document.addEventListener('DOMContentLoaded', () => {
    const calendarSection = document.getElementById('calendar');
    const eventFormSection = document.getElementById('event-form');
    const eventForm = document.getElementById('form');
    const eventIdInput = document.getElementById('event-id');
    const eventTitleInput = document.getElementById('event-title');
    const eventDateInput = document.getElementById('event-date');
    const eventTimeSelect = document.getElementById('event-time');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventParticipantsInput = document.getElementById('event-participants');
    const viewAnnualButton = document.getElementById('view-annual');
    const viewMonthlyButton = document.getElementById('view-monthly');
    const viewDailyButton = document.getElementById('view-daily');
    const saveEventButton = document.getElementById('save-event');
    const updateEventButton = document.getElementById('update-event');
    const deleteEventButton = document.getElementById('delete-event');
    const selectMonth = document.getElementById('select-month');
    const monthSelectorContainer = document.getElementById('month-selector-container');

    let events = JSON.parse(localStorage.getItem('events')) || {};

    // Genera opciones de tiempo en intervalos de media hora
    function generateTimeOptions() {
        for (let hour = 0; hour < 24; hour++) {
            const hourStr = String(hour).padStart(2, '0');
            eventTimeSelect.appendChild(new Option(`${hourStr}:00`, `${hourStr}:00`));
            eventTimeSelect.appendChild(new Option(`${hourStr}:30`, `${hourStr}:30`));
        }
    }

    generateTimeOptions();

    function generateCalendar(view = 'monthly', specificDate = new Date()) {
        calendarSection.innerHTML = '';

        const year = specificDate.getFullYear();
        const month = specificDate.getMonth();

        if (view === 'annual') {
            generateAnnualCalendar(year);
        } else if (view === 'monthly') {
            generateMonthlyCalendar(year, month);
        } else if (view === 'daily') {
            generateDailyCalendar(specificDate);
        }
    }

    function generateDaysOfWeekHeader() {
        const daysOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        const daysOfWeekHeader = document.createElement('div');
        daysOfWeekHeader.classList.add('calendar-grid');
        daysOfWeek.forEach(day => {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day', 'day-header');
            dayCell.textContent = day;
            daysOfWeekHeader.appendChild(dayCell);
        });
        return daysOfWeekHeader;
    }

    function generateAnnualCalendar(year) {
        const calendarContainer = document.createElement('div');
        calendarContainer.id = 'calendar-container';
        calendarContainer.classList.add('calendar-annual');
        calendarSection.appendChild(calendarContainer);

        for (let month = 0; month < 12; month++) {
            const monthContainer = document.createElement('div');
            monthContainer.classList.add('month-container');
            const monthName = getMonthName(month);
            monthContainer.innerHTML = `<h3>${monthName}</h3>`;
            calendarContainer.appendChild(monthContainer);

            monthContainer.appendChild(generateDaysOfWeekHeader());

            const calendarGrid = document.createElement('div');
            calendarGrid.classList.add('calendar-grid');
            monthContainer.appendChild(calendarGrid);

            const firstDayOfMonth = new Date(year, month, 1).getDay();
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('calendar-day', 'empty');
                calendarGrid.appendChild(emptyCell);
            }

            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('calendar-day');
                dayCell.innerHTML = `<div class="day-number">${day}</div>`;
                dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dayCell.addEventListener('click', (event) => openEventForm(event, dayCell.dataset.date));
                calendarGrid.appendChild(dayCell);

                if (events[dayCell.dataset.date]) {
                    dayCell.classList.add('has-event');
                }
            }
        }
    }

    function generateMonthlyCalendar(year, month = new Date().getMonth()) {
        const calendarContainer = document.createElement('div');
        calendarContainer.id = 'calendar-container';
        calendarContainer.classList.add('calendar-monthly');
        calendarSection.appendChild(calendarContainer);

        const monthName = getMonthName(month);
        calendarContainer.innerHTML = `<h3>${monthName} ${year}</h3>`; // Display month and year

        calendarContainer.appendChild(generateDaysOfWeekHeader());

        const calendarGrid = document.createElement('div');
        calendarGrid.classList.add('calendar-grid');
        calendarContainer.appendChild(calendarGrid);

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.innerHTML = `<div class="day-number">${day}</div><div class="events-list"></div>`;
            dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.addEventListener('click', (event) => openEventForm(event, dayCell.dataset.date));
            calendarGrid.appendChild(dayCell);

            if (events[dayCell.dataset.date]) {
                const eventsList = dayCell.querySelector('.events-list');
                events[dayCell.dataset.date].forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.textContent = `${event.time} - ${event.title}`;
                    eventItem.addEventListener('click', (e) => editEvent(e, event, dayCell.dataset.date));
                    eventsList.appendChild(eventItem);
                });
                dayCell.classList.add('has-event');
            }
        }
    }

    function generateDailyCalendar(date) {
        const calendarContainer = document.createElement('div');
        calendarContainer.id = 'calendar-container';
        calendarContainer.classList.add('calendar-daily');
        calendarSection.appendChild(calendarContainer);

        // Contenedor principal con estilo Google Calendar
        const dailyScheduleContainer = document.createElement('div');
        dailyScheduleContainer.classList.add('daily-schedule-container');
        calendarContainer.appendChild(dailyScheduleContainer);

        // Fila superior con hora actual resaltada
        const timeHeaderRow = document.createElement('div');
        timeHeaderRow.classList.add('time-header-row');
        dailyScheduleContainer.appendChild(timeHeaderRow);

        const now = new Date();
        const currentHour = now.getHours();

        for (let hour = 0; hour < 24; hour++) {
            const timeHeaderCell = document.createElement('div');
            timeHeaderCell.classList.add('time-header-cell');
            timeHeaderCell.textContent = `${String(hour).padStart(2, '0')}:00`;
            if (hour === currentHour) {
                timeHeaderCell.classList.add('current-hour');
            }
            timeHeaderRow.appendChild(timeHeaderCell);
        }

        // Filas de eventos con franjas horarias de 30 minutos
        const eventRows = document.createElement('div');
        eventRows.classList.add('event-rows');
        dailyScheduleContainer.appendChild(eventRows);

        for (let hour = 0; hour < 24; hour++) {
            const eventRow = document.createElement('div');
            eventRow.classList.add('event-row');
            eventRows.appendChild(eventRow);

            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = `${String(hour).padStart(2, '0')}:00`;
            eventRow.appendChild(timeSlot);

            const halfHourSlot = document.createElement('div');
            halfHourSlot.classList.add('time-slot');
            halfHourSlot.textContent = `${String(hour).padStart(2, '0')}:30`;
            eventRow.appendChild(halfHourSlot);

            const eventSlot = document.createElement('div');
            eventSlot.classList.add('event-slot');

            // Comprueba si hay eventos para esa hora y fecha
            const eventDate = date.toISOString().split('T')[0];
            if (events[eventDate]) {
                events[eventDate].forEach(event => {
                    if (event.time.startsWith(`${String(hour).padStart(2, '0')}:`)) {
                        const eventItem = document.createElement('div');
                        eventItem.classList.add('event-item');
                        eventItem.textContent = event.title;
                        // Puedes agregar estilos para diferenciar eventos todo el día o por franjas
                        if (event.time.includes(":00")) {
                            eventItem.classList.add('all-day-event');
                        } else {
                            eventItem.style.top = `${(parseInt(event.time.split(':')[1]) / 2) * 30}px`;
                            eventItem.style.height = '30px';
                        }
                        eventSlot.appendChild(eventItem);
                    }
                });
            }
            eventRow.appendChild(eventSlot);
        }
    }

    function openEventForm(event, date) {
        event.stopPropagation();
        eventFormSection.style.display = 'block';
        eventFormSection.style.top = `${event.clientY}px`;
        eventFormSection.style.left = `${event.clientX}px`;
        eventDateInput.value = date;
        eventIdInput.value = '';
        eventTitleInput.value = '';
        eventTimeSelect.value = '';
        eventDescriptionInput.value = '';
        eventParticipantsInput.value = '';
        saveEventButton.style.display = 'block'; // Show save button when creating a new event
        updateEventButton.style.display = 'none'; // Hide update button when creating a new event
        deleteEventButton.style.display = 'none'; // Hide delete button when creating a new event
    }

    function editEvent(e, event, date) {
        e.stopPropagation(); // Prevents triggering openEventForm when clicking an event item
        eventFormSection.style.display = 'block';
        eventFormSection.style.top = `${e.clientY}px`;
        eventFormSection.style.left = `${e.clientX}px`;
        eventIdInput.value = event.id;
        eventTitleInput.value = event.title;
        eventDateInput.value = date;
        eventTimeSelect.value = event.time;
        eventDescriptionInput.value = event.description;
        eventParticipantsInput.value = event.participants;
        saveEventButton.style.display = 'none'; // Hide save button when editing an event
        updateEventButton.style.display = 'block'; // Show update button when editing an event
        deleteEventButton.style.display = 'block'; // Show delete button when editing an event
    }

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = eventIdInput.value || Date.now().toString();
        const title = eventTitleInput.value;
        const date = eventDateInput.value;
        const time = eventTimeSelect.value;
        const description = eventDescriptionInput.value;
        const participants = eventParticipantsInput.value;

        if (!events[date]) {
            events[date] = [];
        }

        const existingEventIndex = events[date].findIndex(event => event.id === id);
        if (existingEventIndex !== -1) {
            events[date][existingEventIndex] = { id, title, time, description, participants };
        } else {
            events[date].push({ id, title, time, description, participants });
        }

        localStorage.setItem('events', JSON.stringify(events));
        eventForm.reset();
        eventFormSection.style.display = 'none';
        generateCalendar('monthly', new Date(date));
    });

    updateEventButton.addEventListener('click', (e) => {
        e.preventDefault();
        const id = eventIdInput.value;
        const title = eventTitleInput.value;
        const date = eventDateInput.value;
        const time = eventTimeSelect.value;
        const description = eventDescriptionInput.value;
        const participants = eventParticipantsInput.value;

        if (events[date]) {
            const existingEventIndex = events[date].findIndex(event => event.id === id);
            if (existingEventIndex !== -1) {
                events[date][existingEventIndex] = { id, title, time, description, participants };
                localStorage.setItem('events', JSON.stringify(events));
                eventForm.reset();
                eventFormSection.style.display = 'none';
                generateCalendar('monthly', new Date(date));
            }
        }
    });

    deleteEventButton.addEventListener('click', () => {
        const id = eventIdInput.value;
        const date = eventDateInput.value;

        if (events[date]) {
            events[date] = events[date].filter(event => event.id !== id);
            if (events[date].length === 0) {
                delete events[date];
            }
        }

        localStorage.setItem('events', JSON.stringify(events));
        eventForm.reset();
        eventFormSection.style.display = 'none';
        generateCalendar('monthly', new Date(date));
    });

    function getMonthName(monthIndex) {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return monthNames[monthIndex];
    }

    function populateMonthSelector() {
        const currentMonth = new Date().getMonth();
        selectMonth.innerHTML = '';

        for (let month = 0; month < 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = getMonthName(month);
            if (month === currentMonth) {
                option.selected = true;
            }
            selectMonth.appendChild(option);
        }
    }

    selectMonth.addEventListener('change', () => {
        const selectedMonth = parseInt(selectMonth.value, 10);
        generateCalendar('monthly', new Date(new Date().getFullYear(), selectedMonth));
    });

    populateMonthSelector();

    viewAnnualButton.addEventListener('click', () => {
        monthSelectorContainer.style.display = 'none';
        generateCalendar('annual')
    });
    viewMonthlyButton.addEventListener('click', () => {
        monthSelectorContainer.style.display = 'block';
        generateCalendar('monthly');
    });
    viewDailyButton.addEventListener('click', () => {
        monthSelectorContainer.style.display = 'none';
        generateCalendar('daily')
    });

    generateCalendar('monthly');
});
