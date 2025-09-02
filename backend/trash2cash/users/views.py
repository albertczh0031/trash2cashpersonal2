import random

from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required,user_passes_test
from django.http import JsonResponse, HttpRequest
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_GET, require_POST

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment, OTP, Profile, Notification, RecyclingCentreAdmin, RecyclingCentre
from .serializers import AppointmentSerializer, NotificationSerializer, UserSerializer, UserSignupSerializer, LoginSerializer

from datetime import datetime
import logging

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    role = "admin" if request.user.is_staff else "user"
    return Response({"role": role})


@api_view(['GET'])
def get_appointments(request):
    centre_id = request.GET.get('centreId')
    is_dropoff = request.GET.get('is_dropoff') == 'true'  # Convert to boolean

    if not centre_id:
        return Response({'error': 'Missing centreId'}, status=400)

    appointments = Appointment.objects.filter(centre_id=centre_id, is_dropoff=is_dropoff)
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


class MyAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f"Fetching appointments for user: {request.user}")
        status = request.query_params.get("status", None)
        print(f"Status filter: {status}")
        
        appointments = Appointment.objects.filter(user_id=request.user)
        if status:
            appointments = appointments.filter(status=status)
        
        print(f"Found {appointments.count()} appointments")
        serializer = AppointmentSerializer(appointments, many=True)
        print("Serialized data:", serializer.data)
        
        return Response(serializer.data)
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Try to get the user's profile
            profile = request.user.profile
            tier = profile.tier.tier_desc if profile.tier else "Bronze"
        except Profile.DoesNotExist:
            # If profile doesn't exist, return basic user info
            tier = "Bronze"
        
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "tier": profile.tier.tier_desc if profile.tier else "Bronze",
        })


# US 37: Available Appointments View: Shows all available appointments for a particular recycling centre
class AvailableAppointmentsView(APIView):
    def get(self, request, centre_id, date):
        # Get the is_dropoff parameter from the query string
        is_dropoff = request.query_params.get('is_dropoff', None)

        # Build the filter dynamically
        filter_kwargs = {
            'centre_id': centre_id,
            'date': date,
            'user_id__isnull': True,
            'status': 'Available',
        }

        if is_dropoff is not None:
            filter_kwargs['is_dropoff'] = is_dropoff.lower() == 'true'  # Convert to boolean

        # Filter appointments based on the dynamic filter
        appointments = Appointment.objects.filter(**filter_kwargs)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

# US 37: Confirm Appointment View: Allows a user to confirm an appointment
@permission_classes([IsAuthenticated])
class ConfirmAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get("appointment_id")
        if not appointment_id:
            return Response({"error": "Appointment ID is required."}, status=400)

        try:
            appointment = Appointment.objects.get(
                appointment_id=appointment_id, user_id__isnull=True, status='Available'
            )
            appointment.user_id = request.user
            appointment.status = 'Booked'
            appointment.save()
            # Create a user notification for successful booking
            try:
                # Build datetime in format: "4 Sept 2025 at 16:00"
                date_part = None
                time_part = None
                try:
                    d = appointment.date
                    if isinstance(d, str):
                        from datetime import datetime as _dt
                        d = _dt.strptime(d, "%Y-%m-%d").date()
                    date_part = f"{d.day} {d.strftime('%b')} {d.year}"
                except Exception:
                    date_part = str(appointment.date)

                try:
                    t = appointment.time
                    if t is None:
                        time_part = "00:00"
                    elif isinstance(t, str):
                        from datetime import datetime as _dt
                        parsed = None
                        for fmt in ["%H:%M:%S", "%H:%M"]:
                            try:
                                parsed = _dt.strptime(t, fmt).time()
                                break
                            except Exception:
                                continue
                        if parsed:
                            time_part = parsed.strftime("%H:%M")
                        else:
                            time_part = t
                    else:
                        time_part = t.strftime("%H:%M")
                except Exception:
                    time_part = str(appointment.time)

                when = f"{date_part} at {time_part}" if date_part and time_part else f"{appointment.date} {appointment.time}"

                Notification.objects.create(
                    user=request.user,
                    message=f"Appointment {appointment.appointment_id} booked for {when}."
                )
            except Exception:
                # don't block booking on notification errors
                pass

            return Response({"message": "Appointment booked successfully!"}, status=200)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not available or already booked."}, status=400)


