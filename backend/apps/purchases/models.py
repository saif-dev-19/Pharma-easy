from django.conf import settings
from django.db import models

from apps.branches.models import Branch
from apps.medicines.models import Batch


class Supplier(models.Model):
    name = models.CharField(max_length=150)
    company_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Purchase(models.Model):
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="purchases"
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.PROTECT,
        related_name="purchases"
    )
    invoice_number = models.CharField(max_length=100, unique=True)
    purchase_date = models.DateField()
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="purchases_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-purchase_date", "-id"]

    def __str__(self):
        return self.invoice_number

class PurchaseItem(models.Model):
    purchase = models.ForeignKey(
        Purchase,
        on_delete=models.CASCADE,
        related_name="items"
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name="purchase_items"
    )
    quantity = models.PositiveIntegerField()
    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def save(self, *args, **kwargs):
        self.subtotal = self.purchase_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.batch} - {self.quantity}"