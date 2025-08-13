from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Electronic, Clothe, BooksMagazine, Furniture
from .serializers import ElectronicsSerializer, ClothesSerializer, BooksMagazinesSerializer, FurnitureSerializer

class AllItemsListAPIView(APIView):
    def get(self, request):
        date_range = request.query_params.get("date_range")  # '1', '7', '30'
        price_range = request.query_params.get("price_range")  # 'low', 'mid', 'high'
        query = request.GET.get("search", None)

        # Base querysets (no filters yet)
        electronics_qs = Electronic.objects.all()
        clothes_qs = Clothe.objects.all()
        books_qs = BooksMagazine.objects.all()
        furniture_qs = Furniture.objects.all()

        if not (query is None):
            electronics_qs = electronics_qs.filter(title__icontains=query) | electronics_qs.filter(description__icontains=query)
            clothes_qs = clothes_qs.filter(title__icontains=query) | clothes_qs.filter(description__icontains=query)
            books_qs = books_qs.filter(title__icontains=query) | books_qs.filter(description__icontains=query)
            furniture_qs = furniture_qs.filter(title__icontains=query) | furniture_qs.filter(description__icontains=query)

        # Apply date filter if provided
        if date_range in ["1", "7", "30"]:
            days = int(date_range)
            start_date = timezone.now() - timedelta(days=days)
            electronics_qs = electronics_qs.filter(date__gte=start_date)
            clothes_qs = clothes_qs.filter(date__gte=start_date)
            books_qs = books_qs.filter(date__gte=start_date)
            furniture_qs = furniture_qs.filter(date__gte=start_date)

        # Apply price filter if provided
        if price_range == "low":
            electronics_qs = electronics_qs.filter(price__lte=50)
            clothes_qs = clothes_qs.filter(price__lte=50)
            books_qs = books_qs.filter(price__lte=50)
            furniture_qs = furniture_qs.filter(price__lte=50)
        elif price_range == "mid":
            electronics_qs = electronics_qs.filter(price__gte=51, price__lte=200)
            clothes_qs = clothes_qs.filter(price__gte=51, price__lte=200)
            books_qs = books_qs.filter(price__gte=51, price__lte=200)
            furniture_qs = furniture_qs.filter(price__gte=51, price__lte=200)
        elif price_range == "high":
            electronics_qs = electronics_qs.filter(price__gte=201)
            clothes_qs = clothes_qs.filter(price__gte=201)
            books_qs = books_qs.filter(price__gte=201)
            furniture_qs = furniture_qs.filter(price__gte=201)

        # Serialize
        electronics = ElectronicsSerializer(electronics_qs, many=True).data
        clothes = ClothesSerializer(clothes_qs, many=True).data
        books = BooksMagazinesSerializer(books_qs, many=True).data
        furniture = FurnitureSerializer(furniture_qs, many=True).data

        # Merge all categories into one list
        all_items = electronics + clothes + books + furniture

        return Response(all_items, status=status.HTTP_200_OK)
    
class ElectronicsListAPIView(APIView):
    def get(self, request):
        query = request.GET.get("search", None)

        if query is None:
            items = Electronic.objects.all()
        else:
            items = Electronic.objects.filter(title__icontains=query) | Electronic.objects.filter(description__icontains=query)
        serializer = ElectronicsSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ClothesListAPIView(APIView):
    def get(self, request):
        query = request.GET.get("search", None)

        if query is None:
            items = Clothe.objects.all()
        else:
            items = Clothe.objects.filter(title__icontains=query) | Clothe.objects.filter(description__icontains=query)
        serializer = ClothesSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BooksMagazinesListAPIView(APIView):
    def get(self, request):
        query = request.GET.get("search", None)

        if query is None:
            items = BooksMagazine.objects.all()
        else:
            items = BooksMagazine.objects.filter(title__icontains=query) | BooksMagazine.objects.filter(description__icontains=query)
        serializer = BooksMagazinesSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FurnitureListAPIView(APIView):
    def get(self, request):
        query = request.GET.get("search", None)

        if query is None:
            items = Furniture.objects.all()
        else:
            items = Furniture.objects.filter(title__icontains=query) | Furniture.objects.filter(description__icontains=query)
        serializer = FurnitureSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)