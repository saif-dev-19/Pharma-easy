"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.db import router
from django.urls import include, path

from rest_framework.routers import DefaultRouter

from apps.authentication.views import UserManagementViewSet
from apps.medicines.views import BatchQRImageView, QRMedicineDetailView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()

router.register(
    "users",
    UserManagementViewSet,
    basename="user-management"
)

urlpatterns = [
    path("admin/", admin.site.urls),

    path(
            "token/refresh/",
            TokenRefreshView.as_view(),
            name="token_refresh",
        ),

    path(
        "api/",
        include(router.urls)
    ),

    path(
        "api/auth/",
        include("apps.authentication.urls")
    ),

    path(
    "api/",
    include("apps.branches.urls")
    ),

    path(
    "api/",
    include("apps.medicines.urls")
    ),

    path(
    "api/",
    include("apps.inventory.urls")
    ),
    
    path(
    "api/",
    include("apps.purchases.urls")
),

    path(
    "api/",
    include("apps.sales.urls")
),

    path(
    "api/",
    include("apps.transfers.urls")
),


    path(
        "api/dashboard/",
        include("apps.dashboard.urls")
    ),


    path(
        "api/qr/<str:qr_code>/",
        QRMedicineDetailView.as_view(),
        name="qr-medicine-detail",
    ),

    path(
    "api/batches/<int:pk>/qr/",
    BatchQRImageView.as_view(),
    name="batch-qr",
),
]


urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)