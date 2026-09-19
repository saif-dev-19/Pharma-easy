from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.authentication.permissions import IsAdminManagerOrStaff, IsAdminOrManager

from .models import Sale
from .serializers import (
    SaleSerializer,
    SaleItemInputSerializer,
)
from .services import create_sale


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        queryset = Sale.objects.select_related(
            "branch",
            "sold_by",
        ).prefetch_related("items__batch__medicine")

        user = self.request.user

        if user.role != "ADMIN":
            queryset = queryset.filter(
                branch=user.branch
            )

        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if date_from:
            queryset = queryset.filter(
                sale_date__gte=date_from
            )

        if date_to:
            queryset = queryset.filter(
                sale_date__lte=date_to
        )

        return queryset



    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        items_data = validated_data.pop("items")

        sale = create_sale(
            sale_data=validated_data,
            items_data=items_data,
            user=request.user,
        )

        response_serializer = SaleSerializer(sale)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )