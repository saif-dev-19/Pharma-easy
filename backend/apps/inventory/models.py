# apps/inventory/models.py

from django.db import models

from apps.branches.models import Branch
from apps.medicines.models import Batch


class Inventory(models.Model):
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="inventory"
    )

    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name="inventory_records"
    )

    quantity = models.PositiveIntegerField(default=0)

    minimum_stock = models.PositiveIntegerField(default=10)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["branch", "batch"],
                name="unique_branch_batch_stock"
            )
        ]

    def __str__(self):
        return f"{self.branch} - {self.batch}: {self.quantity}"