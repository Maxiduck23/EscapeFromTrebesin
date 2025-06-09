# escapefromtrebesin/booking/forms.py

from django import forms
from .models import EscapeRoom

class RezervaceForm(forms.Form):
    room = forms.ModelChoiceField(
        queryset=EscapeRoom.objects.all(),
        widget=forms.HiddenInput(),
        required=True,
        label="Místnost"
    )
    date = forms.DateField(
        widget=forms.HiddenInput(),
        required=True,
        label="Datum"
    )
    time = forms.TimeField(
        widget=forms.HiddenInput(),
        required=True,
        label="Čas"
    )
    jmeno = forms.CharField(label="Jméno", max_length=45, required=True)
    prijmeni = forms.CharField(label="Příjmení", max_length=45, required=True)
    email = forms.EmailField(label="E-mail", max_length=45, required=True)
    telefon = forms.CharField(label="Telefon", max_length=45, required=True)
    pocet_hracu = forms.IntegerField(label="Počet hráčů", min_value=2, max_value=6, required=True)
    poznamky = forms.CharField(label="Poznámky", widget=forms.Textarea, required=False)
