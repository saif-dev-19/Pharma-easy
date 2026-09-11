from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "id",
        "username",
        "email",
        "role",
        "branch",
        "is_active",
        "is_staff",
    )

    list_filter = (
        "role",
        "branch",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "username",
        "email",
    )

    ordering = ("username",)

    fieldsets = UserAdmin.fieldsets + (
        (
            "Pharmacy Information",
            {
                "fields": (
                    "role",
                    "branch",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Pharmacy Information",
            {
                "fields": (
                    "role",
                    "branch",
                )
            },
        ),
    )