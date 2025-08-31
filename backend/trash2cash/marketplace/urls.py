from django.urls import path
from .views import (
    CreateListingView,
    ElectronicsListAPIView, ClothesListAPIView, BooksMagazinesListAPIView, FurnitureListAPIView, MiscItemsListAPIView,
    AllItemsListAPIView, MyListingsView,
    ElectronicsDetailAPIView, ClothesDetailAPIView, BooksMagazinesDetailAPIView, FurnitureDetailAPIView, MiscItemsDetailAPIView
)


urlpatterns = [
    path('all-items/', AllItemsListAPIView.as_view(), name='all-items-list'),
    path('electronics/', ElectronicsListAPIView.as_view(), name='electronics-list'),
    path('electronics/<int:pk>/', ElectronicsDetailAPIView.as_view(), name='electronics-detail'),
    path('clothes/', ClothesListAPIView.as_view(), name='clothes-list'),
    path('clothes/<int:pk>/', ClothesDetailAPIView.as_view(), name='clothes-detail'),
    path('books-magazines/', BooksMagazinesListAPIView.as_view(), name='books-magazines-list'),
    path('books-magazines/<int:pk>/', BooksMagazinesDetailAPIView.as_view(), name='books-magazines-detail'),
    path('furniture/', FurnitureListAPIView.as_view(), name='furniture-list'),
    path('furniture/<int:pk>/', FurnitureDetailAPIView.as_view(), name='furniture-detail'),
    path('misc-items/', MiscItemsListAPIView.as_view(), name='misc-items-list'),
    path('misc-items/<int:pk>/', MiscItemsDetailAPIView.as_view(), name='misc-items-detail'),
    path('create-listing/', CreateListingView.as_view(), name='create-listing'),
    path("my-listings/", MyListingsView.as_view(), name="my-listings"),

]