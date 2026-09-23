import uuid

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.inventory.models import Inventory
from apps.medicines.models import Batch

from .models import Purchase, PurchaseItem


def _get_or_create_batch(item_data):
    if item_data.get("batch"):
        return item_data["batch"]

    batch_data = {
        "medicine": item_data["medicine"],
        "expiry_date": item_data["expiry_date"],
        "pack_size": item_data["pack_size"],
        "purchase_price": item_data["purchase_price"],
        "selling_price": item_data["selling_price"],
    }

    return Batch.objects.create(**batch_data)


def _add_inventory(*, branch, batch, quantity):
    inventory, created = Inventory.objects.select_for_update().get_or_create(
        branch=branch,
        batch=batch,
        defaults={"quantity": quantity},
    )

    if not created:
        inventory.quantity += quantity
        inventory.save(update_fields=["quantity", "updated_at"])


def _remove_inventory(*, branch, batch, quantity):
    inventory = Inventory.objects.select_for_update().get(
        branch=branch,
        batch=batch,
    )

    if inventory.quantity < quantity:
        raise ValidationError(
            f"Cannot remove {quantity} units from batch {batch.batch_number}."
        )

    inventory.quantity -= quantity
    inventory.save(update_fields=["quantity", "updated_at"])


def _create_items(*, purchase, items_data):
    for item_data in items_data:
        batch = _get_or_create_batch(item_data)

        PurchaseItem.objects.create(
            purchase=purchase,
            batch=batch,
            quantity=item_data["quantity"],
            purchase_price=item_data["purchase_price"],
            selling_price=item_data["selling_price"],
        )
        _add_inventory(
            branch=purchase.branch,
            batch=batch,
            quantity=item_data["quantity"],
        )


@transaction.atomic
def create_purchase(*, purchase_data, items_data, user):
    if not items_data:
        raise ValidationError("At least one purchase item is required.")

    total_amount = sum(
        item["purchase_price"] * item["quantity"]
        for item in items_data
    )
    purchase_data = {
        **purchase_data,
        "invoice_number": (
            f"PUR-{timezone.now().year}-{uuid.uuid4().hex[:10].upper()}"
        ),
    }
    purchase = Purchase.objects.create(
        **{**purchase_data, "total_amount": total_amount},
        created_by=user,
    )
    _create_items(purchase=purchase, items_data=items_data)
    return purchase


@transaction.atomic
def update_purchase(*, purchase, purchase_data, items_data):
    old_branch = purchase.branch
    old_items = list(
        purchase.items.select_related("batch").select_for_update()
    )

    for item in old_items:
        _remove_inventory(
            branch=old_branch,
            batch=item.batch,
            quantity=item.quantity,
        )

    for field, value in purchase_data.items():
        setattr(purchase, field, value)

    if items_data is not None:
        purchase.items.all().delete()
        purchase.total_amount = sum(
            item["purchase_price"] * item["quantity"]
            for item in items_data
        )
    else:
        purchase.total_amount = sum(
            item.purchase_price * item.quantity
            for item in old_items
        )

    purchase.save()

    if items_data is not None:
        _create_items(purchase=purchase, items_data=items_data)
    else:
        for item in old_items:
            _add_inventory(
                branch=purchase.branch,
                batch=item.batch,
                quantity=item.quantity,
            )

    return purchase


@transaction.atomic
def delete_purchase(*, purchase):
    items = list(
        purchase.items.select_related("batch").select_for_update()
    )

    for item in items:
        _remove_inventory(
            branch=purchase.branch,
            batch=item.batch,
            quantity=item.quantity,
        )

    purchase.delete()