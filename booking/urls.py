from django.urls import path
from .views import (
    booking_view,
    get_available_slots,
)

app_name = 'booking'

urlpatterns = [
    path('', booking_view, name='booking'),
    path('ajax/get_available_slots/', get_available_slots, name='get_available_slots'),
]
