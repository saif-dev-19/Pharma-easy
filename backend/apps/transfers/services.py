from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.inventory.models import Inventory

from .models import StockTransfer, StockTransferItem


@transaction.atomic
def create_stock_transfer(*, transfer_data, items_data, user):

    # IMPORTANT:
    # items is nested reverse relation.
    # It must NOT be passed to StockTransfer.objects.create().
    transfer = StockTransfer.objects.create(
        **transfer_data,
        created_by=user,
        status=StockTransfer.Status.COMPLETED,
    )

    today = timezone.now().date()
    print("items_data", items_data)

    for item_data in items_data:
        batch = item_data["batch"]
        quantity = item_data["quantity"]

        # Lock source inventory row
        try:
            source_inventory = (
                Inventory.objects
                .select_for_update()
                .get(
                    branch=transfer.from_branch,
                    batch=batch,
                )
            )
        except Inventory.DoesNotExist:
            raise ValidationError(
                f"No stock found for batch {batch.id} "
                f"in source branch."
            )

        # Don't transfer expired stock
        if batch.expiry_date < today:
            raise ValidationError(
                f"Batch {batch.batch_number} is expired."
            )

        # Check source stock
        if source_inventory.quantity < quantity:
            raise ValidationError(
                f"Insufficient stock for batch "
                f"{batch.batch_number}. "
                f"Available: {source_inventory.quantity}"
            )

        # Reduce source stock
        source_inventory.quantity -= quantity

        source_inventory.save(
            update_fields=[
                "quantity",
                "updated_at",
            ]
        )

        # Add destination stock
        destination_inventory, created = (
            Inventory.objects.select_for_update().get_or_create(
                branch=transfer.to_branch,
                batch=batch,
                defaults={
                    "quantity": quantity,
                    "minimum_stock": source_inventory.minimum_stock,
                },
            )
        )

        if not created:
            destination_inventory.quantity += quantity

            destination_inventory.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )

        # Create transfer item separately
        StockTransferItem.objects.create(
            transfer=transfer,
            batch=batch,
            quantity=quantity,
        )

    return transfer