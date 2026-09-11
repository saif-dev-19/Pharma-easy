from django.contrib import admin

from .models import Sale, SaleItem


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "invoice_number",
        "branch",
        "sold_by",
        "sale_date",
        "total_amount",
        "discount",
        "paid_amount",
        "due_amount",
    )

    list_filter = (
        "branch",
        "sale_date",
    )

    search_fields = (
        "invoice_number",
        "sold_by__username",
    )

    ordering = ("-sale_date", "-id")


@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "sale",
        "batch",
        "quantity",
        "selling_price",
        "subtotal",
    )

    list_filter = (
        "batch",
    )

    search_fields = (
        "sale__invoice_number",
        "batch__medicine__name",
    )

    ordering = (
        "-sale__sale_date",
        "-id",
    )