class CancelAppointmentView(APIView):
    """Allows an authenticated user to cancel their booked appointment.

    Business rules implemented here:
    - Only the user who booked the appointment may cancel it.
    - Appointment must currently be in 'Booked' status.
    - If the appointment had points_earned recorded, they will be deducted from
      the user's profile and a notification created.
    - Appointment status is set to 'Cancelled'.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get("appointment_id")
        if not appointment_id:
            return Response({"error": "Appointment ID is required."}, status=400)

        try:
            appointment = Appointment.objects.get(appointment_id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=404)

        # Only allow the user who booked the appointment to cancel it
        if appointment.user_id is None or appointment.user_id != request.user:
            return Response({"error": "You are not authorised to cancel this appointment."}, status=403)

        if appointment.status != 'Booked':
            return Response({"error": "Only booked appointments can be cancelled."}, status=400)

        # perform cancellation
        try:
            # Cancel appointment notification
            Notification.objects.create(
                user=request.user,
                message=f"Appointment {appointment.appointment_id} cancelled."
            )

            # Revert appointment to available and clear the user assignment so others can book it
            appointment.user_id = None
            appointment.status = 'Available'
            appointment.save(update_fields=['user_id', 'status'])

            return Response({"message": "Appointment cancelled and made available."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    
# THE FOLLOWING CODE IS FROM HENRY MA US38: CHANGE PASSWORD
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not user.check_password(current_password):
        return Response({'detail': 'Current password is incorrect.'}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({'detail': 'Password changed successfully.'})

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        return Response({
            'token': token.key,
            'user_id': token.user_id,
            'email': token.user.email,
        })


def sign_up_view(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        street = request.POST.get('street', '').strip()
        city = request.POST.get('city', '').strip()
        postcode = request.POST.get('postcode', '').strip()

        errors = []

        # Empty field checks
        if not username:
            errors.append('Username is required.')
        if not email:
            errors.append('Email is required.')
        if not password or not password2:
            errors.append('Both password fields are required.')
        if not street or not city or not postcode:
            errors.append('Address (street, city, postcode) is required.')

        # Basic validation
        if password and password2 and password != password2:
            errors.append('Passwords do not match.')

        if User.objects.filter(username=username).exists():
            errors.append('Username already exists.')
        if User.objects.filter(email=email).exists():
            errors.append('Email already exists.')

        if errors:
            return render(request, 'sign_up.html', {
                'errors': errors,
                'username': username,
                'email': email,
                'street': street,
                'city': city,
                'postcode': postcode
            })

        # Adding the default attributes to the in-built USER model
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        # Adding the extended attributes
        user.street = street
        user.city = city
        user.postcode = postcode
        user.save()

        return redirect('login')

    return render(request, 'sign_up.html')


class SignupAPIView(APIView):
    """
    Handles POST requests for user signup from the frontend.
    """
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # Save the Profile instance
            # 201: New resource created
            return Response({"message": "Signup successful!"}, status=status.HTTP_201_CREATED)
        # 400: Bad request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Check if user's profile is verified
            if not user.profile.is_verified:
                return Response({
                    "message": "Not verified",
                    "redirect_to_otp": True,
                    "email": user.email
                }, status=status.HTTP_403_FORBIDDEN)

            return Response({
                "message": "Login successful",
                "username": user.username
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@permission_classes([IsAuthenticated])
class GetAdminStatusAPIView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            "is_staff": user.is_staff,
            "username": user.username,
        })

class OTPAPIView(APIView):
    #TODO: def get(self, request):
        # Add OTP Logic here
    permission_classes = [AllowAny]

    def post(self, request):
        otp = request.data.get("otp")
        logging.info(f"OTP: {otp}")
        if not otp:
            return Response({"message": "OTP is required."}, status=status.HTTP_400_BAD_REQUEST)
        email = request.data.get('email')
        logging.info(f"Email: {email}")
        if not email:
            return Response({"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the latest OTP from the database
        otp_obj = OTP.objects.filter(email=email).order_by('-created_at').first()

        logging.info(f"OTP from DB: {otp_obj.code}")
        logging.info(f"OTP email from DB: {otp_obj.email}")
        if not otp_obj:
            return Response({"message": "No OTP found for this email."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the OTP is valid (e.g., not expired)
        if otp_obj.is_expired():
            return Response({"message": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the provided OTP matches the one in the database
        if otp_obj.code != otp:
            return Response({"message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # If everything is valid, mark the user as verified
        user = User.objects.filter(email=email).first()
        if user:
            user.profile.is_verified = True
            user.profile.save()

        return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            first_name = user.first_name
            last_name = user.last_name
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        otp_code = str(random.randint(100000, 999999))
        OTP.objects.create(email=email, code=otp_code)

        from .registration_email import send_registration_verification_email
        send_registration_verification_email(email, first_name, last_name, otp_code)

        return Response({"message": "OTP resent successfully."}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
class GetEmailAPIView(APIView):
    def get(self,request):
        user = request.user
        return Response({
            "email": user.email
        })

@permission_classes([IsAuthenticated])
class GetVerifiedStatusAPIView(APIView):
    def get(self, request):
        try:
            # Try to get the user's profile
            profile = request.user.profile
            verified = profile.is_verified
        except Profile.DoesNotExist:
            # If profile doesn't exist, create one with default values
            from .models import Tier
            try:
                default_tier = Tier.objects.get(tier_desc="Bronze")
            except Tier.DoesNotExist:
                default_tier = None
            
            profile = Profile.objects.create(
                user=request.user,
                tier=default_tier,
                is_verified=False
            )
            verified = False
        
        return Response({"verified_status": verified})

@permission_classes([IsAuthenticated])
class GetAdminAppointmentsAPIView(APIView):
    def get(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            recycling_centre_admin = RecyclingCentreAdmin.objects.get(admin=profile)
        except RecyclingCentreAdmin.DoesNotExist:
            return Response(
                {"error": "This admin user is not assigned to any recycling centre."},
                status=status.HTTP_403_FORBIDDEN   # better than 404 because user exists but has no permissions
            )
        except RecyclingCentreAdmin.MultipleObjectsReturned:
            return Response(
                {"error": "Multiple recycling centre assignments found for this admin."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        appointments = Appointment.objects.filter(centre=recycling_centre_admin.recycling_centre,status__in=["Booked", "Completed"])
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    
"""
Seller verification
"""
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_sellers(request):
    sellers = User.objects.filter(profile__request_seller=True)  # 👈 filter by profile
    serializer = UserSerializer(sellers, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_seller(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.profile.is_seller = True
        user.profile.request_seller = False
        user.profile.save()
        return Response({"message": f"{user.username} approved as seller!"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_seller_status(request):
    try:
        # Get the logged-in user's profile
        profile = getattr(request.user, "profile", None)

        if not profile:
            return Response({"error": "Profile not found"}, status=404)

        # Check seller status
        if profile.is_seller:
            return Response({"message": "Seller Verified"})
        elif profile.request_seller:
            return Response({"message": "Requesting Verification"})
        else:
            return Response({"message": "Not Verified"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_seller_verification(request):
    try:
        profile = request.user.profile
        if profile.is_seller:
            return Response({"message": "Already a verified seller"}, status=400)

        if profile.request_seller:
            return Response({"message": "Seller verification request already pending."}, status=400)

        profile.request_seller = True
        profile.save()

        return Response({"message": "Request for seller verification submitted successfully."})

    except Exception as e:
        return Response({"error": str(e)}, status=500)



@permission_classes([IsAuthenticated])
class GetUserNotificationsAPIView(APIView):
    """
    API view to get all unread notifications for the authenticated user.
    Only returns notifications that are unread (is_read=False).
    The notifications are ordered by creation date in descending order.
    """

    def get(self, request):
        user = request.user
        notifications = Notification.objects.filter(user=user, is_read=False).order_by('-created_at').all()
        serialiser = NotificationSerializer(notifications, many=True)
        return Response(serialiser.data, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
class MarkAllNotificationsReadAPIView(APIView):
    """
    Marks all unread notifications for the authenticated user as read.
    Returns the number of notifications that were marked.
    """
    def post(self, request):
        user = request.user
        updated_count = Notification.objects.filter(user=user, is_read=False).update(is_read=True)
        return Response({"marked": updated_count}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
class MarkNotificationReadAPIView(APIView):
    """
    Marks a single notification as read for the authenticated user.
    """
    def post(self, request, pk):
        user = request.user
        try:
            notif = Notification.objects.get(pk=pk, user=user)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

        notif.is_read = True
        notif.save()
        return Response({"marked": 1}, status=status.HTTP_200_OK)