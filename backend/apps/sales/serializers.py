from rest_framework import serializers

from .models import Sale, SaleItem

class SaleItemSerializer(serializers.ModelSerializer):
    batch_number = serializers.CharField(
        source="batch.batch_number",
        read_only=True
    )

    medicine_name = serializers.CharField(
        source="batch.medicine.name",
        read_only=True
    )

    medicine_strength = serializers.CharField(
        source="batch.medicine.strength",
        read_only=True
    )

    class Meta:
        model = SaleItem
        fields = [
            "id",
            "batch",
            "batch_number",
            "medicine_name",
            "medicine_strength",
            "quantity",
            "selling_price",
            "subtotal",
        ]
        read_only_fields = [
            "id",
            "batch_number",
            "medicine_name",
            "medicine_strength",
        ]

class SaleItemInputSerializer(serializers.Serializer):
    batch = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    selling_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    subtotal = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )



class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    branch_name = serializers.CharField(
        source="branch.name",
        read_only=True
    )

    sold_by_name = serializers.CharField(
        source="sold_by.username",
        read_only=True
    )

    class Meta:
        model = Sale
        fields = [
            "id",
            "invoice_number",
            "branch",
            "branch_name",
            "sold_by",
            "sold_by_name",
            "sale_date",
            "total_amount",
            "discount",
            "paid_amount",
            "due_amount",
            "created_at",
            "items",
        ]
        read_only_fields = [
            "id",
            "sold_by",
            "sold_by_name",
            "total_amount",
            "due_amount",
            "created_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user
        branch = attrs.get("branch")

        if user.role in ["MANAGER", "STAFF"]:
            if user.branch_id != branch.id or user.role == "ADMIN":
                raise serializers.ValidationError(
                    "You can only create sales for your own branch."
                )

        discount = attrs.get("discount", 0)
        paid_amount = attrs.get("paid_amount", 0)

        if discount < 0:
            raise serializers.ValidationError(
                "Discount cannot be negative."
            )

        if paid_amount < 0:
            raise serializers.ValidationError(
                "Paid amount cannot be negative."
            )

        return attrs