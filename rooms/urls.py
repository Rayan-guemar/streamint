from django.urls import path
from django.conf.urls.static import static

from . import views 

urlpatterns = [
    path('', views.render_landing, name='render_landing'),
    path('rooms/create', views.create_room,  name='create_room'),
    path('rooms/<str:code>', views.detail, name='detail')

]