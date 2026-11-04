from django.urls import path
from django.conf.urls.static import static

from . import views 

urlpatterns = [
    path('', views.render_landing, name='render_landing'),
]
