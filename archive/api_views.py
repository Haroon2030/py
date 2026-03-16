from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Count
from django.utils import timezone
from .models import Branch, ArchiveDocument
from .serializers import (
    BranchSerializer, ArchiveDocumentSerializer,
    ArchiveDocumentUploadSerializer, UserSerializer
)


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
    total = ArchiveDocument.objects.count()
    today_count = ArchiveDocument.objects.filter(created_at__date=today).count()
    branches_count = Branch.objects.count()
    recent = ArchiveDocument.objects.select_related('branch', 'uploaded_by')[:5]
    return Response({
        'total_documents': total,
        'today_documents': today_count,
        'total_branches': branches_count,
        'recent_documents': ArchiveDocumentSerializer(recent, many=True).data,
    })


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class ArchiveDocumentViewSet(viewsets.ModelViewSet):
    queryset = ArchiveDocument.objects.select_related('branch', 'uploaded_by').all()
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return ArchiveDocumentUploadSerializer
        return ArchiveDocumentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
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
        instance.pdf_file.delete()
        instance.delete()
