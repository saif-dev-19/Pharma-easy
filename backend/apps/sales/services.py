from django.db import transaction

from .models import Sale, SaleItem
from apps.inventory.models import Inventory


@transaction.atomic
def create_sale(*, sale_data, items_data, user):

    sale = Sale.objects.create(
        invoice_number=sale_data["invoice_number"],
        branch=sale_data["branch"],
        sold_by=user,
        sale_date=sale_data["sale_date"],
        discount=sale_data["discount"],
        paid_amount=sale_data["paid_amount"],
    )

    total_amount = 0

    for item in items_data:
        batch = item["batch"]
        quantity = item["quantity"]
        selling_price = item["selling_price"]
        subtotal = item["subtotal"]

        inventory = Inventory.objects.select_for_update().get(
            branch=sale.branch,
            batch=batch,
        )

        if inventory.quantity < quantity:
            raise ValueError(
                f"Insufficient stock for {batch.medicine.name}."
            )

        inventory.quantity -= quantity
        inventory.save(
            update_fields=["quantity", "updated_at"]
        )

        SaleItem.objects.create(
            sale=sale,
            batch=batch,
            quantity=quantity,
            selling_price=selling_price,
            subtotal=subtotal,
        )

        total_amount += subtotal

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