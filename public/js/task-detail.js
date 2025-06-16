/* =====================================================
   TASK-IT! - DETALHES DA TAREFA JAVASCRIPT
   Funcionalidades da página de detalhes
   ===================================================== */

class TaskDetail {
    constructor() {
        this.taskId = window.taskDetailData?.taskId || null;
        this.task = null;
        this.checklist = [];
        this.notes = [];
        this.activity = [];
    }

    // ===== INICIALIZAÇÃO =====
    async init() {
        try {
            // Check authentication
            if (!API.isAuthenticated()) {
                window.location.href = '/auth';
                return;
            }

            if (!this.taskId) {
                Toast.error('ID da tarefa não encontrado');
                window.location.href = '/';
                return;
            }

            // Load task data
            await this.loadTaskData();
            await Promise.all([
                this.loadChecklist(),
                this.loadNotes(),
                this.loadActivity()
            ]);

            // Render everything
            this.renderTask();
            this.renderChecklist();
            this.renderNotes();
            this.renderActivity();
            this.renderRelatedTasks();

            // Setup event listeners
            this.setupEventListeners();

            Loading.hide();
            Toast.success('Detalhes da tarefa carregados!');
        } catch (error) {
            console.error('Error initializing task detail:', error);
            Toast.error('Erro ao carregar detalhes da tarefa');
        }
    }

    // ===== CARREGAMENTO DE DADOS =====
    async loadTaskData() {
        try {
            const response = await API.getTask(this.taskId);
            if (response.success) {
                this.task = response.data;
            } else {
                throw new Error('Tarefa não encontrada');
            }
        } catch (error) {
            console.error('Error loading task:', error);
            throw error;
        }
    }

    async loadChecklist() {
        try {
            const response = await API.getTaskChecklist(this.taskId);
            if (response.success) {
                this.checklist = response.data;
            }
        } catch (error) {
            console.error('Error loading checklist:', error);
        }
    }

