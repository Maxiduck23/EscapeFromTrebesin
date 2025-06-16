from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.views.generic import TemplateView
from .forms import RezervaceForm
from .models import Zakaznik, Rezervace, EscapeRoom
from datetime import datetime


class HomeView(TemplateView):
    """Zobrazí hlavní stránku."""
    template_name = 'home.html'


class AboutView(TemplateView):
    """Zobrazí stránku 'O nás'."""
    template_name = 'about.html'


class KontactView(TemplateView):
    """Zobrazí stránku 'Kontakt'."""
    template_name = 'kontact.html'


class DetailsView(TemplateView):
    """Zobrazí stránku s přehledem místností."""
    template_name = 'details.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['escape_rooms'] = EscapeRoom.objects.all()
        return context


class TombView(TemplateView):
    """Zobrazí detailní stránku pro 'Egyptská hrobka'."""
    template_name = 'tomb.html'


class LabView(TemplateView):
    """Zobrazí detailní stránku pro 'Laboratoř'."""
    template_name = 'lab.html'


class AlcatrazView(TemplateView):
    """Zobrazí detailní stránku pro 'Alcatraz'."""
    template_name = 'alcatraz.html'


class BookingView(View):
    """Zobrazuje a zpracovává formulář pro rezervaci."""
    template_name = 'booking/booking.html'

    def get(self, request):
        escape_rooms = EscapeRoom.objects.all()
        return render(request, self.template_name, {'escape_rooms': escape_rooms})

    def post(self, request):
        form = RezervaceForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            zakaznik, _ = Zakaznik.objects.get_or_create(
                email=data['email'],
                defaults={
                    'jmeno': data['jmeno'],
                    'prijmeni': data['prijmeni'],
                    'telefon': data['telefon'],
                }
            )
            try:
                rezervace = Rezervace.objects.create(
                    escape_room=data['room'],
                    datum_rezervace=data['date'],
                    cas_rezervace=data['time'],
                    pocet_hracu=data['pocet_hracu'],
                    poznamky=data.get('poznamky', ''),
                    zakaznik=zakaznik
                )
                booking_code = f"EFT-{rezervace.id_rezervace}-{rezervace.datum_rezervace.year}"
                return JsonResponse({'success': True, 'booking_code': booking_code})
            except Exception:
                return JsonResponse({'success': False, 'errors': {'__all__': ['Tento termín je již obsazen.']}})
        return JsonResponse({'success': False, 'errors': form.errors})


class GetAvailableSlotsView(View):
    """Vrací dostupné časové sloty pro vybranou místnost a datum."""

    def get(self, request):
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
        booked_slots = Rezervace.objects.filter(
            escape_room=room,
            datum_rezervace=date
        ).values_list('cas_rezervace', flat=True)
        booked = [slot.strftime('%H:%M') for slot in booked_slots]
        available = [slot for slot in all_slots if slot not in booked]
        return JsonResponse({'available_slots': available})


# Helper aliases for urls
home = HomeView.as_view()
about = AboutView.as_view()
kontact = KontactView.as_view()
details = DetailsView.as_view()
tomb = TombView.as_view()
lab = LabView.as_view()
alcatraz = AlcatrazView.as_view()
booking_view = BookingView.as_view()
get_available_slots = GetAvailableSlotsView.as_view()
