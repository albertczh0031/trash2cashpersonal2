from rest_framework import serializers
from .models import Electronic, Clothe, BooksMagazine, Furniture

class ElectronicsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Electronic
        fields = '__all__'

class ClothesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clothe
        fields = '__all__'

class BooksMagazinesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BooksMagazine
        fields = '__all__'

class FurnitureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Furniture
        fields = '__all__'