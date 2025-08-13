import os
import logging
from django.http import HttpResponse
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from google.cloud import vision
from .models import *
from users.models import *
from django.utils.timezone import now
import json


# Load environment variables from .env file
load_dotenv()

def home(request):
    return HttpResponse("Welcome to Trash2Cash API")



@api_view(['POST'])
def upload_and_analyze(request):
    try:
        # Retrieve date from the request or set the current date as default
        date = request.POST.get('date', now().date()) 
        time = request.POST.get('time', now().time())  

        NON_REAL_IMAGE_LABELS = {'clip art', 'illustration', 'drawing', 'cartoon', 'sketch', 'vector graphics', 'graphics', 'animation'}

        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded.'}, status=400)

        # Get the uploaded file and metadata from the request
        file = request.FILES.get('file')
        description = request.POST.get('description', '')
        weight = request.POST.get('weight', '')
        brand = request.POST.get('brand', '')
        centre_id = request.POST.get('centre_id')  # Retrieve centre_id from the request
        date = request.POST.get('date')  # Retrieve date from the request
        user_name = request.POST.get('user_name', 'Anonymous')  # Retrieve username from the request


        # Validate required fields
        if not centre_id:
            return Response({'error': 'Centre ID is required.'}, status=400)
        if not date:
            return Response({'error': 'Date is required.'}, status=400)
        if not time:
            return Response({'error': 'Time is required.'}, status=400)
        if not file:
            return Response({'error': 'No file uploaded.'}, status=400)
        if not user_name:
            return Response({'error': 'User name is required.'}, status=400)

        # Save the file temporarily
        temp_path = f"temp_{file.name}"
        with open(temp_path, 'wb+') as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)

        # Get the GCP key from the environment variable (JSON string)
        gcp_key_json = os.getenv('GCP_KEY_PATH')
        if not gcp_key_json:
            return Response({'error': 'Google Cloud key file is missing or invalid.'}, status=500)

        try:
            # Load credentials from the environment variable directly as JSON string
            credentials = service_account.Credentials.from_service_account_info(
                json.loads(gcp_key_json)
            )
            client = vision.ImageAnnotatorClient(credentials=credentials)

        except Exception as e:
            return Response({'error': f'Error loading Google Cloud key: {str(e)}'}, status=500)

        # Process the image with the Google Cloud Vision API
        with open(temp_path, 'rb') as image_file:
            content = image_file.read()
            image = vision.Image(content=content)

        response = client.label_detection(image=image)
        labels = response.label_annotations

        # Convert labels into a JSON-serializable format
        serialized_labels = [{'description': label.description, 'score': label.score} for label in labels]

        # Fetch recyclable identifiers (main category and subcategory) from the database
        recyclable_identifiers = RecyclableIdentifier.objects.all()

        # Check if any label matches a subcategory with a confidence score >= 0.8
        matched_category = None
        matched_confidence = 0.0
        for label in labels:

            # Check if the label is in NON_REAL_IMAGE_LABELS
            if label.description.lower() in NON_REAL_IMAGE_LABELS:
                matched_category = None
                matched_confidence = 0.0
                break

            for identifier in recyclable_identifiers:
                if identifier.subcategory.lower() in label.description.lower() and label.score >= 0.8:
                    matched_category = identifier.category  # Get the main category
                    matched_confidence = label.score
                    continue

            if matched_category:
                continue

        # Clean up the temporary file
        os.remove(temp_path)

        # Create an Item instance
        item = Item.objects.create(
            category=matched_category if matched_category else "Unidentified",
            confidence=matched_confidence,
            description=description,
            weight=weight,
            brand=brand,
            labels=serialized_labels,
            user = User.objects.get(username=user_name),  # Assuming user_name is unique
        )

        # Return the response
        if matched_category:
            return Response({
                'identified': True,
                'category': matched_category,
                'confidence': matched_confidence,
                'message': f"Item recognised as {matched_category}. Is this correct?",
                'item_id': item.item_id,
                'labels': serialized_labels
            })
        else:
            return Response({
                'identified': False,
                'message': "Item not identified confidently. Please select a category manually.",
                'item_id': item.item_id,
                'categories': [identifier.category for identifier in recyclable_identifiers],
                'labels': serialized_labels
            })

    except Exception as e:
        # Handle errors (e.g., Vision API issues)
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)  # Ensure the file is cleaned up
        return Response({'error': str(e)}, status=500)


