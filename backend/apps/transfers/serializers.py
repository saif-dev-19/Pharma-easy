from rest_framework import serializers

from .models import StockTransfer, StockTransferItem


class StockTransferItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(
        source="batch.medicine.name",
        read_only=True
    )

    # batch = serializers.CharField(
    #     source="batch.batch_number",
    #     read_only=True
    # )
    class Meta:
        model = StockTransferItem
        fields = [
            "id",
            "batch",
            "medicine_name",
            "quantity",
        ]
        read_only_fields = ["id"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )
        return value


class StockTransferSerializer(serializers.ModelSerializer):
    items = StockTransferItemSerializer(many=True)

    from_branch_name = serializers.CharField(
        source="from_branch.name",
        read_only=True
    )

    to_branch_name = serializers.CharField(
        source="to_branch.name",
        read_only=True
    )

    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    approved_by_name = serializers.CharField(
        source="approved_by.username",
        read_only=True,
    )

    class Meta:
        model = StockTransfer

        fields = [
            "id",
            "from_branch",
            "from_branch_name",
            "to_branch",
            "to_branch_name",
            "transfer_date",
            "status",
            "created_by",
            "created_by_name",
            "approved_by",
            "approved_by_name",
            "approved_at",
            "created_at",
            "items",
        ]

        read_only_fields = [
            "id",
            "status",
            "created_by",
            "created_by_name",
            "approved_by",
            "approved_by_name",
            "approved_at",
            "created_at",
        ]


    def validate(self, attrs):
        from_branch = attrs.get("from_branch")
        to_branch = attrs.get("to_branch")

        if from_branch == to_branch:
            raise serializers.ValidationError(
                "Source and destination branches cannot be the same."
            )

        request = self.context.get("request")
        user = request.user

        # Manager can transfer only from their own branch
        if user.role == "MANAGER":
            if user.branch_id != from_branch.id:
                raise serializers.ValidationError(
                    "Manager can only transfer stock from their own branch."
                )

        # Prevent duplicate batch lines
        items = self.initial_data.get("items", [])
        batch_ids = [item.get("batch") for item in items]

        if len(batch_ids) != len(set(batch_ids)):
            raise serializers.ValidationError(
                "The same batch cannot appear multiple times."
            )

        return attrs