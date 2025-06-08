/* =====================================================
   TASK-IT! - DASHBOARD JAVASCRIPT
   Funcionalidades do dashboard principal
   ===================================================== */

class Dashboard {
    constructor() {
        this.currentFilter = 'all';
        this.currentView = 'list';
        this.tasks = [];
        this.categories = [];
        this.tags = [];
        this.stats = {};
    }

    // ===== INICIALIZAÇÃO =====
    async init() {
        try {
            // Check authentication
            if (!API.isAuthenticated()) {
                window.location.href = '/auth';
                return;
            }

            // Load user info
            this.loadUserInfo();

            // Load all data
            await Promise.all([
                this.loadStats(),
                this.loadTasks(),
                this.loadCategories(),
                this.loadTags(),
                this.loadUpcomingTasks(),
                this.loadActivityFeed()
            ]);

            // Setup event listeners
            this.setupEventListeners();

            // Animate stat cards
            this.animateStatCards();

            // Hide loading
            Loading.hide();

            Toast.success('Dashboard carregado com sucesso!');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            Toast.error('Erro ao carregar dashboard');
        }
    }

    // ===== CARREGAMENTO DE DADOS =====
    loadUserInfo() {
        const user = API.getCurrentUser();
        if (user) {
            const userName = DOM.$('userName');
            const userEmail = DOM.$('userEmail');
            
            if (userName) userName.textContent = user.nome;
            if (userEmail) userEmail.textContent = user.email;
        }
    }

