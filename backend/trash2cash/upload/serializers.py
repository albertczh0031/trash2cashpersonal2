from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = [
            'category', 'confidence', 'description', 'weight', 'brand', 'labels', 'appointment', 'user'
        ]
        extra_kwargs = {
            'category': {'required': False},
            'confidence': {'required': False},
            'labels': {'required': False},
            'description': {'required': True, 'allow_blank': False},
            'weight': {'required': True, 'allow_blank': False},
            'brand': {'required': True, 'allow_blank': False},
            'user': {'required': True},
        }

    def validate(self, data):
        errors = {}
        # Set required fields
        for field in ['description', 'weight', 'brand']:
            value = data.get(field)
            if not value or (isinstance(value, str) and not value.strip()):
                errors[field] = 'This field is required.'
        if errors:
            raise serializers.ValidationError(errors)
        return data
