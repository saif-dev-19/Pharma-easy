from rest_framework import serializers

from apps.medicines.models import Batch, Medicine

from .models import Purchase, PurchaseItem, Supplier


class PurchaseItemSerializer(serializers.Serializer):
    batch = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.select_related("medicine").all(),
        write_only=True,
        required=False,
    )
    medicine = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.filter(is_active=True),
        write_only=True,
        required=False,
    )
    supplier_batch_number = serializers.CharField(read_only=True)
    expiry_date = serializers.DateField(required=False, write_only=True)
    pack_size = serializers.IntegerField(
        min_value=1,
        required=False,
        write_only=True,
    )
    quantity = serializers.IntegerField(min_value=1)
    purchase_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        required=False,
    )
    selling_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        required=False,
    )
    subtotal = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    batch_number = serializers.CharField(
        source="batch.batch_number",
        read_only=True,
    )
    qr_code = serializers.CharField(
        source="batch.qr_code",
        read_only=True,
    )
    medicine_name = serializers.CharField(
        source="batch.medicine.name",
        read_only=True,
    )

    def validate(self, attrs):
        batch = attrs.get("batch")
        if batch:
            if any(field in attrs for field in ["medicine", "expiry_date", "pack_size"]):
                raise serializers.ValidationError(
                    "Existing batch items cannot change medicine, expiry, or pack size."
                )

            attrs.setdefault("purchase_price", batch.purchase_price)
            attrs.setdefault("selling_price", batch.selling_price)

        else:
            required_fields = [
                "medicine",
                "expiry_date",
                "pack_size",
                "purchase_price",
                "selling_price",
            ]
            missing_fields = [field for field in required_fields if field not in attrs]
            if missing_fields:
                raise serializers.ValidationError(
                    "New batch items require medicine, expiry, pack size, and prices."
                )

        if attrs["selling_price"] < attrs["purchase_price"]:
            raise serializers.ValidationError(
                "Selling price cannot be lower than purchase price."
            )

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["id"] = instance.id
        data["batch"] = instance.batch_id
        data["medicine"] = instance.batch.medicine_id
        data["supplier_batch_number"] = instance.batch.supplier_batch_number
        data["expiry_date"] = instance.batch.expiry_date
        data["pack_size"] = instance.batch.pack_size
        return data


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, required=False)

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
            "invoice_number",
            "created_by_name",
            "created_at",
            "created_by",
            "total_amount",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user if request else None

        branch = attrs.get("branch")

        if user and user.role == "MANAGER" and branch:
            if user.branch_id != branch.id:
                raise serializers.ValidationError(
                    "Manager can only create purchases for their own branch."
                )

        return attrs

    def validate_items(self, items):
        keys = [
            item.get("batch").id
            if item.get("batch")
            else ("new", item["medicine"].id)
            for item in items
        ]

        if len(keys) != len(set(keys)):
            raise serializers.ValidationError(
                "A medicine and supplier batch can only appear once per purchase."
            )

        return items


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