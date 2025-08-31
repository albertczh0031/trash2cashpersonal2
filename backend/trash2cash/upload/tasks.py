from datetime import timedelta
from django.utils import timezone
from .models import OneTimeToken
from celery import shared_task

@shared_task
def delete_expired_tokens():
    expiry_time = timezone.now() - timedelta(seconds=1)
    OneTimeToken.objects.filter(created_at__lt=expiry_time).delete()