    async loadStats() {
        try {
            const response = await API.getTaskStats();
            if (response.success) {
                this.stats = response.data;
                this.updateStatsDisplay();
                this.updateSidebarBadges();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadTasks() {
        try {
            const response = await API.getTasks();
            if (response.success) {
                this.tasks = response.data;
                this.renderTasks();
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showTasksError();
        }
    }

    async loadCategories() {
        try {
            const response = await API.getCategories();
            if (response.success) {
                this.categories = response.data;
                this.renderCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadTags() {
        try {
            const response = await API.getTags();
            if (response.success) {
                this.tags = response.data;
                this.renderTags();
            }
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }

    async loadUpcomingTasks() {
        try {
            const response = await API.getUpcomingTasks(7);
            if (response.success) {
                this.renderUpcomingTasks(response.data);
            }
        } catch (error) {
            console.error('Error loading upcoming tasks:', error);
        }
    }

    async loadActivityFeed() {
        try {
            // Simulated activity feed - replace with real API call
            const activities = [
                {
                    type: 'task_completed',
                    message: 'Tarefa "Teste FASE 1" foi concluída',
                    time: '2 horas atrás',
                    icon: 'fas fa-check-circle',
                    color: 'success'
                },
                {
                    type: 'task_created',
                    message: 'Nova tarefa "Implementar Models" foi criada',
                    time: '4 horas atrás',
                    icon: 'fas fa-plus-circle',
                    color: 'info'
                },
                {
                    type: 'category_created',
                    message: 'Categoria "Teste FASE 2" foi criada',
                    time: '1 dia atrás',
                    icon: 'fas fa-folder-plus',
                    color: 'primary'
                }
            ];
            this.renderActivityFeed(activities);
        } catch (error) {
            console.error('Error loading activity feed:', error);
        }
    }

    // ===== RENDERIZAÇÃO =====
    updateStatsDisplay() {
        const elements = {
            totalTasks: DOM.$('totalTasks'),
            pendingTasks: DOM.$('pendingTasks'),
            completedTasks: DOM.$('completedTasks'),
            overdueTasks: DOM.$('overdueTasks')
        };

        if (elements.totalTasks) elements.totalTasks.textContent = this.stats.total || 0;
        if (elements.pendingTasks) elements.pendingTasks.textContent = this.stats.pendentes || 0;
        if (elements.completedTasks) elements.completedTasks.textContent = this.stats.concluidas || 0;
        if (elements.overdueTasks) elements.overdueTasks.textContent = this.stats.atrasadas || 0;
    }

    updateSidebarBadges() {
        const badges = {
            totalTasksBadge: this.stats.total || 0,
            allTasksBadge: this.stats.total || 0,
            pendingTasksBadge: this.stats.pendentes || 0,
            progressTasksBadge: this.stats.em_andamento || 0,
            completedTasksBadge: this.stats.concluidas || 0
        };

        Object.keys(badges).forEach(id => {
            const element = DOM.$(id);
            if (element) element.textContent = badges[id];
        });
    }



    renderTasks() {
        const container = DOM.$('tasksContainer');
        if (!container) return;

        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>Nenhuma tarefa encontrada</h3>
                    <p>Comece criando sua primeira tarefa!</p>
                    <button class="btn btn-primary" onclick="window.location.href='/tasks/new'">
                        <i class="fas fa-plus"></i>
                        Nova Tarefa
                    </button>
                </div>
            `;
            return;
        }

        const tasksHTML = this.tasks.map(task => this.createTaskCard(task)).join('');
        container.innerHTML = `<div class="tasks-list">${tasksHTML}</div>`;
    }

    createTaskCard(task) {
        const priorityClass = `priority-${task.priority}`;
        const statusClass = `status-${task.status}`;
        const dueDate = task.due_date ? Utils.formatDate(task.due_date, 'relative') : '';
        const categoryColor = task.category_color || '#8B3DFF';
        const categoryName = task.category_name || 'Sem categoria';

        return `
            <div class="task-card ${priorityClass} ${statusClass}" onclick="openTaskDetail(${task.id})">
                <div class="task-header">
                    <div class="task-priority">
                        <span class="tag tag-priority-${task.priority}">
                            ${Utils.formatPriority(task.priority)}
                        </span>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); toggleTaskStatus(${task.id})" title="Marcar como concluída">
                            <i class="fas ${task.status === 'concluida' ? 'fa-check-circle' : 'fa-circle'}"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); openTaskMenu(${task.id})" title="Mais opções">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${Utils.sanitizeHTML(task.title)}</h3>
                    <p class="task-description">${Utils.truncateText(task.description || '', 100)}</p>
                </div>
                <div class="task-footer">
                    <div class="task-meta">
                        <div class="task-category">
                            <div class="category-color" style="background: ${categoryColor};"></div>
                            <span>${categoryName}</span>
                        </div>
                        ${dueDate ? `<div class="task-due-date">
                            <i class="fas fa-clock"></i>
                            <span>${dueDate}</span>
                        </div>` : ''}
                    </div>
                    <div class="task-status">
                        <span class="tag tag-status-${task.status}">
                            ${Utils.formatStatus(task.status)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategories() {
        const container = DOM.$('categoriesList');
        if (!container || this.categories.length === 0) return;

        const categoriesHTML = this.categories.map(category => `
            <li class="nav-item">
                <a href="#" class="nav-link" onclick="filterByCategory(${category.id})">
                    <div class="category-color" style="background: ${category.cor};"></div>
                    <span>${Utils.sanitizeHTML(category.nome)}</span>
                    <span class="nav-badge">${category.task_count || 0}</span>
                </a>
            </li>
        `).join('');

        container.innerHTML = categoriesHTML;
    }

    renderTags() {
        const container = DOM.$('tagsList');
        if (!container || this.tags.length === 0) return;

        const tagsHTML = this.tags.map(tag => `
            <span class="tag tag-filter" onclick="filterByTag(${tag.id})" style="background: ${tag.cor}; color: white;">
                ${Utils.sanitizeHTML(tag.nome)}
            </span>
        `).join('');

        container.innerHTML = tagsHTML;
    }

    renderUpcomingTasks(tasks) {
        const container = DOM.$('upcomingTasks');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <i class="fas fa-calendar-check"></i>
                    <p>Nenhuma tarefa próxima do vencimento</p>
                </div>
            `;
            return;
        }

        const tasksHTML = tasks.map(task => `
            <div class="upcoming-task" onclick="openTaskDetail(${task.id})">
                <div class="upcoming-task-content">
                    <h4>${Utils.sanitizeHTML(task.title)}</h4>
                    <p>${Utils.formatDate(task.due_date)}</p>
                </div>
                <div class="upcoming-task-priority">
                    <span class="tag tag-priority-${task.priority}">
                        ${Utils.formatPriority(task.priority)}
                    </span>
                </div>
            </div>
        `).join('');

        container.innerHTML = tasksHTML;
    }

    renderActivityFeed(activities) {
        const container = DOM.$('activityFeed');
        if (!container) return;

        const activitiesHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
    }

    showTasksError() {
        const container = DOM.$('tasksContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar tarefas</h3>
                    <p>Tente recarregar a página</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Recarregar
                    </button>
                </div>
            `;
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Search functionality
        const searchInput = DOM.$('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchTasks(e.target.value);
            }, 300));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        window.location.href = '/tasks/new';
                        break;
                    case 'k':
                        e.preventDefault();
                        searchInput?.focus();
                        break;
                }
            }
        });
    }

    // ===== FUNCIONALIDADES =====
    searchTasks(query) {
        if (!query.trim()) {
            this.renderTasks();
            return;
        }

        const filteredTasks = this.tasks.filter(task => 
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
        );

        const container = DOM.$('tasksContainer');
        if (container) {
            if (filteredTasks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Nenhuma tarefa encontrada</h3>
                        <p>Tente usar outros termos de busca</p>
                    </div>
                `;
            } else {
                const tasksHTML = filteredTasks.map(task => this.createTaskCard(task)).join('');
                container.innerHTML = `<div class="tasks-list">${tasksHTML}</div>`;
            }
        }
    }

    async refreshData() {
        Loading.show('Atualizando dados...');
        await this.init();
    }

    // ===== ANIMAÇÕES =====
    animateStatCards() {
        // Animate numbers counting up
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach((element, index) => {
            const finalValue = parseInt(element.textContent) || 0;
            element.textContent = '0';

            // Stagger animation start
            setTimeout(() => {
                this.animateNumber(element, 0, finalValue, 1000);
            }, index * 200);
        });

        // Animate cards entrance
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(start + (end - start) * easeOutQuart);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }
}

// ===== FUNÇÕES GLOBAIS =====
let dashboard;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    dashboard = new Dashboard();
    await dashboard.init();
});

// Global functions for onclick handlers
function toggleSidebar() {
    const sidebar = DOM.$('sidebar');
    const overlay = DOM.$('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

function closeSidebar() {
    const sidebar = DOM.$('sidebar');
    const overlay = DOM.$('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}

function toggleProfileMenu() {
    const menu = DOM.$('profileMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function logout() {
    Modal.confirm('Tem certeza que deseja sair?', 'Confirmar Logout')
        .then(confirmed => {
            if (confirmed) {
                API.logout();
            }
        });
}

function filterTasks(filter) {
    if (dashboard) {
        dashboard.currentFilter = filter;
        // Implement filtering logic
        console.log('Filtering tasks by:', filter);
    }
}

function filterByCategory(categoryId) {
    console.log('Filtering by category:', categoryId);
}

function filterByTag(tagId) {
    console.log('Filtering by tag:', tagId);
}

function setTaskView(view) {
    if (dashboard) {
        dashboard.currentView = view;
        // Update view toggle buttons
        DOM.findAll('.view-toggle .btn-icon').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Re-render tasks with new view
        dashboard.renderTasks();
    }
}

function openTaskDetail(taskId) {
    window.location.href = `/tasks/${taskId}`;
}

function toggleTaskStatus(taskId) {
    // Implement task status toggle
    console.log('Toggling task status:', taskId);
}

function openTaskMenu(taskId) {
    // Implement task context menu
    console.log('Opening task menu:', taskId);
}

function openCategoryModal() {
    // Implement category creation modal
    console.log('Opening category modal');
}

function openTagModal() {
    // Implement tag creation modal
    console.log('Opening tag modal');
}

function toggleNotifications() {
    const panel = DOM.$('notificationsPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

function exportTasks() {
    if (dashboard && dashboard.tasks) {
        Utils.downloadJSON(dashboard.tasks, 'tasks-export.json');
        Toast.success('Tarefas exportadas com sucesso!');
    }
}

// Make Dashboard globally available
window.Dashboard = Dashboard;
