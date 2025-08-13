from celery import app as celery_app

from .task_queue import app as celery_app

__all__ = ("celery_app",)