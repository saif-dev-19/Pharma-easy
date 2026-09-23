from django.test import TestCase
from django.contrib.auth import authenticate, get_user_model

from apps.branches.models import Branch

from .serializers import UserManagementSerializer


class UserManagementSerializerTests(TestCase):
	def setUp(self):
		self.branch = Branch.objects.create(
			name="Main Branch",
			address="Dhaka",
		)

	def test_create_hashes_password(self):
		serializer = UserManagementSerializer(data={
			"username": "staff-user",
			"password": "OldPassword123!",
			"role": "STAFF",
			"branch": self.branch.pk,
		})

		self.assertTrue(serializer.is_valid(), serializer.errors)
		user = serializer.save()

		self.assertNotEqual(user.password, "OldPassword123!")
		self.assertTrue(user.check_password("OldPassword123!"))

	def test_update_changes_password_with_hash(self):
		user = get_user_model().objects.create_user(
			username="staff-user",
			password="OldPassword123!",
			role="STAFF",
			branch=self.branch,
		)

		serializer = UserManagementSerializer(
			user,
			data={"password": "NewPassword456!"},
			partial=True,
		)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		updated_user = serializer.save()

		self.assertTrue(updated_user.check_password("NewPassword456!"))
		self.assertFalse(updated_user.check_password("OldPassword123!"))
		self.assertEqual(
			authenticate(
				username="staff-user",
				password="NewPassword456!",
			),
			updated_user,
		)

	def test_blank_password_keeps_existing_password(self):
		user = get_user_model().objects.create_user(
			username="staff-user",
			password="OldPassword123!",
			role="STAFF",
			branch=self.branch,
		)
		old_password_hash = user.password

		serializer = UserManagementSerializer(
			user,
			data={"email": "staff@example.com"},
			partial=True,
		)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		updated_user = serializer.save()

		self.assertEqual(updated_user.password, old_password_hash)
		self.assertTrue(updated_user.check_password("OldPassword123!"))
