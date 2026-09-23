from django.utils import timezone
from rest_framework import serializers

from .models import Medicine,Batch


class MedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine
        fields = [
            "id",
            "name",
            "generic_name",
            "strength",
            "dosage_form",
            "manufacturer",
            "image",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]



class BatchSerializer(serializers.ModelSerializer):
    medicine = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.filter(is_active=True)
    )

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    medicine_strength = serializers.CharField(
        source="medicine.strength",
        read_only=True
    )

    class Meta:
        model = Batch
        fields = [
            "id",
            "medicine",
            "medicine_name",
            "medicine_strength",
            "supplier_batch_number",
            "batch_number",
            "expiry_date",
            "pack_size",
            "purchase_price",
            "selling_price",
            "qr_code",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "medicine_name",
            "medicine_strength",
            "supplier_batch_number",
            "batch_number",
            "qr_code",
            "created_at",
        ]



class QRMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source="medicine.name")
    generic_name = serializers.CharField(source="medicine.generic_name")
    strength = serializers.CharField(source="medicine.strength")
    dosage_form = serializers.CharField(source="medicine.dosage_form")
    manufacturer = serializers.CharField(source="medicine.manufacturer")
    medicine_image = serializers.ImageField(
    source="medicine.image",
    read_only=True
)

    is_expired = serializers.SerializerMethodField()

    fields = [
        "qr_code",
        "medicine_name",
        "generic_name",
        "strength",
        "dosage_form",
        "manufacturer",
        "medicine_image",
        "batch_number",
        "expiry_date",
        "pack_size",
        "selling_price",
        "is_expired",
    ]

    def get_is_expired(self, obj):
        return obj.expiry_date < timezone.now().date()