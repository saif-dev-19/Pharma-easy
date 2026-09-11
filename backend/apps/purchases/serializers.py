from rest_framework import serializers

from .models import Purchase, PurchaseItem, Supplier


class PurchaseItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = PurchaseItem
        fields = [
            "id",
            "batch",
            "quantity",
            "purchase_price",
            "selling_price",
            "subtotal",
        ]
        read_only_fields = ["id"]


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)

    class Meta:
        model = Purchase
        fields = [
            "id",
            "supplier",
            "branch",
            "invoice_number",
            "purchase_date",
            "total_amount",
            "created_by",
            "created_at",
            "items",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user

        branch = attrs.get("branch")

        if user.role == "MANAGER":
            if user.branch_id != branch.id:
                raise serializers.ValidationError(
                    "Manager can only create purchases for their own branch."
                )

        return attrs


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "company_name",
            "phone",
            "address",
            "is_active",
        ]
        read_only_fields = ["id"]