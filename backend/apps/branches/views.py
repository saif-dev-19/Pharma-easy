from rest_framework import viewsets

from apps.authentication.permissions import IsAdmin

from .models import Branch
from .serializers import BranchSerializer


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [IsAdmin]