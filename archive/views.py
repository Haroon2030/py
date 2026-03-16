from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from .models import ArchiveDocument, Branch
from .forms import ArchiveDocumentForm, BranchForm


@login_required
def archive_list(request):
    """عرض قائمة الأرشيف مع البحث والفلترة"""
    documents = ArchiveDocument.objects.select_related('branch', 'uploaded_by').all()

    # البحث
    search = request.GET.get('search', '')
    if search:
        documents = documents.filter(
            Q(employee_name__icontains=search) |
            Q(branch__name__icontains=search) |
            Q(notes__icontains=search)
        )

    # فلترة حسب الفرع
    branch_id = request.GET.get('branch', '')
    if branch_id:
        documents = documents.filter(branch_id=branch_id)

    # فلترة حسب التاريخ
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    if date_from:
        documents = documents.filter(document_date__gte=date_from)
    if date_to:
        documents = documents.filter(document_date__lte=date_to)

    # الترقيم
    paginator = Paginator(documents, 15)
    page = request.GET.get('page')
    documents = paginator.get_page(page)

    branches = Branch.objects.all()
    total_count = paginator.count
    today_count = ArchiveDocument.objects.filter(created_at__date=timezone.now().date()).count()

    context = {
        'documents': documents,
        'branches': branches,
        'search': search,
        'branch_id': branch_id,
        'date_from': date_from,
        'date_to': date_to,
        'total_count': total_count,
        'today_count': today_count,
    }
    return render(request, 'archive/archive_list.html', context)


@login_required
def archive_upload(request):
    """رفع مستند جديد"""
    if request.method == 'POST':
        form = ArchiveDocumentForm(request.POST, request.FILES)
        if form.is_valid():
            doc = form.save(commit=False)
            doc.uploaded_by = request.user
            doc.save()
            messages.success(request, f'تم رفع المستند بنجاح: {doc.employee_name}')
            return redirect('archive_list')
    else:
        form = ArchiveDocumentForm()

    return render(request, 'archive/archive_upload.html', {'form': form})


@login_required
def archive_detail(request, pk):
    """عرض تفاصيل مستند"""
    document = get_object_or_404(ArchiveDocument, pk=pk)
    return render(request, 'archive/archive_detail.html', {'document': document})


@login_required
def archive_delete(request, pk):
    """حذف مستند"""
    document = get_object_or_404(ArchiveDocument, pk=pk)
    if request.method == 'POST':
        name = document.employee_name
        document.pdf_file.delete()
        document.delete()
        messages.success(request, f'تم حذف المستند: {name}')
        return redirect('archive_list')
    return render(request, 'archive/archive_confirm_delete.html', {'document': document})


@login_required
def branch_manage(request):
    """إدارة الفروع"""
    if request.method == 'POST':
        form = BranchForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة الفرع بنجاح.')
            return redirect('branch_manage')
    else:
        form = BranchForm()

    branches = Branch.objects.all()
    return render(request, 'archive/branch_manage.html', {'form': form, 'branches': branches})


@login_required
def branch_delete(request, pk):
    """حذف فرع"""
    branch = get_object_or_404(Branch, pk=pk)
    if request.method == 'POST':
        branch.delete()
        messages.success(request, 'تم حذف الفرع.')
        return redirect('branch_manage')
    return redirect('branch_manage')
