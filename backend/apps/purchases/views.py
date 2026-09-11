from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.authentication.permissions import IsAdminOrManager

from .models import Purchase, Supplier
from .serializers import PurchaseSerializer, SupplierSerializer
from .services import create_purchase


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.select_related(
        "supplier",
        "branch",
        "created_by",
    ).prefetch_related(
        "items",
    )
    serializer_class = PurchaseSerializer
    permission_classes = [IsAdminOrManager]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        items_data = validated_data.pop("items")
        print(items_data)

        purchase = create_purchase(
            purchase_data=validated_data,
            items_data=items_data,
            user=request.user,
        )

        response_serializer = self.get_serializer(purchase)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        user = self.request.user

        queryset = Purchase.objects.select_related(
            "supplier",
            "branch",
            "created_by",
        ).prefetch_related(
            "items",
        )

        if user.role == "ADMIN":
            return queryset

        return queryset.filter(branch=user.branch)





class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminOrManager]