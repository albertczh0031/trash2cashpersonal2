from .serializers import RecyclingCentreSerializer, CategorySerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets

from math import cos, sin, asin, sqrt, pi

from .models import RecyclingCentre, Category

from .email_sending import send_appointment_email


def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth (in km).
    """
    # distance between latitudes and longitudes
    dLat = (lat2 - lat1) * pi / 180.0
    dLon = (lon2 - lon1) * pi / 180.0
 
    # convert to radians
    lat1 = (lat1) * pi / 180.0
    lat2 = (lat2) * pi / 180.0
 
    # apply formula
    a = (pow(sin(dLat / 2), 2) +
         pow(sin(dLon / 2), 2) *
             cos(lat1) * cos(lat2))
    rad = 6371
    c = 2 * asin(sqrt(a))

    return rad * c

@api_view(['GET'])
def locate_filtered_recycling_centres(request):

    user_lat = request.GET.get('latitude')
    user_lng = request.GET.get('longitude')
    category = request.query_params.get('category')  # Get category from request

    if not user_lat or not user_lng:
        return Response({'error': 'Missing coordinates'}, status=400)

    try:
        user_lat = float(user_lat)
        user_lng = float(user_lng)
        print(user_lat,user_lng)
    except ValueError:
        return Response({'error': 'Invalid coordinates format'}, status=400)

    if category:
        centres = RecyclingCentre.objects.filter(accepted_categories__name=category)
    else:
        centres = RecyclingCentre.objects.all()

    # Calculate distances
    distances = {}
    for centre in centres:
        dist_km = haversine(user_lat, user_lng, centre.latitude, centre.longitude)
        distances[centre.id] = round(dist_km, 2)

    # Sort centres by distance
    sorted_centres = sorted(centres, key=lambda centre: distances[centre.id])
    top_centres = sorted_centres[:5]  # Get the top 5

    # Pass distances to the serializer via context
    serializer = RecyclingCentreSerializer(top_centres, many=True, context={'distances': distances})
    return Response(serializer.data)

@api_view(['POST'])
def send_confirmation(request):
    data = request.data
    response = send_appointment_email(
        to_email=data["email"],
        name=data["name"],
        date=data["date"],
        arrival_time=data["arrival_time"],
        centre_name=data.get("centre_name", ""),
        street=data["street"],
        city=data["city"],
        postcode=data["postcode"],
        pickup=data.get("pickup", False)
    )
    return Response(response)

# Creating a viewset which automatically allows for CRUD operations
class RecyclingAdminViewSet(viewsets.ModelViewSet):
    queryset = RecyclingCentre.objects.all()
    serializer_class = RecyclingCentreSerializer

# Viewset for categories to be used in the frontend
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
