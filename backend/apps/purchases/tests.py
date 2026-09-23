from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.branches.models import Branch
from apps.inventory.models import Inventory
from apps.medicines.models import Batch, Medicine

from .models import Purchase, Supplier
from .serializers import PurchaseItemSerializer
from .services import create_purchase, delete_purchase, update_purchase


class PurchaseServiceTests(TestCase):
	def setUp(self):
		self.branch = Branch.objects.create(
			name="Main Branch",
			address="Dhaka",
		)
		self.user = get_user_model().objects.create_user(
			username="admin",
			password="password",
			role="ADMIN",
		)
		self.supplier = Supplier.objects.create(
			name="Acme Pharma",
			phone="01700000000",
		)
		self.medicine = Medicine.objects.create(
			name="Paracetamol",
			strength="500mg",
		)

	def purchase_data(self, invoice_number):
		return {
			"supplier": self.supplier,
			"branch": self.branch,
			"invoice_number": invoice_number,
			"purchase_date": timezone.now().date(),
		}

	def item_data(self, quantity=10):
		return {
			"medicine": self.medicine,
			"supplier_batch_number": "SUP-001",
			"expiry_date": timezone.now().date().replace(year=timezone.now().year + 1),
			"pack_size": 10,
			"quantity": quantity,
			"purchase_price": 5,
			"selling_price": 8,
		}

	def test_purchase_creates_batch_and_inventory(self):
		purchase = create_purchase(
			purchase_data=self.purchase_data("INV-001"),
			items_data=[self.item_data()],
			user=self.user,
		)

		item = purchase.items.get()
		batch = item.batch
		inventory = Inventory.objects.get(branch=self.branch, batch=batch)

		self.assertEqual(Purchase.objects.count(), 1)
		self.assertRegex(
			purchase.invoice_number,
			r"^PUR-\d{4}-[A-F0-9]{10}$",
		)
		self.assertEqual(Batch.objects.count(), 1)
		self.assertTrue(batch.batch_number.startswith("BTH-"))
		self.assertTrue(batch.qr_code.startswith("MED-"))
		self.assertEqual(batch.supplier_batch_number, "")
		self.assertEqual(item.subtotal, 50)
		self.assertEqual(purchase.total_amount, 50)
		self.assertEqual(inventory.quantity, 10)

	def test_same_supplier_batch_reuses_batch_and_increments_inventory(self):
		batch = Batch.objects.create(
			medicine=self.medicine,
			expiry_date=timezone.now().date().replace(
				year=timezone.now().year + 1
			),
			pack_size=10,
			purchase_price=5,
			selling_price=8,
		)
		existing_item = {
			"batch": batch,
			"quantity": 10,
			"purchase_price": batch.purchase_price,
			"selling_price": batch.selling_price,
		}
		first_purchase = create_purchase(
			purchase_data=self.purchase_data("INV-001"),
			items_data=[existing_item],
			user=self.user,
		)
		first_batch = first_purchase.items.get().batch

		second_purchase = create_purchase(
			purchase_data=self.purchase_data("INV-002"),
			items_data=[{
				**existing_item,
				"quantity": 7,
			}],
			user=self.user,
		)

		second_batch = second_purchase.items.get().batch
		inventory = Inventory.objects.get(branch=self.branch, batch=first_batch)

		self.assertEqual(first_batch.pk, second_batch.pk)
		self.assertEqual(Batch.objects.count(), 1)
		self.assertEqual(inventory.quantity, 17)

	def test_update_and_delete_reconcile_inventory(self):
		purchase = create_purchase(
			purchase_data=self.purchase_data("INV-001"),
			items_data=[self.item_data(quantity=10)],
			user=self.user,
		)

		update_purchase(
			purchase=purchase,
			purchase_data={},
			items_data=[self.item_data(quantity=15)],
		)
		batch = purchase.items.get().batch
		inventory = Inventory.objects.get(branch=self.branch, batch=batch)

		self.assertEqual(inventory.quantity, 15)
		self.assertEqual(purchase.total_amount, 75)

		delete_purchase(purchase=purchase)

		inventory.refresh_from_db()
		self.assertEqual(inventory.quantity, 0)
		self.assertFalse(Purchase.objects.filter(pk=purchase.pk).exists())

	def test_existing_batch_serializer_does_not_require_prices(self):
		batch = Batch.objects.create(
			medicine=self.medicine,
			expiry_date=timezone.now().date().replace(
				year=timezone.now().year + 1
			),
			pack_size=10,
			purchase_price=5,
			selling_price=8,
		)

		serializer = PurchaseItemSerializer(
			data={"batch": batch.pk, "quantity": 5}
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		self.assertEqual(serializer.validated_data["purchase_price"], 5)
		self.assertEqual(serializer.validated_data["selling_price"], 8)

		override_serializer = PurchaseItemSerializer(
			data={
				"batch": batch.pk,
				"quantity": 5,
				"purchase_price": "6.00",
				"selling_price": "9.00",
			}
		)

		self.assertTrue(override_serializer.is_valid(), override_serializer.errors)
		self.assertEqual(override_serializer.validated_data["purchase_price"], 6)
		self.assertEqual(override_serializer.validated_data["selling_price"], 9)
