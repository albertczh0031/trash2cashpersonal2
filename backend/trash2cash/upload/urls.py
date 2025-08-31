from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('api/upload-and-analyze/', upload_and_analyze, name='upload_and_analyze'),
    path('api/generate-ott/', generate_one_time_token, name='generate_one_time_token'),
    path('api/validate-ott/', validate_ott, name='validate_ott'),
]