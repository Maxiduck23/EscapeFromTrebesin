# escapefromtrebesin/booking/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('kontact/', views.kontact, name='kontact'),
    path('details/', views.details, name='details'),
    path('tomb/', views.tomb, name='tomb'),
    path('lab/', views.lab, name='lab'),
    path('alcatraz/', views.alcatraz, name='alcatraz'),
    path('booking/', views.booking_view, name='booking'),
    path('ajax/get_available_slots/', views.get_available_slots, name='get_available_slots'),
]