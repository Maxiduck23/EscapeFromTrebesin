# main/urls.py

from django.urls import path
from .views import (
    home,
    about,
    kontact,
    details,
    tomb,
    lab,
    alcatraz,
)

app_name = 'main'

urlpatterns = [
    path('', home, name='home'),
    path('about/', about, name='about'),
    path('kontact/', kontact, name='kontact'),
    path('details/', details, name='details'),
    path('tomb/', tomb, name='tomb'),
    path('lab/', lab, name='lab'),
    path('alcatraz/', alcatraz, name='alcatraz'),
]
