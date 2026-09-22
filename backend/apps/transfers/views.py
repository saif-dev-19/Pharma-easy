from django.db.models import Q

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import StockTransfer
from .serializers import StockTransferSerializer
from .services import (
    create_stock_transfer,
    approve_stock_transfer,
    reject_stock_transfer,
)


class StockTransferViewSet(viewsets.ModelViewSet):

    serializer_class = StockTransferSerializer

    def get_queryset(self):

        queryset = (
            StockTransfer.objects
            .select_related(
                "from_branch",
                "to_branch",
                "created_by",
                "approved_by",
            )
            .prefetch_related(
                "items__batch__medicine",
            )
        )

        user = self.request.user

        # ADMIN can see all transfers.
        #
        # MANAGER can see transfers where
        # their branch is either source or destination.
        if user.role != "ADMIN":

            queryset = queryset.filter(
                Q(from_branch=user.branch)
                | Q(to_branch=user.branch)
            )

        # From branch filter
        from_branch = self.request.query_params.get(
            "from_branch"
        )

        if from_branch:
            queryset = queryset.filter(
                from_branch_id=from_branch
            )

        # To branch filter
        to_branch = self.request.query_params.get(
            "to_branch"
        )

        if to_branch:
            queryset = queryset.filter(
                to_branch_id=to_branch
            )

        # Status filter
        status_value = self.request.query_params.get(
            "status"
        )

        if status_value:
            queryset = queryset.filter(
                status=status_value
            )

        # Date filters
        date_from = self.request.query_params.get(
            "date_from"
        )

        if date_from:
            queryset = queryset.filter(
                transfer_date__gte=date_from
            )

        date_to = self.request.query_params.get(
            "date_to"
        )

        if date_to:
            queryset = queryset.filter(
                transfer_date__lte=date_to
            )

        return queryset

    def perform_create(self, serializer):

        validated_data = serializer.validated_data
        items_data = validated_data.pop("items")

        transfer = create_stock_transfer(
            transfer_data=validated_data,
            items_data=items_data,
            user=self.request.user,
        )

        serializer.instance = transfer

    @action(
        detail=True,
        methods=["post"],
        url_path="approve",
    )
    def approve(self, request, pk=None):

        transfer = self.get_object()

        try:

            transfer = approve_stock_transfer(
                transfer=transfer,
                user=request.user,
            )

        except Exception as error:

            return Response(
                {
                    "detail": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            transfer
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="reject",
    )
    def reject(self, request, pk=None):

        transfer = self.get_object()

        try:

            transfer = reject_stock_transfer(
                transfer=transfer,
                user=request.user,
            )

        except Exception as error:

            return Response(
                {
                    "detail": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            transfer
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )