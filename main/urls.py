# main/urls.py

from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('kontact/', views.kontact, name='kontact'),
    path('details/', views.details, name='details'),
    path('tomb/', views.tomb, name='tomb'),
    path('lab/', views.lab, name='lab'),
    path('alcatraz/', views.alcatraz, name='alcatraz'),
]