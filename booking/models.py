from django.db import models
from django.utils import timezone

# Model pro Správce
class Spravce(models.Model):
    id_spravce = models.AutoField(primary_key=True)
    jmeno = models.CharField("Jméno", max_length=45)
    prijmeni = models.CharField("Příjmení", max_length=45)
    vek = models.IntegerField("Věk")
    doba_zamestnani = models.CharField("Doba zaměstnání", max_length=45, blank=True, null=True)

    def __str__(self):
        return f"{self.jmeno} {self.prijmeni}"

    class Meta:
        verbose_name = "Správce"
        verbose_name_plural = "Správci"

# Model pro Lokace
class Lokace(models.Model):
    id_lokace = models.AutoField(primary_key=True)
    nazev = models.CharField("Název lokace", max_length=45, unique=True)
    mesto = models.CharField("Město", max_length=45)
    ulice = models.CharField("Ulice", max_length=45)
    spravce = models.ForeignKey(Spravce, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Správce")

    def __str__(self):
        return self.nazev

    class Meta:
        verbose_name = "Lokace"
        verbose_name_plural = "Lokace"

# Model pro Herci
class Herec(models.Model):
    id_herec = models.AutoField(primary_key=True)
    jmeno = models.CharField("Jméno", max_length=45)
    prijmeni = models.CharField("Příjmení", max_length=45)
    role = models.CharField("Role", max_length=45)

    def __str__(self):
        return f"{self.jmeno} {self.prijmeni}"

    class Meta:
        verbose_name = "Herec"
        verbose_name_plural = "Herci"

# Model pro Únikové místnosti (Escape Rooms)
class EscapeRoom(models.Model):
    id_escape_room = models.AutoField(primary_key=True)
    nazev = models.CharField("Název místnosti", max_length=100)
    lokace = models.ForeignKey(Lokace, on_delete=models.CASCADE, verbose_name="Lokace")
    obtiznost = models.CharField("Obtížnost", max_length=45)
    strasidelnost = models.CharField("Strašidelnost", max_length=45)
    cena = models.DecimalField("Cena", max_digits=10, decimal_places=2)
    doporuceny_vek = models.CharField("Doporučený věk", max_length=45)
    tema = models.CharField("Téma", max_length=45, unique=True)
    herci = models.ManyToManyField(Herec, through='HerciHasEscapeRoom', blank=True, verbose_name="Herci")

    def __str__(self):
        return self.nazev

    class Meta:
        verbose_name = "Úniková místnost"
        verbose_name_plural = "Únikové místnosti"

# Model pro Zákazníky
class Zakaznik(models.Model):
    id_zakaznik = models.AutoField(primary_key=True)
    jmeno = models.CharField("Jméno", max_length=45)
    prijmeni = models.CharField("Příjmení", max_length=45)
    telefon = models.CharField("Telefon", max_length=45, unique=True)
    email = models.EmailField("Email", max_length=45, unique=True)

    def __str__(self):
        return f"{self.jmeno} {self.prijmeni}"

    class Meta:
        verbose_name = "Zákazník"
        verbose_name_plural = "Zákazníci"

# Model pro Rezervace
class Rezervace(models.Model):
    id_rezervace = models.AutoField(primary_key=True)
    datum_rezervace = models.DateField("Datum rezervace")
    cas_rezervace = models.TimeField("Čas rezervace")
    pocet_hracu = models.IntegerField("Počet hráčů")
    escape_room = models.ForeignKey(EscapeRoom, on_delete=models.CASCADE, verbose_name="Úniková místnost")
    zakaznik = models.ForeignKey(Zakaznik, on_delete=models.CASCADE, verbose_name="Zákazník")
    poznamky = models.TextField("Poznámky", blank=True, null=True)

    def __str__(self):
        return f"Rezervace #{self.id_rezervace} - {self.escape_room.nazev}"

    class Meta:
        verbose_name = "Rezervace"
        verbose_name_plural = "Rezervace"
        # Zajišťuje, že jedna místnost nemůže být rezervována ve stejný den a čas
        unique_together = ('datum_rezervace', 'cas_rezervace', 'escape_room')

# Model pro Recenze
class Recenze(models.Model):
    id_recenze = models.AutoField(primary_key=True)
    datum = models.DateField("Datum", default=timezone.now)
    autor = models.CharField("Autor", max_length=45)
    obsah = models.CharField("Obsah", max_length=255)
    herci = models.ManyToManyField(Herec, through='HerciHasRecenze', blank=True, verbose_name="Herci")
    escape_room = models.ManyToManyField(EscapeRoom, through='RecenzeHasEscapeRoom', blank=True, verbose_name="Únikové místnosti")

    def __str__(self):
        return f"Recenze od {self.autor} ze dne {self.datum}"

    class Meta:
        verbose_name = "Recenze"
        verbose_name_plural = "Recenze"

# Spojovací tabulky pro vztahy Many-to-Many
class HerciHasRecenze(models.Model):
    herec = models.ForeignKey(Herec, on_delete=models.CASCADE)
    recenze = models.ForeignKey(Recenze, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('herec', 'recenze')

class RecenzeHasEscapeRoom(models.Model):
    recenze = models.ForeignKey(Recenze, on_delete=models.CASCADE)
    escape_room = models.ForeignKey(EscapeRoom, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('recenze', 'escape_room')

class HerciHasEscapeRoom(models.Model):
    herec = models.ForeignKey(Herec, on_delete=models.CASCADE)
    escape_room = models.ForeignKey(EscapeRoom, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('herec', 'escape_room')