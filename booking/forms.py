# escapefromtrebesin/booking/forms.py

from django import forms
from django.utils.translation import gettext_lazy as _
from .models import EscapeRoom

class RezervaceForm(forms.Form):
    room = forms.ModelChoiceField(
        queryset=EscapeRoom.objects.all(),
        widget=forms.HiddenInput(),
        required=True,
        label=_("Místnost")
    )
    date = forms.DateField(
        widget=forms.HiddenInput(),
        required=True,
        label=_("Datum")
    )
    time = forms.TimeField(
        widget=forms.HiddenInput(),
        required=True,
        label=_("Čas")
    )
    jmeno = forms.CharField(label=_("Jméno"), max_length=45, required=True)
    prijmeni = forms.CharField(label=_("Příjmení"), max_length=45, required=True)
    email = forms.EmailField(label=_("E-mail"), max_length=45, required=True)
    telefon = forms.CharField(label=_("Telefon"), max_length=45, required=True)
    pocet_hracu = forms.IntegerField(label=_("Počet hráčů"), min_value=2, max_value=6, required=True)
    poznamky = forms.CharField(label=_("Poznámky"), widget=forms.Textarea, required=False)
