"""
URL configuration for student_portal project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('archive.api_urls')),
    # Legacy Django views (keep for backwards compat)
    path('archive/', include('archive.urls')),
    path('accounts/', include('accounts.urls')),
]

# Media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if not settings.DEBUG:
    urlpatterns += [
        path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

# React SPA - catch all routes and serve index.html
urlpatterns += [
    re_path(r'^(?!admin|api|media|static|archive|accounts).*$',
            TemplateView.as_view(template_name='index.html'),
            name='react_app'),
]
