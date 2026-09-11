from django.utils import timezone

from rest_framework import status, viewsets

from apps.authentication.permissions import IsAdmin, IsAdminOrReadOnly

from .models import Medicine, Batch
from .serializers import BatchSerializer, MedicineSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Medicine.objects.all()

        search = self.request.query_params.get("search")
        is_active = self.request.query_params.get("is_active")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(generic_name__icontains=search)
                | Q(manufacturer__icontains=search)
            )

        if is_active is not None:
            queryset = queryset.filter(
                is_active=is_active.lower() == "true"
            )

        return queryset


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.select_related(
        "medicine"
    ).all()

    serializer_class = BatchSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Batch.objects.select_related(
            "medicine"
        ).all()

        search = self.request.query_params.get("search")
        expired = self.request.query_params.get("expired")

        if search:
            queryset = queryset.filter(
                Q(batch_number__icontains=search)
                | Q(medicine__name__icontains=search)
                | Q(medicine__generic_name__icontains=search)
            )

        if expired is not None:
            today = timezone.now().date()

            if expired.lower() == "true":
                queryset = queryset.filter(
                    expiry_date__lt=today
                )

            elif expired.lower() == "false":
                queryset = queryset.filter(
                    expiry_date__gte=today
                )

        return queryset



from django.shortcuts import get_object_or_404

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Batch
from .serializers import QRMedicineSerializer
from django.http import HttpResponse

class QRMedicineDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, qr_code):
        try:
            batch = Batch.objects.select_related(
                "medicine"
            ).get(qr_code=qr_code)
        except Batch.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Invalid QR code."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = QRMedicineSerializer(batch)

        return Response({
            "success": True,
            "data": serializer.data,
        })


from .services import generate_batch_qr


class BatchQRImageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        batch = get_object_or_404(
            Batch,
            pk=pk,
        )

        qr_image = generate_batch_qr(batch)

        return HttpResponse(
            qr_image.getvalue(),
            content_type="image/png",
        )