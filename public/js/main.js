/* =====================================================
   TASK-IT! - JAVASCRIPT PRINCIPAL
   Inicialização e funcionalidades globais
   ===================================================== */

// ===== INICIALIZAÇÃO GLOBAL =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global components
    initializeGlobalComponents();
    
    // Setup global event listeners
    setupGlobalEventListeners();
    
    // Check authentication for protected pages
    checkAuthentication();
    
    // Initialize page-specific functionality
    initializePageSpecific();
});

// ===== COMPONENTES GLOBAIS =====
function initializeGlobalComponents() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize dropdowns
    initializeDropdowns();
    
    // Initialize modals
    initializeModals();
    
    // Setup theme
    initializeTheme();
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        // Simple tooltip implementation
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const title = element.getAttribute('title');
    
    if (!title) return;
    
    // Remove title to prevent default tooltip
    element.setAttribute('data-original-title', title);
    element.removeAttribute('title');
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = title;
    tooltip.style.position = 'absolute';
    tooltip.style.background = '#333';
    tooltip.style.color = 'white';
    tooltip.style.padding = '4px 8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '10000';
    tooltip.style.pointerEvents = 'none';
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    element._tooltip = tooltip;
}

function hideTooltip(event) {
    const element = event.target;
    const originalTitle = element.getAttribute('data-original-title');
    
    if (originalTitle) {
        element.setAttribute('title', originalTitle);
        element.removeAttribute('data-original-title');
    }
    
    if (element._tooltip) {
        document.body.removeChild(element._tooltip);
        delete element._tooltip;
    }
}

function initializeDropdowns() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.dropdown-menu.active');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target) && !event.target.closest('[data-dropdown]')) {
                dropdown.classList.remove('active');
            }
        });
    });
}

function initializeModals() {
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal-overlay.active');
            activeModals.forEach(modal => {
                const closeBtn = modal.querySelector('.modal-close');
                if (closeBtn) closeBtn.click();
            });
        }
    });
}

function initializeTheme() {
    // Load saved theme
    const savedTheme = Utils.storage.get('theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle if exists
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
        themeToggle.addEventListener('change', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    Utils.storage.set('theme', newTheme);
    
    Toast.info(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`);
}

// ===== EVENT LISTENERS GLOBAIS =====
function setupGlobalEventListeners() {
    // Handle form submissions
    document.addEventListener('submit', handleFormSubmission);
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Handle network status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Handle page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function handleFormSubmission(event) {
    const form = event.target;
    
    // Add loading state to submit buttons
    if (form.tagName === 'FORM') {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && !submitBtn.disabled) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            submitBtn.disabled = true;
            
            // Restore button after 5 seconds (fallback)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 5000);
        }
    }
}

function handleKeyboardShortcuts(event) {
    // Global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case '/':
                event.preventDefault();
                focusSearch();
                break;
            case 'k':
                event.preventDefault();
                focusSearch();
                break;
        }
    }
    
    // Escape key handlers
    if (event.key === 'Escape') {
        // Close any open panels
        closeAllPanels();
    }
}

function focusSearch() {
    const searchInput = document.querySelector('#searchInput, [data-search]');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function closeAllPanels() {
    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
    
    // Close notifications panel
    const notificationsPanel = document.getElementById('notificationsPanel');
    if (notificationsPanel) {
        notificationsPanel.classList.remove('active');
    }
    
    // Close profile menu
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
        profileMenu.classList.remove('active');
    }
}

function handleOnline() {
    Toast.success('Conexão restaurada');
    // Sync any pending changes
    syncPendingChanges();
}

function handleOffline() {
    Toast.warning('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
}

function handleVisibilityChange() {
    if (!document.hidden) {
        // Page became visible, refresh data if needed
        refreshDataIfNeeded();
    }
}

// ===== AUTENTICAÇÃO =====
function checkAuthentication() {
    // Skip auth check if explicitly disabled
    if (window.skipAuthCheck) {
        console.log('checkAuthentication - pulando verificação (skipAuthCheck=true)');
        return true;
    }

    const protectedPaths = ['/', '/dashboard', '/calendar', '/tasks'];
    const currentPath = window.location.pathname;

    console.log('checkAuthentication - currentPath:', currentPath);
    console.log('checkAuthentication - isAuthenticated:', API.isAuthenticated());

    // Check if current page requires authentication
    const isProtectedPage = protectedPaths.some(path =>
        currentPath === path || currentPath.startsWith(path + '/')
    );

    console.log('checkAuthentication - isProtectedPage:', isProtectedPage);

    if (isProtectedPage && !API.isAuthenticated()) {
        console.log('Redirecionando para /auth - usuário não autenticado');
        // Redirect to auth page
        window.location.href = '/auth';
        return false;
    }

    // If on auth page and already authenticated, redirect to dashboard
    // BUT only if not explicitly staying on auth page
    if (currentPath === '/auth' && API.isAuthenticated() && !window.stayOnAuthPage) {
        console.log('Redirecionando para / - usuário já autenticado');

        // Add a small delay to allow user to see the page and potentially clear auth
        setTimeout(() => {
            if (!window.stayOnAuthPage) {
                window.location.href = '/';
            }
        }, 1000);
        return false;
    }

    console.log('checkAuthentication - tudo ok, continuando');
    return true;
}

// ===== INICIALIZAÇÃO ESPECÍFICA DA PÁGINA =====
function initializePageSpecific() {
    const path = window.location.pathname;
    
    switch (path) {
        case '/':
        case '/dashboard':
            // Dashboard initialization is handled in dashboard.js
            break;
        case '/auth':
            // Auth initialization is handled in auth.js
            break;
        case '/calendar':
            // Calendar initialization will be handled in calendar.js
            break;
        default:
            if (path.startsWith('/tasks/')) {
                // Task-specific initialization
                initializeTaskPages();
            }
            break;
    }
}

function initializeTaskPages() {
    // Common task page functionality
    console.log('Initializing task pages');
}

// ===== UTILITÁRIOS GLOBAIS =====
function syncPendingChanges() {
    // Implement offline sync functionality
    const pendingChanges = Utils.storage.get('pendingChanges', []);
    
    if (pendingChanges.length > 0) {
        console.log('Syncing pending changes:', pendingChanges);
        // Process pending changes
        Utils.storage.remove('pendingChanges');
    }
}

function refreshDataIfNeeded() {
    const lastRefresh = Utils.storage.get('lastRefresh', 0);
    const now = Date.now();
    const refreshInterval = 5 * 60 * 1000; // 5 minutes
    
    if (now - lastRefresh > refreshInterval) {
        // Refresh data if page has been hidden for more than 5 minutes
        if (window.dashboard && typeof window.dashboard.refreshData === 'function') {
            window.dashboard.refreshData();
        }
        Utils.storage.set('lastRefresh', now);
    }
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Don't show error toast for network errors or script loading errors
    if (event.error && !event.error.message.includes('Loading')) {
        Toast.error('Ocorreu um erro inesperado. Tente recarregar a página.');
    }
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Handle API errors gracefully
    if (event.reason && event.reason.message) {
        Toast.error(event.reason.message);
    }
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }
        }, 0);
    });
}

// ===== EXPORT GLOBAL FUNCTIONS =====
window.TaskIt = {
    toggleTheme,
    focusSearch,
    closeAllPanels,
    checkAuthentication,
    refreshDataIfNeeded
};
