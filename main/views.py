from django.shortcuts import render
from booking.models import EscapeRoom # Importujeme model z druhé aplikace

def home(request):
    """Zobrazuje hlavní stránku."""
    return render(request, 'main/home.html')

def about(request):
    """Zobrazuje stránku 'O nás'."""
    return render(request, 'main/about.html')

def kontact(request):
    """Zobrazuje stránku 'Kontakt'."""
    return render(request, 'main/kontact.html')

def details(request):
    """Zobrazuje stránku s přehledem místností."""
    context = {
        'escape_rooms': EscapeRoom.objects.all()
    }
    return render(request, 'main/details.html', context)

def tomb(request):
    """Zobrazuje detailní stránku pro 'Egyptská hrobka'."""
    return render(request, 'main/tomb.html')

def lab(request):
    """Zobrazuje detailní stránku pro 'Laboratoř'."""
    return render(request, 'main/lab.html')

def alcatraz(request):
    """Zobrazuje detailní stránku pro 'Alcatraz'."""
    return render(request, 'main/alcatraz.html')