from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.inventory.models import Inventory
from .models import Sale, SaleItem


@transaction.atomic
def create_sale(*, sale_data, items_data, user):
    sale = Sale.objects.create(
        **sale_data,
        sold_by=user,
    )

    total_amount = 0
    today = timezone.now().date()

    for item_data in items_data:
        medicine_id = item_data["medicine"]
        remaining_quantity = item_data["quantity"]

        inventories = (
            Inventory.objects
            .select_for_update()
            .select_related("batch", "batch__medicine")
            .filter(
                branch=sale.branch,
                batch__medicine_id=medicine_id,
                batch__expiry_date__gte=today,
                quantity__gt=0,
            )
            .order_by(
                "batch__expiry_date",
                "batch_id",
            )
        )

        available_quantity = sum(
            inventory.quantity
            for inventory in inventories
        )

        if available_quantity < remaining_quantity:
            raise ValidationError(
                f"Insufficient stock for medicine ID {medicine_id}. "
                f"Available: {available_quantity}"
            )

        for inventory in inventories:
            if remaining_quantity <= 0:
                break

            quantity_to_sell = min(
                inventory.quantity,
                remaining_quantity,
            )

            batch = inventory.batch
            selling_price = batch.selling_price

            subtotal = quantity_to_sell * selling_price

            SaleItem.objects.create(
                sale=sale,
                batch=batch,
                quantity=quantity_to_sell,
                selling_price=selling_price,
                subtotal=subtotal,
            )

            inventory.quantity -= quantity_to_sell
            inventory.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )

            total_amount += subtotal
            remaining_quantity -= quantity_to_sell

    sale.total_amount = total_amount

    net_amount = total_amount - sale.discount

    if sale.paid_amount < net_amount:
        sale.due_amount = net_amount - sale.paid_amount
    else:
        sale.due_amount = 0

    sale.save(
        update_fields=[
            "total_amount",
            "due_amount",
        ]
    )

    return sale