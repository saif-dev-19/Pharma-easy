from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.inventory.models import Inventory

from .models import StockTransfer, StockTransferItem


@transaction.atomic
def create_stock_transfer(*, transfer_data, items_data, user):

    # Transfer request is created as PENDING.
    # No inventory will be changed here.

    transfer = StockTransfer.objects.create(
        **transfer_data,
        created_by=user,
        status=StockTransfer.Status.PENDING,
    )

    for item_data in items_data:
        batch = item_data["batch"]
        quantity = item_data["quantity"]

        # Make sure the requested batch is not expired.
        today = timezone.now().date()

        if batch.expiry_date < today:
            raise ValidationError(
                f"Batch {batch.batch_number} is expired."
            )

        # Check source inventory exists.
        try:
            source_inventory = Inventory.objects.get(
                branch=transfer.from_branch,
                batch=batch,
            )
        except Inventory.DoesNotExist:
            raise ValidationError(
                f"No stock found for batch {batch.id} "
                f"in source branch."
            )

        # Check whether source branch currently has enough stock.
        if source_inventory.quantity < quantity:
            raise ValidationError(
                f"Insufficient stock for batch "
                f"{batch.batch_number}. "
                f"Available: {source_inventory.quantity}"
            )

        # Create transfer item.
        #
        # IMPORTANT:
        # Stock is NOT reduced here.
        StockTransferItem.objects.create(
            transfer=transfer,
            batch=batch,
            quantity=quantity,
        )

    return transfer


@transaction.atomic
def approve_stock_transfer(*, transfer, user):

    # Only PENDING transfers can be approved.
    if transfer.status != StockTransfer.Status.PENDING:
        raise ValidationError(
            "Only pending transfer requests can be approved."
        )

    # Admin can approve any transfer.
    #
    # Manager can approve only if the transfer
    # is coming to their own branch.
    if user.role != "ADMIN":

        if not user.branch_id:
            raise ValidationError(
                "User is not assigned to a branch."
            )

        if user.branch_id != transfer.to_branch_id:
            raise ValidationError(
                "Only the destination branch can approve "
                "this transfer."
            )

    today = timezone.now().date()

    items = transfer.items.select_related(
        "batch",
        "batch__medicine",
    )

    for item in items:

        batch = item.batch
        quantity = item.quantity

        # Don't transfer expired stock.
        if batch.expiry_date < today:
            raise ValidationError(
                f"Batch {batch.batch_number} is expired."
            )

        # Lock source inventory.
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
                f"No stock found for batch "
                f"{batch.batch_number} in source branch."
            )

        # Check current stock again.
        #
        # This is IMPORTANT.
        #
        # Between creating the request and approving it,
        # someone may have sold/transferred some of the stock.
        if source_inventory.quantity < quantity:
            raise ValidationError(
                f"Insufficient stock for batch "
                f"{batch.batch_number}. "
                f"Available: {source_inventory.quantity}"
            )

        # Reduce source branch stock.
        source_inventory.quantity -= quantity

        source_inventory.save(
            update_fields=[
                "quantity",
                "updated_at",
            ]
        )

        # Get/create destination inventory.
        destination_inventory, created = (
            Inventory.objects
            .select_for_update()
            .get_or_create(
                branch=transfer.to_branch,
                batch=batch,
                defaults={
                    "quantity": quantity,
                    "minimum_stock": source_inventory.minimum_stock,
                },
            )
        )

        # If destination inventory already exists,
        # increase its quantity.
        if not created:

            destination_inventory.quantity += quantity

            destination_inventory.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )

    # Mark transfer as completed.
    transfer.status = StockTransfer.Status.COMPLETED

    transfer.approved_by = user
    transfer.approved_at = timezone.now()

    transfer.save(
        update_fields=[
            "status",
            "approved_by",
            "approved_at",
        ]
    )

    return transfer


@transaction.atomic
def reject_stock_transfer(*, transfer, user):

    # Only pending transfers can be rejected.
    if transfer.status != StockTransfer.Status.PENDING:
        raise ValidationError(
            "Only pending transfer requests can be rejected."
        )

    # Admin can reject any transfer.
    #
    # Manager can reject only incoming requests
    # for their own branch.
    if user.role != "ADMIN":

        if not user.branch_id:
            raise ValidationError(
                "User is not assigned to a branch."
            )

        if user.branch_id != transfer.to_branch_id:
            raise ValidationError(
                "Only the destination branch can reject "
                "this transfer."
            )

    # Rejecting a transfer does NOT modify inventory.
    transfer.status = StockTransfer.Status.CANCELLED

    transfer.save(
        update_fields=[
            "status",
        ]
    )

    return transfer