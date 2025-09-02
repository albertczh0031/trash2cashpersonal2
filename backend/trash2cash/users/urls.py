# users/views.py
from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import MyAppointmentsView, CustomAuthToken, change_password, GetAdminStatusAPIView, UserProfileView, OTPAPIView, GetEmailAPIView, GetVerifiedStatusAPIView, SendOTPView, get_seller_status

urlpatterns = [
    path('my-appointments/', MyAppointmentsView.as_view()),  # <-- ADD THIS
    path('appointments/<int:centre_id>/<str:date>/', AvailableAppointmentsView.as_view(), name='available-appointments'),   # Go to this to see all available appointments for a particular recycling centre e.g. http://127.0.0.1:8000/api/appointments/1/2025-05-06/
    path('appointments/confirm/', ConfirmAppointmentView.as_view(), name='confirm-appointment'),
    path('appointments/cancel/', CancelAppointmentView.as_view(), name='cancel-appointment'),
    path('change-password/', change_password, name='change-password'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('api/user-role/', get_user_role, name='user-role'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('getadmin/', GetAdminStatusAPIView.as_view(), name='get-admin-status'),
    path('change-password/', change_password, name='change-password'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('api/user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/verify-otp/', OTPAPIView.as_view(), name='verify-otp'),
    path('api/getemail/', GetEmailAPIView.as_view(), name='get-email'),
    path('api/get-verification/', GetVerifiedStatusAPIView.as_view(), name='get-verification-status'),
    path("api/send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("api/get-admin-appointments/", GetAdminAppointmentsAPIView.as_view(), name="get-admin-appointments"),
    path("pending-sellers/", pending_sellers, name="pending_sellers"),
    path("approve-seller/<int:user_id>/", approve_seller, name="approve_seller"),
    path('request-seller-verification/', request_seller_verification, name='request-seller-verification'),
    path('get-seller-status/', get_seller_status, name='get-seller-status'),
    path('api/notifications/', GetUserNotificationsAPIView.as_view(), name='notifications-list'),
    path('api/notifications/mark-all-read/', MarkAllNotificationsReadAPIView.as_view(), name='notifications-mark-all-read'),
    path('api/notifications/<int:pk>/mark-read/', MarkNotificationReadAPIView.as_view(), name='notifications-mark-read'),
    path('api-auth/', include('rest_framework.urls')),

]
