from django.contrib import admin

from .models import StockTransfer, StockTransferItem


@admin.register(StockTransfer)
class StockTransferAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "from_branch",
        "to_branch",
        "transfer_date",
        "status",
        "created_by",
    )

    list_filter = (
        "status",
        "from_branch",
        "to_branch",
        "transfer_date",
    )

    search_fields = (
        "from_branch__name",
        "to_branch__name",
        "created_by__username",
    )

    ordering = ("-transfer_date", "-id")


@admin.register(StockTransferItem)
class StockTransferItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "transfer",
        "batch",
        "quantity",
    )

    list_filter = (
        "batch",
    )

    search_fields = (
        "batch__medicine__name",
        "batch__batch_number",
    )

    ordering = ("-id",)