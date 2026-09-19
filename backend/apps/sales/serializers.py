from rest_framework import serializers

from .models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    medicine = serializers.PrimaryKeyRelatedField(
        source="batch.medicine",
        read_only=True
    )

    class Meta:
        model = SaleItem
        fields = [
            "id",
            "medicine",
            "batch",
            "quantity",
            "selling_price",
            "subtotal",
        ]
        read_only_fields = [
            "id",
            "batch",
            "selling_price",
            "subtotal",
        ]


class SaleItemInputSerializer(serializers.Serializer):
    medicine = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)



class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "invoice_number",
            "branch",
            "sold_by",
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
            "total_amount",
            "due_amount",
            "created_at",
            "items",
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