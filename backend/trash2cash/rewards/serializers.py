from rest_framework import serializers
from .models import Voucher, VoucherInstance
from users.models import Profile


class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = '__all__'

class VoucherInstanceSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # This will call user.__str__()

    class Meta:
        model = VoucherInstance
        fields = ['id', 'voucher', 'user', 'date', 'redeemed']
        depth = 1