from django.urls import path
from . import views

app_name = 'booking'

urlpatterns = [
    path('', views.booking_view, name='booking'),
    path('ajax/get_available_slots/', views.get_available_slots, name='get_available_slots'),
]