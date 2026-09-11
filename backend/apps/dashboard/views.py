from django.db.models import Sum
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.branches.models import Branch
from apps.medicines.models import Medicine
from apps.purchases.models import Supplier
from apps.inventory.models import Inventory
from apps.sales.models import Sale
from django.db import models
from .serializers import DashboardSaleSerializer


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # Base querysets
        branches = Branch.objects.filter(is_active=True)
        inventory = Inventory.objects.select_related(
            "branch",
            "batch",
            "batch__medicine",
        )
        sales = Sale.objects.select_related(
            "branch",
            "sold_by",
        )

        # Branch-based access
        if user.role != "ADMIN":
            branches = branches.filter(id=user.branch_id)
            inventory = inventory.filter(branch=user.branch)
            sales = sales.filter(branch=user.branch)

        # Today's sales
        today_sales = sales.filter(
            sale_date=today
        )

        today_sales_amount = (
            today_sales.aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        # Low stock
        low_stock_count = inventory.filter(
            quantity__lte=models.F("minimum_stock")
        ).count()

        # Expired stock
        expired_stock_count = inventory.filter(
            batch__expiry_date__lt=today,
            quantity__gt=0,
        ).count()

        # Total stock
        total_stock_quantity = (
            inventory.aggregate(
                total=Sum("quantity")
            )["total"] or 0
        )

        recent_sales = sales.order_by(
            "-created_at"
        )[:5]

        return Response({
            "total_branches": branches.count(),

            "total_medicines": Medicine.objects.filter(
                is_active=True
            ).count(),

            "total_suppliers": Supplier.objects.filter(
                is_active=True
            ).count(),

            "total_stock_quantity": total_stock_quantity,

            "low_stock_count": low_stock_count,

            "expired_stock_count": expired_stock_count,

            "today_sales_count": today_sales.count(),

            "today_sales_amount": today_sales_amount,

            "recent_sales": DashboardSaleSerializer(
                recent_sales,
                many=True
            ).data,
        })