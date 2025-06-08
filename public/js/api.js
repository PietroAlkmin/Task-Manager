/* =====================================================
   TASK-IT! - API CLIENT
   Cliente para comunicação com a API
   ===================================================== */

class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = Utils.storage.get('auth_token');
        this.user = Utils.storage.get('current_user');
    }

    // ===== MÉTODOS AUXILIARES =====
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ===== AUTENTICAÇÃO =====
    async login(email, senha) {
        try {
            const response = await this.post('/auth/login', { email, senha });
            
            if (response.success) {
                this.token = response.token;
                this.user = response.data;
                
                // Save to localStorage
                Utils.storage.set('auth_token', this.token);
                Utils.storage.set('current_user', this.user);
                
                return response;
            }
            
            throw new Error(response.error || 'Erro no login');
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await this.post('/auth/register', userData);
            
            if (response.success) {
                // Auto login after registration
                return await this.login(userData.email, userData.senha);
            }
            
            throw new Error(response.error || 'Erro no cadastro');
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        Utils.storage.remove('auth_token');
        Utils.storage.remove('current_user');
        window.location.href = '/auth';
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    // ===== TAREFAS =====
    async getTasks(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.get(`/tarefas?${params}`);
    }

    async getTask(id) {
        return this.get(`/tarefas/${id}`);
    }

    async createTask(taskData) {
        return this.post('/tarefas', taskData);
    }

    async updateTask(id, taskData) {
        return this.put(`/tarefas/${id}`, taskData);
    }

    async deleteTask(id) {
        return this.delete(`/tarefas/${id}`);
    }

    async markTaskAsCompleted(id) {
        return this.patch(`/tarefas/${id}/complete`, {});
    }

    async getTasksByStatus(status) {
        return this.get(`/tarefas/status/${status}`);
    }

    async getTasksByPriority(priority) {
        return this.get(`/tarefas/priority/${priority}`);
    }

    async getUpcomingTasks(days = 7) {
        return this.get(`/tarefas/upcoming?days=${days}`);
    }

    async getTaskStats() {
        return this.get('/tarefas/stats/summary');
    }

    // ===== CATEGORIAS =====
    async getCategories() {
        return this.get('/categories');
    }

    async getCategory(id) {
        return this.get(`/categories/${id}`);
    }

    async createCategory(categoryData) {
        return this.post('/categories', categoryData);
    }

    async updateCategory(id, categoryData) {
        return this.put(`/categories/${id}`, categoryData);
    }

    async deleteCategory(id) {
        return this.delete(`/categories/${id}`);
    }

    async getMostUsedCategories(limit = 5) {
        return this.get(`/categories/most-used?limit=${limit}`);
    }

    async searchCategories(query) {
        return this.get(`/categories/search?q=${encodeURIComponent(query)}`);
    }

    async getCategoryStats() {
        return this.get('/categories/stats');
    }

    async getAvailableColors() {
        return this.get('/categories/colors');
    }

    // ===== TAGS =====
    async getTags() {
        return this.get('/tags');
    }

    async getTag(id) {
        return this.get(`/tags/${id}`);
    }

    async createTag(tagData) {
        return this.post('/tags', tagData);
    }

    async updateTag(id, tagData) {
        return this.put(`/tags/${id}`, tagData);
    }

    async deleteTag(id) {
        return this.delete(`/tags/${id}`);
    }

    async getTagsByTask(taskId) {
        return this.get(`/tasks/${taskId}/tags`);
    }

    async addTagsToTask(taskId, tagIds) {
        return this.post(`/tasks/${taskId}/tags`, { tagIds });
    }

    async removeTagFromTask(taskId, tagId) {
        return this.delete(`/tasks/${taskId}/tags/${tagId}`);
    }

    async getMostUsedTags(limit = 10) {
        return this.get(`/tags/most-used?limit=${limit}`);
    }

    async searchTags(query) {
        return this.get(`/tags/search?q=${encodeURIComponent(query)}`);
    }

    async getTagStats() {
        return this.get('/tags/stats');
    }

    // ===== CHECKLISTS =====
    async getTaskChecklist(taskId) {
        return this.get(`/tasks/${taskId}/checklist`);
    }

    async createChecklistItem(taskId, itemData) {
        return this.post(`/tasks/${taskId}/checklist`, itemData);
    }

    async updateChecklistItem(itemId, itemData) {
        return this.put(`/checklist/${itemId}`, itemData);
    }

    async toggleChecklistItem(itemId, completed) {
        return this.patch(`/checklist/${itemId}/toggle`, { completed });
    }

    async deleteChecklistItem(itemId) {
        return this.delete(`/checklist/${itemId}`);
    }

    async reorderChecklist(taskId, itemsOrder) {
        return this.post(`/tasks/${taskId}/checklist/reorder`, { itemsOrder });
    }

    async getTaskChecklistStats(taskId) {
        return this.get(`/tasks/${taskId}/checklist/stats`);
    }

    async markAllChecklistItems(taskId, completed) {
        return this.patch(`/tasks/${taskId}/checklist/mark-all`, { completed });
    }

    // ===== ANOTAÇÕES =====
    async getTaskNotes(taskId) {
        return this.get(`/tasks/${taskId}/anotacoes`);
    }

    async createNote(taskId, noteData) {
        return this.post(`/tasks/${taskId}/anotacoes`, noteData);
    }

    async updateNote(noteId, noteData) {
        return this.put(`/anotacoes/${noteId}`, noteData);
    }

    async deleteNote(noteId) {
        return this.delete(`/anotacoes/${noteId}`);
    }

    async getUserNotes(limit = 50) {
        return this.get(`/anotacoes/user?limit=${limit}`);
    }

    async searchNotes(query) {
        return this.get(`/anotacoes/search?q=${encodeURIComponent(query)}`);
    }

    async getRecentNotes(limit = 10) {
        return this.get(`/anotacoes/recent?limit=${limit}`);
    }

    async getNoteStats() {
        return this.get('/anotacoes/stats');
    }

    // ===== USUÁRIOS =====
    async getUsers() {
        return this.get('/users');
    }

    async getUser(id) {
        return this.get(`/users/${id}`);
    }

    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    async updatePassword(id, newPassword) {
        return this.patch(`/users/${id}/password`, { novaSenha: newPassword });
    }

    async getUserStats(id) {
        return this.get(`/users/${id}/stats`);
    }
}

// Create global API instance
window.API = new APIClient();
