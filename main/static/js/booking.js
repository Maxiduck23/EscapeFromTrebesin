    document.addEventListener('DOMContentLoaded', function() {
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
            option.addEventListener('click', function() {
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
        
        // Funkce kalendáře (vaše existující logika je v pořádku, jen ji propojíme s AJAXem)
        let currentMonth = new Date();
        
        function generateCalendar() {
            // Váš stávající kód pro generování kalendáře
            // ...
            const calendarGrid = document.getElementById('calendar-grid');
            const calendarTitle = document.getElementById('calendar-title');
            
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
            
            let startDay = firstDay.getDay() || 7;
            startDay = startDay === 1 ? 1 : startDay -1; // Převod na Po-Ne
            for (let i = 1; i < startDay; i++) {
                const emptyDay = document.createElement('div');
                calendarGrid.appendChild(emptyDay);
            }
            
            const today = new Date();
            today.setHours(0,0,0,0);
    
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;
                
                const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                
                if (currentDate < today) {
                    dayElement.classList.add('disabled');
                } else {
                    dayElement.addEventListener('click', function() {
                        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                        this.classList.add('selected');
                        bookingState.selectedDate = currentDate;
                        
                        const dateStr = `${day}. ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
                        document.getElementById('summary-date').textContent = dateStr;
                        
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
        
        document.getElementById('prev-month').addEventListener('click', function() {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            generateCalendar();
        });
        
        document.getElementById('next-month').addEventListener('click', function() {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            generateCalendar();
        });
    
        // Funkce pro načtení dostupných časů z backendu
        function updateTimeSlots() {
            if (!bookingState.selectedRoom || !bookingState.selectedDate) return;
        
            const timeSlotsContainer = document.getElementById('time-slots');
            timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Načítání volných termínů...</p>';
        
            const dateStr = bookingState.selectedDate.toISOString().split('T')[0];
            const url = `${window.bookingUrls.getAvailableSlots}?date=${dateStr}&room_id=${bookingState.selectedRoom}`;
        
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    timeSlotsContainer.innerHTML = '';
                    const allSlots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
                    
                    allSlots.forEach(time => {
                        const slotEl = document.createElement('div');
                        slotEl.className = 'time-slot';
                        slotEl.dataset.time = time;
                        slotEl.textContent = time;
        
                        if (!data.available_slots.includes(time)) {
                            slotEl.classList.add('disabled');
                        } else {
                            slotEl.onclick = function() {
                                if (this.classList.contains('disabled')) return;
                                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                                this.classList.add('selected');
                                bookingState.selectedTime = this.dataset.time;
                                document.getElementById('summary-time').textContent = bookingState.selectedTime;
                                checkStep2Completion();
                            };
                        }
                        timeSlotsContainer.appendChild(slotEl);
                    });
                })
                .catch(error => {
                    console.error('Chyba při načítání časových slotů:', error);
                    timeSlotsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; color: #e63946;">Chyba při načítání. Zkuste to znovu.</p>';
                });
        }
        
        // Zpracování odeslání formuláře
        btnNext.addEventListener('click', function() {
            if (bookingState.currentStep === 3) {
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
                    if (data.success) {
                        document.getElementById('booking-code').textContent = data.booking_code;
                        goToStep(4);
                    } else {
                        console.error('Rezervace selhala:', data.errors);
                        alert('Rezervace se nezdařila. Zkontrolujte prosím zadané údaje a zkuste to znovu. Je možné, že termín byl mezitím obsazen.');
                    }
                })
                .catch(error => {
                    loadingOverlay.classList.remove('active');
                    console.error('Chyba při odesílání formuláře:', error);
                    alert('Došlo k technické chybě. Zkuste to prosím znovu později.');
                });
            } else {
                goToStep(bookingState.currentStep + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    
        // Váš zbývající JavaScript kód pro navigaci mezi kroky (goToStep, btnBack, atd.)
        // ... Zde vložte zbývající část vašeho JS, je v pořádku.
        
        function checkStep2Completion() {
            if (bookingState.selectedDate && bookingState.selectedTime) {
                btnNext.disabled = false;
            } else {
                btnNext.disabled = true;
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
    
        function goToStep(stepNumber) {
            steps.forEach(step => step.style.display = 'none');
            document.getElementById(`booking-step-${stepNumber}`).style.display = 'block';
            
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
                validateForm(); // Zkontrolujeme formulář při přechodu na krok 3
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
    
        btnBack.addEventListener('click', function() {
            goToStep(bookingState.currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    
        // Inicializace kalendáře
        generateCalendar();
    });
