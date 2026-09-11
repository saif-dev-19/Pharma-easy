
from django.contrib import admin

from apps.purchases.models import Purchase, PurchaseItem, Supplier


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "supplier",
        "branch",
        "invoice_number",
        "purchase_date",
        "total_amount",
    )

    list_filter = (
        "supplier",
        "branch",
        "purchase_date",
    )

    search_fields = (
        "invoice_number",
        "supplier__name",
    )

    ordering = ("-purchase_date", "-id")


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "purchase",
        "batch",
        "quantity",
        "purchase_price",
        "selling_price",
        "subtotal",
    )

    list_filter = (
        "purchase",
        "batch",
    )

    search_fields = (
        "purchase__invoice_number",
        "batch__medicine__name",
    )

    ordering = ("-purchase__purchase_date", "-id")


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "company_name",
        "phone",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "company_name",
        "phone",
    )

    ordering = ("name",)
