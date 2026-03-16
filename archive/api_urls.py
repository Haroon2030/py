from django.urls import path, include
from rest_framework.routers import DefaultRouter
from archive.api_views import (
    BranchViewSet, ArchiveDocumentViewSet, UserViewSet,
    api_login, api_logout, api_user, api_stats
)

router = DefaultRouter()
router.register(r'branches', BranchViewSet)
router.register(r'documents', ArchiveDocumentViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('auth/login/', api_login, name='api_login'),
    path('auth/logout/', api_logout, name='api_logout'),
    path('auth/user/', api_user, name='api_user'),
    path('stats/', api_stats, name='api_stats'),
    path('', include(router.urls)),
]
