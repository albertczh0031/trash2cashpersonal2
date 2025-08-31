from rest_framework import serializers
from .models import (
    Electronic, Clothe, BooksMagazine, Furniture, MiscItem, MarketplaceImage
)

# Helper to build absolute URLs for images
def image_urls_from_obj(obj, request):
    urls = []
    for img in obj.images.all():
        url = img.image.url
        if request:
            url = request.build_absolute_uri(url)
        urls.append(url)
    return urls


class ElectronicsSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = Electronic
        fields = '__all__'
        read_only_fields = ['seller', 'date']

    def get_images(self, obj):
        request = self.context.get('request')
        return image_urls_from_obj(obj, request)

    def create(self, validated_data):
        # seller is set in the view via serializer.save(seller=request.user)
        return Electronic.objects.create(**validated_data)


class ClothesSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = Clothe
        fields = '__all__'
        read_only_fields = ['seller', 'date']

    def get_images(self, obj):
        request = self.context.get('request')
        return image_urls_from_obj(obj, request)

    def create(self, validated_data):
        return Clothe.objects.create(**validated_data)


class BooksMagazinesSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = BooksMagazine
        fields = '__all__'
        read_only_fields = ['seller', 'date']

    def get_images(self, obj):
        request = self.context.get('request')
        return image_urls_from_obj(obj, request)

    def create(self, validated_data):
        return BooksMagazine.objects.create(**validated_data)


class FurnitureSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = Furniture
        fields = '__all__'
        read_only_fields = ['seller', 'date']

    def get_images(self, obj):
        request = self.context.get('request')
        return image_urls_from_obj(obj, request)

    def create(self, validated_data):
        return Furniture.objects.create(**validated_data)


class MiscItemSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = MiscItem
        fields = '__all__'
        read_only_fields = ['seller', 'date']

    def get_images(self, obj):
        request = self.context.get('request')
        return image_urls_from_obj(obj, request)

    def create(self, validated_data):
        return MiscItem.objects.create(**validated_data)
