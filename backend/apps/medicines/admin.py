from django.contrib import admin

from .models import Medicine, Batch


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "generic_name",
        "strength",
        "dosage_form",
        "manufacturer",
        "is_active",
    )

    list_filter = (
        "dosage_form",
        "manufacturer",
        "is_active",
    )

    search_fields = (
        "name",
        "generic_name",
        "strength",
        "manufacturer",
    )

    ordering = ("name",)


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "medicine",
        "batch_number",
        "expiry_date",
        "pack_size",
        "purchase_price",
        "selling_price",
    )

    list_filter = (
        "expiry_date",
        "medicine",
    )

    search_fields = (
        "batch_number",
        "medicine__name",
    )

    ordering = (
        "expiry_date",
        "medicine__name",
    )