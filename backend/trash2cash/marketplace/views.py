from rest_framework.generics import RetrieveAPIView
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Electronic, Clothe, BooksMagazine, Furniture, MiscItem,MarketplaceImage
from .serializers import ElectronicsSerializer, ClothesSerializer, BooksMagazinesSerializer, FurnitureSerializer, MiscItemSerializer
from rest_framework.parsers import MultiPartParser, FormParser

# Detail APIViews for each category
class ElectronicsDetailAPIView(RetrieveAPIView):
    queryset = Electronic.objects.all()
    serializer_class = ElectronicsSerializer

class ClothesDetailAPIView(RetrieveAPIView):
    queryset = Clothe.objects.all()
    serializer_class = ClothesSerializer

class BooksMagazinesDetailAPIView(RetrieveAPIView):
    queryset = BooksMagazine.objects.all()
    serializer_class = BooksMagazinesSerializer

class FurnitureDetailAPIView(RetrieveAPIView):
    queryset = Furniture.objects.all()
    serializer_class = FurnitureSerializer

class MiscItemsDetailAPIView(RetrieveAPIView):
    queryset = MiscItem.objects.all()
    serializer_class = MiscItemSerializer

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
        misc_items_qs = MiscItem.objects.all()

        if not (query is None):
            electronics_qs = electronics_qs.filter(title__icontains=query) | electronics_qs.filter(description__icontains=query)
            clothes_qs = clothes_qs.filter(title__icontains=query) | clothes_qs.filter(description__icontains=query)
            books_qs = books_qs.filter(title__icontains=query) | books_qs.filter(description__icontains=query)
            furniture_qs = furniture_qs.filter(title__icontains=query) | furniture_qs.filter(description__icontains=query)
            misc_items_qs = misc_items_qs.filter(title__icontains=query) | misc_items_qs.filter(description__icontains=query)

        # Apply date filter if provided
        if date_range in ["1", "7", "30"]:
            days = int(date_range)
            start_date = timezone.now() - timedelta(days=days)
            electronics_qs = electronics_qs.filter(date__gte=start_date)
            clothes_qs = clothes_qs.filter(date__gte=start_date)
            books_qs = books_qs.filter(date__gte=start_date)
            furniture_qs = furniture_qs.filter(date__gte=start_date)
            misc_items_qs = misc_items_qs.filter(date__gte=start_date)

        # Apply price filter if provided
        if price_range == "low":
            electronics_qs = electronics_qs.filter(price__lte=50)
            clothes_qs = clothes_qs.filter(price__lte=50)
            books_qs = books_qs.filter(price__lte=50)
            furniture_qs = furniture_qs.filter(price__lte=50)
            misc_items_qs = misc_items_qs.filter(price__lte=50)
        elif price_range == "mid":
            electronics_qs = electronics_qs.filter(price__gte=51, price__lte=200)
            clothes_qs = clothes_qs.filter(price__gte=51, price__lte=200)
            books_qs = books_qs.filter(price__gte=51, price__lte=200)
            furniture_qs = furniture_qs.filter(price__gte=51, price__lte=200)
            misc_items_qs = misc_items_qs.filter(price__gte=51, price__lte=200)
        elif price_range == "high":
            electronics_qs = electronics_qs.filter(price__gte=201)
            clothes_qs = clothes_qs.filter(price__gte=201)
            books_qs = books_qs.filter(price__gte=201)
            furniture_qs = furniture_qs.filter(price__gte=201)
            misc_items_qs = misc_items_qs.filter(price__gte=201)

        # Serialize
        electronics = ElectronicsSerializer(electronics_qs, many=True).data
        clothes = ClothesSerializer(clothes_qs, many=True).data
        books = BooksMagazinesSerializer(books_qs, many=True).data
        furniture = FurnitureSerializer(furniture_qs, many=True).data
        misc_items = MiscItemSerializer(misc_items_qs, many=True).data

        # Merge all categories into one list
        all_items = electronics + clothes + books + furniture + misc_items

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

class MiscItemsListAPIView(APIView):
    def get(self, request):
        query = request.GET.get("search", None)

        if query is None:
            items = MiscItem.objects.all()
        else:
            items = MiscItem.objects.filter(title__icontains=query) | MiscItem.objects.filter(description__icontains=query)
        serializer = MiscItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CreateListingView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        category = request.data.get("category")

        # Pick the right serializer and model per category
        serializer_class = None
        fk_name = None  # which FK on MarketplaceImage to set

        if category == "Electronic":
            serializer_class = ElectronicsSerializer
            fk_name = "electronic"
        elif category == "Clothe":
            serializer_class = ClothesSerializer
            fk_name = "clothe"
        elif category == "BooksMagazines":
            serializer_class = BooksMagazinesSerializer
            fk_name = "books_magazine"
        elif category == "Furniture":
            serializer_class = FurnitureSerializer
            fk_name = "furniture"
        elif category == "MiscItems":
            serializer_class = MiscItemSerializer
            fk_name = "misc_item"
        else:
            return Response({"error": "Invalid category"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializer_class(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Create the base item with seller bound
        item = serializer.save(seller=request.user)

        # Attach uploaded images to the correct FK
        files = request.FILES.getlist("images")
        for f in files:
            kwargs = {"image": f, fk_name: item}
            MarketplaceImage.objects.create(**kwargs)

        # Return the newly created item with images
        return Response(serializer_class(item, context={"request": request}).data, status=status.HTTP_201_CREATED)

class MyListingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        electronics = ElectronicsSerializer(Electronic.objects.filter(seller=user), many=True).data
        clothes = ClothesSerializer(Clothe.objects.filter(seller=user), many=True).data
        books = BooksMagazinesSerializer(BooksMagazine.objects.filter(seller=user), many=True).data
        furniture = FurnitureSerializer(Furniture.objects.filter(seller=user), many=True).data
        misc_items = MiscItemSerializer(MiscItem.objects.filter(seller=user), many=True).data

        # Combine all listings
        all_listings = electronics + clothes + books + furniture + misc_items

        return Response(all_listings)