from django.conf import settings
from django.db import models

from apps.branches.models import Branch
from apps.medicines.models import Batch


class StockTransfer(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    from_branch = models.ForeignKey(
        Branch,
        on_delete=models.PROTECT,
        related_name="outgoing_transfers",
    )

    to_branch = models.ForeignKey(
        Branch,
        on_delete=models.PROTECT,
        related_name="incoming_transfers",
    )

    transfer_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="stock_transfers_created",
    )

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_transfers_approved",
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-transfer_date", "-id"]

    def __str__(self):
        return f"{self.from_branch} → {self.to_branch}"


class StockTransferItem(models.Model):
    transfer = models.ForeignKey(
        StockTransfer,
        on_delete=models.CASCADE,
        related_name="items"
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name="transfer_items"
    )
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.batch} - {self.quantity}"