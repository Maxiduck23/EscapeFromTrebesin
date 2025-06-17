document.addEventListener('DOMContentLoaded', function () {
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Stav rezervace
    let bookingState = {
        currentStep: 1,
        selectedRoom: null,
        selectedDate: null,
        selectedTime: null,
        personalInfo: {},
        roomPrice: 0,
        roomName: ''
    };

    // Elementy
    const steps = document.querySelectorAll('.booking-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');
    const bookingSummary = document.getElementById('booking-summary');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Výběr místnosti
    const roomOptions = document.querySelectorAll('.room-option');
    roomOptions.forEach(option => {
        option.addEventListener('click', function () {
            roomOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            bookingState.selectedRoom = this.dataset.roomId;
            bookingState.roomPrice = parseInt(this.dataset.price);
            bookingState.roomName = this.querySelector('.room-name').textContent;

            // Aktualizace souhrnu
            document.getElementById('summary-room').textContent = bookingState.roomName;
            document.getElementById('summary-price').textContent = bookingState.roomPrice + ' Kč';

            // Povolit další krok
            btnNext.disabled = false;
        });
    });

    // OPRAVENÁ KALENDÁŘOVÁ LOGIKA
    let currentMonth = new Date();

    function generateCalendar() {
        console.log('Generuji kalendář pro:', currentMonth); // Debug

        const calendarGrid = document.getElementById('calendar-grid');
        const calendarTitle = document.getElementById('calendar-title');

        if (!calendarGrid || !calendarTitle) {
            console.error('Kalendářové elementy nenalezeny!');
            return;
        }

        calendarGrid.innerHTML = '';

        // Přidání labels pro dny v týdnu
        const dayLabels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        dayLabels.forEach(day => {
            const label = document.createElement('div');
            label.className = 'day-label';
            label.textContent = day;
            calendarGrid.appendChild(label);
        });

        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const monthNames = [
            'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
            'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
        ];
        calendarTitle.textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

        // OPRAVENÝ VÝPOČET PRVNÍHO DNE (Po = 0, Út = 1, ..., Ne = 6)
        let startDay = firstDay.getDay();
        startDay = (startDay === 0) ? 6 : startDay - 1; // Neděle (0) -> 6, ostatní -1

        // Prázdné buňky na začátku
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generování dnů
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

            // Kontrola, jestli je den v minulosti
            if (currentDate < today) {
                dayElement.classList.add('disabled');
                dayElement.title = 'Nelze rezervovat minulé datum';
            } else {
                // PŘIDÁNÍ EVENT LISTENERU POUZE PRO DOSTUPNÉ DNY
                dayElement.addEventListener('click', function () {
                    console.log('Klik na datum:', currentDate); // Debug

                    // Odstranění předchozího výběru
                    document.querySelectorAll('.calendar-day.selected').forEach(d => {
                        d.classList.remove('selected');
                    });

                    // Přidání výběru
                    this.classList.add('selected');
                    bookingState.selectedDate = currentDate;

                    // Aktualizace souhrnu
                    const dateStr = `${day}. ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
                    document.getElementById('summary-date').textContent = dateStr;

                    // Načtení dostupných časů
                    updateTimeSlots();
                    checkStep2Completion();
                });

                // Hover efekt
                dayElement.addEventListener('mouseenter', function () {
                    if (!this.classList.contains('disabled')) {
                        this.style.backgroundColor = '#e63946';
                        this.style.color = '#fff';
                    }
                });

                dayElement.addEventListener('mouseleave', function () {
                    if (!this.classList.contains('selected')) {
                        this.style.backgroundColor = '';
                        this.style.color = '';
                    }
                });
            }

            // Označení dnešního dne
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            calendarGrid.appendChild(dayElement);
        }

        console.log('Kalendář vygenerován'); // Debug
    }

    // Navigation kalendáře
    document.getElementById('prev-month').addEventListener('click', function () {
        console.log('Předchozí měsíc'); // Debug
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        generateCalendar();

        // Reset výběru při změně měsíce
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        document.getElementById('summary-date').textContent = '-';
        document.getElementById('summary-time').textContent = '-';
        checkStep2Completion();
    });

    document.getElementById('next-month').addEventListener('click', function () {
        console.log('Další měsíc'); // Debug
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        generateCalendar();

        // Reset výběru při změně měsíce
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        document.getElementById('summary-date').textContent = '-';
        document.getElementById('summary-time').textContent = '-';
        checkStep2Completion();
    });

    // OPRAVENÁ FUNKCE PRO NAČTENÍ DOSTUPNÝCH ČASŮ
    function updateTimeSlots() {
        if (!bookingState.selectedRoom || !bookingState.selectedDate) {
            console.log('Chybí místnost nebo datum pro načtení časů');
            return;
        }

        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Načítání volných termínů...</p>';

        const dateStr = bookingState.selectedDate.toISOString().split('T')[0];
        const url = `${window.bookingUrls.getAvailableSlots}?date=${dateStr}&room_id=${bookingState.selectedRoom}`;

        console.log('Načítám dostupné časy:', url); // Debug

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dostupné časy:', data); // Debug
                timeSlotsContainer.innerHTML = '';
                const allSlots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

                allSlots.forEach(time => {
                    const slotEl = document.createElement('div');
                    slotEl.className = 'time-slot';
                    slotEl.dataset.time = time;
                    slotEl.textContent = time;

                    if (!data.available_slots.includes(time)) {
                        slotEl.classList.add('disabled');
                        slotEl.title = 'Termín je obsazený';
                    } else {
                        slotEl.addEventListener('click', function () {
                            if (this.classList.contains('disabled')) return;

                            console.log('Vybran čas:', time); // Debug

                            document.querySelectorAll('.time-slot.selected').forEach(s => {
                                s.classList.remove('selected');
                            });
                            this.classList.add('selected');
                            bookingState.selectedTime = this.dataset.time;
                            document.getElementById('summary-time').textContent = bookingState.selectedTime;
                            checkStep2Completion();
                        });

                        // Hover efekt pro dostupné časy
                        slotEl.addEventListener('mouseenter', function () {
                            this.style.backgroundColor = '#e63946';
                            this.style.color = '#fff';
                        });

                        slotEl.addEventListener('mouseleave', function () {
                            if (!this.classList.contains('selected')) {
                                this.style.backgroundColor = '';
                                this.style.color = '';
                            }
                        });
                    }
                    timeSlotsContainer.appendChild(slotEl);
                });
            })
            .catch(error => {
                console.error('Chyba při načítání časových slotů:', error);
                timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: #e63946;">Chyba při načítání. Zkuste to znovu.</p>';
            });
    }

    // Kontrola dokončení kroku 2
    function checkStep2Completion() {
        if (bookingState.selectedDate && bookingState.selectedTime) {
            btnNext.disabled = false;
            console.log('Krok 2 dokončen');
        } else {
            btnNext.disabled = true;
            console.log('Krok 2 nedokončen - datum:', bookingState.selectedDate, 'čas:', bookingState.selectedTime);
        }
    }

    // Validace formuláře
    const personalInfoForm = document.getElementById('personal-info-form');
    const formInputs = personalInfoForm.querySelectorAll('input[required], select[required]');

    formInputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });

    function validateForm() {
        let isValid = true;
        formInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
            }
        });

        btnNext.disabled = !isValid;

        const players = document.getElementById('players').value;
        if (players) {
            document.getElementById('summary-players').textContent = players;
        }
    }

    // OPRAVENÉ ODESÍLÁNÍ FORMULÁŘE
    btnNext.addEventListener('click', function () {
        if (bookingState.currentStep === 3) {
            console.log('Odesílám rezervaci...'); // Debug

            // Sbíráme data z formuláře
            bookingState.personalInfo = {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                players: document.getElementById('players').value,
                notes: document.getElementById('notes').value
            };

            // Vytvoříme FormData pro odeslání
            const formData = new FormData();
            formData.append('room', bookingState.selectedRoom);
            formData.append('date', bookingState.selectedDate.toISOString().split('T')[0]);
            formData.append('time', bookingState.selectedTime);
            formData.append('jmeno', bookingState.personalInfo.firstName);
            formData.append('prijmeni', bookingState.personalInfo.lastName);
            formData.append('email', bookingState.personalInfo.email);
            formData.append('telefon', bookingState.personalInfo.phone);
            formData.append('pocet_hracu', bookingState.personalInfo.players);
            formData.append('poznamky', bookingState.personalInfo.notes);

            loadingOverlay.classList.add('active');
            btnNext.disabled = true;

            fetch(window.bookingUrls.bookingSubmit, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
                .then(response => response.json())
                .then(data => {
                    loadingOverlay.classList.remove('active');
                    console.log('Odpověď ze serveru:', data); // Debug

                    if (data.success) {
                        document.getElementById('booking-code').textContent = data.booking_code;
                        goToStep(4);

                        // Zobrazení úspěšné zprávy
                        showSuccessMessage('Rezervace byla úspěšně dokončena!');
                    } else {
                        console.error('Rezervace selhala:', data.errors);
                        showErrorMessage('Rezervace se nezdařila: ' + JSON.stringify(data.errors));
                        btnNext.disabled = false;
                    }
                })
                .catch(error => {
                    loadingOverlay.classList.remove('active');
                    console.error('Chyba při odesílání formuláře:', error);
                    showErrorMessage('Došlo k technické chybě. Zkuste to prosím znovu později.');
                    btnNext.disabled = false;
                });
        } else {
            goToStep(bookingState.currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // FUNKCE PRO ZOBRAZENÍ ZPRÁV
    function showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    function showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✗</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // Navigace mezi kroky
    function goToStep(stepNumber) {
        console.log('Přechod na krok:', stepNumber); // Debug

        steps.forEach(step => step.style.display = 'none');
        const targetStep = document.getElementById(`booking-step-${stepNumber}`);
        if (targetStep) {
            targetStep.style.display = 'block';
        }

        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < stepNumber - 1) {
                step.classList.add('completed');
            } else if (index === stepNumber - 1) {
                step.classList.add('active');
            }
        });

        btnBack.style.display = stepNumber > 1 && stepNumber < 4 ? 'block' : 'none';

        if (stepNumber === 4) {
            document.getElementById('booking-navigation').style.display = 'none';
        } else {
            document.getElementById('booking-navigation').style.display = 'flex';
        }

        bookingSummary.style.display = stepNumber > 1 && stepNumber < 4 ? 'block' : 'none';

        btnNext.disabled = true;

        if (stepNumber === 3) {
            btnNext.textContent = 'Dokončit rezervaci';
            validateForm();
        } else {
            btnNext.textContent = 'Pokračovat';
        }

        if (stepNumber === 1 && bookingState.selectedRoom) {
            btnNext.disabled = false;
        } else if (stepNumber === 2) {
            checkStep2Completion();
        }

        bookingState.currentStep = stepNumber;
    }

    btnBack.addEventListener('click', function () {
        goToStep(bookingState.currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Inicializace kalendáře
    console.log('Inicializuji kalendář...'); // Debug
    generateCalendar();
});