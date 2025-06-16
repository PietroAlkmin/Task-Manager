/* =====================================================
   TASK-IT! - COMPONENTES JAVASCRIPT
   Toast, Modal, Dropdown e outros componentes
   ===================================================== */

// ===== TOAST NOTIFICATIONS =====
class Toast {
    static show(message, type = 'info', duration = 5000) {
        const container = DOM.$('toast-container') || this.createContainer();
        const toast = this.createToast(message, type);
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);
        
        return toast;
    }
    
    static createContainer() {
        const container = DOM.create('div', {
            id: 'toast-container',
            className: 'toast-container'
        });
        document.body.appendChild(container);
        return container;
    }
    
    static createToast(message, type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };
        
        const toast = DOM.create('div', {
            className: `toast ${type}`
        });
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${titles[type] || titles.info}</div>
                <div class="toast-message">${Utils.sanitizeHTML(message)}</div>
            </div>
            <button class="toast-close" onclick="Toast.remove(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return toast;
    }
    
    static remove(toast) {
        if (toast && toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }
    }
    
    static success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    static error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    static warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    static info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// ===== MODAL COMPONENT =====
class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            size: 'medium', // small, medium, large
            closable: true,
            backdrop: true,
            ...options
        };
        
        this.element = null;
        this.overlay = null;
        this.isOpen = false;
    }
    
    create() {
        // Create overlay
        this.overlay = DOM.create('div', {
            className: 'modal-overlay'
        });
        
        // Create modal
        this.element = DOM.create('div', {
            className: `modal modal-${this.options.size}`
        });
        
        // Modal content
        this.element.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${this.options.title}</h3>
                ${this.options.closable ? '<button class="modal-close"><i class="fas fa-times"></i></button>' : ''}
            </div>
            <div class="modal-body">
                ${this.options.content}
            </div>
            ${this.options.footer ? `<div class="modal-footer">${this.options.footer}</div>` : ''}
        `;
        
        this.overlay.appendChild(this.element);
        
        // Bind events
        this.bindEvents();
        
        return this;
    }
    
    bindEvents() {
        // Close button
        const closeBtn = this.element.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Backdrop click
        if (this.options.backdrop) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    open() {
        if (!this.element) {
            this.create();
        }
        
        const container = DOM.$('modals-container') || this.createContainer();
        container.appendChild(this.overlay);
        
        // Show modal
        setTimeout(() => {
            this.overlay.classList.add('active');
            this.isOpen = true;
        }, 10);
        
        return this;
    }
    
    close() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            this.isOpen = false;
            
            setTimeout(() => {
                if (this.overlay && this.overlay.parentElement) {
                    this.overlay.parentElement.removeChild(this.overlay);
                }
            }, 300);
        }
        
        return this;
    }
    
    setTitle(title) {
        const titleElement = this.element?.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        return this;
    }
    
    setContent(content) {
        const bodyElement = this.element?.querySelector('.modal-body');
        if (bodyElement) {
            bodyElement.innerHTML = content;
        }
        return this;
    }
    
    createContainer() {
        const container = DOM.create('div', {
            id: 'modals-container'
        });
        document.body.appendChild(container);
        return container;
    }
    
    static confirm(message, title = 'Confirmação') {
        return new Promise((resolve) => {
            const modal = new Modal({
                title: title,
                content: `<p>${Utils.sanitizeHTML(message)}</p>`,
                footer: `
                    <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').modal.resolve(false)">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').modal.resolve(true)">
                        Confirmar
                    </button>
                `
            }).open();
            
            modal.overlay.modal = {
                resolve: (result) => {
                    modal.close();
                    resolve(result);
                }
            };
        });
    }
    
    static alert(message, title = 'Aviso') {
        return new Promise((resolve) => {
            const modal = new Modal({
                title: title,
                content: `<p>${Utils.sanitizeHTML(message)}</p>`,
                footer: `
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').modal.resolve()">
                        OK
                    </button>
                `
            }).open();
            
            modal.overlay.modal = {
                resolve: () => {
                    modal.close();
                    resolve();
                }
            };
        });
    }
}

// ===== DROPDOWN COMPONENT =====
class Dropdown {
    constructor(trigger, options = {}) {
        this.trigger = typeof trigger === 'string' ? DOM.find(trigger) : trigger;
        this.options = {
            placement: 'bottom-start',
            offset: 8,
            ...options
        };
        
        this.dropdown = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.trigger) return;
        
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        // Close on outside click
        document.addEventListener('click', () => {
            if (this.isOpen) {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (!this.dropdown) {
            this.createDropdown();
        }
        
        this.dropdown.classList.add('active');
        this.isOpen = true;
        this.position();
    }
    
    close() {
        if (this.dropdown) {
            this.dropdown.classList.remove('active');
            this.isOpen = false;
        }
    }
    
    createDropdown() {
        this.dropdown = DOM.create('div', {
            className: 'dropdown-menu'
        });
        
        if (this.options.content) {
            this.dropdown.innerHTML = this.options.content;
        }
        
        document.body.appendChild(this.dropdown);
    }
    
    position() {
        if (!this.dropdown || !this.trigger) return;
        
        const triggerRect = this.trigger.getBoundingClientRect();
        const dropdownRect = this.dropdown.getBoundingClientRect();
        
        let top = triggerRect.bottom + this.options.offset;
        let left = triggerRect.left;
        
        // Adjust if dropdown goes off screen
        if (left + dropdownRect.width > window.innerWidth) {
            left = triggerRect.right - dropdownRect.width;
        }
        
        if (top + dropdownRect.height > window.innerHeight) {
            top = triggerRect.top - dropdownRect.height - this.options.offset;
        }
        
        this.dropdown.style.position = 'fixed';
        this.dropdown.style.top = `${top}px`;
        this.dropdown.style.left = `${left}px`;
        this.dropdown.style.zIndex = '1000';
    }
}

// ===== LOADING COMPONENT =====
class Loading {
    static show(message = 'Carregando...') {
        const existing = DOM.$('loading-spinner');
        if (existing) {
            existing.classList.remove('hidden');
            const text = existing.querySelector('p');
            if (text) text.textContent = message;
            return;
        }
        
        const loading = DOM.create('div', {
            id: 'loading-spinner',
            className: 'loading-spinner'
        });
        
        loading.innerHTML = `
            <div class="spinner"></div>
            <p>${Utils.sanitizeHTML(message)}</p>
        `;
        
        document.body.appendChild(loading);
    }
    
    static hide() {
        const loading = DOM.$('loading-spinner');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
}

// ===== TABS COMPONENT =====
class Tabs {
    constructor(container) {
        this.container = typeof container === 'string' ? DOM.find(container) : container;
        this.tabs = [];
        this.activeTab = null;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        const tabButtons = this.container.querySelectorAll('[data-tab]');
        const tabPanes = this.container.querySelectorAll('[data-tab-pane]');
        
        tabButtons.forEach((button, index) => {
            const tabId = button.dataset.tab;
            const pane = this.container.querySelector(`[data-tab-pane="${tabId}"]`);
            
            this.tabs.push({ button, pane, id: tabId });
            
            button.addEventListener('click', () => {
                this.setActive(tabId);
            });
            
            // Set first tab as active
            if (index === 0) {
                this.setActive(tabId);
            }
        });
    }
    
    setActive(tabId) {
        this.tabs.forEach(tab => {
            if (tab.id === tabId) {
                tab.button.classList.add('active');
                if (tab.pane) tab.pane.classList.add('active');
                this.activeTab = tab;
            } else {
                tab.button.classList.remove('active');
                if (tab.pane) tab.pane.classList.remove('active');
            }
        });
    }
}

// Make components globally available
window.Toast = Toast;
window.Modal = Modal;
window.Dropdown = Dropdown;
window.Loading = Loading;
window.Tabs = Tabs;