    async loadNotes() {
        try {
            const response = await API.getTaskNotes(this.taskId);
            if (response.success) {
                this.notes = response.data;
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }

    async loadActivity() {
        try {
            // Simulated activity data - replace with real API call
            this.activity = [
                {
                    type: 'created',
                    message: 'Tarefa criada',
                    timestamp: this.task?.created_at || new Date().toISOString(),
                    icon: 'fas fa-plus-circle',
                    color: 'primary'
                },
                {
                    type: 'updated',
                    message: 'Tarefa atualizada',
                    timestamp: this.task?.updated_at || new Date().toISOString(),
                    icon: 'fas fa-edit',
                    color: 'info'
                }
            ];
        } catch (error) {
            console.error('Error loading activity:', error);
        }
    }

    // ===== RENDERIZAÇÃO =====
    renderTask() {
        if (!this.task) return;

        // Update header
        const titleElement = DOM.$('taskTitle');
        const subtitleElement = DOM.$('taskSubtitle');
        
        if (titleElement) titleElement.textContent = this.task.title;
        if (subtitleElement) {
            subtitleElement.textContent = `Criada em ${Utils.formatDate(this.task.created_at)}`;
        }

        // Update status bar
        this.updateStatusBar();

        // Update description
        const descriptionElement = DOM.$('taskDescription');
        if (descriptionElement) {
            if (this.task.description) {
                descriptionElement.innerHTML = `<p>${Utils.sanitizeHTML(this.task.description)}</p>`;
            } else {
                descriptionElement.innerHTML = '<p class="text-muted">Nenhuma descrição fornecida.</p>';
            }
        }

        // Update sidebar info
        this.updateSidebarInfo();
    }

    updateStatusBar() {
        if (!this.task) return;

        // Priority
        const priorityElement = DOM.$('taskPriority');
        if (priorityElement) {
            priorityElement.textContent = Utils.formatPriority(this.task.priority);
            priorityElement.className = `task-priority priority-${this.task.priority}`;
        }

        // Status
        const statusElement = DOM.$('taskStatus');
        if (statusElement) {
            statusElement.textContent = Utils.formatStatus(this.task.status);
            statusElement.className = `task-status status-${this.task.status}`;
        }

        // Progress
        const progressElement = DOM.$('taskProgress');
        if (progressElement) {
            const progress = this.calculateProgress();
            progressElement.textContent = `${progress}% concluído`;
        }

        // Action buttons
        this.updateActionButtons();
    }

    updateActionButtons() {
        const completeBtn = DOM.$('completeBtn');
        const startBtn = DOM.$('startBtn');

        if (completeBtn) {
            if (this.task.status === 'concluida') {
                completeBtn.innerHTML = '<i class="fas fa-undo"></i> Reabrir';
                completeBtn.onclick = () => this.reopenTask();
            } else {
                completeBtn.innerHTML = '<i class="fas fa-check"></i> Marcar como Concluída';
                completeBtn.onclick = () => this.markAsCompleted();
            }
        }

        if (startBtn) {
            if (this.task.status === 'em_andamento') {
                startBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
                startBtn.onclick = () => this.pauseTask();
            } else if (this.task.status === 'concluida') {
                startBtn.style.display = 'none';
            } else {
                startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
                startBtn.onclick = () => this.startTask();
            }
        }
    }

    updateSidebarInfo() {
        if (!this.task) return;

        // Basic info
        const elements = {
            createdAt: Utils.formatDate(this.task.created_at),
            updatedAt: Utils.formatDate(this.task.updated_at),
            dueDate: this.task.due_date ? Utils.formatDate(this.task.due_date) : 'Não definido',
            categoryInfo: this.task.category_name || 'Sem categoria'
        };

        Object.keys(elements).forEach(id => {
            const element = DOM.$(id);
            if (element) element.textContent = elements[id];
        });

        // Tags
        this.renderTags();

        // Statistics
        this.updateStatistics();
    }

    renderTags() {
        const container = DOM.$('tagsList');
        if (!container) return;

        if (!this.task.tags || this.task.tags.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma tag</p>';
            return;
        }

        const tagsHTML = this.task.tags.map(tag => `
            <span class="tag" style="background: ${tag.cor}; color: white;">
                ${Utils.sanitizeHTML(tag.nome)}
            </span>
        `).join('');

        container.innerHTML = tagsHTML;
    }

    updateStatistics() {
        const estimatedTimeElement = DOM.$('estimatedTime');
        const timeSpentElement = DOM.$('timeSpent');
        const checklistStatsElement = DOM.$('checklistStats');
        const notesCountElement = DOM.$('notesCount');

        if (estimatedTimeElement) estimatedTimeElement.textContent = 'Não definido';
        if (timeSpentElement) timeSpentElement.textContent = 'Não rastreado';
        
        if (checklistStatsElement) {
            const completed = this.checklist.filter(item => item.completed).length;
            const total = this.checklist.length;
            checklistStatsElement.textContent = total > 0 ? `${completed}/${total}` : 'Nenhum item';
        }
        
        if (notesCountElement) {
            notesCountElement.textContent = `${this.notes.length} anotaç${this.notes.length !== 1 ? 'ões' : 'ão'}`;
        }
    }

    renderChecklist() {
        const container = DOM.$('checklistContainer');
        const progressElement = DOM.$('checklistProgress');
        
        if (!container) return;

        if (this.checklist.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum item no checklist</p>';
            if (progressElement) progressElement.textContent = '(0/0)';
            return;
        }

        const completed = this.checklist.filter(item => item.completed).length;
        const total = this.checklist.length;
        
        if (progressElement) {
            progressElement.textContent = `(${completed}/${total})`;
        }

        const checklistHTML = this.checklist.map((item, index) => `
            <div class="checklist-item ${item.completed ? 'completed' : ''}">
                <input type="checkbox" ${item.completed ? 'checked' : ''} 
                       onchange="taskDetail.toggleChecklistItem(${index})">
                <span class="checklist-text">${Utils.sanitizeHTML(item.text)}</span>
                <button class="btn-icon btn-sm" onclick="taskDetail.removeChecklistItem(${index})" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = checklistHTML;
    }

    renderNotes() {
        const container = DOM.$('notesList');
        if (!container) return;

        if (this.notes.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhuma anotação</p>';
            return;
        }

        const notesHTML = this.notes.map((note, index) => `
            <div class="note-item">
                <div class="note-content">${Utils.sanitizeHTML(note.content)}</div>
                <div class="note-meta">
                    <span class="note-date">${Utils.formatDate(note.created_at, 'relative')}</span>
                    <div class="note-actions">
                        <button class="btn-icon btn-sm" onclick="taskDetail.editNote(${index})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="taskDetail.removeNote(${index})" title="Remover">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = notesHTML;
    }

    renderActivity() {
        const container = DOM.$('activityTimeline');
        if (!container) return;

        const activityHTML = this.activity.map(item => `
            <div class="activity-item">
                <div class="activity-icon ${item.color}">
                    <i class="${item.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${item.message}</p>
                    <span class="activity-time">${Utils.formatDate(item.timestamp, 'relative')}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = activityHTML;
    }

    renderRelatedTasks() {
        const container = DOM.$('relatedTasks');
        if (!container) return;

        // Simulated related tasks - replace with real API call
        container.innerHTML = '<p class="text-muted">Nenhuma tarefa relacionada</p>';
    }

    // ===== FUNCIONALIDADES =====
    calculateProgress() {
        if (this.task.status === 'concluida') return 100;
        if (this.checklist.length === 0) return 0;
        
        const completed = this.checklist.filter(item => item.completed).length;
        return Math.round((completed / this.checklist.length) * 100);
    }

    async markAsCompleted() {
        try {
            Loading.show('Marcando como concluída...');
            const response = await API.markTaskAsCompleted(this.taskId);
            
            if (response.success) {
                this.task.status = 'concluida';
                this.updateStatusBar();
                Toast.success('Tarefa marcada como concluída!');
            }
        } catch (error) {
            console.error('Error marking task as completed:', error);
            Toast.error('Erro ao marcar tarefa como concluída');
        } finally {
            Loading.hide();
        }
    }

    async startTask() {
        try {
            Loading.show('Iniciando tarefa...');
            const response = await API.updateTask(this.taskId, { status: 'em_andamento' });
            
            if (response.success) {
                this.task.status = 'em_andamento';
                this.updateStatusBar();
                Toast.success('Tarefa iniciada!');
            }
        } catch (error) {
            console.error('Error starting task:', error);
            Toast.error('Erro ao iniciar tarefa');
        } finally {
            Loading.hide();
        }
    }

    async pauseTask() {
        try {
            Loading.show('Pausando tarefa...');
            const response = await API.updateTask(this.taskId, { status: 'pendente' });
            
            if (response.success) {
                this.task.status = 'pendente';
                this.updateStatusBar();
                Toast.success('Tarefa pausada!');
            }
        } catch (error) {
            console.error('Error pausing task:', error);
            Toast.error('Erro ao pausar tarefa');
        } finally {
            Loading.hide();
        }
    }

    async reopenTask() {
        try {
            Loading.show('Reabrindo tarefa...');
            const response = await API.updateTask(this.taskId, { status: 'pendente' });
            
            if (response.success) {
                this.task.status = 'pendente';
                this.updateStatusBar();
                Toast.success('Tarefa reaberta!');
            }
        } catch (error) {
            console.error('Error reopening task:', error);
            Toast.error('Erro ao reabrir tarefa');
        } finally {
            Loading.hide();
        }
    }

    // ===== CHECKLIST =====
    async toggleChecklistItem(index) {
        const item = this.checklist[index];
        if (!item) return;

        try {
            const response = await API.toggleChecklistItem(item.id, !item.completed);
            if (response.success) {
                item.completed = !item.completed;
                this.renderChecklist();
                this.updateStatistics();
                this.updateStatusBar();
            }
        } catch (error) {
            console.error('Error toggling checklist item:', error);
            Toast.error('Erro ao atualizar item do checklist');
        }
    }

    async removeChecklistItem(index) {
        const item = this.checklist[index];
        if (!item) return;

        const confirmed = await Modal.confirm('Remover este item do checklist?');
        if (!confirmed) return;

        try {
            const response = await API.deleteChecklistItem(item.id);
            if (response.success) {
                this.checklist.splice(index, 1);
                this.renderChecklist();
                this.updateStatistics();
                Toast.success('Item removido do checklist');
            }
        } catch (error) {
            console.error('Error removing checklist item:', error);
            Toast.error('Erro ao remover item do checklist');
        }
    }

    async addChecklistItem() {
        const text = prompt('Digite o texto do item:');
        if (!text || !text.trim()) return;

        try {
            const response = await API.createChecklistItem(this.taskId, { text: text.trim() });
            if (response.success) {
                this.checklist.push(response.data);
                this.renderChecklist();
                this.updateStatistics();
                Toast.success('Item adicionado ao checklist');
            }
        } catch (error) {
            console.error('Error adding checklist item:', error);
            Toast.error('Erro ao adicionar item ao checklist');
        }
    }

    // ===== ANOTAÇÕES =====
    addNote() {
        const noteInput = DOM.$('noteInput');
        if (noteInput) {
            noteInput.style.display = 'block';
            const textarea = noteInput.querySelector('textarea');
            if (textarea) textarea.focus();
        }
    }

    cancelNote() {
        const noteInput = DOM.$('noteInput');
        if (noteInput) {
            noteInput.style.display = 'none';
            const textarea = noteInput.querySelector('textarea');
            if (textarea) textarea.value = '';
        }
    }

    async saveNote() {
        const noteInput = DOM.$('noteInput');
        const textarea = noteInput?.querySelector('textarea');
        
        if (!textarea || !textarea.value.trim()) {
            Toast.error('Digite o conteúdo da anotação');
            return;
        }

        try {
            const response = await API.createNote(this.taskId, { content: textarea.value.trim() });
            if (response.success) {
                this.notes.push(response.data);
                this.renderNotes();
                this.updateStatistics();
                this.cancelNote();
                Toast.success('Anotação adicionada');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            Toast.error('Erro ao salvar anotação');
        }
    }

    async editNote(index) {
        const note = this.notes[index];
        if (!note) return;

        const newContent = prompt('Editar anotação:', note.content);
        if (newContent === null || newContent.trim() === note.content) return;

        try {
            const response = await API.updateNote(note.id, { content: newContent.trim() });
            if (response.success) {
                note.content = newContent.trim();
                this.renderNotes();
                Toast.success('Anotação atualizada');
            }
        } catch (error) {
            console.error('Error updating note:', error);
            Toast.error('Erro ao atualizar anotação');
        }
    }

    async removeNote(index) {
        const note = this.notes[index];
        if (!note) return;

        const confirmed = await Modal.confirm('Remover esta anotação?');
        if (!confirmed) return;

        try {
            const response = await API.deleteNote(note.id);
            if (response.success) {
                this.notes.splice(index, 1);
                this.renderNotes();
                this.updateStatistics();
                Toast.success('Anotação removida');
            }
        } catch (error) {
            console.error('Error removing note:', error);
            Toast.error('Erro ao remover anotação');
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'e':
                        e.preventDefault();
                        this.editTask();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.duplicateTask();
                        break;
                }
            }
        });
    }

    // ===== OUTRAS FUNCIONALIDADES =====
    editTask() {
        window.location.href = `/tasks/${this.taskId}/edit`;
    }

    async duplicateTask() {
        try {
            Loading.show('Duplicando tarefa...');
            
            const taskData = {
                title: `${this.task.title} (Cópia)`,
                description: this.task.description,
                priority: this.task.priority,
                status: 'pendente',
                category_id: this.task.category_id
            };

            const response = await API.createTask(taskData);
            if (response.success) {
                Toast.success('Tarefa duplicada com sucesso!');
                setTimeout(() => {
                    window.location.href = `/tasks/${response.data.id}`;
                }, 1000);
            }
        } catch (error) {
            console.error('Error duplicating task:', error);
            Toast.error('Erro ao duplicar tarefa');
        } finally {
            Loading.hide();
        }
    }

    exportTask() {
        const taskData = {
            ...this.task,
            checklist: this.checklist,
            notes: this.notes
        };
        
        Utils.downloadJSON(taskData, `task-${this.taskId}.json`);
        Toast.success('Tarefa exportada com sucesso!');
    }

    async deleteTask() {
        const confirmed = await Modal.confirm(
            'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
            'Confirmar Exclusão'
        );

        if (!confirmed) return;

        try {
            Loading.show('Excluindo tarefa...');
            const response = await API.deleteTask(this.taskId);
            
            if (response.success) {
                Toast.success('Tarefa excluída com sucesso!');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            Toast.error('Erro ao excluir tarefa');
        } finally {
            Loading.hide();
        }
    }

    copyTaskLink() {
        const link = `${window.location.origin}/tasks/${this.taskId}`;
        Utils.copyToClipboard(link);
        Toast.success('Link copiado para a área de transferência!');
    }

    shareTask() {
        const modal = DOM.$('shareModal');
        if (modal) {
            const linkInput = DOM.$('taskLink');
            if (linkInput) {
                linkInput.value = `${window.location.origin}/tasks/${this.taskId}`;
            }
            modal.classList.add('active');
        }
    }

    printTask() {
        window.print();
    }

    createSubtask() {
        window.location.href = `/tasks/new?parent=${this.taskId}`;
    }
}

// ===== FUNÇÕES GLOBAIS =====
let taskDetail;

// Initialize task detail
document.addEventListener('DOMContentLoaded', async function() {
    taskDetail = new TaskDetail();
    await taskDetail.init();
});

// Global functions for onclick handlers
function editTask() {
    taskDetail.editTask();
}

function markAsCompleted() {
    taskDetail.markAsCompleted();
}

function startTask() {
    taskDetail.startTask();
}

function duplicateTask() {
    taskDetail.duplicateTask();
}

function exportTask() {
    taskDetail.exportTask();
}

function deleteTask() {
    taskDetail.deleteTask();
}

function addNote() {
    taskDetail.addNote();
}

function cancelNote() {
    taskDetail.cancelNote();
}

function saveNote() {
    taskDetail.saveNote();
}

function addChecklistItem() {
    taskDetail.addChecklistItem();
}

function copyTaskLink() {
    taskDetail.copyTaskLink();
}

function shareTask() {
    taskDetail.shareTask();
}

function printTask() {
    taskDetail.printTask();
}

function createSubtask() {
    taskDetail.createSubtask();
}

function toggleTaskMenu() {
    const menu = DOM.$('taskMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function closeShareModal() {
    const modal = DOM.$('shareModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Share functions
function shareViaEmail() {
    const subject = encodeURIComponent(`Tarefa: ${taskDetail.task.title}`);
    const body = encodeURIComponent(`Confira esta tarefa: ${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
}

function shareViaWhatsApp() {
    const text = encodeURIComponent(`Tarefa: ${taskDetail.task.title} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`);
}

function shareViaTwitter() {
    const text = encodeURIComponent(`Trabalhando na tarefa: ${taskDetail.task.title}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
}

// Make TaskDetail globally available
window.TaskDetail = TaskDetail;
window.taskDetail = taskDetail;
