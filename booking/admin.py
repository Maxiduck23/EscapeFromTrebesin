from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    Spravce, Lokace, Herec, EscapeRoom,
    Zakaznik, Rezervace, Recenze,
    HerciHasRecenze, RecenzeHasEscapeRoom, HerciHasEscapeRoom
)


class HerciHasEscapeRoomInline(admin.TabularInline):
    model = HerciHasEscapeRoom
    extra = 1


class RecenzeHasEscapeRoomInline(admin.TabularInline):
    model = RecenzeHasEscapeRoom
    extra = 1


class HerciHasRecenzeInline(admin.TabularInline):
    model = HerciHasRecenze
    extra = 1


@admin.register(Spravce)
class SpravceAdmin(admin.ModelAdmin):
    list_display = ('jmeno', 'prijmeni', 'vek', 'doba_zamestnani', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('jmeno', 'prijmeni')
    ordering = ('prijmeni', 'jmeno')


@admin.register(Lokace)
class LokaceAdmin(admin.ModelAdmin):
    list_display = ('nazev', 'mesto', 'ulice', 'spravce', 'created_at')
    list_filter = ('mesto', 'created_at')
    search_fields = ('nazev', 'mesto', 'ulice')
    ordering = ('nazev',)


@admin.register(Herec)
class HerecAdmin(admin.ModelAdmin):
    list_display = ('jmeno', 'prijmeni', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('jmeno', 'prijmeni', 'role')
    ordering = ('prijmeni', 'jmeno')
    inlines = [HerciHasEscapeRoomInline, HerciHasRecenzeInline]


@admin.register(EscapeRoom)
class EscapeRoomAdmin(admin.ModelAdmin):
    list_display = ('nazev', 'lokace', 'obtiznost', 'cena', 'tema', 'created_at')
    list_filter = ('obtiznost', 'lokace', 'created_at')
    search_fields = ('nazev', 'tema')
    ordering = ('nazev',)
    inlines = [HerciHasEscapeRoomInline, RecenzeHasEscapeRoomInline]
    fieldsets = (
        (_('Základní informace'), {
            'fields': ('nazev', 'tema', 'lokace')
        }),
        (_('Detaily'), {
            'fields': ('obtiznost', 'strasidelnost', 'cena', 'doporuceny_vek')
        }),
        (_('Časové údaje'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Zakaznik)
class ZakaznikAdmin(admin.ModelAdmin):
    list_display = ('jmeno', 'prijmeni', 'email', 'telefon', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('jmeno', 'prijmeni', 'email', 'telefon')
    ordering = ('prijmeni', 'jmeno')


@admin.register(Rezervace)
class RezervaceAdmin(admin.ModelAdmin):
    list_display = (
        'id_rezervace', 'escape_room', 'zakaznik', 'datum_rezervace',
        'cas_rezervace', 'pocet_hracu', 'created_at'
    )
    list_filter = ('escape_room', 'datum_rezervace', 'created_at')
    search_fields = (
        'zakaznik__jmeno', 'zakaznik__prijmeni', 'zakaznik__email'
    )
    date_hierarchy = 'datum_rezervace'
    ordering = ('-datum_rezervace', '-cas_rezervace')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (_('Informace o rezervaci'), {
            'fields': ('escape_room', 'datum_rezervace', 'cas_rezervace', 'pocet_hracu')
        }),
        (_('Zákazník'), {
            'fields': ('zakaznik',)
        }),
        (_('Dodatečné informace'), {
            'fields': ('poznamky',)
        }),
        (_('Časové údaje'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Recenze)
class RecenzeAdmin(admin.ModelAdmin):
    list_display = ('autor', 'datum', 'created_at')
    list_filter = ('datum', 'created_at')
    search_fields = ('autor', 'obsah')
    date_hierarchy = 'datum'
    ordering = ('-datum',)
    inlines = [HerciHasRecenzeInline, RecenzeHasEscapeRoomInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HerciHasEscapeRoom)
class HerciHasEscapeRoomAdmin(admin.ModelAdmin):
    list_display = ('herec', 'escape_room', 'created_at')
    list_filter = ('escape_room', 'created_at')


@admin.register(HerciHasRecenze)
class HerciHasRecenzeAdmin(admin.ModelAdmin):
    list_display = ('herec', 'recenze', 'created_at')
    list_filter = ('created_at',)


@admin.register(RecenzeHasEscapeRoom)
class RecenzeHasEscapeRoomAdmin(admin.ModelAdmin):
    list_display = ('recenze', 'escape_room', 'created_at')
    list_filter = ('escape_room', 'created_at')
