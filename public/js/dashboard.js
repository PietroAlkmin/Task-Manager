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
              // Try to load real data first, fallback to mock if fails
            try {
                await this.loadRealData();
                this.updateLastRefreshTime();
                console.log('Real data loaded successfully');
            } catch (error) {
                console.warn('Failed to load real data, using mock data:', error);
                this.loadMockData();
            }

            // Setup event listeners
            this.setupEventListeners();

            console.log('Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    // ===== CARREGAMENTO DE DADOS REAIS =====
    async loadRealData() {
        console.log('Loading real data from server...');
        
        // Load real stats and tasks in parallel
        await Promise.all([
            this.loadRealStats(),
            this.loadRealTasks(),
            this.loadRealUpcomingTasks(),
            this.loadRealActivityFeed()
        ]);
    }    async loadRealStats() {
        try {
            const response = await fetch('/tarefas/stats/summary');
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const result = await response.json();
            this.stats = result.data || result;
            console.log('Real stats loaded:', this.stats);
            this.updateStatsDisplay();
            this.updateSidebarBadges();
        } catch (error) {
            console.error('Error loading real stats:', error);
            throw error;
        }
    }

    async loadRealTasks() {
        try {
            const response = await fetch('/tarefas');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            
            const result = await response.json();
            this.tasks = result.data || result;
            console.log('Real tasks loaded:', this.tasks);
            this.renderTasks();
        } catch (error) {
            console.error('Error loading real tasks:', error);
            throw error;
        }
    }

    async loadRealUpcomingTasks() {
        try {
            const response = await fetch('/tarefas/upcoming');
            if (!response.ok) throw new Error('Failed to fetch upcoming tasks');
            
            const result = await response.json();
            const upcomingTasks = result.data || result;
            console.log('Real upcoming tasks loaded:', upcomingTasks);
            this.renderUpcomingTasks(upcomingTasks);
        } catch (error) {
            console.error('Error loading real upcoming tasks:', error);
            this.loadMockUpcomingTasks(); // Fallback to mock
        }
    }

    async loadRealActivityFeed() {
        try {
            // For now, use mock activity feed as this endpoint might not exist yet
            this.loadMockActivityFeed();
        } catch (error) {
            console.error('Error loading real activity feed:', error);
            this.loadMockActivityFeed();
        }
    }

    // ===== CARREGAMENTO DE DADOS MOCK (FALLBACK) =====
    loadMockData() {
        this.loadMockStats();
        this.loadMockTasks();
        this.loadMockUpcomingTasks();
        this.loadMockActivityFeed();
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
    }    renderTaskCard(task) {
        // Mapear campos do banco (inglês) para exibição
        const title = task.titulo || task.title || 'Sem título';
        const description = task.descricao || task.description || 'Sem descrição';
        const priority = task.prioridade || task.priority || 'baixa';
        const status = task.status || 'pendente';
        const dueDate = task.data_vencimento || task.due_date;
        
        const priorityClass = priority.toLowerCase();
        const statusClass = status.toLowerCase();
        const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'Sem prazo';
        
        // Mapear categoria
        const category = task.categoria || (task.category_name ? {
            nome: task.category_name,
            cor: task.category_color || '#8B3DFF'
        } : null);
        
        return `
            <div class="task-card priority-${priorityClass} status-${statusClass}" onclick="dashboard.viewTask(${task.id})">
                <div class="task-header">
                    <div class="task-priority">
                        <span class="priority-badge ${priorityClass}">${priority.toUpperCase()}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); dashboard.editTask(${task.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); dashboard.toggleTaskStatus(${task.id})" title="Marcar como ${statusClass === 'concluida' ? 'pendente' : 'concluída'}">
                            <i class="fas ${statusClass === 'concluida' ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="btn-icon btn-sm btn-delete" onclick="event.stopPropagation(); dashboard.deleteTask(${task.id})" title="Excluir tarefa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${title}</h3>
                    <p class="task-description">${description}</p>
                </div>
                <div class="task-footer">
                    <div class="task-meta">
                        <span class="task-due">
                            <i class="fas fa-calendar"></i>
                            ${dueDateFormatted}
                        </span>
                        ${category ? `
                            <span class="task-category" style="color: ${category.cor}">
                                <i class="fas fa-tag"></i>
                                ${category.nome}
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
    }    // ===== RENDERIZAÇÃO DE TAREFAS VINDAS DO SERVIDOR =====
    renderUpcomingTasks(upcomingTasks) {
        console.log('Rendering upcoming tasks from server...');
        const upcomingContainer = document.getElementById('upcomingTasks');
        
        if (!upcomingContainer) {
            console.warn('Upcoming tasks container not found');
            return;
        }

        if (!upcomingTasks || upcomingTasks.length === 0) {
            upcomingContainer.innerHTML = '<p class="empty-state">Nenhuma tarefa próxima do vencimento</p>';
            return;
        }

        upcomingContainer.innerHTML = upcomingTasks.map(task => {
            const today = new Date();
            const dueDate = task.data_vencimento || task.due_date;
            const due = new Date(dueDate);
            const diffTime = due - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let dueDateText = '';
            let dueDateClass = '';

            if (diffDays < 0) {
                dueDateText = `${Math.abs(diffDays)} dia(s) atrasado`;
                dueDateClass = 'overdue';
            } else if (diffDays === 0) {
                dueDateText = 'Vence hoje';
                dueDateClass = 'due-today';
            } else if (diffDays === 1) {
                dueDateText = 'Vence amanhã';
                dueDateClass = 'due-tomorrow';
            } else {
                dueDateText = `Vence em ${diffDays} dia(s)`;
                dueDateClass = 'due-later';
            }

            const priority = task.prioridade || task.priority || 'baixa';
            const title = task.titulo || task.title || 'Sem título';
            const priorityClass = this.getPriorityClass(priority);

            return `
                <div class="upcoming-task-item">
                    <div class="task-priority-indicator ${priorityClass}"></div>
                    <div class="upcoming-task-content">
                        <h4 class="upcoming-task-title">${title}</h4>
                        <p class="upcoming-task-due ${dueDateClass}">${dueDateText}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== REFRESH DOS DADOS =====
    async refreshData() {
        console.log('Refreshing dashboard data...');
        try {
            // Show loading animation
            const refreshIcon = document.getElementById('refreshIcon');
            if (refreshIcon) {
                refreshIcon.classList.add('fa-spin');
            }
            
            this.showLoading();
            await this.loadRealData();
            this.hideLoading();
            
            // Update last refresh time
            this.updateLastRefreshTime();
            
            this.showToast('Dados atualizados com sucesso!', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.hideLoading();
            this.showToast('Erro ao atualizar dados', 'error');
        } finally {
            // Stop loading animation
            const refreshIcon = document.getElementById('refreshIcon');
            if (refreshIcon) {
                refreshIcon.classList.remove('fa-spin');
            }
        }
    }

    updateLastRefreshTime() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            lastUpdateElement.textContent = ` ${timeString}`;
        }
    }

    // ===== UTILITÁRIOS =====
    getPriorityClass(priority) {
        switch (priority?.toLowerCase()) {
            case 'alta': 
            case 'high': 
                return 'priority-high';
            case 'media': 
            case 'medium': 
                return 'priority-medium';
            case 'baixa': 
            case 'low': 
                return 'priority-low';
            default: 
                return 'priority-medium';
        }
    }

    showLoading() {
        const loadingStates = document.querySelectorAll('.loading-state');
        loadingStates.forEach(state => {
            state.style.display = 'block';
        });
    }

    hideLoading() {
        const loadingStates = document.querySelectorAll('.loading-state');
        loadingStates.forEach(state => {
            state.style.display = 'none';
        });
    }

    showToast(message, type = 'info') {
        // Use existing toast functionality from utils.js if available
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`Toast: ${message} (${type})`);
        }
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

        // Refresh button
        const refreshButton = document.getElementById('refreshButton');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshData();
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

        // Auto-refresh when returning from task creation
        window.addEventListener('focus', () => {
            // Check if we returned from task form
            if (document.referrer.includes('/task-form')) {
                setTimeout(() => {
                    this.refreshData();
                }, 500);
            }
        });

        // Listen for storage events (when task is created in another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'taskCreated') {
                this.refreshData();
            }
        });

        // ===== TOGGLE DOS WIDGETS LATERAIS =====
        const widgetToggle = document.getElementById('widgetToggle');
        const dashboardMain = document.getElementById('dashboardMain');
        
        if (widgetToggle && dashboardMain) {
            let widgetsHidden = false;
            
            // Verificar estado salvo no localStorage
            const savedState = localStorage.getItem('dashboardWidgetsHidden');
            if (savedState === 'true') {
                toggleWidgets();
            }
            
            widgetToggle.addEventListener('click', toggleWidgets);
            
            function toggleWidgets() {
                widgetsHidden = !widgetsHidden;
                
                if (widgetsHidden) {
                    dashboardMain.classList.add('hide-widgets');
                    widgetToggle.classList.add('widgets-hidden');
                    widgetToggle.title = 'Mostrar Widgets';
                } else {
                    dashboardMain.classList.remove('hide-widgets');
                    widgetToggle.classList.remove('widgets-hidden');
                    widgetToggle.title = 'Esconder Widgets';
                }
                
                // Salvar estado no localStorage
                localStorage.setItem('dashboardWidgetsHidden', widgetsHidden.toString());
            }
        }

        // ===== OTIMIZAÇÃO AUTOMÁTICA PARA TELAS PEQUENAS =====
        function checkScreenSize() {
            const dashboardMain = document.getElementById('dashboardMain');
            if (dashboardMain && window.innerWidth <= 1024) {
                dashboardMain.classList.add('hide-widgets');
            }
        }
        
        // Verificar tamanho da tela na inicialização e redimensionamento
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        // ===== MODO ULTRA-COMPACTO =====
        const bodyElement = document.body;
        
        // Verificar se modo compacto está ativo
        const isCompactMode = localStorage.getItem('dashboardCompactMode') === 'true';
        if (isCompactMode) {
            bodyElement.classList.add('dashboard-ultra-compact', 'maximize-space');
        }
        
        // Atalho de teclado para toggle do modo compacto (Ctrl+Shift+C)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                toggleCompactMode();
            }
        });
        
        function toggleCompactMode() {
            const isCurrentlyCompact = bodyElement.classList.contains('dashboard-ultra-compact');
            
            if (isCurrentlyCompact) {
                bodyElement.classList.remove('dashboard-ultra-compact', 'maximize-space');
                localStorage.setItem('dashboardCompactMode', 'false');
                showToast('Modo normal ativado', 'info');
            } else {
                bodyElement.classList.add('dashboard-ultra-compact', 'maximize-space');
                localStorage.setItem('dashboardCompactMode', 'true');
                showToast('Modo ultra-compacto ativado (Ctrl+Shift+C para alternar)', 'success');
            }
        }

        // ===== DETECÇÃO AUTOMÁTICA DE DENSIDADE DE TELA =====
        function detectScreenDensity() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const area = width * height;
            
            // Se a área da tela for muito grande, ativar otimizações automáticas
            if (area > 2073600) { // > 1920x1080
                bodyElement.classList.add('high-density-screen');
            }
            
            // Para telas ultra-wide, maximizar aproveitamento horizontal
            if (width / height > 1.8) {
                bodyElement.classList.add('ultra-wide-screen');
            }
        }
        
        detectScreenDensity();
        window.addEventListener('resize', detectScreenDensity);

        // ===== ÍCONE DE DICA CLICÁVEL =====
        const compactModeHint = document.querySelector('.compact-mode-hint');
        if (compactModeHint) {
            compactModeHint.addEventListener('click', toggleCompactMode);
        }
    }

    // ===== TASK ACTIONS =====
    async deleteTask(taskId) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
            return;
        }

        try {
            const response = await fetch(`/tarefas/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir tarefa');
            }

            this.showToast('Tarefa excluída com sucesso!', 'success');
            await this.refreshData();
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showToast('Erro ao excluir tarefa', 'error');
        }
    }

    async toggleTaskStatus(taskId) {
        try {
            // Encontrar a tarefa atual
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Tarefa não encontrada');
            }

            // Determinar novo status
            const currentStatus = task.status;
            const newStatus = currentStatus === 'concluida' ? 'pendente' : 'concluida';

            const response = await fetch(`/tarefas/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar status da tarefa');
            }

            this.showToast(`Tarefa marcada como ${newStatus === 'concluida' ? 'concluída' : 'pendente'}!`, 'success');
            await this.refreshData();
        } catch (error) {
            console.error('Error toggling task status:', error);
            this.showToast('Erro ao atualizar status da tarefa', 'error');
        }
    }

    editTask(taskId) {
        // Redirecionar para página de edição
        window.location.href = `/task-form?id=${taskId}`;
    }

    viewTask(taskId) {
        // Redirecionar para página de detalhes da tarefa
        window.location.href = `/task-detail/${taskId}`;
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
