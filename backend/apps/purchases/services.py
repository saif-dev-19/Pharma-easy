from django.db import transaction

from apps.inventory.models import Inventory

from .models import Purchase, PurchaseItem


@transaction.atomic
def create_purchase(*, purchase_data, items_data, user):
    purchase = Purchase.objects.create(
        **purchase_data,
        created_by=user,
    )

    for item_data in items_data:
        item = PurchaseItem.objects.create(
            purchase=purchase,
            **item_data,
        )

        inventory, created = Inventory.objects.get_or_create(
            branch=purchase.branch,
            batch=item.batch,
            defaults={
                "quantity": item.quantity,
            },
        )

        if not created:
            inventory.quantity += item.quantity
            inventory.save(update_fields=["quantity", "updated_at"])

    return purchase