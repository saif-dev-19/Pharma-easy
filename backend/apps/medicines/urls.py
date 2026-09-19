from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GenerateBatchNumberView, MedicineViewSet, BatchViewSet


router = DefaultRouter()

router.register("medicines", MedicineViewSet, basename="medicine")
router.register("batches", BatchViewSet, basename="batch")


urlpatterns = [
    path("", include(router.urls)),
    path(
        "generate-number/",
        GenerateBatchNumberView.as_view(),
        name="generate-batch-number",
    ),
]