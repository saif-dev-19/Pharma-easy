from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.authentication.permissions import IsAdminManagerOrStaff
from .models import Inventory
from .serializers import InventorySerializer
from django.db import models


class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [IsAdminManagerOrStaff]

    def get_queryset(self):
        user = self.request.user

        queryset = Inventory.objects.select_related(
            "branch",
            "batch",
            "batch__medicine",
        )

        if user.role == "ADMIN":
            return queryset

        return queryset.filter(branch=user.branch)

    @action(detail=False, methods=["get"])
    def expired(self, request):
        today = timezone.now().date()

        queryset = self.get_queryset().filter(
            batch__expiry_date__lt=today,
            quantity__gt=0,
        )

        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        queryset = self.get_queryset().filter(
            quantity__lte=models.F("minimum_stock"),
        )

        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)