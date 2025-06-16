/* =====================================================
   TASK-IT! - JAVASCRIPT PARA LISTAGEM DE TAREFAS
   ===================================================== */

class TasksList {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.currentPage = 1;
        this.tasksPerPage = 12;
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            search: '',
            sortBy: 'created_at'
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadTasks();
            this.renderTasks();
            this.updatePagination();
        } catch (error) {
            console.error('Erro ao inicializar lista de tarefas:', error);
            this.showError();
        }
    }

    async loadTasks() {
        try {
            const response = await API.getTasks();
            if (response.success) {
                this.tasks = response.data;
            } else {
                console.warn('API response not successful, using mock data');
                this.loadMockTasks();
            }
            this.applyFilters();
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.loadMockTasks();
            this.applyFilters();
        }
    }

    loadMockTasks() {
        this.tasks = [
            {
                id: 1,
                title: "Finalizar Projeto Task-It!",
                description: "Implementar todas as funcionalidades do gerenciador de tarefas",
                due_date: "2025-06-20",
                priority: "alta",
                status: "em_progresso",
                created_at: "2025-06-10"
            },
            {
                id: 2,
                title: "Estudar para Prova de Matemática",
                description: "Revisar capítulos 5-8 do livro de Cálculo Diferencial",
                due_date: "2025-06-18",
                priority: "alta",
                status: "pendente",
                created_at: "2025-06-12"
            },
            {
                id: 3,
                title: "Reunião com Orientador",
                description: "Discutir progresso do projeto e próximos passos",
                due_date: "2025-06-17",
                priority: "media",
                status: "pendente",
                created_at: "2025-06-11"
            },
            {
                id: 4,
                title: "Implementar Sistema de Login",
                description: "Criar tela de login e sistema de autenticação",
                due_date: "2025-06-19",
                priority: "alta",
                status: "concluida",
                created_at: "2025-06-09"
            },
            {
                id: 5,
                title: "Fazer Compras",
                description: "Lista de compras para a semana",
                due_date: "2025-06-16",
                priority: "baixa",
                status: "pendente",
                created_at: "2025-06-13"
            },
            {
                id: 6,
                title: "Revisar Código",
                description: "Code review do projeto com o time",
                due_date: "2025-06-21",
                priority: "media",
                status: "pendente",
                created_at: "2025-06-14"
            }
        ];
    }

    applyFilters() {
        this.filteredTasks = this.tasks.filter(task => {
            let matches = true;

            // Filtro por status
            if (this.currentFilters.status !== 'all') {
                matches = matches && task.status === this.currentFilters.status;
            }

            // Filtro por prioridade
            if (this.currentFilters.priority !== 'all') {
                matches = matches && task.priority === this.currentFilters.priority;
            }

            // Filtro por busca
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                matches = matches && (
                    task.title.toLowerCase().includes(searchTerm) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm))
                );
            }

            return matches;
        });

        // Ordenação
        this.sortTasks(this.currentFilters.sortBy);
        this.currentPage = 1; // Reset para primeira página
    }

    sortTasks(sortBy) {
        this.currentFilters.sortBy = sortBy;
        
        this.filteredTasks.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'due_date':
                    if (!a.due_date && !b.due_date) return 0;
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(a.due_date) - new Date(b.due_date);
                case 'priority':
                    const priorityOrder = { alta: 3, media: 2, baixa: 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                case 'created_at':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });
    }

    renderTasks() {
        const container = document.getElementById('tasksGrid');
        if (!container) return;

        // Calcular tarefas para a página atual
        const startIndex = (this.currentPage - 1) * this.tasksPerPage;
        const endIndex = startIndex + this.tasksPerPage;
        const tasksToShow = this.filteredTasks.slice(startIndex, endIndex);

        if (tasksToShow.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const tasksHTML = tasksToShow.map(task => this.createTaskCard(task)).join('');
        container.innerHTML = tasksHTML;
    }

    createTaskCard(task) {
        const priorityClass = `priority-${task.priority}`;
        const statusClass = `status-${task.status}`;
        const dueDate = task.due_date ? Utils.formatDate(task.due_date, 'relative') : '';
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'concluida';

        return `
            <div class="task-card ${priorityClass} ${statusClass}" onclick="openTaskDetail(${task.id})">
                <div class="task-header">
                    <div class="task-priority">
                        <span class="priority-badge ${task.priority || 'baixa'}">
                            ${Utils.formatPriority(task.priority)}
                        </span>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); toggleTaskStatus(${task.id})" title="Marcar como ${task.status === 'concluida' ? 'pendente' : 'concluída'}">
                            <i class="fas ${task.status === 'concluida' ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="event.stopPropagation(); editTask(${task.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-sm btn-danger" onclick="event.stopPropagation(); deleteTask(${task.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${Utils.sanitizeHTML(task.title)}</h3>
                    ${task.description ? `<p class="task-description">${Utils.sanitizeHTML(task.description)}</p>` : ''}
                </div>
                <div class="task-footer">
                    <div class="task-meta">
                        <div class="task-status">
                            <span class="status-badge ${task.status || 'pendente'}">
                                ${Utils.formatStatus(task.status)}
                            </span>
                        </div>
                        ${dueDate ? `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i>
                            <span>${dueDate}</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="tasks-empty">
                <i class="fas fa-search"></i>
                <h3>Nenhuma tarefa encontrada</h3>
                <p>Tente ajustar os filtros ou criar uma nova tarefa.</p>
                <a href="/tasks/new" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Nova Tarefa
                </a>
            </div>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredTasks.length / this.tasksPerPage);
        const paginationContainer = document.getElementById('pagination');
        const paginationInfo = document.getElementById('paginationInfo');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        if (totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        if (paginationContainer) paginationContainer.style.display = 'flex';
        if (paginationInfo) paginationInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
        
        if (prevButton) prevButton.disabled = this.currentPage === 1;
        if (nextButton) nextButton.disabled = this.currentPage === totalPages;
    }

    // Métodos de filtro
    searchTasks(searchTerm) {
        this.currentFilters.search = searchTerm;
        this.applyFilters();
        this.renderTasks();
        this.updatePagination();
    }

    filterByStatus(status) {
        this.currentFilters.status = status;
        this.applyFilters();
        this.renderTasks();
        this.updatePagination();
    }

    filterByPriority(priority) {
        this.currentFilters.priority = priority;
        this.applyFilters();
        this.renderTasks();
        this.updatePagination();
    }

    clearFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            search: '',
            sortBy: 'created_at'
        };

        // Reset form elements
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const sortBy = document.getElementById('sortBy');
        const searchInput = document.getElementById('searchInput');

        if (statusFilter) statusFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        if (sortBy) sortBy.value = 'created_at';
        if (searchInput) searchInput.value = '';

        this.applyFilters();
        this.renderTasks();
        this.updatePagination();
    }

    // Paginação
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTasks();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredTasks.length / this.tasksPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTasks();
            this.updatePagination();
        }
    }

    showError() {
        const container = document.getElementById('tasksGrid');
        if (container) {
            container.innerHTML = `
                <div class="tasks-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar tarefas</h3>
                    <p>Tente recarregar a página.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Recarregar
                    </button>
                </div>
            `;
        }
    }
}

