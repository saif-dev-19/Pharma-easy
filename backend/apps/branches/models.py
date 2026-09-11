from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=150, unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name