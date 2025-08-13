from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile
from .models import Appointment
from .models import OTP

class UserSignupSerializer(serializers.ModelSerializer):
    """
    Serializer to parse and validate user signup data in json format and save it to the database as a User and Profile object.
    """
    # password2 will not be returned in the response
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    street = serializers.CharField()
    city = serializers.CharField()
    postcode = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()

    class Meta:
        model = Profile
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'street', 'city', 'postcode']
        extra_kwargs = {
            # prevent password from being read in the response
            'password': {'write_only': True},
        }

    def validate(self, data):
        # Check if password and password2 match
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})

        # Check if username already exists
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})

        # Check if email already exists
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})

        # Check that first_name and last_name are not empty or null
        if not data.get('first_name'):
            raise serializers.ValidationError({"first_name": "First name cannot be empty."})
        if not data.get('last_name'):
            raise serializers.ValidationError({"last_name": "Last name cannot be empty."})

        # Check that street, city, and postcode are not empty or null
        if not data.get('street'):
            raise serializers.ValidationError({"street": "Street cannot be empty."})
        if not data.get('city'):
            raise serializers.ValidationError({"city": "City cannot be empty."})
        if not data.get('postcode'):
            raise serializers.ValidationError({"postcode": "Postcode cannot be empty."})

        return data

    def create(self, validated_data):
        validated_data.pop('password2')

        # Extract Profile data (address fields)
        username = validated_data['username']
        email = validated_data['email']
        street = validated_data.pop('street')
        city = validated_data.pop('city')
        postcode = validated_data.pop('postcode')

        # Create the User object first
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        # Create the Profile linked to the User
        profile = Profile(
            user=user,  # Linking the Profile to the User
            street=street,
            city=city,
            postcode=postcode
        )
        profile.save()

        return profile

class LoginSerializer(serializers.Serializer):
    """
    Serializer to handle user login data.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Authenticate checks if a user exists with the provided credentials
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        data['user'] = user  # Add the user to the validated data
        return data

class AppointmentSerializer(serializers.ModelSerializer):
    centre_name = serializers.CharField(source='centre.name', read_only=True)  # Add this field to display the centre name

    class Meta:
        model = Appointment
        fields = ['appointment_id', 'date', 'time', 'points_earned', 'centre_name']  # Include centre_name


class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['otp']
        