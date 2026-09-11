from rest_framework import serializers

from apps.sales.models import Sale


class DashboardSaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = [
            "id",
            "invoice_number",
            "branch",
            "sale_date",
            "total_amount",
            "discount",
            "paid_amount",
            "due_amount",
        ]