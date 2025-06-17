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

    
    function formatDateLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    
    let bookingState = {
        currentStep: 1,
        selectedRoom: null,
        selectedDate: null,
        selectedTime: null,
        personalInfo: {},
        roomPrice: 0,
        roomName: ''
    };

    
    const steps = document.querySelectorAll('.booking-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');
    const bookingSummary = document.getElementById('booking-summary');
    const loadingOverlay = document.getElementById('loading-overlay');

    
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
            document.getElementById('summary-date').textContent = '-';
            document.getElementById('summary-time').textContent = '-';
            document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
            document.querySelectorAll('.time-slot.selected').forEach(t => t.classList.remove('selected'));
            const timeSlotsContainer = document.getElementById('time-slots');
            if (timeSlotsContainer) {
                timeSlotsContainer.innerHTML = '';
            }

            
            document.getElementById('summary-room').textContent = bookingState.roomName;
            document.getElementById('summary-price').textContent = bookingState.roomPrice + ' Kč';

            
            btnNext.disabled = false;
        });
    });

    
    let currentMonth = new Date();

    function generateCalendar() {
        console.log('Generuji kalendář pro:', currentMonth);

        const calendarGrid = document.getElementById('calendar-grid');
        const calendarTitle = document.getElementById('calendar-title');

        if (!calendarGrid || !calendarTitle) {
            console.error('Kalendářové elementy nenalezeny!');
            return;
        }

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

        const monthNames = [
            'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
            'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
        ];
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
                dayElement.title = 'Nelze rezervovat minulé datum';
            } else {
                
                dayElement.dataset.date = formatDateLocal(currentDate);

                dayElement.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log('Klik na datum:', this.dataset.date);

                    document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));

                    this.classList.add('selected');
                    
                    const [year, month, day] = this.dataset.date.split('-');
                    bookingState.selectedDate = new Date(year, month - 1, day);
                    bookingState.selectedTime = null;

                    const dateStr = `${day}. ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
                    document.getElementById('summary-date').textContent = dateStr;
                    document.getElementById('summary-time').textContent = '-';

                    updateTimeSlots();
                    checkStep2Completion();
                });

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

            
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            calendarGrid.appendChild(dayElement);
        }

        console.log('Kalendář vygenerován');
    }

    
    document.getElementById('prev-month').addEventListener('click', function () {
        console.log('Předchozí měsíc');
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        generateCalendar();

        
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        document.getElementById('summary-date').textContent = '-';
        document.getElementById('summary-time').textContent = '-';
        checkStep2Completion();
    });

    document.getElementById('next-month').addEventListener('click', function () {
        console.log('Další měsíc');
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        generateCalendar();

        
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        document.getElementById('summary-date').textContent = '-';
        document.getElementById('summary-time').textContent = '-';
        checkStep2Completion();
    });

    
    function updateTimeSlots() {
        if (!bookingState.selectedRoom || !bookingState.selectedDate) {
            console.log('Chybí místnost nebo datum pro načtení časů');
            return;
        }

        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) {
            console.error('Time slots container not found!');
            return;
        }
        timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Načítání volných termínů...</p>';

        
        const dateStr = formatDateLocal(bookingState.selectedDate);

        if (!window.bookingUrls || !window.bookingUrls.getAvailableSlots) {
            console.error('Booking URLs not available!');
            timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: #e63946;">Chyba konfigurace. Obnovte stránku.</p>';
            return;
        }
        const url = `${window.bookingUrls.getAvailableSlots}?date=${dateStr}&room_id=${bookingState.selectedRoom}`;

        console.log('Načítám dostupné časy:', url);

        fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dostupné časy:', data);
                timeSlotsContainer.innerHTML = '';
                const allSlots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
                allSlots.forEach(time => {
                    const slotEl = document.createElement('div');
                    slotEl.className = 'time-slot';
                    slotEl.dataset.time = time;
                    slotEl.textContent = time;

                    if (!data.available_slots || !data.available_slots.includes(time)) {
                        slotEl.classList.add('disabled');
                        slotEl.title = 'Termín je obsazený';
                    } else {
                        slotEl.addEventListener('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (this.classList.contains('disabled')) return;
                            console.log('Vybran čas:', time);
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
                console.error('Chyba při načítání časových slotů:', error);
                timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: #e63946;">Chyba při načítání. Zkuste to znovu.</p>';
            });
    }

    
    function checkStep2Completion() {
        if (bookingState.selectedDate && bookingState.selectedTime) {
            btnNext.disabled = false;
            console.log('Krok 2 dokončen');
        } else {
            btnNext.disabled = true;
            console.log('Krok 2 nedokončen - datum:', bookingState.selectedDate, 'čas:', bookingState.selectedTime);
        }
    }

    
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

    
    btnNext.addEventListener('click', function () {
        if (bookingState.currentStep === 3) {
            console.log('Odesílám rezervaci...');

            const requiredFields = ['first-name', 'last-name', 'email', 'phone', 'players'];
            let hasErrors = false;
            const errors = {};

            requiredFields.forEach(id => {
                const field = document.getElementById(id);
                if (!field || !field.value.trim()) {
                    hasErrors = true;
                    errors[id] = 'This field is required';
                    if (field) field.classList.add('error');
                } else if (field) {
                    field.classList.remove('error');
                }
            });

            if (hasErrors) {
                showErrorMessage('Prosím vyplňte všechna povinná pole.');
                return;
            }

            bookingState.personalInfo = {
                firstName: document.getElementById('first-name').value.trim(),
                lastName: document.getElementById('last-name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                players: document.getElementById('players').value,
                notes: document.getElementById('notes').value.trim()
            };

            if (!bookingState.selectedRoom || !bookingState.selectedDate || !bookingState.selectedTime) {
                showErrorMessage('Chybí údaje o rezervaci. Vraťte se zpět a zkontrolujte výběr.');
                return;
            }

            const formData = new FormData();
            formData.append('room', bookingState.selectedRoom);
            
            formData.append('date', formatDateLocal(bookingState.selectedDate));
            formData.append('time', bookingState.selectedTime);
            formData.append('jmeno', bookingState.personalInfo.firstName);
            formData.append('prijmeni', bookingState.personalInfo.lastName);
            formData.append('email', bookingState.personalInfo.email);
            formData.append('telefon', bookingState.personalInfo.phone);
            formData.append('pocet_hracu', bookingState.personalInfo.players);
            formData.append('poznamky', bookingState.personalInfo.notes);

            const csrfToken = getCookie('csrftoken') ||
                (window.bookingUrls && window.bookingUrls.csrfToken) ||
                document.querySelector('[name=csrfmiddlewaretoken]')?.value;
            if (!csrfToken) {
                showErrorMessage('Chyba bezpečnostního tokenu. Obnovte prosím stránku.');
                return;
            }

            loadingOverlay.classList.add('active');
            btnNext.disabled = true;
            const submitUrl = window.bookingUrls?.bookingSubmit || '/booking/';

            
            console.log('Odesílám data:', {
                room: bookingState.selectedRoom,
                date: formatDateLocal(bookingState.selectedDate),
                time: bookingState.selectedTime,
                originalDate: bookingState.selectedDate
            });

            fetch(submitUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    loadingOverlay.classList.remove('active');
                    console.log('Odpověď ze serveru:', data);
                    if (data.success) {
                        document.getElementById('booking-code').textContent = data.booking_code || 'EFT-XXXX';
                        goToStep(4);
                        showSuccessMessage(data.message || 'Rezervace byla úspěšně dokončena!');
                    } else {
                        console.error('Rezervace selhala:', data.errors);
                        if (data.errors && typeof data.errors === 'object') {
                            let msgs = [];
                            Object.keys(data.errors).forEach(field => {
                                const el = document.getElementById(field) || document.getElementById(field.replace('_', '-'));
                                if (el) el.classList.add('error');
                                if (Array.isArray(data.errors[field])) msgs.push(...data.errors[field]);
                                else msgs.push(data.errors[field]);
                            });
                            showErrorMessage(msgs.join('<br>'));
                        } else {
                            showErrorMessage('Rezervace se nezdařila. Zkuste to prosím znovu.');
                        }
                        btnNext.disabled = false;
                    }
                })
                .catch(error => {
                    loadingOverlay.classList.remove('active');
                    console.error('Chyba při odesílání formuláře:', error);
                    showErrorMessage(`Došlo k technické chybě: ${error.message}. Zkuste to prosím znovu později.`);
                    btnNext.disabled = false;
                });
        } else {
            goToStep(bookingState.currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    
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
        document.querySelectorAll('.notification.error').forEach(n => n.remove());
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✗</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 8000);
    }

    
    function goToStep(stepNumber) {
        console.log('Přechod na krok:', stepNumber);

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

    
    console.log('Inicializuji kalendář...');
    generateCalendar();

    
    window.bookingState = bookingState;
});