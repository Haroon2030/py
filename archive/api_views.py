from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.utils import timezone
from .models import Branch, ArchiveDocument, UserProfile
from .serializers import (
    BranchSerializer, ArchiveDocumentSerializer,
    ArchiveDocumentUploadSerializer, ArchiveDocumentUpdateSerializer,
    UserSerializer, UserManagementSerializer, UserCreateSerializer
)


def _user_branch(user):
    """الحصول على فرع المستخدم من الملف الشخصي"""
    profile = getattr(user, 'profile', None)
    if not profile:
        profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile.branch


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            'user': UserSerializer(user).data,
            'message': 'تم تسجيل الدخول بنجاح'
        })
    return Response(
        {'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
def api_logout(request):
    logout(request)
    return Response({'message': 'تم تسجيل الخروج'})


@api_view(['GET'])
def api_user(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
def api_stats(request):
    today = timezone.now().date()
    user = request.user
    branch = _user_branch(user)

    # المدير يرى الكل - الموظف يرى فرعه فقط
    if user.is_staff:
        docs_qs = ArchiveDocument.objects.all()
    else:
        if branch:
            docs_qs = ArchiveDocument.objects.filter(branch=branch)
        else:
            docs_qs = ArchiveDocument.objects.none()

    total = docs_qs.count()
    today_count = docs_qs.filter(created_at__date=today).count()
    branches_count = Branch.objects.count() if user.is_staff else (1 if branch else 0)
    recent = docs_qs.select_related('branch', 'uploaded_by')[:5]

    return Response({
        'total_documents': total,
        'today_documents': today_count,
        'total_branches': branches_count,
        'recent_documents': ArchiveDocumentSerializer(recent, many=True).data,
    })


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    pagination_class = None  # الفروع بدون ترقيم - تُستخدم في القوائم المنسدلة

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class ArchiveDocumentViewSet(viewsets.ModelViewSet):
    queryset = ArchiveDocument.objects.select_related('branch', 'uploaded_by').all()
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return ArchiveDocumentUploadSerializer
        if self.action in ('update', 'partial_update'):
            return ArchiveDocumentUpdateSerializer
        return ArchiveDocumentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # الموظف يرى فرعه فقط - المدير يرى الكل
        if not user.is_staff:
            branch = _user_branch(user)
            if branch:
                qs = qs.filter(branch=branch)
            else:
                return qs.none()

        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(employee_name__icontains=search) |
                Q(branch__name__icontains=search) |
                Q(notes__icontains=search)
            )
        branch_id = self.request.query_params.get('branch', '')
        if branch_id:
            qs = qs.filter(branch_id=branch_id)
        date_from = self.request.query_params.get('date_from', '')
        date_to = self.request.query_params.get('date_to', '')
        if date_from:
            qs = qs.filter(document_date__gte=date_from)
        if date_to:
            qs = qs.filter(document_date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def perform_destroy(self, instance):
        # فقط المدير يمكنه الحذف
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('فقط المدير يمكنه حذف المستندات')
        instance.pdf_file.delete()
        instance.delete()

    def perform_update(self, serializer):
        # الموظف يعدل فقط مستندات فرعه
        user = self.request.user
        if not user.is_staff:
            branch = _user_branch(user)
            if branch and serializer.instance.branch_id != branch.id:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('لا يمكنك تعديل مستندات فرع آخر')
        serializer.save()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('profile', 'profile__branch').all().order_by('-date_joined')
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserManagementSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return qs

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'لا يمكنك تعطيل حسابك'}, status=400)
        user.is_active = not user.is_active
        user.save()
        return Response(UserManagementSerializer(user).data)

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password', '')
        if len(new_password) < 6:
            return Response({'error': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'message': f'تم تغيير كلمة مرور {user.username} بنجاح'})

    @action(detail=True, methods=['post'])
    def set_branch(self, request, pk=None):
        """تعيين فرع للمستخدم"""
        user = self.get_object()
        branch_id = request.data.get('branch_id')
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if branch_id:
            try:
                branch = Branch.objects.get(id=branch_id)
                profile.branch = branch
            except Branch.DoesNotExist:
                return Response({'error': 'الفرع غير موجود'}, status=400)
        else:
            profile.branch = None
        profile.save()
        return Response(UserManagementSerializer(user).data)
