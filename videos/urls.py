from django.urls import path
from django.conf.urls.static import static

from streamint import settings
from . import views 

urlpatterns = [
    # Route pour afficher la page avec le formulaire HTML
    path('upload/', views.upload_form_view, name='upload_page'),
    
    # Route pour réceptionner le fichier envoyé par le formulaire
    path('upload/process/', views.handle_upload_view, name='handle_upload'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)