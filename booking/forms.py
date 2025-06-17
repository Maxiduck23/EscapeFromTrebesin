# escapefromtrebesin/booking/forms.py

from django import forms
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from datetime import date, datetime, time
import re

from .models import EscapeRoom, Rezervace


class RezervaceForm(forms.Form):
    """Vylepšený formulář pro rezervace s důkladnou validací."""
    
    # Základní pole rezervace
    room = forms.ModelChoiceField(
        queryset=EscapeRoom.objects.all(),
        widget=forms.HiddenInput(),
        required=True,
        label=_("Místnost"),
        error_messages={
            'required': _('Vyberte místnost.'),
            'invalid_choice': _('Vybraná místnost neexistuje.')
        }
    )
    
    date = forms.DateField(
        widget=forms.HiddenInput(),
        required=True,
        label=_("Datum"),
        error_messages={
            'required': _('Vyberte datum.'),
            'invalid': _('Neplatný formát data.')
        }
    )
    
    time = forms.TimeField(
        widget=forms.HiddenInput(),
        required=True,
        label=_("Čas"),
        error_messages={
            'required': _('Vyberte čas.'),
            'invalid': _('Neplatný formát času.')
        }
    )
    
    # Osobní údaje s validátory
    jmeno = forms.CharField(
        label=_("Jméno"),
        max_length=45,
        min_length=2,
        required=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-ZěščřžýáíéůúňťďĚŠČŘŽÝÁÍÉŮÚŇŤĎ\s-]+$',
                message=_('Jméno může obsahovat pouze písmena, mezery a pomlčky.')
            )
        ],
        widget=forms.TextInput(attrs={
            'placeholder': _('Zadejte vaše jméno'),
            'class': 'form-control'
        }),
        error_messages={
            'required': _('Zadejte jméno.'),
            'min_length': _('Jméno musí mít alespoň 2 znaky.'),
            'max_length': _('Jméno je příliš dlouhé.')
        }
    )
    
    prijmeni = forms.CharField(
        label=_("Příjmení"),
        max_length=45,
        min_length=2,
        required=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-ZěščřžýáíéůúňťďĚŠČŘŽÝÁÍÉŮÚŇŤĎ\s-]+$',
                message=_('Příjmení může obsahovat pouze písmena, mezery a pomlčky.')
            )
        ],
        widget=forms.TextInput(attrs={
            'placeholder': _('Zadejte vaše příjmení'),
            'class': 'form-control'
        }),
        error_messages={
            'required': _('Zadejte příjmení.'),
            'min_length': _('Příjmení musí mít alespoň 2 znaky.'),
            'max_length': _('Příjmení je příliš dlouhé.')
        }
    )
    
    email = forms.EmailField(
        label=_("E-mail"),
        max_length=45,
        required=True,
        widget=forms.EmailInput(attrs={
            'placeholder': _('jan.novak@email.cz'),
            'class': 'form-control'
        }),
        error_messages={
            'required': _('Zadejte e-mail.'),
            'invalid': _('Zadejte platný e-mail.'),
            'max_length': _('E-mail je příliš dlouhý.')
        }
    )
    
    telefon = forms.CharField(
        label=_("Telefon"),
        max_length=45,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': _('+420 123 456 789'),
            'class': 'form-control'
        }),
        error_messages={
            'required': _('Zadejte telefon.'),
            'max_length': _('Telefon je příliš dlouhý.')
        }
    )
    
    pocet_hracu = forms.IntegerField(
        label=_("Počet hráčů"),
        min_value=2,
        max_value=6,
        required=True,
        widget=forms.Select(
            choices=[(i, f'{i} {"hráči" if i in [2,3,4] else "hráčů"}') for i in range(2, 7)],
            attrs={'class': 'form-control'}
        ),
        error_messages={
            'required': _('Zadejte počet hráčů.'),
            'min_value': _('Minimální počet hráčů je 2.'),
            'max_value': _('Maximální počet hráčů je 6.'),
            'invalid': _('Neplatný počet hráčů.')
        }
    )
    
    poznamky = forms.CharField(
        label=_("Poznámky"),
        max_length=500,
        required=False,
        widget=forms.Textarea(attrs={
            'rows': 4,
            'placeholder': _('Máte nějaké speciální požadavky nebo poznámky?'),
            'class': 'form-control'
        }),
        error_messages={
            'max_length': _('Poznámky jsou příliš dlouhé (maximálně 500 znaků).')
        }
    )

    def clean_jmeno(self):
        """Validace jména."""
        jmeno = self.cleaned_data.get('jmeno', '').strip()
        if not jmeno:
            raise ValidationError(_('Zadejte jméno.'))
        
        # Kontrola délky
        if len(jmeno) < 2:
            raise ValidationError(_('Jméno musí mít alespoň 2 znaky.'))
        if len(jmeno) > 45:
            raise ValidationError(_('Jméno je příliš dlouhé.'))
            
        # Kontrola znaků
        if not re.match(r'^[a-zA-ZěščřžýáíéůúňťďĚŠČŘŽÝÁÍÉŮÚŇŤĎ\s-]+$', jmeno):
            raise ValidationError(_('Jméno obsahuje nepovolené znaky.'))
            
        return jmeno.title()  # Převod na správnou velikost písmen

    def clean_prijmeni(self):
        """Validace příjmení."""
        prijmeni = self.cleaned_data.get('prijmeni', '').strip()
        if not prijmeni:
            raise ValidationError(_('Zadejte příjmení.'))
        
        # Kontrola délky
        if len(prijmeni) < 2:
            raise ValidationError(_('Příjmení musí mít alespoň 2 znaky.'))
        if len(prijmeni) > 45:
            raise ValidationError(_('Příjmení je příliš dlouhé.'))
            
        # Kontrola znaků
        if not re.match(r'^[a-zA-ZěščřžýáíéůúňťďĚŠČŘŽÝÁÍÉŮÚŇŤĎ\s-]+$', prijmeni):
            raise ValidationError(_('Příjmení obsahuje nepovolené znaky.'))
            
        return prijmeni.title()  # Převod na správnou velikost písmen

    def clean_email(self):
        """Validace e-mailu."""
        email = self.cleaned_data.get('email', '').strip().lower()
        if not email:
            raise ValidationError(_('Zadejte e-mail.'))
            
        if len(email) > 45:
            raise ValidationError(_('E-mail je příliš dlouhý.'))
            
        return email

    def clean_telefon(self):
        """Validace telefonu."""
        telefon = self.cleaned_data.get('telefon', '').strip()
        if not telefon:
            raise ValidationError(_('Zadejte telefon.'))
            
        # Očistíme telefon od mezer a speciálních znaků pro validaci
        clean_telefon = re.sub(r'[\s\-\(\)]+', '', telefon)
        
        if not re.match(r'^\+?[0-9]{9,15}$', clean_telefon):
            raise ValidationError(_('Neplatný formát telefonu. Použijte formát: +420123456789 nebo 123456789'))
            
        if len(telefon) > 45:
            raise ValidationError(_('Telefon je příliš dlouhý.'))
            
        return telefon

    def clean_date(self):
        """Validace data rezervace."""
        reservation_date = self.cleaned_data.get('date')
        if not reservation_date:
            raise ValidationError(_('Vyberte datum.'))
            
        # Kontrola, že datum není v minulosti
        if reservation_date < date.today():
            raise ValidationError(_('Nelze rezervovat minulé datum.'))
            
        # Kontrola, že datum není více než 6 měsíců v budoucnu
        if (reservation_date - date.today()).days > 180:
            raise ValidationError(_('Nelze rezervovat více než 6 měsíců dopředu.'))
            
        return reservation_date

    def clean_time(self):
        """Validace času rezervace."""
        reservation_time = self.cleaned_data.get('time')
        if not reservation_time:
            raise ValidationError(_('Vyberte čas.'))
            
        # Kontrola povolených časů
        allowed_times = [time(10, 0), time(12, 0), time(14, 0), 
                        time(16, 0), time(18, 0), time(20, 0)]
        
        if reservation_time not in allowed_times:
            raise ValidationError(_('Neplatný čas rezervace. Povolené časy: 10:00, 12:00, 14:00, 16:00, 18:00, 20:00'))
            
        return reservation_time

    def clean_poznamky(self):
        """Validace poznámek."""
        poznamky = self.cleaned_data.get('poznamky', '').strip()
        
        if len(poznamky) > 500:
            raise ValidationError(_('Poznámky jsou příliš dlouhé (maximálně 500 znaků).'))
            
        return poznamky

    def clean(self):
        """Globální validace formuláře."""
        cleaned_data = super().clean()
        room = cleaned_data.get('room')
        reservation_date = cleaned_data.get('date')
        reservation_time = cleaned_data.get('time')
        
        # Kontrola dostupnosti termínu pouze pokud máme všechna potřebná data
        if room and reservation_date and reservation_time:
            # Kontrola, jestli termín není již obsazen
            existing_reservation = Rezervace.objects.filter(
                escape_room=room,
                datum_rezervace=reservation_date,
                cas_rezervace=reservation_time
            ).exists()
            
            if existing_reservation:
                raise ValidationError(_('Tento termín je již obsazen. Vyberte jiný čas.'))
                
            # Pro současný den: kontrola, že čas ještě neprošel
            if reservation_date == date.today():
                current_time = datetime.now().time()
                if reservation_time <= current_time:
                    raise ValidationError(_('Nelze rezervovat čas, který již prošel.'))
        
        return cleaned_data


class ContactForm(forms.Form):
    """Formulář pro kontaktní zprávy."""
    
    jmeno = forms.CharField(
        label=_("Jméno a příjmení"),
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': _('Jan Novák'),
            'class': 'form-control'
        })
    )
    
    email = forms.EmailField(
        label=_("E-mail"),
        required=True,
        widget=forms.EmailInput(attrs={
            'placeholder': _('jan.novak@email.cz'),
            'class': 'form-control'
        })
    )
    
    predmet = forms.CharField(
        label=_("Předmět"),
        max_length=200,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': _('Dotaz k rezervaci'),
            'class': 'form-control'
        })
    )
    
    zprava = forms.CharField(
        label=_("Zpráva"),
        max_length=1000,
        required=True,
        widget=forms.Textarea(attrs={
            'rows': 5,
            'placeholder': _('Napište nám vaši zprávu...'),
            'class': 'form-control'
        })
    )
