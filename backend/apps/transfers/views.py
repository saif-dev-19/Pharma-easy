from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.authentication.permissions import IsAdminOrManager

from .models import StockTransfer
from .serializers import StockTransferSerializer
from .services import create_stock_transfer


class StockTransferViewSet(viewsets.ModelViewSet):

    serializer_class = StockTransferSerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            StockTransfer.objects
            .select_related(
                "from_branch",
                "to_branch",
                "created_by",
            )
            .prefetch_related(
                "items",
            )
        )

        if user.role == "ADMIN":
            return queryset

        # Manager can see transfers involving their branch
        return queryset.filter(
            from_branch=user.branch
        ) | queryset.filter(
            to_branch=user.branch
        )

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )
        serializer.is_valid(
            raise_exception=True
        )

        validated_data = serializer.validated_data

        # Remove nested items from StockTransfer data
        items_data = validated_data.pop("items", [])
        print("items_data", items_data)

        if not items_data:
            return Response(
                {
                    "detail": "At least one transfer item is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transfer = create_stock_transfer(
            transfer_data=validated_data,
            items_data=items_data,
            user=request.user,
        )

        response_serializer = self.get_serializer(
            transfer
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )                           