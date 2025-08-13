from rewards.models import Voucher
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rewards.serializers import VoucherSerializer
from rewards.models import VoucherInstance
from rewards.serializers import VoucherInstanceSerializer
from django.utils.timezone import now
from datetime import datetime

# Create your views here.
class CreateVoucherAPIView(APIView):
    """
    Creates voucher object
    """
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = VoucherSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # Save the Profile instance
            # 201: New resource created
            return Response({"message": "Voucher creation successful!"}, status=status.HTTP_201_CREATED)
        # 400: Bad request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetRedeemedVoucherInstancesAPIView(APIView):
    """
    Fetch redeemed voucher instances for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        redeemed_vouchers = VoucherInstance.objects.filter(user=profile, redeemed=True)
        serializer = VoucherInstanceSerializer(redeemed_vouchers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class GetExpiredVouchersAPIView(APIView):
    """
    Fetch vouchers that are both redeemed and expired for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        # Filter vouchers that are redeemed and have expired based on the voucher's expiration date
        expired_redeemed_vouchers = VoucherInstance.objects.filter(
            user=profile,
            voucher__expiration_date__lt=now(),  # Check if the expiration date is in the past
            redeemed=True  # Ensure the voucher is redeemed
        )
        serializer = VoucherInstanceSerializer(expired_redeemed_vouchers, many=True)
        serialized_data = serializer.data

        # Format the expiration date to date/month/year
        for item in serialized_data:
            item['voucher']['expiration_date'] = datetime.strptime(
                item['voucher']['expiration_date'], "%Y-%m-%d"
            ).strftime("%d/%m/%Y")

        return Response(serialized_data, status=status.HTTP_200_OK)

class GetVoucherAPIView(APIView):
    """
    Get voucher object
    """
    def get(self, request):
        vouchers = Voucher.objects.all()
        serializer = VoucherSerializer(vouchers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateVoucherInstanceAPIView(APIView):
    """
    Creates VoucherInstance object
    """
    def post(self, request):
        serializer = VoucherInstanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # Save the Profile instance
            # 201: New resource created
            return Response({"message": "VoucherInstance creation successful!"}, status=status.HTTP_201_CREATED)
        # 400: Bad request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetVoucherInstanceAPIView(APIView):
    """
    Returns the list of voucher instances for the user along with user tier, points,
    and tier threshold information.
    """
    permission_classes = [IsAuthenticated]

    # Static tier configuration
    TIER_THRESHOLDS = {
        "Bronze": 0,
        "Silver": 3000,
        "Gold": 5000,
        "Platinum": 7500
    }
    TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum"]

    def get_next_tier(self, current_tier):
        try:
            idx = self.TIER_ORDER.index(current_tier)
            return self.TIER_ORDER[idx + 1] if idx + 1 < len(self.TIER_ORDER) else None
        except ValueError:
            return None

    def get_current_threshold(self, tier):
        return self.TIER_THRESHOLDS.get(tier, 0)

    def get_next_threshold(self, current_tier):
        next_tier = self.get_next_tier(current_tier)
        return self.TIER_THRESHOLDS.get(next_tier)

    def get(self, request):
        profile = request.user.profile
        current_tier = profile.tier.tier_desc if profile.tier else "Bronze"

        voucher_instances = VoucherInstance.objects.filter(user=profile)
        serializer = VoucherInstanceSerializer(voucher_instances, many=True)

        formatted_vouchers = []
        for item in serializer.data:
            formatted_vouchers.append({
                "id": item["id"],
                "voucher": {
                    "name": item["voucher"]["name"],
                    "points": item["voucher"]["points"],
                    "description": item["voucher"]["description"],
                    "recycle_center_code": item["voucher"]["recycle_center_code"],
                    "required_tier": item["voucher"]["tier"],  # Or map Tier object to its name if needed
                    "image": item["voucher"]["image"],
                    "expiration_date": item["voucher"]["expiration_date"]
                },
                "redeemed": item["redeemed"]
            })

        return Response({
            "username": profile.user.username,
            "tier": current_tier,
            "points": profile.points,
            "rewards": formatted_vouchers,
            "tier_thresholds": self.TIER_THRESHOLDS,
            "current_tier_threshold": self.get_current_threshold(current_tier),
            "next_tier": self.get_next_tier(current_tier),
            "next_tier_threshold": self.get_next_threshold(current_tier)
        }, status=status.HTTP_200_OK)




class UpdateVoucherInstanceAPIView(APIView):
    def patch(self, request, pk):
        try:
            instance = VoucherInstance.objects.get(pk=pk)
        except VoucherInstance.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        print(f"INSTANCE {instance.user}")
        print(f"INSTANCE {instance.voucher.points}")
        print(request.data)
        user_redeem = instance.user
        if user_redeem.points < instance.voucher.points:
            return Response({"error": "You do not have enough points to redeem this!"}, status=status.HTTP_403_FORBIDDEN)
        user_redeem.points -= instance.voucher.points
        user_redeem.save()
        print(f"WHY DID YOU REEDEEM {user_redeem}")
        serializer = VoucherInstanceSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def rewards(request):
    return GetVoucherAPIView.get(request)



class UseVoucherInstanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            voucher_instance = VoucherInstance.objects.get(pk=pk, user=request.user.profile, redeemed=True)
            # Logic for using the voucher (e.g., mark as used, log usage, etc.)
            voucher_instance.delete()  # Example: Delete the voucher after use
            return Response({"message": "Voucher used successfully!"}, status=status.HTTP_200_OK)
        except VoucherInstance.DoesNotExist:
            return Response({"error": "Voucher not found or not eligible for use."}, status=status.HTTP_404_NOT_FOUND)