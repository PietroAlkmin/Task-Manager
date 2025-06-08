/* =====================================================
   TASK-IT! - FORMULÁRIO DE TAREFA JAVASCRIPT
   Funcionalidades do formulário de criação/edição
   ===================================================== */

class TaskForm {
    constructor() {
        this.mode = window.taskFormData?.mode || 'create';
        this.taskId = window.taskFormData?.taskId || null;
        this.categories = [];
        this.availableTags = [];
        this.selectedTags = [];
        this.checklistItems = [];
        this.notes = [];
        this.isDirty = false;
    }

    // ===== INICIALIZAÇÃO =====
    async init() {
        try {
            // Check authentication
            if (!API.isAuthenticated()) {
                window.location.href = '/auth';
                return;
            }

            // Load data
            await Promise.all([
                this.loadCategories(),
                this.loadAvailableTags()
            ]);

            // Load task data if editing
            if (this.mode === 'edit' && this.taskId) {
                await this.loadTaskData();
            }

            // Setup form
            this.setupForm();
            this.setupEventListeners();
            this.setupPreview();
            this.setupKeyboardShortcuts();

            // Initialize components
            this.renderCategories();
            this.renderAvailableTags();
            this.renderColorPicker();

            Loading.hide();
            Toast.success(`Formulário ${this.mode === 'edit' ? 'de edição' : 'de criação'} carregado!`);
        } catch (error) {
            console.error('Error initializing task form:', error);
            Toast.error('Erro ao carregar formulário');
        }
    }

