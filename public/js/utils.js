/* =====================================================
   TASK-IT! - UTILITÁRIOS JAVASCRIPT
   Funções auxiliares e utilitários
   ===================================================== */

// ===== UTILITÁRIOS GERAIS =====
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Format date
    formatDate(date, format = 'dd/mm/yyyy') {
        if (!date) return '';
        
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        switch (format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            case 'relative':
                return this.getRelativeTime(d);
            default:
                return d.toLocaleDateString('pt-BR');
        }
    },

    // Get relative time
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return days === 1 ? 'há 1 dia' : `há ${days} dias`;
        } else if (hours > 0) {
            return hours === 1 ? 'há 1 hora' : `há ${hours} horas`;
        } else if (minutes > 0) {
            return minutes === 1 ? 'há 1 minuto' : `há ${minutes} minutos`;
        } else {
            return 'agora mesmo';
        }
    },

    // Format time
    formatTime(date) {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Generate UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Sanitize HTML
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Truncate text
    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Get priority color
    getPriorityColor(priority) {
        const colors = {
            'alta': '#FF3D3D',
            'media': '#FFB930',
            'baixa': '#3D8BFF'
        };
        return colors[priority] || colors['media'];
    },

    // Get status color
    getStatusColor(status) {
        const colors = {
            'pendente': '#FFB930',
            'em_andamento': '#3D8BFF',
            'concluida': '#10AC84',
            'cancelada': '#FF3D3D'
        };
        return colors[status] || colors['pendente'];
    },

    // Format priority
    formatPriority(priority) {
        const priorities = {
            'alta': 'Alta',
            'media': 'Média',
            'baixa': 'Baixa'
        };
        return priorities[priority] || 'Média';
    },

    // Format status
    formatStatus(status) {
        const statuses = {
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'concluida': 'Concluída',
            'cancelada': 'Cancelada'
        };
        return statuses[status] || 'Pendente';
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    },

    // Download as JSON
    downloadJSON(data, filename = 'data.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Get query parameters
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Set query parameter
    setQueryParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    },

    // Remove query parameter
    removeQueryParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    },

    // Scroll to element
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Generate random color
    generateRandomColor() {
        const colors = [
            '#8B3DFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3',
            '#FF9F43', '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Error saving to localStorage:', e);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removing from localStorage:', e);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Error clearing localStorage:', e);
                return false;
            }
        }
    }
};

// ===== DOM UTILITIES =====
const DOM = {
    // Get element by ID
    $(id) {
        return document.getElementById(id);
    },

    // Query selector
    find(selector, parent = document) {
        return parent.querySelector(selector);
    },

    // Query selector all
    findAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

    // Create element
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    },

    // Add event listener
    on(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = this.find(element);
        }
        if (element) {
            element.addEventListener(event, handler, options);
        }
    },

    // Remove event listener
    off(element, event, handler) {
        if (typeof element === 'string') {
            element = this.find(element);
        }
        if (element) {
            element.removeEventListener(event, handler);
        }
    },

    // Add class
    addClass(element, className) {
        if (typeof element === 'string') {
            element = this.find(element);
        }
        if (element) {
            element.classList.add(className);
        }
    },

    // Remove class
    removeClass(element, className) {
        if (typeof element === 'string') {
            element = this.find(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    },

    // Toggle class
    toggleClass(element, className) {
        if (typeof element === 'string') {
            element = this.find(element);
        }
        if (element) {
            element.classList.toggle(className);
        }
    },

    // Has class
    hasClass(element, className) {
        if (typeof element === 'string') {
            element = this.find(element);
        }
        return element ? element.classList.contains(className) : false;
    }
};

// Make utilities globally available
window.Utils = Utils;
window.DOM = DOM;
