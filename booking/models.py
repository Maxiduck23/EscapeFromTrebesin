from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# Model pro Správce
class Spravce(models.Model):
    id_spravce = models.AutoField(primary_key=True)
    jmeno = models.CharField("Jméno", max_length=45)
    prijmeni = models.CharField("Příjmení", max_length=45)
    vek = models.IntegerField(_("Věk"))
    doba_zamestnani = models.CharField(_("Doba zaměstnání"), max_length=45, blank=True, null=True)
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)

    def __str__(self):
        return f"{self.jmeno} {self.prijmeni}"

    class Meta:
        verbose_name = _("Správce")
        verbose_name_plural = _("Správci")

# Model pro Lokace
class Lokace(models.Model):
    id_lokace = models.AutoField(primary_key=True)
    nazev = models.CharField(_("Název lokace"), max_length=45, unique=True)
    mesto = models.CharField(_("Město"), max_length=45)
    ulice = models.CharField(_("Ulice"), max_length=45)
    spravce = models.ForeignKey(Spravce, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Správce"))
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)

    def __str__(self):
        return self.nazev

    class Meta:
        verbose_name = _("Lokace")
        verbose_name_plural = _("Lokace")

# Model pro Herci
class Herec(models.Model):
    id_herec = models.AutoField(primary_key=True)
    jmeno = models.CharField(_("Jméno"), max_length=45)
    prijmeni = models.CharField(_("Příjmení"), max_length=45)
    role = models.CharField(_("Role"), max_length=45)
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)

    def __str__(self):
        return f"{self.jmeno} {self.prijmeni}"

    class Meta:
        verbose_name = _("Herec")
        verbose_name_plural = _("Herci")

# Model pro Únikové místnosti (Escape Rooms)
class EscapeRoom(models.Model):
    id_escape_room = models.AutoField(primary_key=True)
    nazev = models.CharField(_("Název místnosti"), max_length=100)
    lokace = models.ForeignKey(Lokace, on_delete=models.CASCADE, verbose_name=_("Lokace"))
    obtiznost = models.CharField(_("Obtížnost"), max_length=45)
    strasidelnost = models.CharField(_("Strašidelnost"), max_length=45)
    cena = models.DecimalField(_("Cena"), max_digits=10, decimal_places=2)
    doporuceny_vek = models.CharField(_("Doporučený věk"), max_length=45)
    tema = models.CharField(_("Téma"), max_length=45, unique=True)
    herci = models.ManyToManyField(Herec, through='HerciHasEscapeRoom', blank=True, verbose_name=_("Herci"))
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)

    def __str__(self):
        return self.nazev

    class Meta:
        verbose_name = _("Úniková místnost")
        verbose_name_plural = _("Únikové místnosti")

# Model pro Zákazníky
class Zakaznik(models.Model):
    id_zakaznik = models.AutoField(primary_key=True)
    jmeno = models.CharField(_("Jméno"), max_length=45)
    prijmeni = models.CharField(_("Příjmení"), max_length=45)
    telefon = models.CharField(_("Telefon"), max_length=45, unique=True)
    email = models.EmailField(_("Email"), max_length=45, unique=True)
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)

    def __str__(self):
        return f"{self.jmeno} {self.prijmeni}"

    class Meta:
        verbose_name = _("Zákazník")
        verbose_name_plural = _("Zákazníci")

# Model pro Rezervace
class Rezervace(models.Model):
    id_rezervace = models.AutoField(primary_key=True)
    datum_rezervace = models.DateField(_("Datum rezervace"))
    cas_rezervace = models.TimeField(_("Čas rezervace"))
    pocet_hracu = models.IntegerField(_("Počet hráčů"))
    escape_room = models.ForeignKey(EscapeRoom, on_delete=models.CASCADE, verbose_name=_("Úniková místnost"))
    zakaznik = models.ForeignKey(Zakaznik, on_delete=models.CASCADE, verbose_name=_("Zákazník"))
    poznamky = models.TextField(_("Poznámky"), blank=True, null=True)
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)

    def __str__(self):
        return f"Rezervace #{self.id_rezervace} - {self.escape_room.nazev}"

    class Meta:
        verbose_name = _("Rezervace")
        verbose_name_plural = _("Rezervace")
        # Zajišťuje, že jedna místnost nemůže být rezervována ve stejný den a čas
        unique_together = ('datum_rezervace', 'cas_rezervace', 'escape_room')

# Model pro Recenze
class Recenze(models.Model):
    id_recenze = models.AutoField(primary_key=True)
    datum = models.DateField(_("Datum"), default=timezone.now)
    autor = models.CharField(_("Autor"), max_length=45)
    obsah = models.CharField(_("Obsah"), max_length=255)
    herci = models.ManyToManyField(Herec, through='HerciHasRecenze', blank=True, verbose_name=_("Herci"))
    escape_room = models.ManyToManyField(EscapeRoom, through='RecenzeHasEscapeRoom', blank=True, verbose_name=_("Únikové místnosti"))
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)

    def __str__(self):
        return f"Recenze od {self.autor} ze dne {self.datum}"

    class Meta:
        verbose_name = _("Recenze")
        verbose_name_plural = _("Recenze")

# Spojovací tabulky pro vztahy Many-to-Many
class HerciHasRecenze(models.Model):
    herec = models.ForeignKey(Herec, on_delete=models.CASCADE)
    recenze = models.ForeignKey(Recenze, on_delete=models.CASCADE)
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)
class Meta:
        unique_together = ('herec', 'recenze')

class RecenzeHasEscapeRoom(models.Model):
    recenze = models.ForeignKey(Recenze, on_delete=models.CASCADE)
    escape_room = models.ForeignKey(EscapeRoom, on_delete=models.CASCADE)
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)
class Meta:
        unique_together = ('recenze', 'escape_room')

class HerciHasEscapeRoom(models.Model):
    herec = models.ForeignKey(Herec, on_delete=models.CASCADE)
    escape_room = models.ForeignKey(EscapeRoom, on_delete=models.CASCADE)
    created_at = models.DateTimeField(_("Vytvořeno"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Aktualizováno"), auto_now=True)
class Meta:
        unique_together = ('herec', 'escape_room')