from celery import Celery

import os
from celery import Celery

# ---------------------------------------------
# Celery Setup Summary
# ---------------------------------------------
# 1. Install required packages:
#    pip install celery redis
#
# 2. Start Redis server:
#    redis-server
#
# 3. Run Celery worker from project root:
#    celery -A trash2cash.task_queue worker --loglevel=info
# ---------------------------------------------

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trash2cash.settings")
app = Celery("trash2cash")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()