from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.views.generic import TemplateView
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils.translation import gettext as _
from django.core.validators import validate_email
from django.core.mail import send_mail
from django.conf import settings
import re
from datetime import datetime, date, time
import logging

from .forms import RezervaceForm
from .models import Zakaznik, Rezervace, EscapeRoom

logger = logging.getLogger(__name__)


class HomeView(TemplateView):
                                 
    template_name = 'home.html'


class AboutView(TemplateView):
                                  
    template_name = 'about.html'


class KontactView(TemplateView):
                                    
    template_name = 'kontact.html'


class DetailsView(TemplateView):
                                                
    template_name = 'details.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['escape_rooms'] = EscapeRoom.objects.all()
        return context


class TombView(TemplateView):
                                                         
    template_name = 'tomb.html'


class LabView(TemplateView):
                                                   
    template_name = 'lab.html'


class AlcatrazView(TemplateView):
                                                  
    template_name = 'alcatraz.html'


class BookingView(View):
                                                                              
    template_name = 'booking/booking.html'

    def get(self, request):
        escape_rooms = EscapeRoom.objects.all()
        return render(request, self.template_name, {'escape_rooms': escape_rooms})

    def post(self, request):
                                                      
        try:
                                     
            room_id = request.POST.get('room')
            date_str = request.POST.get('date')
            time_str = request.POST.get('time')
            jmeno = request.POST.get('jmeno', '').strip()
            prijmeni = request.POST.get('prijmeni', '').strip()
            email = request.POST.get('email', '').strip().lower()
            telefon = request.POST.get('telefon', '').strip()
            pocet_hracu = request.POST.get('pocet_hracu')
            poznamky = request.POST.get('poznamky', '').strip()

                                     
            errors = {}
            
                                
            if not room_id:
                errors['room'] = _('Vyberte místnost.')
            else:
                try:
                    room = EscapeRoom.objects.get(pk=room_id)
                except EscapeRoom.DoesNotExist:
                    errors['room'] = _('Vybraná místnost neexistuje.')
                    
                           
            if not date_str:
                errors['date'] = _('Vyberte datum.')
            else:
                try:
                    reservation_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    if reservation_date < date.today():
                        errors['date'] = _('Nelze rezervovat minulé datum.')
                                                                          
                    elif (reservation_date - date.today()).days > 180:
                        errors['date'] = _('Nelze rezervovat více než 6 měsíců dopředu.')
                except ValueError:
                    errors['date'] = _('Neplatný formát data.')
                    
                           
            if not time_str:
                errors['time'] = _('Vyberte čas.')
            else:
                try:
                    reservation_time = datetime.strptime(time_str, '%H:%M').time()
                    allowed_times = [time(10, 0), time(12, 0), time(14, 0), 
                                   time(16, 0), time(18, 0), time(20, 0)]
                    if reservation_time not in allowed_times:
                        errors['time'] = _('Neplatný čas rezervace.')
                except ValueError:
                    errors['time'] = _('Neplatný formát času.')
                    
                            
            if not jmeno:
                errors['jmeno'] = _('Zadejte jméno.')
            elif len(jmeno) < 2:
                errors['jmeno'] = _('Jméno musí mít alespoň 2 znaky.')
            elif len(jmeno) > 45:
                errors['jmeno'] = _('Jméno je příliš dlouhé.')
            elif not re.match(r'^[a-zA-ZěščřžýáíéůúňťďĚŠČŘŽÝÁÍÉŮÚŇŤĎ\s-]+$', jmeno):
                errors['jmeno'] = _('Jméno obsahuje nepovolené znaky.')
                
                               
            if not prijmeni:
                errors['prijmeni'] = _('Zadejte příjmení.')
            elif len(prijmeni) < 2:
                errors['prijmeni'] = _('Příjmení musí mít alespoň 2 znaky.')
            elif len(prijmeni) > 45:
                errors['prijmeni'] = _('Příjmení je příliš dlouhé.')
            elif not re.match(r'^[a-zA-ZěščřžýáíéůúňťďĚŠČŘŽÝÁÍÉŮÚŇŤĎ\s-]+$', prijmeni):
                errors['prijmeni'] = _('Příjmení obsahuje nepovolené znaky.')
                
                             
            if not email:
                errors['email'] = _('Zadejte e-mail.')
            else:
                try:
                    validate_email(email)
                    if len(email) > 45:
                        errors['email'] = _('E-mail je příliš dlouhý.')
                except ValidationError:
                    errors['email'] = _('Neplatný formát e-mailu.')
                    
                               
            if not telefon:
                errors['telefon'] = _('Zadejte telefon.')
            else:
                                                               
                clean_telefon = re.sub(r'[\s\-\(\)]+', '', telefon)
                if not re.match(r'^\+?[0-9]{9,15}$', clean_telefon):
                    errors['telefon'] = _('Neplatný formát telefonu.')
                elif len(telefon) > 45:
                    errors['telefon'] = _('Telefon je příliš dlouhý.')
                    
                                  
            if not pocet_hracu:
                errors['pocet_hracu'] = _('Zadejte počet hráčů.')
            else:
                try:
                    pocet_hracu = int(pocet_hracu)
                    if pocet_hracu < 2:
                        errors['pocet_hracu'] = _('Minimální počet hráčů je 2.')
                    elif pocet_hracu > 6:
                        errors['pocet_hracu'] = _('Maximální počet hráčů je 6.')
                except ValueError:
                    errors['pocet_hracu'] = _('Neplatný počet hráčů.')
                    
                               
            if poznamky and len(poznamky) > 500:
                errors['poznamky'] = _('Poznámky jsou příliš dlouhé.')

                                          
            if errors:
                return JsonResponse({
                    'success': False, 
                    'errors': errors
                })

                                                                  
            with transaction.atomic():
                                              
                existing_reservation = Rezervace.objects.filter(
                    escape_room=room,
                    datum_rezervace=reservation_date,
                    cas_rezervace=reservation_time
                ).exists()
                
                if existing_reservation:
                    return JsonResponse({
                        'success': False, 
                        'errors': {'__all__': [_('Tento termín je již obsazen.')]}
                    })

                                                   
                zakaznik, created = Zakaznik.objects.get_or_create(
                    email=email,
                    defaults={
                        'jmeno': jmeno,
                        'prijmeni': prijmeni,
                        'telefon': telefon,
                    }
                )
                
                                                                
                if not created:
                    zakaznik.jmeno = jmeno
                    zakaznik.prijmeni = prijmeni
                    zakaznik.telefon = telefon
                    zakaznik.save()

                                     
                rezervace = Rezervace.objects.create(
                    escape_room=room,
                    datum_rezervace=reservation_date,
                    cas_rezervace=reservation_time,
                    pocet_hracu=pocet_hracu,
                    poznamky=poznamky,
                    zakaznik=zakaznik
                )

                                           
                booking_code = f"EFT-{rezervace.id_rezervace:04d}-{reservation_date.year}"
                
                                                            
                try:
                    self.send_confirmation_email(zakaznik, rezervace, booking_code)
                except Exception as e:
                    logger.warning(f"Nepodařilo se odeslat potvrzovací e-mail: {e}")

                logger.info(f"Nová rezervace vytvořena: {booking_code} pro {email}")

                return JsonResponse({
                    'success': True, 
                    'booking_code': booking_code,
                    'message': _('Rezervace byla úspěšně dokončena!')
                })

        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            return JsonResponse({
                'success': False, 
                'errors': {'__all__': [_('Tento termín je již obsazen.')]}
            })
            
        except Exception as e:
            logger.error(f"Unexpected error during booking: {e}")
            return JsonResponse({
                'success': False, 
                'errors': {'__all__': [_('Došlo k neočekávané chybě. Zkuste to prosím znovu.')]}
            })

    def send_confirmation_email(self, zakaznik, rezervace, booking_code):
                                                    
        if not hasattr(settings, 'EMAIL_HOST') or not settings.EMAIL_HOST:
            return                              
            
        subject = f'Potvrzení rezervace - {booking_code}'
        message = f"""
Dobrý den {zakaznik.jmeno} {zakaznik.prijmeni},

děkujeme za vaši rezervaci v Escape From Třebešín!

Detaily rezervace:
- Kód rezervace: {booking_code}
- Místnost: {rezervace.escape_room.nazev}
- Datum: {rezervace.datum_rezervace.strftime('%d.%m.%Y')}
- Čas: {rezervace.cas_rezervace.strftime('%H:%M')}
- Počet hráčů: {rezervace.pocet_hracu}
- Lokace: {rezervace.escape_room.lokace.nazev}, {rezervace.escape_room.lokace.ulice}, {rezervace.escape_room.lokace.mesto}

Poznámky: {rezervace.poznamky if rezervace.poznamky else 'Žádné'}

Platba probíhá na místě v hotovosti nebo kartou.
Rezervaci je možné zrušit nejpozději 24 hodin předem.

Těšíme se na vás!

S pozdravem,
Tým Escape From Třebešín
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [zakaznik.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Chyba při odesílání e-mailu pro {zakaznik.email}: {e}")
            raise


class GetAvailableSlotsView(View):
                                                                                          

    def get(self, request):
        date_str = request.GET.get('date')
        room_id = request.GET.get('room_id')
        
                                      
        if not date_str or not room_id:
            return JsonResponse({
                'error': _('Chybí datum nebo ID místnosti')
            }, status=400)

        try:
                           
            reservation_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
                                                 
            if reservation_date < date.today():
                return JsonResponse({
                    'available_slots': [],
                    'message': _('Nelze rezervovat minulé datum')
                })
                
                                   
            try:
                room = EscapeRoom.objects.get(pk=room_id)
            except EscapeRoom.DoesNotExist:
                return JsonResponse({
                    'error': _('Místnost neexistuje')
                }, status=404)
                
        except ValueError:
            return JsonResponse({
                'error': _('Neplatné datum nebo ID místnosti')
            }, status=400)

                                     
        all_slots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
        
                                  
        booked_reservations = Rezervace.objects.filter(
            escape_room=room,
            datum_rezervace=reservation_date
        ).values_list('cas_rezervace', flat=True)
        
                                 
        booked_slots = [slot.strftime('%H:%M') for slot in booked_reservations]
        
                                  
        available_slots = [slot for slot in all_slots if slot not in booked_slots]
        
                                                         
        if reservation_date == date.today():
            current_time = datetime.now().time()
            available_slots = [
                slot for slot in available_slots
                if datetime.strptime(slot, '%H:%M').time() > current_time
            ]
        
        logger.debug(f"Dostupné sloty pro {room.nazev} na {reservation_date}: {available_slots}")
        
        return JsonResponse({
            'available_slots': available_slots,
            'total_slots': len(all_slots),
            'booked_slots': len(booked_slots),
            'room_name': room.nazev
        })


                         
home = HomeView.as_view()
about = AboutView.as_view()
kontact = KontactView.as_view()
details = DetailsView.as_view()
tomb = TombView.as_view()
lab = LabView.as_view()
alcatraz = AlcatrazView.as_view()
booking_view = BookingView.as_view()
get_available_slots = GetAvailableSlotsView.as_view()