from . import views

# KAIXUAN'S
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecyclingAdminViewSet, CategoryViewSet

# KAIXUAN'S Registering the Viewsets
router = DefaultRouter()
router.register(r'recycler', RecyclingAdminViewSet)
router.register(r'categories', CategoryViewSet, basename='category') # For editing categories in admin panel

app_name = 'recycler'

urlpatterns = [
    path('locate_centres/', views.locate_filtered_recycling_centres, name='locate_centres'),
    path('', include(router.urls)), # KAIXUAN'S
]
