from rest_framework import serializers

from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(
        source="batch.medicine.name",
        read_only=True
    )
    batch_number = serializers.CharField(
        source="batch.batch_number",
        read_only=True
    )
    expiry_date = serializers.DateField(
        source="batch.expiry_date",
        read_only=True
    )

    class Meta:
        model = Inventory
        fields = [
            "id",
            "branch",
            "batch",
            "medicine_name",
            "batch_number",
            "expiry_date",
            "quantity",
            "minimum_stock",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "updated_at",
        ]