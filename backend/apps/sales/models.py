from django.conf import settings
from django.db import models

from apps.branches.models import Branch
from apps.medicines.models import Batch


class Sale(models.Model):
    invoice_number = models.CharField(
        max_length=100,
        unique=True
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.PROTECT,
        related_name="sales"
    )
    sold_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sales_made"
    )
    sale_date = models.DateField()
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    due_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-sale_date", "-id"]

    def __str__(self):
        return self.invoice_number


class SaleItem(models.Model):
    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name="items"
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name="sale_items"
    )
    quantity = models.PositiveIntegerField()
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.batch} - {self.quantity}"