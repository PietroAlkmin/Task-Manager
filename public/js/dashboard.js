/* =====================================================
   TASK-IT! - DASHBOARD JAVASCRIPT
   Funcionalidades do dashboard principal
   ===================================================== */

class Dashboard {
    constructor() {
        this.currentFilter = 'all';
        this.tasks = [];
        this.stats = {};
    }    // ===== INICIALIZAÇÃO =====
    async init() {
        try {
            console.log('Dashboard init started...');
            
            // Hide loading spinner immediately
            this.hideLoading();
            
            // Load mock data immediately
            this.loadMockStats();
            this.loadMockTasks();
            this.loadMockUpcomingTasks();
            this.loadMockActivityFeed();

            // Setup event listeners
            this.setupEventListeners();

            console.log('Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    // ===== CARREGAMENTO DE DADOS MOCK =====
    loadMockStats() {
        this.stats = {
            total: 6,
            pendentes: 3,
            em_andamento: 1,
            concluidas: 2,
            atrasadas: 1
        };
        console.log('Mock stats loaded:', this.stats);
        this.updateStatsDisplay();
        this.updateSidebarBadges();
    }

    loadMockTasks() {
        console.log('Loading mock tasks...');
        this.tasks = [
            {
                id: 1,
                titulo: 'Desenvolver Interface do Dashboard',
                descricao: 'Criar e implementar a interface principal do sistema Task-It! com foco na experiência do usuário.',
                prioridade: 'alta',
                status: 'em_andamento',
                data_vencimento: '2024-12-20',
                categoria: { nome: 'Desenvolvimento', cor: '#8B3DFF' },
                tags: [{ nome: 'Frontend' }, { nome: 'UI/UX' }]
            },
            {
                id: 2,
                titulo: 'Estudar para Prova de Matemática',
                descricao: 'Revisar todos os tópicos de cálculo integral e derivadas para a prova final.',
                prioridade: 'alta',
                status: 'pendente',
                data_vencimento: '2024-12-22',
                categoria: { nome: 'Estudos', cor: '#10AC84' },
                tags: [{ nome: 'Matemática' }, { nome: 'Prova' }]
            },
            {
                id: 3,
                titulo: 'Implementar Sistema de Autenticação',
                descricao: 'Desenvolver sistema completo de login, registro e recuperação de senha.',
                prioridade: 'media',
                status: 'pendente',
                data_vencimento: '2024-12-25',
                categoria: { nome: 'Backend', cor: '#FF3D3D' },
                tags: [{ nome: 'Segurança' }, { nome: 'API' }]
            },
            {
                id: 4,
                titulo: 'Teste FASE 1',
                descricao: 'Executar bateria completa de testes para validar funcionalidades da primeira fase.',
                prioridade: 'baixa',
                status: 'concluida',
                data_vencimento: '2024-12-15',
                categoria: { nome: 'QA', cor: '#FFB930' },
                tags: [{ nome: 'Testes' }, { nome: 'Validação' }]
            },
            {
                id: 5,
                titulo: 'Documentação da API',
                descricao: 'Criar documentação completa dos endpoints da API REST do sistema.',
                prioridade: 'media',
                status: 'em_andamento',
                data_vencimento: '2024-12-30',
                categoria: { nome: 'Documentação', cor: '#3D8BFF' },
                tags: [{ nome: 'API' }, { nome: 'Docs' }]
            },
            {
                id: 6,
                titulo: 'Revisar Código Frontend',
                descricao: 'Fazer code review completo das funcionalidades implementadas no frontend.',
                prioridade: 'baixa',
                status: 'pendente',
                data_vencimento: '2025-01-05',
                categoria: { nome: 'Code Review', cor: '#9CA3AF' },
                tags: [{ nome: 'Frontend' }, { nome: 'Review' }]
            }
        ];
        console.log('Mock tasks loaded:', this.tasks);
        this.renderTasks();
    }

    loadMockUpcomingTasks() {
        console.log('Loading mock upcoming tasks...');
        const upcomingContainer = document.getElementById('upcomingTasks');
        
        if (!upcomingContainer) {
            console.warn('Upcoming tasks container not found');
            return;
        }

        const upcomingTasks = [
            { 
                id: 1, 
                title: 'Estudar para Prova de Matemática', 
                dueDate: new Date(Date.now() + 86400000),
                priority: 'alta' 
            },
            { 
                id: 2, 
                title: 'Entregar Projeto WAD', 
                dueDate: new Date(Date.now() + 172800000),
                priority: 'alta' 
            },
            { 
                id: 3, 
                title: 'Revisar código do frontend', 
                dueDate: new Date(Date.now() + 432000000),
                priority: 'media' 
            }
        ];

        upcomingContainer.innerHTML = upcomingTasks.map(task => {
            const today = new Date();
            const due = new Date(task.dueDate);
            const diffTime = due - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let indicator = 'week';
            let dueText = `${diffDays} dias`;
            
            if (diffDays === 0) {
                indicator = 'today';
                dueText = 'Hoje';
            } else if (diffDays === 1) {
                indicator = 'tomorrow';
                dueText = 'Amanhã';
            }

            return `
                <div class="upcoming-task-item" onclick="window.location.href='/tasks/${task.id}'">
                    <div class="task-due-indicator ${indicator}"></div>
                    <div class="upcoming-task-content">
                        <h4 class="upcoming-task-title">${task.title}</h4>
                        <p class="upcoming-task-due">Vence em ${dueText}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadMockActivityFeed() {
        console.log('Loading mock activity feed...');
        const activityContainer = document.getElementById('activityFeed');
        
        if (!activityContainer) {
            console.warn('Activity feed container not found');
            return;
        }

        const activities = [
            { 
                type: 'completed', 
                title: 'Tarefa "Teste FASE 1" concluída', 
                time: 'há 2 horas',
                icon: 'fa-check-circle'
            },
            { 
                type: 'created', 
                title: 'Nova tarefa criada: "Estudar React"', 
                time: 'há 4 horas',
                icon: 'fa-plus-circle'
            },
            { 
                type: 'updated', 
                title: 'Tarefa "Projeto Final" atualizada', 
                time: 'há 6 horas',
                icon: 'fa-edit'
            },
            { 
                type: 'completed', 
                title: 'Checklist "Revisão de código" finalizada', 
                time: 'ontem',
                icon: 'fa-check-circle'
            }
        ];

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4 class="activity-title">${activity.title}</h4>
                    <p class="activity-time">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    // ===== ATUALIZAÇÃO DA INTERFACE =====
    updateStatsDisplay() {
        console.log('Updating stats display:', this.stats);
        
        const totalElement = document.getElementById('totalTasks');
        const pendingElement = document.getElementById('pendingTasks');
        const completedElement = document.getElementById('completedTasks');
        const overdueElement = document.getElementById('overdueTasks');

        if (totalElement) totalElement.textContent = this.stats.total || 0;
        if (pendingElement) pendingElement.textContent = this.stats.pendentes || 0;
        if (completedElement) completedElement.textContent = this.stats.concluidas || 0;
        if (overdueElement) overdueElement.textContent = this.stats.atrasadas || 0;
    }

    updateSidebarBadges() {
        const badges = {
            'pending': this.stats.pendentes || 0,
            'completed': this.stats.concluidas || 0,
            'overdue': this.stats.atrasadas || 0
        };

        Object.entries(badges).forEach(([key, value]) => {
            const badge = document.querySelector(`[data-filter="${key}"] .nav-badge`);
            if (badge) {
                badge.textContent = value;
                badge.className = `nav-badge ${key}`;
            }
        });
    }

    renderTasks() {
        console.log('Rendering tasks...');
        const container = document.getElementById('tasksContainer');
        if (!container) {
            console.warn('Tasks container not found!');
            return;
        }

        if (!this.tasks || this.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>Nenhuma tarefa encontrada</p>
                </div>
            `;
            return;
        }

        // Limitar a 6 tarefas no dashboard
        const recentTasks = this.tasks.slice(0, 6);

        container.innerHTML = `
            <div class="tasks-list">
                ${recentTasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
        `;
    }

    renderTaskCard(task) {
        const priorityClass = task.prioridade || 'baixa';
        const statusClass = task.status || 'pendente';
        const dueDate = task.data_vencimento ? new Date(task.data_vencimento).toLocaleDateString('pt-BR') : 'Sem prazo';
        
        return `
            <div class="task-card priority-${priorityClass} status-${statusClass}" onclick="dashboard.viewTask(${task.id})">
                <div class="task-header">
                    <div class="task-priority">
                        <span class="priority-badge ${priorityClass}">${priorityClass.toUpperCase()}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); dashboard.editTask(${task.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); dashboard.toggleTaskStatus(${task.id})" title="Marcar como ${statusClass === 'concluida' ? 'pendente' : 'concluída'}">
                            <i class="fas ${statusClass === 'concluida' ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                    </div>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${task.titulo}</h3>
                    <p class="task-description">${task.descricao}</p>
                </div>
                <div class="task-footer">
                    <div class="task-meta">
                        <span class="task-due">
                            <i class="fas fa-calendar"></i>
                            ${dueDate}
                        </span>
                        ${task.categoria ? `
                            <span class="task-category" style="color: ${task.categoria.cor}">
                                <i class="fas fa-tag"></i>
                                ${task.categoria.nome}
                            </span>
                        ` : ''}
                    </div>
                    ${task.tags && task.tags.length > 0 ? `
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${tag.nome}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTasks(e.target.value);
            });
        }

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter');
                this.filterTasks(filter);
            });
        });
    }

    // ===== TASK ACTIONS =====
    viewTask(taskId) {
        window.location.href = `/tasks/${taskId}`;
    }

    editTask(taskId) {
        window.location.href = `/tasks/${taskId}/edit`;
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
        task.status = newStatus;
        this.renderTasks();
        this.loadMockStats(); // Refresh stats
    }

    searchTasks(query) {
        if (!query.trim()) {
            this.renderTasks();
            return;
        }

        const filteredTasks = this.tasks.filter(task =>
            task.titulo.toLowerCase().includes(query.toLowerCase()) ||
            task.descricao.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredTasks(filteredTasks);
    }

    filterTasks(filter) {
        let filteredTasks;

        switch (filter) {
            case 'pending':
                filteredTasks = this.tasks.filter(task => task.status === 'pendente');
                break;
            case 'in-progress':
                filteredTasks = this.tasks.filter(task => task.status === 'em_andamento');
                break;
            case 'completed':
                filteredTasks = this.tasks.filter(task => task.status === 'concluida');
                break;
            case 'overdue':
                filteredTasks = this.tasks.filter(task => {
                    if (!task.data_vencimento) return false;
                    return new Date(task.data_vencimento) < new Date() && task.status !== 'concluida';
                });
                break;
            default:
                filteredTasks = this.tasks;
        }

        this.renderFilteredTasks(filteredTasks);
    }

    renderFilteredTasks(tasks) {
        const container = document.getElementById('tasksContainer');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma tarefa encontrada</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="tasks-list">
                ${tasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
        `;
    }

    // ===== UTILITIES =====
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
            spinner.style.display = 'none';
        }
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let dashboard;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing dashboard...');
    dashboard = new Dashboard();
    await dashboard.init();
});

// ===== FUNÇÕES GLOBAIS =====
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.toggle('active');
    }
}