// Funções globais para os botões de ação
function editTask(taskId) {
    window.location.href = `/tasks/${taskId}/edit`;
}

function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        fetch(`/tarefas/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                showToast('Tarefa excluída com sucesso!', 'success');
                tasksList.loadTasks();
            } else {
                throw new Error('Erro ao excluir tarefa');
            }
        })
        .catch(error => {
            console.error('Erro ao excluir tarefa:', error);
            showToast('Erro ao excluir tarefa', 'error');
        });
    }
}

function toggleTaskStatus(taskId) {
    const task = tasksList.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
    
    fetch(`/tarefas/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (response.ok) {
            task.status = newStatus;
            tasksList.applyFilters();
            tasksList.renderTasks();
            showToast(newStatus === 'concluida' ? 'Tarefa marcada como concluída!' : 'Tarefa marcada como pendente!', 'success');
        } else {
            throw new Error('Erro ao atualizar status da tarefa');
        }
    })
    .catch(error => {
        console.error('Erro ao alterar status:', error);
        showToast('Erro ao alterar status da tarefa', 'error');
    });
}

function openTaskDetail(taskId) {
    window.location.href = `/tasks/${taskId}`;
}

// Inicializar quando a página carregar
let tasksList;
document.addEventListener('DOMContentLoaded', () => {
    tasksList = new TasksList();
    setActivePage();
});
