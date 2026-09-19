from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.authentication.permissions import IsAdminOrManager

from .models import StockTransfer
from .serializers import StockTransferSerializer
from .services import create_stock_transfer
from django.db.models import Q

class StockTransferViewSet(viewsets.ModelViewSet):

    serializer_class = StockTransferSerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        queryset = (
            StockTransfer.objects
            .select_related(
                "from_branch",
                "to_branch",
                "created_by",
            )
            .prefetch_related(
                "items__batch__medicine"
            )
        )

        user = self.request.user

        # Branch restriction
        if user.role != "ADMIN":
            queryset = queryset.filter(
                Q(from_branch=user.branch)
                | Q(to_branch=user.branch)
            )

        # From branch
        from_branch = self.request.query_params.get(
            "from_branch"
        )

        if from_branch:
            queryset = queryset.filter(
                from_branch_id=from_branch
            )

        # To branch
        to_branch = self.request.query_params.get(
            "to_branch"
        )

        if to_branch:
            queryset = queryset.filter(
                to_branch_id=to_branch
            )

        # Status
        status_value = self.request.query_params.get(
            "status"
        )

        if status_value:
            queryset = queryset.filter(
                status=status_value
            )

        # Date range
        date_from = self.request.query_params.get(
            "date_from"
        )

        date_to = self.request.query_params.get(
            "date_to"
        )

        if date_from:
            queryset = queryset.filter(
                transfer_date__gte=date_from
            )

        if date_to:
            queryset = queryset.filter(
                transfer_date__lte=date_to
            )

        return queryset

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