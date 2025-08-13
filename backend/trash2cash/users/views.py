import random

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from .models import Appointment, OTP, Profile
from .serializers import AppointmentSerializer
from .serializers import UserSignupSerializer, LoginSerializer

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
            return Response({"message": "Appointment booked successfully!"}, status=200)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not available or already booked."}, status=400)

    
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