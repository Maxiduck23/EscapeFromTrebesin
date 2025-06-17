// Přidejte tuto debug funkci na začátek booking.js
document.addEventListener('DOMContentLoaded', function () {

    // DEBUG FUNKCE
    function debugDate(label, date, extra = {}) {
        console.log(`🔍 ${label}:`);
        if (typeof date === 'string') {
            console.log(`   String: "${date}"`);
        } else if (date instanceof Date) {
            console.log(`   Date object: ${date}`);
            console.log(`   ISO: ${date.toISOString()}`);
            console.log(`   Local: ${date.toLocaleDateString('cs-CZ')}`);
            console.log(`   getDate(): ${date.getDate()}`);
            console.log(`   getMonth(): ${date.getMonth() + 1}`);
            console.log(`   getFullYear(): ${date.getFullYear()}`);
        }
        if (Object.keys(extra).length > 0) {
            console.log(`   Extra:`, extra);
        }
        console.log('---');
    }

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

    // Helper funkce pro formátování data
    function formatDateForServer(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

    window.bookingState = bookingState;

    // Elementy
    const steps = document.querySelectorAll('.booking-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');
    const bookingSummary = document.getElementById('booking-summary');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Výběr místnosti (zkráceno pro přehlednost)
    const roomOptions = document.querySelectorAll('.room-option');
    roomOptions.forEach(option => {
        option.addEventListener('click', function () {
            roomOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            bookingState.selectedRoom = this.dataset.roomId;
            bookingState.roomPrice = parseInt(this.dataset.price);
            bookingState.roomName = this.querySelector('.room-name').textContent;
            bookingState.selectedDate = null;
            bookingState.selectedTime = null;
            document.getElementById('summary-room').textContent = bookingState.roomName;
            document.getElementById('summary-price').textContent = bookingState.roomPrice + ' Kč';
            btnNext.disabled = false;
            console.log('✅ Vybrána místnost:', bookingState.roomName);
        });
    });

    // KALENDÁŘOVÁ LOGIKA
    let currentMonth = new Date();

    function generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const calendarTitle = document.getElementById('calendar-title');
        if (!calendarGrid || !calendarTitle) return;

        calendarGrid.innerHTML = '';
        const dayLabels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        dayLabels.forEach(day => {
            const label = document.createElement('div');
            label.className = 'day-label';
            label.textContent = day;
            calendarGrid.appendChild(label);
        });

        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const monthNames = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
        calendarTitle.textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

        let startDay = firstDay.getDay();
        startDay = (startDay === 0) ? 6 : startDay - 1;

        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

            if (currentDate < today) {
                dayElement.classList.add('disabled');
            } else {
                // KRITICKÉ MÍSTO - tady se vytváří dataset.date
                const datasetDate = formatDateForServer(currentDate);
                dayElement.dataset.date = datasetDate;

                debugDate(`Dataset pro den ${day}`, currentDate, {
                    datasetDate: datasetDate,
                    dayInMonth: day
                });

                dayElement.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log('🖱️ KLIK NA DATUM');
                    console.log(`   Kliknuto na den: ${day}`);
                    console.log(`   Dataset.date: "${this.dataset.date}"`);

                    document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
                    this.classList.add('selected');

                    // TESTUJEME RŮZNÉ ZPŮSOBY VYTVOŘENÍ DATA
                    const method1_string = this.dataset.date;
                    const method2_dateFromString = new Date(this.dataset.date);
                    const method3_dateFromParts = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

                    debugDate('Method 1 - String z datasetu', method1_string);
                    debugDate('Method 2 - new Date(string)', method2_dateFromString);
                    debugDate('Method 3 - new Date(year, month, day)', method3_dateFromParts);

                    // Používáme string metodu
                    bookingState.selectedDate = method1_string;
                    bookingState.selectedTime = null;

                    const dateStr = `${day}. ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
                    document.getElementById('summary-date').textContent = dateStr;
                    document.getElementById('summary-time').textContent = '-';

                    console.log(`✅ Uloženo do bookingState.selectedDate: "${bookingState.selectedDate}"`);

                    updateTimeSlots();
                    checkStep2Completion();
                });
            }

            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            calendarGrid.appendChild(dayElement);
        }
    }

    // Navigation kalendáře
    document.getElementById('prev-month')?.addEventListener('click', function () {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        generateCalendar();
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
    });

    document.getElementById('next-month')?.addEventListener('click', function () {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        generateCalendar();
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
    });

    function updateTimeSlots() {
        if (!bookingState.selectedRoom || !bookingState.selectedDate) return;

        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) return;

        timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Načítání...</p>';

        const dateStr = bookingState.selectedDate;
        const url = `${window.bookingUrls.getAvailableSlots}?date=${dateStr}&room_id=${bookingState.selectedRoom}`;

        console.log('🌐 AJAX REQUEST');
        console.log(`   URL: ${url}`);
        console.log(`   Datum: "${dateStr}"`);

        fetch(url, { method: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(response => response.json())
            .then(data => {
                console.log('📥 AJAX RESPONSE:', data);
                timeSlotsContainer.innerHTML = '';
                const allSlots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
                allSlots.forEach(time => {
                    const slotEl = document.createElement('div');
                    slotEl.className = 'time-slot';
                    slotEl.dataset.time = time;
                    slotEl.textContent = time;
                    if (!data.available_slots || !data.available_slots.includes(time)) {
                        slotEl.classList.add('disabled');
                    } else {
                        slotEl.addEventListener('click', function (e) {
                            if (this.classList.contains('disabled')) return;
                            document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                            this.classList.add('selected');
                            bookingState.selectedTime = this.dataset.time;
                            document.getElementById('summary-time').textContent = bookingState.selectedTime;
                            checkStep2Completion();
                        });
                    }
                    timeSlotsContainer.appendChild(slotEl);
                });
            })
            .catch(error => {
                console.error('❌ AJAX ERROR:', error);
                timeSlotsContainer.innerHTML = '<p style="color: red;">Chyba při načítání</p>';
            });
    }

    function checkStep2Completion() {
        if (bookingState.selectedDate && bookingState.selectedTime) {
            btnNext.disabled = false;
        } else {
            btnNext.disabled = true;
        }
    }

    // Simplified form validation
    function validateForm() {
        const inputs = ['first-name', 'last-name', 'email', 'phone', 'players'];
        let isValid = inputs.every(id => {
            const field = document.getElementById(id);
            return field && field.value.trim();
        });
        btnNext.disabled = !isValid;
    }

    // Event listeners for form
    ['first-name', 'last-name', 'email', 'phone', 'players'].forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('input', validateForm);
            field.addEventListener('change', validateForm);
        }
    });

    // ODESÍLÁNÍ FORMULÁŘE
    btnNext?.addEventListener('click', function () {
        if (bookingState.currentStep === 3) {
            console.log('🚀 ODESÍLÁNÍ REZERVACE');

            // Sestavení dat
            bookingState.personalInfo = {
                firstName: document.getElementById('first-name')?.value.trim(),
                lastName: document.getElementById('last-name')?.value.trim(),
                email: document.getElementById('email')?.value.trim(),
                phone: document.getElementById('phone')?.value.trim(),
                players: document.getElementById('players')?.value,
                notes: document.getElementById('notes')?.value.trim() || ''
            };

            const formData = new FormData();
            formData.append('room', bookingState.selectedRoom);
            formData.append('date', bookingState.selectedDate);
            formData.append('time', bookingState.selectedTime);
            formData.append('jmeno', bookingState.personalInfo.firstName);
            formData.append('prijmeni', bookingState.personalInfo.lastName);
            formData.append('email', bookingState.personalInfo.email);
            formData.append('telefon', bookingState.personalInfo.phone);
            formData.append('pocet_hracu', bookingState.personalInfo.players);
            formData.append('poznamky', bookingState.personalInfo.notes);

            // KRITICKÝ DEBUG
            console.log('📤 ODESÍLANÁ DATA:');
            for (let [key, value] of formData.entries()) {
                console.log(`   ${key}: "${value}"`);
            }

            const csrfToken = getCookie('csrftoken') || window.bookingUrls?.csrfToken;
            const submitUrl = window.bookingUrls?.bookingSubmit || '/booking/';

            loadingOverlay?.classList.add('active');
            btnNext.disabled = true;

            fetch(submitUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
                .then(response => response.json())
                .then(data => {
                    loadingOverlay?.classList.remove('active');
                    console.log('📥 SERVER RESPONSE:', data);
                    if (data.success) {
                        document.getElementById('booking-code').textContent = data.booking_code || 'EFT-XXXX';
                        goToStep(4);
                    } else {
                        console.error('❌ REZERVACE SELHALA:', data.errors);
                        btnNext.disabled = false;
                    }
                })
                .catch(error => {
                    loadingOverlay?.classList.remove('active');
                    console.error('❌ NETWORK ERROR:', error);
                    btnNext.disabled = false;
                });
        } else {
            goToStep(bookingState.currentStep + 1);
        }
    });

    function goToStep(stepNumber) {
        steps.forEach(step => step.style.display = 'none');
        document.getElementById(`booking-step-${stepNumber}`)?.style.display = 'block';

        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < stepNumber - 1) step.classList.add('completed');
            else if (index === stepNumber - 1) step.classList.add('active');
        });

        if (btnBack) btnBack.style.display = stepNumber > 1 && stepNumber < 4 ? 'block' : 'none';
        if (bookingSummary) bookingSummary.style.display = stepNumber > 1 && stepNumber < 4 ? 'block' : 'none';

        btnNext.disabled = true;
        if (stepNumber === 3) {
            btnNext.textContent = 'Dokončit rezervaci';
            validateForm();
        } else {
            btnNext.textContent = 'Pokračovat';
        }

        if (stepNumber === 1 && bookingState.selectedRoom) btnNext.disabled = false;
        else if (stepNumber === 2) checkStep2Completion();

        bookingState.currentStep = stepNumber;
    }

    btnBack?.addEventListener('click', () => goToStep(bookingState.currentStep - 1));

    // Inicializace
    generateCalendar();
    console.log('🎉 Debug booking.js loaded');
});