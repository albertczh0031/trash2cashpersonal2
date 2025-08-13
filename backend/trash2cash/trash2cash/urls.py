# trash2cash/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from users.views import SignupAPIView, LoginAPIView
from recycler.views import send_confirmation 
from analytics.views import StatisticsView

def home(request):
    return HttpResponse("Server is running")


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('', include('upload.urls')), # Includes the URLs from the upload app
    path('', include('users.urls')), # Includes the URLs from the users app
    path('api/appointments/', include('users.urls')),
    path('api-token-auth/', obtain_auth_token),
    path('api/', include('users.urls')),  
    path('api/signup/', SignupAPIView.as_view(), name='api-signup'),
    path('api/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/', include('recycler.urls', namespace='recycler')),
    # used to get an access token and a refresh token.
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # used to refresh the access token using the refresh token.
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('send-confirmation/', send_confirmation),
    path('api/rewards/', include('rewards.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/chat/', include('chat.urls')), # Includes the URLs from the chat app
    path('api/marketplace/', include('marketplace.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)