# users/views.py
from django.urls import path
from rewards.views import GetVoucherInstanceAPIView,CreateVoucherInstanceAPIView, UpdateVoucherInstanceAPIView, UseVoucherInstanceAPIView, GetVoucherAPIView, CreateVoucherAPIView, GetRedeemedVoucherInstancesAPIView, GetExpiredVouchersAPIView

urlpatterns = [
    path('get-voucher/', GetVoucherAPIView.as_view(), name='get-voucher'),
    path('create-voucher/', CreateVoucherAPIView.as_view(), name='create-voucher'),
    path('get-voucher-instance/', GetVoucherInstanceAPIView.as_view(), name='get-voucher-instance'),
    path('create-voucher-instance/', CreateVoucherInstanceAPIView.as_view(), name='create-voucher-instance'),
    path('update-voucher-instance/<int:pk>/', UpdateVoucherInstanceAPIView.as_view(), name='update-voucher-instance'),
    path('api/rewards/use-voucher-instance/<int:pk>/', UseVoucherInstanceAPIView.as_view(), name='use-voucher-instance'),
    path('api/rewards/redeemed-voucher-instances/', GetRedeemedVoucherInstancesAPIView.as_view(), name='redeemed-voucher-instances'),
    path('api/rewards/expired-vouchers/', GetExpiredVouchersAPIView.as_view(), name='expired-vouchers'),
]
