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
            console.log('API.login chamado com:', { email, senha });

            // Simulate API call for demo
            if (email === 'pietro@inteli.edu.br' && senha === '123456') {
                console.log('Credenciais demo reconhecidas');

                const response = {
                    success: true,
                    token: 'demo_token_' + Date.now(),
                    data: {
                        id: 1,
                        nome: 'Pietro Alkmin',
                        email: 'pietro@inteli.edu.br'
                    }
                };

                this.token = response.token;
                this.user = response.data;

                // Save to localStorage
                Utils.storage.set('auth_token', this.token);
                Utils.storage.set('current_user', this.user);

                console.log('Login demo bem-sucedido:', response);
                return response;
            }

            // Try real API
            console.log('Tentando API real...');
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
            console.error('Erro na API.login:', error);

            // Se a API real falhar, mas as credenciais são demo, tente novamente
            if (email === 'pietro@inteli.edu.br' && senha === '123456') {
                console.log('API real falhou, usando credenciais demo');

                const response = {
                    success: true,
                    token: 'demo_token_' + Date.now(),
                    data: {
                        id: 1,
                        nome: 'Pietro Alkmin',
                        email: 'pietro@inteli.edu.br'
                    }
                };

                this.token = response.token;
                this.user = response.data;

                // Save to localStorage
                Utils.storage.set('auth_token', this.token);
                Utils.storage.set('current_user', this.user);

                return response;
            }

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
        // Check both memory and localStorage
        const hasToken = !!this.token || !!Utils.storage.get('auth_token');
        const hasUser = !!this.user || !!Utils.storage.get('current_user');

        console.log('isAuthenticated check:', {
            memoryToken: !!this.token,
            storageToken: !!Utils.storage.get('auth_token'),
            memoryUser: !!this.user,
            storageUser: !!Utils.storage.get('current_user'),
            result: hasToken && hasUser
        });

        // If we have data in storage but not in memory, restore it
        if (!this.token && Utils.storage.get('auth_token')) {
            this.token = Utils.storage.get('auth_token');
        }
        if (!this.user && Utils.storage.get('current_user')) {
            this.user = Utils.storage.get('current_user');
        }

        return hasToken && hasUser;
    }

    getCurrentUser() {
        return this.user;
    }

    // ===== TAREFAS =====
    async getTasks(filters = {}) {
        try {
            // Try real API first
            const params = new URLSearchParams(filters);
            return await this.get(`/tarefas?${params}`);
        } catch (error) {
            // Return demo data if API fails
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        title: 'Implementar Dashboard',
                        description: 'Criar dashboard principal com estatísticas e visualização de tarefas',
                        priority: 'alta',
                        status: 'em_andamento',
                        due_date: '2024-01-20',
                        category_name: 'Inteli',
                        category_color: '#8B3DFF',
                        created_at: '2024-01-15'
                    },
                    {
                        id: 2,
                        title: 'Estudar para Prova de Matemática',
                        description: 'Revisar cálculo diferencial e integral',
                        priority: 'alta',
                        status: 'pendente',
                        due_date: '2024-01-18',
                        category_name: 'Estudos',
                        category_color: '#FF6B6B',
                        created_at: '2024-01-14'
                    },
                    {
                        id: 3,
                        title: 'Teste FASE 1',
                        description: 'Completar testes da primeira fase do projeto',
                        priority: 'media',
                        status: 'concluida',
                        due_date: '2024-01-16',
                        category_name: 'Inteli',
                        category_color: '#8B3DFF',
                        created_at: '2024-01-13'
                    }
                ]
            };
        }
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
        try {
            return await this.get(`/tarefas/upcoming?days=${days}`);
        } catch (error) {
            // Return demo upcoming tasks if API fails
            return {
                success: true,
                data: [
                    {
                        id: 2,
                        title: 'Estudar para Prova de Matemática',
                        due_date: '2024-01-18',
                        priority: 'alta'
                    },
                    {
                        id: 1,
                        title: 'Implementar Dashboard',
                        due_date: '2024-01-20',
                        priority: 'alta'
                    }
                ]
            };
        }
    }

    async getTaskStats() {
        try {
            return await this.get('/tarefas/stats/summary');
        } catch (error) {
            // Return demo stats if API fails
            return {
                success: true,
                data: {
                    total: 7,
                    pendentes: 4,
                    em_andamento: 1,
                    concluidas: 2,
                    atrasadas: 1
                }
            };
        }
    }

    // ===== CATEGORIAS =====
    async getCategories() {
        try {
            return await this.get('/categories');
        } catch (error) {
            // Return demo categories if API fails
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        nome: 'Inteli',
                        cor: '#8B3DFF',
                        task_count: 3
                    },
                    {
                        id: 2,
                        nome: 'Estudos',
                        cor: '#FF6B6B',
                        task_count: 2
                    },
                    {
                        id: 3,
                        nome: 'Trabalho',
                        cor: '#4ECDC4',
                        task_count: 1
                    },
                    {
                        id: 4,
                        nome: 'Pessoal',
                        cor: '#45B7D1',
                        task_count: 1
                    }
                ]
            };
        }
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
        try {
            return await this.get('/tags');
        } catch (error) {
            // Return demo tags if API fails
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        nome: 'Urgente',
                        cor: '#FF3D3D'
                    },
                    {
                        id: 2,
                        nome: 'Importante',
                        cor: '#FFB930'
                    },
                    {
                        id: 3,
                        nome: 'Entrega',
                        cor: '#E74C3C'
                    },
                    {
                        id: 4,
                        nome: 'Revisão',
                        cor: '#3D8BFF'
                    }
                ]
            };
        }
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
