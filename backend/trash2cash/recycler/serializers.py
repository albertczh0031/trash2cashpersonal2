from rest_framework import serializers
from .models import RecyclingCentre, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class RecyclingCentreSerializer(serializers.ModelSerializer):
    distance_km = serializers.SerializerMethodField()
    accepted_categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True
    )

    class Meta:
        model = RecyclingCentre
        fields = '__all__'

    def get_distance_km(self, obj):
        return self.context.get('distances', {}).get(obj.id, None)