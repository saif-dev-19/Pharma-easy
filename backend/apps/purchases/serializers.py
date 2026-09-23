from rest_framework import serializers

from .models import Purchase, PurchaseItem, Supplier


class PurchaseItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = PurchaseItem
        fields = [
            "id",
            "medicine",
            "quantity",
            "purchase_price",
            "selling_price",
            "subtotal",
        ]
        read_only_fields = [
            "id",
            "subtotal",
        ]


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)

    supplier_name = serializers.CharField(
        source="supplier.name",
        read_only=True
    )

    branch_name = serializers.CharField(
        source="branch.name",
        read_only=True
    )

    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    class Meta:
        model = Purchase
        fields = [
            "id",
            "supplier",
            "supplier_name",
            "branch",
            "branch_name",
            "invoice_number",
            "purchase_date",
            "total_amount",
            "created_by",
            "created_by_name",
            "created_at",
            "items",
        ]

        read_only_fields = [
            "id",
            "supplier_name",
            "branch_name",
            "created_by_name",
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
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]