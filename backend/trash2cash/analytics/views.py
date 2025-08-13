import logging
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from recycler.models import RecyclingCentre, Category
from users.models import Appointment
from collections import defaultdict
from django.db.models import Count, Sum
from users.models import Appointment
from django.http import JsonResponse
from django.utils.dateparse import parse_date
logger = logging.getLogger(__name__)

class StatisticsView(APIView):
    def get(self, request):
        try:
            # read raw query params
            start_raw = request.GET.get("start")
            end_raw = request.GET.get("end")
            logger.info(f"Statistics called with start={start_raw}, end={end_raw}")

            # parse to date objects (parse_date expects 'YYYY-MM-DD')
            start = parse_date(start_raw) if start_raw else None
            end = parse_date(end_raw) if end_raw else None

            # validate parse results
            if start_raw and not start:
                return Response({"error": "Invalid start date. Expect YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            if end_raw and not end:
                return Response({"error": "Invalid end date. Expect YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

            # base queryset
            qs = Appointment.objects.filter(status='Completed')
            if start and end:
                qs = qs.filter(date__range=[start, end])

            centres = RecyclingCentre.objects.all()
            categories = Category.objects.all()

            # By centre and category (sum of item_weight)
            recycled_by_centre_and_material = defaultdict(dict)
            for centre in centres:
                for category in categories:
                    total_weight = qs.filter(centre=centre, category=category).aggregate(w=Sum('item_weight'))['w'] or 0
                    recycled_by_centre_and_material[centre.name][category.name] = total_weight

            # By category (sum of item_weight)
            recycled_by_category = {}
            for category in categories:
                total_weight = qs.filter(category=category).aggregate(w=Sum('item_weight'))['w'] or 0
                if total_weight > 0:
                    recycled_by_category[category.name] = total_weight

            # By day of week (sum of item_weight)
            recycled_by_day = {d: 0 for d in ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]}
            for appt in qs:
                if not appt or not getattr(appt, "date", None):
                    continue
                day = appt.date.strftime('%A')
                recycled_by_day[day] += appt.item_weight or 0

            data = {
                "recycled_by_centre_and_material": recycled_by_centre_and_material,
                "recycled_by_category": recycled_by_category,
                "recycled_by_day": recycled_by_day,
            }
            return Response(data)
        except Exception as exc:
            logger.exception("Unhandled error in StatisticsView")
            return Response({"error": "Server error", "detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
