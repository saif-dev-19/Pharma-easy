from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.branches.models import Branch


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MANAGER = "MANAGER", "Manager"
        STAFF = "STAFF", "Staff"

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )

    def __str__(self):
        return self.username