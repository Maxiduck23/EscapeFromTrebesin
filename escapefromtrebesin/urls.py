from django.contrib import admin
from django.urls import path, include  # Důležité: přidejte import 'include'
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Říkáme Djangu: "Všechny URL, které začínají na 'booking/',
    # hledej v souboru booking/urls.py"
    path('booking/', include('booking.urls', namespace='booking')),
    
    # Říkáme Djangu: "Všechny ostatní URL adresy (začínající prázdným řetězcem)
    # hledej v souboru main/urls.py"
    path('', include('main.urls', namespace='main')),
]

# Toto je pomocný kód, aby vývojový server uměl zobrazovat nahrané obrázky
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)