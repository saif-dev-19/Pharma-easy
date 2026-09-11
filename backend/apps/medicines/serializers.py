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
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = [
            "id",
            "medicine",
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
            "qr_code",
            "created_at",
        ]



class QRMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source="medicine.name")
    generic_name = serializers.CharField(source="medicine.generic_name")
    strength = serializers.CharField(source="medicine.strength")
    dosage_form = serializers.CharField(source="medicine.dosage_form")
    manufacturer = serializers.CharField(source="medicine.manufacturer")

    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            "qr_code",
            "medicine_name",
            "generic_name",
            "strength",
            "dosage_form",
            "manufacturer",
            "batch_number",
            "expiry_date",
            "pack_size",
            "selling_price",
            "is_expired",
        ]

    def get_is_expired(self, obj):
        return obj.expiry_date < timezone.now().date()