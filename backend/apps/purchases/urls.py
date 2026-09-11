from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PurchaseViewSet


router = DefaultRouter()

router.register(
    "purchases",
    PurchaseViewSet,
    basename="purchase"
)
router.register(
    "suppliers",
    PurchaseViewSet,
    basename="supplier"
)
urlpatterns = [
    path("", include(router.urls)),
]