    // ===== CARREGAMENTO DE DADOS =====
    async loadCategories() {
        try {
            const response = await API.getCategories();
            if (response.success) {
                this.categories = response.data;
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadAvailableTags() {
        try {
            const response = await API.getTags();
            if (response.success) {
                this.availableTags = response.data;
            }
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }

    async loadTaskData() {
        try {
            const response = await API.getTask(this.taskId);
            if (response.success) {
                this.populateForm(response.data);
                
                // Load checklist and notes
                await Promise.all([
                    this.loadTaskChecklist(),
                    this.loadTaskNotes()
                ]);
            }
        } catch (error) {
            console.error('Error loading task data:', error);
            Toast.error('Erro ao carregar dados da tarefa');
        }
    }

    async loadTaskChecklist() {
        try {
            const response = await API.getTaskChecklist(this.taskId);
            if (response.success) {
                this.checklistItems = response.data;
                this.renderChecklist();
            }
        } catch (error) {
            console.error('Error loading checklist:', error);
        }
    }

    async loadTaskNotes() {
        try {
            const response = await API.getTaskNotes(this.taskId);
            if (response.success) {
                this.notes = response.data;
                this.renderNotes();
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }

    // ===== CONFIGURAÇÃO DO FORMULÁRIO =====
    setupForm() {
        const form = DOM.$('taskForm');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Track changes
        form.addEventListener('input', () => {
            this.isDirty = true;
            this.updatePreview();
        });
        
        form.addEventListener('change', () => {
            this.isDirty = true;
            this.updatePreview();
        });
    }

    setupEventListeners() {
        // Prevent leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Auto-save draft every 30 seconds
        setInterval(() => {
            if (this.isDirty) {
                this.saveDraft(true); // Silent save
            }
        }, 30000);
    }

    setupPreview() {
        // Update preview on form changes
        const inputs = DOM.findAll('#taskForm input, #taskForm textarea, #taskForm select');
        inputs.forEach(input => {
            input.addEventListener('input', Utils.debounce(() => {
                this.updatePreview();
            }, 300));
        });

        // Initial preview update
        this.updatePreview();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveDraft();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.handleSubmit();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.handleCancel();
            }
        });
    }

    // ===== RENDERIZAÇÃO =====
    renderCategories() {
        const select = DOM.$('category_id');
        if (!select) return;

        const optionsHTML = this.categories.map(category => `
            <option value="${category.id}" style="color: ${category.cor};">
                ${Utils.sanitizeHTML(category.nome)}
            </option>
        `).join('');

        select.innerHTML = `
            <option value="">Selecione uma categoria</option>
            ${optionsHTML}
        `;
    }

    renderAvailableTags() {
        const container = DOM.$('availableTags');
        if (!container) return;

        const tagsHTML = this.availableTags
            .filter(tag => !this.selectedTags.find(selected => selected.id === tag.id))
            .map(tag => `
                <span class="available-tag" onclick="taskForm.addTag(${tag.id}, '${Utils.sanitizeHTML(tag.nome)}')" style="border-color: ${tag.cor};">
                    ${Utils.sanitizeHTML(tag.nome)}
                </span>
            `).join('');

        container.innerHTML = tagsHTML;
    }

    renderSelectedTags() {
        const container = DOM.$('tagsInput');
        const input = container?.querySelector('input');
        
        if (!container) return;

        // Remove existing tags
        container.querySelectorAll('.tag-item').forEach(tag => tag.remove());

        // Add selected tags
        this.selectedTags.forEach(tag => {
            const tagElement = DOM.create('div', { className: 'tag-item' });
            tagElement.innerHTML = `
                <span>${Utils.sanitizeHTML(tag.nome)}</span>
                <button type="button" class="tag-remove" onclick="taskForm.removeTag(${tag.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.insertBefore(tagElement, input);
        });

        this.renderAvailableTags();
        this.updatePreview();
    }

    renderChecklist() {
        const container = DOM.$('checklistContainer');
        if (!container) return;

        const checklistHTML = this.checklistItems.map((item, index) => `
            <div class="checklist-item" data-index="${index}">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="taskForm.toggleChecklistItem(${index})">
                <input type="text" value="${Utils.sanitizeHTML(item.text)}" onchange="taskForm.updateChecklistItem(${index}, this.value)" placeholder="Digite o item do checklist">
                <button type="button" class="checklist-remove" onclick="taskForm.removeChecklistItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = checklistHTML;
    }

    renderNotes() {
        const container = DOM.$('notesList');
        if (!container) return;

        const notesHTML = this.notes.map((note, index) => `
            <div class="note-item" data-index="${index}">
                <div class="note-content">${Utils.sanitizeHTML(note.content)}</div>
                <div class="note-meta">
                    <span>${Utils.formatDate(note.created_at, 'relative')}</span>
                    <div class="note-actions">
                        <button type="button" onclick="taskForm.editNote(${index})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" onclick="taskForm.removeNote(${index})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = notesHTML;
    }

    renderColorPicker() {
        const container = DOM.$('colorPicker');
        if (!container) return;

        const colors = [
            '#8B3DFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#10AC84',
            '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
        ];

        const colorsHTML = colors.map(color => `
            <div class="color-option" style="background: ${color};" onclick="selectColor('${color}')" data-color="${color}"></div>
        `).join('');

        container.innerHTML = colorsHTML;
    }

    // ===== PREVIEW =====
    updatePreview() {
        const form = DOM.$('taskForm');
        if (!form) return;

        const formData = new FormData(form);
        
        // Update title
        const title = formData.get('title') || 'Título da tarefa';
        const titleElement = DOM.$('previewTitle');
        if (titleElement) titleElement.textContent = title;

        // Update description
        const description = formData.get('description') || 'Descrição da tarefa...';
        const descriptionElement = DOM.$('previewDescription');
        if (descriptionElement) descriptionElement.textContent = Utils.truncateText(description, 100);

        // Update priority
        const priority = formData.get('priority') || 'media';
        const priorityElement = DOM.$('previewPriority');
        if (priorityElement) {
            priorityElement.textContent = Utils.formatPriority(priority);
            priorityElement.className = `preview-priority priority-${priority}`;
        }

        // Update status
        const status = formData.get('status') || 'pendente';
        const statusElement = DOM.$('previewStatus');
        if (statusElement) {
            statusElement.textContent = Utils.formatStatus(status);
            statusElement.className = `preview-status status-${status}`;
        }

        // Update due date
        const dueDate = formData.get('due_date');
        const dueTime = formData.get('due_time');
        const dueDateElement = DOM.$('previewDueDate');
        if (dueDateElement) {
            if (dueDate) {
                const dateStr = Utils.formatDate(dueDate);
                const timeStr = dueTime ? ` às ${dueTime}` : '';
                dueDateElement.innerHTML = `<i class="fas fa-calendar"></i><span>${dateStr}${timeStr}</span>`;
            } else {
                dueDateElement.innerHTML = `<i class="fas fa-calendar"></i><span>Sem prazo</span>`;
            }
        }

        // Update category
        const categoryId = formData.get('category_id');
        const categoryElement = DOM.$('previewCategory');
        if (categoryElement) {
            if (categoryId) {
                const category = this.categories.find(c => c.id == categoryId);
                if (category) {
                    categoryElement.innerHTML = `<i class="fas fa-folder"></i><span>${category.nome}</span>`;
                }
            } else {
                categoryElement.innerHTML = `<i class="fas fa-folder"></i><span>Sem categoria</span>`;
            }
        }

        // Update tags
        const tagsElement = DOM.$('previewTags');
        if (tagsElement) {
            const tagsHTML = this.selectedTags.map(tag => `
                <span class="preview-tag">${Utils.sanitizeHTML(tag.nome)}</span>
            `).join('');
            tagsElement.innerHTML = tagsHTML;
        }
    }

    // ===== MANIPULAÇÃO DE DADOS =====
    populateForm(taskData) {
        // Basic fields
        const fields = ['title', 'description', 'priority', 'status'];
        fields.forEach(field => {
            const element = DOM.$(field);
            if (element && taskData[field]) {
                element.value = taskData[field];
            }
        });

        // Due date and time
        if (taskData.due_date) {
            const dueDate = new Date(taskData.due_date);
            const dateElement = DOM.$('due_date');
            const timeElement = DOM.$('due_time');
            
            if (dateElement) {
                dateElement.value = dueDate.toISOString().split('T')[0];
            }
            
            if (timeElement) {
                timeElement.value = dueDate.toTimeString().slice(0, 5);
            }
        }

        // Category
        if (taskData.category_id) {
            const categoryElement = DOM.$('category_id');
            if (categoryElement) {
                categoryElement.value = taskData.category_id;
            }
        }

        // Tags
        if (taskData.tags) {
            this.selectedTags = taskData.tags;
            this.renderSelectedTags();
        }
    }

    // ===== TAGS =====
    addTag(tagId, tagName) {
        const existingTag = this.selectedTags.find(tag => tag.id === tagId);
        if (existingTag) return;

        const tag = this.availableTags.find(t => t.id === tagId);
        if (tag) {
            this.selectedTags.push(tag);
            this.renderSelectedTags();
            this.isDirty = true;
        }
    }

    removeTag(tagId) {
        this.selectedTags = this.selectedTags.filter(tag => tag.id !== tagId);
        this.renderSelectedTags();
        this.isDirty = true;
    }

    // ===== CHECKLIST =====
    addChecklistItem() {
        this.checklistItems.push({
            text: '',
            completed: false,
            order: this.checklistItems.length
        });
        this.renderChecklist();
        this.isDirty = true;
        
        // Focus on new item
        setTimeout(() => {
            const newItem = DOM.find('.checklist-item:last-child input[type="text"]');
            if (newItem) newItem.focus();
        }, 100);
    }

    removeChecklistItem(index) {
        this.checklistItems.splice(index, 1);
        this.renderChecklist();
        this.isDirty = true;
    }

    toggleChecklistItem(index) {
        if (this.checklistItems[index]) {
            this.checklistItems[index].completed = !this.checklistItems[index].completed;
            this.isDirty = true;
        }
    }

    updateChecklistItem(index, text) {
        if (this.checklistItems[index]) {
            this.checklistItems[index].text = text;
            this.isDirty = true;
        }
    }

    // ===== ANOTAÇÕES =====
    addNote() {
        const textarea = DOM.find('.note-input textarea');
        if (!textarea || !textarea.value.trim()) return;

        this.notes.push({
            content: textarea.value.trim(),
            created_at: new Date().toISOString()
        });

        textarea.value = '';
        this.renderNotes();
        this.isDirty = true;
    }

    removeNote(index) {
        this.notes.splice(index, 1);
        this.renderNotes();
        this.isDirty = true;
    }

    editNote(index) {
        const note = this.notes[index];
        if (!note) return;

        const newContent = prompt('Editar anotação:', note.content);
        if (newContent !== null && newContent.trim()) {
            note.content = newContent.trim();
            this.renderNotes();
            this.isDirty = true;
        }
    }

    // ===== SUBMISSÃO =====
    async handleSubmit(e) {
        if (e) e.preventDefault();

        const form = DOM.$('taskForm');
        if (!form) return;

        // Validate form
        if (!this.validateForm()) {
            Toast.error('Por favor, corrija os erros no formulário');
            return;
        }

        try {
            Loading.show(`${this.mode === 'edit' ? 'Atualizando' : 'Criando'} tarefa...`);

            const taskData = this.getFormData();
            let response;

            if (this.mode === 'edit') {
                response = await API.updateTask(this.taskId, taskData);
            } else {
                response = await API.createTask(taskData);
            }

            if (response.success) {
                this.isDirty = false;
                Toast.success(`Tarefa ${this.mode === 'edit' ? 'atualizada' : 'criada'} com sucesso!`);
                
                // Redirect to task detail or dashboard
                setTimeout(() => {
                    window.location.href = this.mode === 'edit' ? `/tasks/${this.taskId}` : '/';
                }, 1000);
            }
        } catch (error) {
            console.error('Error submitting task:', error);
            Toast.error(error.message || `Erro ao ${this.mode === 'edit' ? 'atualizar' : 'criar'} tarefa`);
        } finally {
            Loading.hide();
        }
    }

    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        DOM.findAll('.form-error').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });

        // Validate title
        const title = DOM.$('title');
        if (!title.value.trim()) {
            this.showError('titleError', 'Título é obrigatório');
            isValid = false;
        }

        return isValid;
    }

    showError(elementId, message) {
        const errorElement = DOM.$(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    getFormData() {
        const form = DOM.$('taskForm');
        const formData = new FormData(form);
        
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            status: formData.get('status'),
            category_id: formData.get('category_id') || null
        };

        // Combine date and time
        const dueDate = formData.get('due_date');
        const dueTime = formData.get('due_time');
        
        if (dueDate) {
            data.due_date = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:59`;
        }

        // Add tags
        data.tags = this.selectedTags.map(tag => tag.id);

        // Add checklist
        data.checklist = this.checklistItems.filter(item => item.text.trim());

        // Add notes
        data.notes = this.notes;

        return data;
    }

    // ===== OUTRAS FUNCIONALIDADES =====
    async saveDraft(silent = false) {
        if (!this.isDirty) return;

        try {
            const draftData = this.getFormData();
            Utils.storage.set(`task_draft_${this.taskId || 'new'}`, draftData);
            
            if (!silent) {
                Toast.success('Rascunho salvo!');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            if (!silent) {
                Toast.error('Erro ao salvar rascunho');
            }
        }
    }

    handleCancel() {
        if (this.isDirty) {
            Modal.confirm('Você tem alterações não salvas. Deseja realmente sair?', 'Confirmar Saída')
                .then(confirmed => {
                    if (confirmed) {
                        window.history.back();
                    }
                });
        } else {
            window.history.back();
        }
    }
}

// ===== FUNÇÕES GLOBAIS =====
let taskForm;

// Initialize task form
document.addEventListener('DOMContentLoaded', async function() {
    taskForm = new TaskForm();
    await taskForm.init();
});

// Global functions for onclick handlers
function handleTagInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const tagName = input.value.trim();
        
        if (tagName) {
            // Create new tag or add existing one
            const existingTag = taskForm.availableTags.find(tag => 
                tag.nome.toLowerCase() === tagName.toLowerCase()
            );
            
            if (existingTag) {
                taskForm.addTag(existingTag.id, existingTag.nome);
            } else {
                // Create new tag
                createNewTag(tagName);
            }
            
            input.value = '';
        }
    }
}

function handleNoteInput(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        taskForm.addNote();
    }
}

function addChecklistItem() {
    taskForm.addChecklistItem();
}

function addNote() {
    taskForm.addNote();
}

function saveDraft() {
    taskForm.saveDraft();
}

async function deleteTask() {
    if (!taskForm.taskId) return;

    const confirmed = await Modal.confirm(
        'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
        'Confirmar Exclusão'
    );

    if (confirmed) {
        try {
            Loading.show('Excluindo tarefa...');
            const response = await API.deleteTask(taskForm.taskId);
            
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
}

// Category modal functions
function openCategoryModal() {
    const modal = DOM.$('categoryModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCategoryModal() {
    const modal = DOM.$('categoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function createCategory() {
    const form = DOM.$('categoryForm');
    if (!form) return;

    const formData = new FormData(form);
    const categoryData = {
        nome: formData.get('nome'),
        cor: document.querySelector('.color-option.selected')?.dataset.color || '#8B3DFF'
    };

    try {
        Loading.show('Criando categoria...');
        const response = await API.createCategory(categoryData);
        
        if (response.success) {
            Toast.success('Categoria criada com sucesso!');
            closeCategoryModal();
            form.reset();
            
            // Reload categories
            await taskForm.loadCategories();
            taskForm.renderCategories();
        }
    } catch (error) {
        console.error('Error creating category:', error);
        Toast.error('Erro ao criar categoria');
    } finally {
        Loading.hide();
    }
}

function selectColor(color) {
    DOM.findAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    DOM.find(`[data-color="${color}"]`).classList.add('selected');
}

async function createNewTag(tagName) {
    try {
        const response = await API.createTag({
            nome: tagName,
            cor: Utils.generateRandomColor()
        });
        
        if (response.success) {
            taskForm.availableTags.push(response.data);
            taskForm.addTag(response.data.id, response.data.nome);
            taskForm.renderAvailableTags();
        }
    } catch (error) {
        console.error('Error creating tag:', error);
        Toast.error('Erro ao criar tag');
    }
}

// Make TaskForm globally available
window.TaskForm = TaskForm;
window.taskForm = taskForm;
