from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer
from rest_framework.permissions import AllowAny

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                    "branch_id": user.branch_id,
                    "branch_name": user.branch.name if user.branch else None,
                },
            },
            status=status.HTTP_200_OK,
        )


from rest_framework import viewsets

from .models import User
from .permissions import IsAdmin
from .serializers import UserManagementSerializer
from django.db.models import Q

class UserManagementViewSet(viewsets.ModelViewSet):
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = (
            User.objects
            .select_related("branch")
            .exclude(role=User.Role.ADMIN)
            .order_by("-id")
        )

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
            )

        return queryset