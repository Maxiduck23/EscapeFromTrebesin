from datetime import date, timedelta, time

from django.db import IntegrityError
from django.test import TestCase
from django.urls import reverse

from .models import (
    EscapeRoom,
    Lokace,
    Rezervace,
    Spravce,
    Zakaznik,
)


class RezervaceTests(TestCase):
                                                             

    @classmethod
    def setUpTestData(cls):
        cls.spravce = Spravce.objects.create(
            jmeno="Test",
            prijmeni="Správce",
            vek=30,
        )
        cls.lokace = Lokace.objects.create(
            nazev="Test Lokace",
            mesto="Praha",
            ulice="Testovací",
            spravce=cls.spravce,
        )
        cls.room = EscapeRoom.objects.create(
            nazev="Test Room",
            lokace=cls.lokace,
            obtiznost="Střední",
            strasidelnost="Nízká",
            cena=1200,
            doporuceny_vek="15+",
            tema="testtema",
        )
        cls.zakaznik = Zakaznik.objects.create(
            jmeno="Jan",
            prijmeni="Novák",
            telefon="123456789",
            email="jan@example.com",
        )

    def test_can_create_reservation_for_future_date(self):
        future_date = date.today() + timedelta(days=1)
        reservation = Rezervace.objects.create(
            escape_room=self.room,
            datum_rezervace=future_date,
            cas_rezervace=time(10, 0),
            pocet_hracu=4,
            zakaznik=self.zakaznik,
        )
        self.assertEqual(reservation.datum_rezervace, future_date)

    def test_duplicate_reservation_not_allowed(self):
        future_date = date.today() + timedelta(days=2)
        Rezervace.objects.create(
            escape_room=self.room,
            datum_rezervace=future_date,
            cas_rezervace=time(10, 0),
            pocet_hracu=4,
            zakaznik=self.zakaznik,
        )
        with self.assertRaises(IntegrityError):
            Rezervace.objects.create(
                escape_room=self.room,
                datum_rezervace=future_date,
                cas_rezervace=time(10, 0),
                pocet_hracu=4,
                zakaznik=self.zakaznik,
            )

    def test_get_available_slots_excludes_booked_time(self):
        future_date = date.today() + timedelta(days=3)
        Rezervace.objects.create(
            escape_room=self.room,
            datum_rezervace=future_date,
            cas_rezervace=time(10, 0),
            pocet_hracu=4,
            zakaznik=self.zakaznik,
        )
        url = reverse("booking:get_available_slots")
        response = self.client.get(
            url, {"date": future_date.isoformat(), "room_id": self.room.id_escape_room}
        )
        self.assertEqual(response.status_code, 200)
        available = response.json()["available_slots"]
        self.assertNotIn("10:00", available)

    def test_get_available_slots_when_no_bookings(self):
        future_date = date.today() + timedelta(days=4)
        url = reverse("booking:get_available_slots")
        response = self.client.get(
            url, {"date": future_date.isoformat(), "room_id": self.room.id_escape_room}
        )
        self.assertEqual(response.status_code, 200)
        available = response.json()["available_slots"]
        self.assertIn("10:00", available)
        self.assertEqual(len(available), 6)

