// KOMPLETNÍ OPRAVENÝ booking.js
// Oprava problému s ukládáním data o den dříve

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Loading booking.js...');

    // =====================================================================
    // HELPER FUNKCE PRO PRÁCI S DATY - OPRAVENO
    // =====================================================================

    /**
     * Vytvoří string ve formátu YYYY-MM-DD bez použití Date objektu
     * Tím se vyhneme timezone problémům
     */
    function formatDateForServer(year, month, day) {
        const monthStr = String(month + 1).padStart(2, '0'); // month je 0-based
        const dayStr = String(day).padStart(2, '0');
        const result = `${year}-${monthStr}-${dayStr}`;
        console.log(`📅 formatDateForServer(${year}, ${month}, ${day}) => "${result}"`);
        return result;
    }

    /**
     * Vytvoří Date objekt bezpečně pro porovnání
     */
    function createSafeDate(year, month, day) {
        return new Date(year, month, day);
    }

    /**
     * Získá CSRF token z cookies
     */
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

    /**
     * Debug funkce pro logování dat
     */
    function debugDate(label, dateValue, extra = {}) {
        if (!window.bookingConfig?.debug) return;

        console.log(`🔍 ${label}:`);
        if (typeof dateValue === 'string') {
            console.log(`   String: "${dateValue}"`);
        } else if (dateValue instanceof Date) {
            console.log(`   Date object: ${dateValue}`);
            console.log(`   ISO: ${dateValue.toISOString()}`);
            console.log(`   Local: ${dateValue.toLocaleDateString('cs-CZ')}`);
        }
        if (Object.keys(extra).length > 0) {
            console.log(`   Extra:`, extra);
        }
        console.log('---');
    }

    // =====================================================================
    // STAV APLIKACE
    // =====================================================================

    let bookingState = {
        currentStep: 1,
        selectedRoom: null,
        selectedDate: null, // Bude ve formátu YYYY-MM-DD
        selectedTime: null,
        personalInfo: {},
        roomPrice: 0,
        roomName: ''
    };

    // Expose pro debugging
    window.bookingState = bookingState;

    // =====================================================================
    // DOM ELEMENTY
    // =====================================================================

    const steps = document.querySelectorAll('.booking-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');
    const bookingSummary = document.getElementById('booking-summary');
    const loadingOverlay = document.getElementById('loading-overlay');

    // =====================================================================
    // KALENDÁŘ - OPRAVENO
    // =====================================================================

    let currentMonth = new Date();

    function generateCalendar() {
        console.log('📅 Generating calendar for:', currentMonth);

        const calendarGrid = document.getElementById('calendar-grid');
        const calendarTitle = document.getElementById('calendar-title');

        if (!calendarGrid || !calendarTitle) {
            console.error('❌ Calendar elements not found');
            return;
        }

        calendarGrid.innerHTML = '';

        // Vytvoření hlavičky s dny v týdnu
        const dayLabels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        dayLabels.forEach(day => {
            const label = document.createElement('div');
            label.className = 'day-label';
            label.textContent = day;
            calendarGrid.appendChild(label);
        });

        // Získání informací o měsíci
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth(); // 0-based
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const monthNames = [
            'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
            'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
        ];

        calendarTitle.textContent = `${monthNames[month]} ${year}`;

        // Výpočet prvního dne v týdnu (pondělí = 0)
        let startDay = firstDay.getDay();
        startDay = (startDay === 0) ? 6 : startDay - 1; // Neděle = 6

        // Prázdné dny na začátku
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Dnešní datum pro porovnání
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generování dnů v měsíci
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // KRITICKÉ: Vytvoření data pro porovnání
            const currentDate = createSafeDate(year, month, day);

            // Kontrola, jestli je den v minulosti
            if (currentDate < today) {
                dayElement.classList.add('disabled');
            } else {
                // OPRAVENO: Ukládání komponent data místo formatted stringu
                dayElement.dataset.year = year;
                dayElement.dataset.month = month; // 0-based
                dayElement.dataset.day = day;

                // Pro server použijeme dedicated funkci
                const serverDate = formatDateForServer(year, month, day);
                dayElement.dataset.serverDate = serverDate;

                debugDate(`Calendar day ${day}`, currentDate, {
                    year: year,
                    month: month,
                    day: day,
                    serverDate: serverDate
                });

                // Event listener pro klik na datum
                dayElement.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (this.classList.contains('disabled')) return;

                    console.log('🖱️ DATE CLICKED');
                    console.log(`   Day: ${day}`);
                    console.log(`   Year: ${this.dataset.year}`);
                    console.log(`   Month: ${this.dataset.month}`);
                    console.log(`   Server date: ${this.dataset.serverDate}`);

                    // Odstranění předchozího výběru
                    document.querySelectorAll('.calendar-day.selected').forEach(d =>
                        d.classList.remove('selected')
                    );
                    this.classList.add('selected');

                    // OPRAVENO: Použití server date formátu
                    bookingState.selectedDate = this.dataset.serverDate;
                    bookingState.selectedTime = null;

                    // Aktualizace UI
                    const dateStr = `${day}. ${monthNames[month]} ${year}`;
                    document.getElementById('summary-date').textContent = dateStr;
                    document.getElementById('summary-time').textContent = '-';

                    console.log(`✅ Selected date stored: "${bookingState.selectedDate}"`);

                    // Reset time slots a načtení nových
                    updateTimeSlots();
                    checkStep2Completion();
                });
            }

            // Zvýraznění dnešního dne
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            calendarGrid.appendChild(dayElement);
        }

        console.log('✅ Calendar generated successfully');
    }

    // Navigace kalendáře
    document.getElementById('prev-month')?.addEventListener('click', function () {
        console.log('⬅️ Previous month');
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        generateCalendar();
        // Reset výběru při změně měsíce
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        document.getElementById('summary-date').textContent = '-';
        document.getElementById('summary-time').textContent = '-';
        checkStep2Completion();
    });

    document.getElementById('next-month')?.addEventListener('click', function () {
        console.log('➡️ Next month');
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        generateCalendar();
        // Reset výběru při změně měsíce
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        document.getElementById('summary-date').textContent = '-';
        document.getElementById('summary-time').textContent = '-';
        checkStep2Completion();
    });

    // =====================================================================
    // VÝBĚR MÍSTNOSTI
    // =====================================================================

    const roomOptions = document.querySelectorAll('.room-option');
    roomOptions.forEach(option => {
        option.addEventListener('click', function () {
            console.log('🏠 Room selected:', this.dataset.roomId);

            // Odstranění předchozího výběru
            roomOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            // Uložení výběru
            bookingState.selectedRoom = this.dataset.roomId;
            bookingState.roomPrice = parseInt(this.dataset.price);
            bookingState.roomName = this.querySelector('.room-name').textContent;

            // Reset date/time při změně místnosti
            bookingState.selectedDate = null;
            bookingState.selectedTime = null;

            // Aktualizace UI
            document.getElementById('summary-room').textContent = bookingState.roomName;
            document.getElementById('summary-price').textContent = bookingState.roomPrice + ' Kč';
            document.getElementById('summary-date').textContent = '-';
            document.getElementById('summary-time').textContent = '-';

            // Povolení pokračování
            btnNext.disabled = false;

            console.log('✅ Room selection saved:', {
                id: bookingState.selectedRoom,
                name: bookingState.roomName,
                price: bookingState.roomPrice
            });
        });
    });

    // =====================================================================
    // ČASOVÉ SLOTY
    // =====================================================================

    function updateTimeSlots() {
        console.log('⏰ Updating time slots...');

        if (!bookingState.selectedRoom || !bookingState.selectedDate) {
            console.log('❌ Missing room or date for time slots');
            return;
        }

        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) {
            console.error('❌ Time slots container not found');
            return;
        }

        // Loading state
        timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Načítání dostupných časů...</p>';

        const dateStr = bookingState.selectedDate;
        const roomId = bookingState.selectedRoom;
        const url = `${window.bookingConfig?.urls?.getAvailableSlots || '/booking/ajax/get_available_slots/'}?date=${encodeURIComponent(dateStr)}&room_id=${encodeURIComponent(roomId)}`;

        console.log('🌐 AJAX REQUEST for time slots');
        console.log(`   URL: ${url}`);
        console.log(`   Date: "${dateStr}"`);
        console.log(`   Room ID: ${roomId}`);

        fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('📥 Time slots response:', data);

                timeSlotsContainer.innerHTML = '';

                if (data.error) {
                    timeSlotsContainer.innerHTML = `<p style="color: red; text-align: center; grid-column: 1 / -1;">${data.error}</p>`;
                    return;
                }

                const allSlots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
                const availableSlots = data.available_slots || [];

                allSlots.forEach(timeSlot => {
                    const slotElement = document.createElement('div');
                    slotElement.className = 'time-slot';
                    slotElement.dataset.time = timeSlot;
                    slotElement.textContent = timeSlot;
                    slotElement.setAttribute('role', 'button');
                    slotElement.setAttribute('tabindex', '0');

                    if (!availableSlots.includes(timeSlot)) {
                        slotElement.classList.add('disabled');
                        slotElement.setAttribute('aria-disabled', 'true');
                    } else {
                        slotElement.addEventListener('click', function (e) {
                            e.preventDefault();
                            if (this.classList.contains('disabled')) return;

                            console.log('⏰ Time selected:', timeSlot);

                            // Odstranění předchozího výběru
                            document.querySelectorAll('.time-slot.selected').forEach(s =>
                                s.classList.remove('selected')
                            );
                            this.classList.add('selected');

                            // Uložení výběru
                            bookingState.selectedTime = this.dataset.time;
                            document.getElementById('summary-time').textContent = bookingState.selectedTime;

                            console.log('✅ Time selection saved:', bookingState.selectedTime);

                            checkStep2Completion();
                        });

                        // Keyboard support
                        slotElement.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                this.click();
                            }
                        });
                    }

                    timeSlotsContainer.appendChild(slotElement);
                });

                console.log(`✅ Time slots rendered: ${availableSlots.length}/${allSlots.length} available`);
            })
            .catch(error => {
                console.error('❌ Time slots error:', error);
                timeSlotsContainer.innerHTML = `<p style="color: red; text-align: center; grid-column: 1 / -1;">Chyba při načítání časů: ${error.message}</p>`;
            });
    }

    function checkStep2Completion() {
        const canProceed = bookingState.selectedDate && bookingState.selectedTime;
        btnNext.disabled = !canProceed;

        console.log('🔍 Step 2 completion check:', {
            hasDate: !!bookingState.selectedDate,
            hasTime: !!bookingState.selectedTime,
            canProceed: canProceed
        });
    }

    // =====================================================================
    // FORMULÁŘ - KROK 3
    // =====================================================================

    function validateForm() {
        const requiredFields = ['first-name', 'last-name', 'email', 'phone', 'players'];
        const isValid = requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field?.value?.trim();
            const valid = !!value;

            // Visual feedback
            if (field) {
                field.classList.toggle('error', !valid);
            }

            return valid;
        });

        btnNext.disabled = !isValid;

        console.log('📝 Form validation:', {
            isValid: isValid,
            fields: requiredFields.map(id => ({
                id: id,
                value: document.getElementById(id)?.value?.trim(),
                valid: !!document.getElementById(id)?.value?.trim()
            }))
        });

        return isValid;
    }

    // Event listeners pro formulářová pole
    ['first-name', 'last-name', 'email', 'phone', 'players'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', validateForm);
            field.addEventListener('change', validateForm);
            field.addEventListener('blur', validateForm);
        }
    });

    // =====================================================================
    // ODESÍLÁNÍ REZERVACE
    // =====================================================================

    function submitBooking() {
        console.log('🚀 SUBMITTING BOOKING');

        // Validace před odesláním
        if (!bookingState.selectedRoom || !bookingState.selectedDate || !bookingState.selectedTime) {
            console.error('❌ Missing booking data');
            alert('Chybí data rezervace. Zkuste to znovu.');
            return;
        }

        if (!validateForm()) {
            console.error('❌ Form validation failed');
            alert('Prosím, vyplňte všechna povinná pole.');
            return;
        }

        // Validace formátu data
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(bookingState.selectedDate)) {
            console.error('❌ Invalid date format:', bookingState.selectedDate);
            alert('Chyba ve formátu data. Obnovte stránku a zkuste znovu.');
            return;
        }

        // Kontrola, že datum není v minulosti
        const selectedDateObj = new Date(bookingState.selectedDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDateObj < today) {
            console.error('❌ Date is in the past:', bookingState.selectedDate);
            alert('Nelze rezervovat minulé datum.');
            return;
        }

        // Sběr osobních údajů
        bookingState.personalInfo = {
            firstName: document.getElementById('first-name')?.value.trim(),
            lastName: document.getElementById('last-name')?.value.trim(),
            email: document.getElementById('email')?.value.trim(),
            phone: document.getElementById('phone')?.value.trim(),
            players: document.getElementById('players')?.value,
            notes: document.getElementById('notes')?.value.trim() || ''
        };

        // Vytvoření FormData
        const formData = new FormData();
        formData.append('room', bookingState.selectedRoom);
        formData.append('date', bookingState.selectedDate); // YYYY-MM-DD formát
        formData.append('time', bookingState.selectedTime);
        formData.append('jmeno', bookingState.personalInfo.firstName);
        formData.append('prijmeni', bookingState.personalInfo.lastName);
        formData.append('email', bookingState.personalInfo.email);
        formData.append('telefon', bookingState.personalInfo.phone);
        formData.append('pocet_hracu', bookingState.personalInfo.players);
        formData.append('poznamky', bookingState.personalInfo.notes);

        // KRITICKÝ DEBUG - co odesíláme
        console.log('📤 FORM DATA BEING SENT:');
        for (let [key, value] of formData.entries()) {
            console.log(`   ${key}: "${value}"`);
        }

        // CSRF token
        const csrfToken = getCookie('csrftoken') ||
            window.bookingConfig?.csrfToken ||
            window.bookingUrls?.csrfToken;

        if (!csrfToken) {
            console.warn('⚠️ No CSRF token found');
        }

        // Submit URL
        const submitUrl = window.bookingConfig?.urls?.bookingSubmit ||
            window.bookingUrls?.bookingSubmit ||
            '/booking/';

        console.log(`🎯 Submitting to: ${submitUrl}`);

        // UI feedback
        if (loadingOverlay) loadingOverlay.classList.add('active');
        btnNext.disabled = true;
        btnNext.textContent = 'Odesílání...';

        // AJAX request
        fetch(submitUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(response => {
                console.log('📡 Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('📥 SERVER RESPONSE:', data);

                if (loadingOverlay) loadingOverlay.classList.remove('active');

                if (data.success) {
                    console.log('✅ Booking successful');

                    // Aktualizace booking code
                    const bookingCodeEl = document.getElementById('booking-code');
                    if (bookingCodeEl) {
                        bookingCodeEl.textContent = data.booking_code || 'EFT-XXXX';
                    }

                    // Přechod na úspěšnou stránku
                    goToStep(4);
                } else {
                    console.error('❌ BOOKING FAILED:', data.errors);

                    // Zobrazení chyb
                    let errorMessage = 'Chyba při rezervaci:\n';
                    if (typeof data.errors === 'object') {
                        for (const [field, messages] of Object.entries(data.errors)) {
                            if (Array.isArray(messages)) {
                                errorMessage += `${field}: ${messages.join(', ')}\n`;
                            } else {
                                errorMessage += `${field}: ${messages}\n`;
                            }
                        }
                    } else {
                        errorMessage += data.errors || 'Neznámá chyba';
                    }

                    alert(errorMessage);

                    // Obnovení tlačítka
                    btnNext.disabled = false;
                    btnNext.textContent = 'Dokončit rezervaci';
                }
            })
            .catch(error => {
                console.error('❌ NETWORK ERROR:', error);

                if (loadingOverlay) loadingOverlay.classList.remove('active');

                alert(`Chyba sítě: ${error.message}\nZkuste to prosím znovu.`);

                // Obnovení tlačítka
                btnNext.disabled = false;
                btnNext.textContent = 'Dokončit rezervaci';
            });
    }

    // =====================================================================
    // NAVIGACE MEZI KROKY
    // =====================================================================

    function goToStep(stepNumber) {
        console.log(`📍 Going to step ${stepNumber}`);

        // Skrytí všech kroků
        steps.forEach(step => step.style.display = 'none');

        // Zobrazení aktuálního kroku
        const currentStepEl = document.getElementById(`booking-step-${stepNumber}`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
        }

        // Aktualizace progress baru
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < stepNumber - 1) {
                step.classList.add('completed');
            } else if (index === stepNumber - 1) {
                step.classList.add('active');
            }
        });

        // Zobrazení/skrytí tlačítek
        if (btnBack) {
            btnBack.style.display = (stepNumber > 1 && stepNumber < 4) ? 'block' : 'none';
        }

        if (btnNext) {
            if (stepNumber === 4) {
                btnNext.style.display = 'none';
            } else {
                btnNext.style.display = 'block';
                btnNext.disabled = true;

                if (stepNumber === 3) {
                    btnNext.textContent = 'Dokončit rezervaci';
                    validateForm(); // Počáteční validace
                } else {
                    btnNext.textContent = 'Pokračovat';
                }
            }
        }

        // Zobrazení/skrytí shrnutí
        if (bookingSummary) {
            bookingSummary.style.display = (stepNumber > 1 && stepNumber < 4) ? 'block' : 'none';
        }

        // Specifická logika pro jednotlivé kroky
        if (stepNumber === 1 && bookingState.selectedRoom) {
            btnNext.disabled = false;
        } else if (stepNumber === 2) {
            checkStep2Completion();
            // Aktualizace počtu hráčů v sumáři
            updatePlayersSummary();
        }

        bookingState.currentStep = stepNumber;

        // Update debug info
        if (window.debugBooking && window.debugBooking.updateDebugInfo) {
            window.debugBooking.updateDebugInfo();
        }
    }

    function updatePlayersSummary() {
        const playersSelect = document.getElementById('players');
        const summaryPlayers = document.getElementById('summary-players');

        if (playersSelect && summaryPlayers && playersSelect.value) {
            const playerCount = playersSelect.value;
            const playerText = playerCount === '1' ? 'hráč' :
                ['2', '3', '4'].includes(playerCount) ? 'hráči' : 'hráčů';
            summaryPlayers.textContent = `${playerCount} ${playerText}`;
        }
    }

    // Event listeners pro navigaci
    btnNext?.addEventListener('click', function () {
        if (bookingState.currentStep === 3) {
            submitBooking();
        } else {
            goToStep(bookingState.currentStep + 1);
        }
    });

    btnBack?.addEventListener('click', function () {
        goToStep(bookingState.currentStep - 1);
    });

    // Update players summary when selection changes
    document.getElementById('players')?.addEventListener('change', updatePlayersSummary);

    // =====================================================================
    // INICIALIZACE
    // =====================================================================

    // Kontrola konfigurace
    if (!window.bookingConfig) {
        console.warn('⚠️ window.bookingConfig not found, using fallbacks');
        window.bookingConfig = {
            urls: {
                getAvailableSlots: '/booking/ajax/get_available_slots/',
                bookingSubmit: '/booking/'
            },
            debug: true
        };
    }

    // Backward compatibility
    if (!window.bookingUrls) {
        window.bookingUrls = window.bookingConfig.urls;
        window.bookingUrls.csrfToken = window.bookingConfig.csrfToken;
    }

    console.log('🔧 Booking configuration:', window.bookingConfig);

    // Generování kalendáře
    generateCalendar();

    // Debug info update
    if (window.bookingConfig?.debug) {
        // Expose debug functions
        window.debugBooking = {
            updateDebugInfo: function () {
                // Update debug panel if it exists
                const debugElements = {
                    room: document.getElementById('debug-room'),
                    date: document.getElementById('debug-date'),
                    time: document.getElementById('debug-time'),
                    step: document.getElementById('debug-step')
                };

                if (debugElements.room) {
                    debugElements.room.textContent = bookingState.roomName || 'Nevybráno';
                }
                if (debugElements.date) {
                    debugElements.date.textContent = bookingState.selectedDate || 'Nevybráno';
                }
                if (debugElements.time) {
                    debugElements.time.textContent = bookingState.selectedTime || 'Nevybráno';
                }
                if (debugElements.step) {
                    debugElements.step.textContent = bookingState.currentStep || '1';
                }
            },
            showState: () => console.table(bookingState),
            testDateFormatting: function (year, month, day) {
                console.log('🧪 Testing date formatting:');
                const result = formatDateForServer(year, month, day);
                console.log(`Input: ${year}-${month}-${day} (month 0-based)`);
                console.log(`Output: ${result}`);
                return result;
            }
        };

        // Pravidelná aktualizace debug info
        setInterval(() => {
            if (window.debugBooking.updateDebugInfo) {
                window.debugBooking.updateDebugInfo();
            }
        }, 2000);
    }

    console.log('🎉 Booking.js successfully loaded and initialized');
    console.log('🔍 Current booking state:', bookingState);
});