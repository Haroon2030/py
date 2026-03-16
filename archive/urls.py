from django.urls import path
from . import views

urlpatterns = [
    path('', views.archive_list, name='archive_list'),
    path('upload/', views.archive_upload, name='archive_upload'),
    path('detail/<int:pk>/', views.archive_detail, name='archive_detail'),
    path('delete/<int:pk>/', views.archive_delete, name='archive_delete'),
    path('branches/', views.branch_manage, name='branch_manage'),
    path('branches/delete/<int:pk>/', views.branch_delete, name='branch_delete'),
]
