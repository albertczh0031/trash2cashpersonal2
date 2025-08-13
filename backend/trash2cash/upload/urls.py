from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('api/upload-and-analyze/', upload_and_analyze, name='upload_and_analyze'),
]