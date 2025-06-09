from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .forms import RezervaceForm
from .models import Zakaznik, Rezervace, EscapeRoom
import json
from datetime import datetime

def home(request):
    """Zobrazí hlavní stránku."""
    return render(request, 'home.html')

def about(request):
    """Zobrazí stránku 'O nás'."""
    # Tuto šablonu jste neposkytl, ale zde je, jak by se zobrazila
    return render(request, 'about.html')
    
def kontact(request):
    """Zobrazí stránku 'Kontakt'."""
    return render(request, 'kontact.html')

def details(request):
    """Zobrazí stránku s přehledem místností."""
    context = {
        'escape_rooms': EscapeRoom.objects.all()
    }
    return render(request, 'details.html', context)

def tomb(request):
    """Zobrazí detailní stránku pro 'Egyptská hrobka'."""
    return render(request, 'tomb.html')

def lab(request):
    """Zobrazí detailní stránku pro 'Laboratoř'."""
    return render(request, 'lab.html')

def alcatraz(request):
    """Zobrazí detailní stránku pro 'Alcatraz'."""
    # Tuto šablonu jste neposkytl, ale zde je, jak by se zobrazila
    return render(request, 'alcatraz.html')

def booking_view(request):
    """
    Zobrazuje a zpracovává formulář pro rezervaci.
    """
    if request.method == 'POST':
        form = RezervaceForm(request.POST)
        if form.is_valid():
            cleaned_data = form.cleaned_data
            
            # 1. Získáme nebo vytvoříme zákazníka
            zakaznik, created = Zakaznik.objects.get_or_create(
                email=cleaned_data['email'],
                defaults={
                    'jmeno': cleaned_data['jmeno'],
                    'prijmeni': cleaned_data['prijmeni'],
                    'telefon': cleaned_data['telefon'],
                }
            )

            # 2. Vytvoříme rezervaci
            try:
                rezervace = Rezervace.objects.create(
                    escape_room=cleaned_data['room'],
                    datum_rezervace=cleaned_data['date'],
                    cas_rezervace=cleaned_data['time'],
                    pocet_hracu=cleaned_data['pocet_hracu'],
                    poznamky=cleaned_data.get('poznamky', ''),
                    zakaznik=zakaznik
                )
                booking_code = f"EFT-{rezervace.id_rezervace}-{rezervace.datum_rezervace.year}"
                return JsonResponse({'success': True, 'booking_code': booking_code})
            except Exception as e:
                 # Pokud se rezervace na daný čas již existuje
                return JsonResponse({'success': False, 'errors': {'__all__': ['Tento termín je již obsazen.']}})

        else:
            return JsonResponse({'success': False, 'errors': form.errors})
            
    # Pro GET požadavek zobrazíme stránku s formulářem a místnostmi
    escape_rooms = EscapeRoom.objects.all()
    return render(request, 'booking/booking.html', {'escape_rooms': escape_rooms})


def get_available_slots(request):
    """
    Vrací dostupné časové sloty pro vybranou místnost a datum (voláno přes AJAX).
    """
    date_str = request.GET.get('date')
    room_id = request.GET.get('room_id')

    if not date_str or not room_id:
        return JsonResponse({'error': 'Chybí datum nebo ID místnosti'}, status=400)

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        room = EscapeRoom.objects.get(pk=room_id)
    except (ValueError, EscapeRoom.DoesNotExist):
        return JsonResponse({'error': 'Neplatné datum nebo ID místnosti'}, status=400)

    all_slots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
    
    booked_slots_query = Rezervace.objects.filter(
        escape_room=room,
        datum_rezervace=date
    ).values_list('cas_rezervace', flat=True)
    
    booked_slots = [slot.strftime('%H:%M') for slot in booked_slots_query]
    available_slots = [slot for slot in all_slots if slot not in booked_slots]

    return JsonResponse({'available_slots': available_slots})