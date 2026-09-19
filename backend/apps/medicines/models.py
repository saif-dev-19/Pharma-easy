from django.db import models


class Medicine(models.Model):
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    strength = models.CharField(max_length=100, blank=True)
    dosage_form = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)
    image = models.ImageField(
        upload_to="medicines/",
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} {self.strength}"





import uuid

from django.db import models


class Batch(models.Model):
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT,
        related_name="batches"
    )
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    pack_size = models.PositiveIntegerField()
    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    qr_code = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["medicine", "batch_number"],
                name="unique_medicine_batch"
            )
        ]

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = f"MED-{uuid.uuid4().hex[:12].upper()}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.medicine} - {self.batch_number}"