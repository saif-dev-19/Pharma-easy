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
    queryset = Sale.objects.select_related(
        "branch",
        "sold_by",
    ).prefetch_related(
        "items",
    )

    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

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