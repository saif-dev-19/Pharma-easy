from django.contrib import admin

from .models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "branch",
        "batch",
        "quantity",
        "minimum_stock",
        "updated_at",
    )

    list_filter = (
        "branch",
        "batch__medicine",
    )

    search_fields = (
        "batch__medicine__name",
        "batch__batch_number",
        "branch__name",
    )

    ordering = (
        "branch",
        "batch__medicine__name",
    )

    readonly_fields = (
        "updated_at",
    )