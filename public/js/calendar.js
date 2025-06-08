/* =====================================================
   TASK-IT! - CALENDÁRIO JAVASCRIPT
   Funcionalidades do calendário
   ===================================================== */

class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentView = 'month';
        this.tasks = [];
        this.filters = {
            alta: true,
            media: true,
            baixa: true,
            concluida: true
        };
        this.monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        this.dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    }

    // ===== INICIALIZAÇÃO =====
    async init() {
        try {
            // Check authentication
            if (!API.isAuthenticated()) {
                window.location.href = '/auth';
                return;
            }

            // Load tasks
            await this.loadTasks();

            // Render calendar
            this.render();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize mini calendar
            this.initMiniCalendar();

            // Load selected day tasks
            this.loadSelectedDayTasks();

            // Load upcoming events
            this.loadUpcomingEvents();

            Loading.hide();
            Toast.success('Calendário carregado com sucesso!');
        } catch (error) {
            console.error('Error initializing calendar:', error);
            Toast.error('Erro ao carregar calendário');
        }
    }

    // ===== CARREGAMENTO DE DADOS =====
    async loadTasks() {
        try {
            const response = await API.getTasks();
            if (response.success) {
                this.tasks = response.data.filter(task => task.due_date);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    // ===== RENDERIZAÇÃO =====
    render() {
        this.updateHeader();
        
        switch (this.currentView) {
            case 'month':
                this.renderMonthView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'day':
                this.renderDayView();
                break;
        }
    }

    updateHeader() {
        const monthElement = DOM.$('calendarMonth');
        if (monthElement) {
            monthElement.textContent = `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }

    renderMonthView() {
        const container = DOM.$('calendarDays');
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '';
        const today = new Date();
        
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                
                const isCurrentMonth = currentDate.getMonth() === month;
                const isToday = this.isSameDay(currentDate, today);
                const isSelected = this.isSameDay(currentDate, this.selectedDate);
                
                const dayTasks = this.getTasksForDate(currentDate);
                const visibleTasks = dayTasks.filter(task => this.filters[task.priority] && this.filters[task.status]);
                
                let classes = 'calendar-day';
                if (!isCurrentMonth) classes += ' other-month';
                if (isToday) classes += ' today';
                if (isSelected) classes += ' selected';

                html += `
                    <div class="${classes}" onclick="calendar.selectDate('${currentDate.toISOString()}')">
                        <div class="day-number">${currentDate.getDate()}</div>
                        <div class="day-tasks">
                            ${visibleTasks.slice(0, 3).map(task => `
                                <div class="calendar-task priority-${task.priority} status-${task.status}" 
                                     onclick="event.stopPropagation(); calendar.openTaskDetail(${task.id})"
                                     title="${Utils.sanitizeHTML(task.title)}">
                                    ${Utils.truncateText(task.title, 15)}
                                </div>
                            `).join('')}
                            ${visibleTasks.length > 3 ? `<div class="task-count">+${visibleTasks.length - 3} mais</div>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = html;
    }

    renderWeekView() {
        const weekDaysContainer = DOM.$('weekDays');
        const timeSlotsContainer = DOM.$('timeSlots');
        const weekGridContainer = DOM.$('weekGrid');
        
        if (!weekDaysContainer || !timeSlotsContainer || !weekGridContainer) return;

        // Get week start (Sunday)
        const weekStart = new Date(this.currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        // Render week days header
        let weekDaysHTML = '';
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            
            const isToday = this.isSameDay(day, new Date());
            
            weekDaysHTML += `
                <div class="week-day ${isToday ? 'today' : ''}">
                    <div>${this.dayNames[i]}</div>
                    <div>${day.getDate()}</div>
                </div>
            `;
        }
        weekDaysContainer.innerHTML = weekDaysHTML;

        // Render time slots
        let timeSlotsHTML = '';
        for (let hour = 0; hour < 24; hour++) {
            timeSlotsHTML += `
                <div class="time-slot">
                    ${hour.toString().padStart(2, '0')}:00
                </div>
            `;
        }
        timeSlotsContainer.innerHTML = timeSlotsHTML;

        // Render week grid
        let weekGridHTML = '';
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            
            const dayTasks = this.getTasksForDate(day);
            
            weekGridHTML += `
                <div class="week-column">
                    ${Array.from({length: 24}, (_, hour) => {
                        const hourTasks = dayTasks.filter(task => {
                            if (!task.due_date) return false;
                            const taskDate = new Date(task.due_date);
                            return taskDate.getHours() === hour;
                        });
                        
                        return `
                            <div class="week-hour">
                                ${hourTasks.map(task => `
                                    <div class="week-task priority-${task.priority}" 
                                         onclick="calendar.openTaskDetail(${task.id})"
                                         title="${Utils.sanitizeHTML(task.title)}">
                                        ${Utils.truncateText(task.title, 20)}
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        weekGridContainer.innerHTML = weekGridHTML;
    }

    renderDayView() {
        const dayTitleElement = DOM.$('dayTitle');
        const dayTimelineElement = DOM.$('dayTimeline');
        const dayTotalTasksElement = DOM.$('dayTotalTasks');
        const dayCompletedTasksElement = DOM.$('dayCompletedTasks');
        
        if (!dayTitleElement || !dayTimelineElement) return;

        // Update day title
        const dayName = this.currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
        const dayDate = this.currentDate.toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        dayTitleElement.textContent = `${dayName} - ${dayDate}`;

        // Get tasks for the day
        const dayTasks = this.getTasksForDate(this.currentDate);
        const completedTasks = dayTasks.filter(task => task.status === 'concluida');

        // Update stats
        if (dayTotalTasksElement) {
            dayTotalTasksElement.textContent = `${dayTasks.length} tarefa${dayTasks.length !== 1 ? 's' : ''}`;
        }
        if (dayCompletedTasksElement) {
            dayCompletedTasksElement.textContent = `${completedTasks.length} concluída${completedTasks.length !== 1 ? 's' : ''}`;
        }

        // Render timeline
        const sortedTasks = dayTasks.sort((a, b) => {
            const timeA = a.due_date ? new Date(a.due_date).getTime() : 0;
            const timeB = b.due_date ? new Date(b.due_date).getTime() : 0;
            return timeA - timeB;
        });

        const timelineHTML = sortedTasks.map(task => {
            const time = task.due_date ? Utils.formatTime(task.due_date) : 'Sem horário';
            const categoryColor = task.category_color || '#8B3DFF';
            
            return `
                <div class="timeline-task priority-${task.priority}" 
                     onclick="calendar.openTaskDetail(${task.id})"
                     style="border-left-color: ${categoryColor};">
                    <div class="timeline-time">${time}</div>
                    <div class="timeline-content">
                        <h4 class="timeline-title">${Utils.sanitizeHTML(task.title)}</h4>
                        <div class="timeline-meta">
                            <span class="tag tag-priority-${task.priority}">
                                ${Utils.formatPriority(task.priority)}
                            </span>
                            <span class="tag tag-status-${task.status}">
                                ${Utils.formatStatus(task.status)}
                            </span>
                            ${task.category_name ? `<span>${task.category_name}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        dayTimelineElement.innerHTML = timelineHTML || `
            <div class="empty-state">
                <i class="fas fa-calendar-day"></i>
                <h3>Nenhuma tarefa para este dia</h3>
                <p>Que tal criar uma nova tarefa?</p>
                <button class="btn btn-primary" onclick="calendar.openQuickCreate()">
                    <i class="fas fa-plus"></i>
                    Nova Tarefa
                </button>
            </div>
        `;
    }

    // ===== MINI CALENDÁRIO =====
    initMiniCalendar() {
        this.renderMiniCalendar();
    }

    renderMiniCalendar() {
        const container = DOM.$('miniCalendarGrid');
        const monthElement = DOM.$('miniCalendarMonth');
        
        if (!container || !monthElement) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthElement.textContent = `${this.monthNames[month].substring(0, 3)} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '';
        const today = new Date();

        // Week days header
        this.dayNames.forEach(day => {
            html += `<div class="mini-day" style="font-weight: 600; color: var(--text-light);">${day.substring(0, 1)}</div>`;
        });

        // Calendar days
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                
                const isCurrentMonth = currentDate.getMonth() === month;
                const isToday = this.isSameDay(currentDate, today);
                const hasTasks = this.getTasksForDate(currentDate).length > 0;
                
                let classes = 'mini-day';
                if (isToday) classes += ' today';
                if (hasTasks) classes += ' has-tasks';
                if (!isCurrentMonth) classes += ' other-month';

                html += `
                    <div class="${classes}" onclick="calendar.selectDate('${currentDate.toISOString()}')">
                        ${currentDate.getDate()}
                    </div>
                `;
            }
        }

        container.innerHTML = html;
    }

    // ===== NAVEGAÇÃO =====
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.renderMiniCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.renderMiniCalendar();
    }

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
        this.renderMiniCalendar();
        this.loadSelectedDayTasks();
    }

    setView(view) {
        this.currentView = view;
        
        // Update view buttons
        DOM.findAll('.view-selector .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        DOM.find(`[data-view="${view}"]`).classList.add('active');

        // Show/hide views
        DOM.findAll('.calendar-view').forEach(viewEl => {
            viewEl.classList.remove('active');
        });
        DOM.$(`${view}View`).classList.add('active');

        this.render();
    }

    selectDate(dateString) {
        this.selectedDate = new Date(dateString);
        this.currentDate = new Date(dateString);
        this.render();
        this.loadSelectedDayTasks();
    }

    // ===== UTILITÁRIOS =====
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    getTasksForDate(date) {
        return this.tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return this.isSameDay(taskDate, date);
        });
    }

    loadSelectedDayTasks() {
        const container = DOM.$('selectedDayTasks');
        const titleElement = DOM.$('selectedDayTitle');
        
        if (!container || !titleElement) return;

        const dayTasks = this.getTasksForDate(this.selectedDate);
        const isToday = this.isSameDay(this.selectedDate, new Date());
        
        titleElement.textContent = isToday ? 'Tarefas de Hoje' : 
            `Tarefas de ${this.selectedDate.toLocaleDateString('pt-BR')}`;

        if (dayTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <i class="fas fa-calendar-day"></i>
                    <p>Nenhuma tarefa para este dia</p>
                </div>
            `;
            return;
        }

        const tasksHTML = dayTasks.map(task => `
            <div class="day-task-item" onclick="calendar.openTaskDetail(${task.id})">
                <div class="task-priority-indicator ${task.priority}"></div>
                <div class="task-info">
                    <div class="task-title">${Utils.sanitizeHTML(task.title)}</div>
                    <div class="task-time">${task.due_date ? Utils.formatTime(task.due_date) : 'Sem horário'}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = tasksHTML;
    }

    async loadUpcomingEvents() {
        try {
            const response = await API.getUpcomingTasks(7);
            if (response.success) {
                this.renderUpcomingEvents(response.data);
            }
        } catch (error) {
            console.error('Error loading upcoming events:', error);
        }
    }

    renderUpcomingEvents(events) {
        const container = DOM.$('upcomingEventsList');
        if (!container) return;

        if (events.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <i class="fas fa-clock"></i>
                    <p>Nenhum evento próximo</p>
                </div>
            `;
            return;
        }

        const eventsHTML = events.map(event => `
            <div class="upcoming-event-item" onclick="calendar.openTaskDetail(${event.id})">
                <div class="task-priority-indicator ${event.priority}"></div>
                <div class="task-info">
                    <div class="task-title">${Utils.sanitizeHTML(event.title)}</div>
                    <div class="task-time">${Utils.formatDate(event.due_date, 'relative')}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = eventsHTML;
    }

    // ===== FILTROS =====
    toggleFilter(filter) {
        this.filters[filter] = !this.filters[filter];
        this.render();
    }

    // ===== MODAIS =====
    openTaskDetail(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const modal = DOM.$('taskDetailModal');
        const content = DOM.$('taskDetailContent');
        
        if (!modal || !content) return;

        content.innerHTML = `
            <div class="task-detail-content">
                <h3>${Utils.sanitizeHTML(task.title)}</h3>
                <p>${Utils.sanitizeHTML(task.description || 'Sem descrição')}</p>
                <div class="task-meta">
                    <div class="meta-item">
                        <strong>Prioridade:</strong>
                        <span class="tag tag-priority-${task.priority}">
                            ${Utils.formatPriority(task.priority)}
                        </span>
                    </div>
                    <div class="meta-item">
                        <strong>Status:</strong>
                        <span class="tag tag-status-${task.status}">
                            ${Utils.formatStatus(task.status)}
                        </span>
                    </div>
                    <div class="meta-item">
                        <strong>Vencimento:</strong>
                        ${task.due_date ? Utils.formatDate(task.due_date) : 'Não definido'}
                    </div>
                    ${task.category_name ? `
                        <div class="meta-item">
                            <strong>Categoria:</strong>
                            ${task.category_name}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        modal.classList.add('active');
        window.currentTaskId = taskId;
    }

    openQuickCreate(date = null) {
        const modal = DOM.$('quickCreateModal');
        const dateInput = DOM.$('quickCreateDate');
        
        if (!modal) return;

        if (date) {
            dateInput.value = date.toISOString().split('T')[0];
        } else if (this.selectedDate) {
            dateInput.value = this.selectedDate.toISOString().split('T')[0];
        }

        modal.classList.add('active');
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Double click to create task
        document.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('calendar-day')) {
                const dateString = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.openQuickCreate(new Date(dateString));
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousMonth();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextMonth();
                    break;
                case 't':
                    e.preventDefault();
                    this.goToToday();
                    break;
                case 'n':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openQuickCreate();
                    }
                    break;
            }
        });
    }
}

// ===== MINI CALENDÁRIO =====
const miniCalendar = {
    previousMonth() {
        calendar.currentDate.setMonth(calendar.currentDate.getMonth() - 1);
        calendar.renderMiniCalendar();
    },
    
    nextMonth() {
        calendar.currentDate.setMonth(calendar.currentDate.getMonth() + 1);
        calendar.renderMiniCalendar();
    }
};

// ===== FUNÇÕES GLOBAIS =====
let calendar;

// Initialize calendar
document.addEventListener('DOMContentLoaded', async function() {
    calendar = new Calendar();
    await calendar.init();
});

function closeTaskDetailModal() {
    const modal = DOM.$('taskDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function editCurrentTask() {
    if (window.currentTaskId) {
        window.location.href = `/tasks/${window.currentTaskId}/edit`;
    }
}

function closeQuickCreateModal() {
    const modal = DOM.$('quickCreateModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function createQuickTask() {
    const form = DOM.$('quickCreateForm');
    if (!form) return;

    const formData = new FormData(form);
    const taskData = {
        title: formData.get('title'),
        due_date: formData.get('due_date'),
        priority: formData.get('priority'),
        status: 'pendente'
    };

    try {
        Loading.show('Criando tarefa...');
        const response = await API.createTask(taskData);
        
        if (response.success) {
            Toast.success('Tarefa criada com sucesso!');
            closeQuickCreateModal();
            form.reset();
            
            // Reload tasks and refresh calendar
            await calendar.loadTasks();
            calendar.render();
            calendar.loadSelectedDayTasks();
        }
    } catch (error) {
        console.error('Error creating task:', error);
        Toast.error(error.message || 'Erro ao criar tarefa');
    } finally {
        Loading.hide();
    }
}

// Make Calendar globally available
window.Calendar = Calendar;
window.calendar = calendar;
