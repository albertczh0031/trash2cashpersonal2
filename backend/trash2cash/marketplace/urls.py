from django.urls import path
from .views import ElectronicsListAPIView, ClothesListAPIView, BooksMagazinesListAPIView, FurnitureListAPIView,AllItemsListAPIView


urlpatterns = [
    path('all-items/', AllItemsListAPIView.as_view(), name='all-items-list'),
    path('electronics/', ElectronicsListAPIView.as_view(), name='electronics-list'),
    path('clothes/', ClothesListAPIView.as_view(), name='clothes-list'),
    path('books-magazines/', BooksMagazinesListAPIView.as_view(), name='books-magazines-list'),
    path('furniture/', FurnitureListAPIView.as_view(), name='furniture-list'),
]