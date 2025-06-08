/* =====================================================
   TASK-IT! - AUTENTICAÇÃO JAVASCRIPT
   Gerenciamento de login, cadastro e autenticação
   ===================================================== */

class AuthManager {
    constructor() {
        this.currentForm = 'login';
        this.isLoading = false;
    }

    // ===== INICIALIZAÇÃO =====
    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.hideLoading();
    }

    // ===== EVENTOS =====
    bindEvents() {
        // Form submissions
        const loginForm = DOM.$('loginForm');
        const registerForm = DOM.$('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        // Email validation
        const emailInputs = DOM.findAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        // Password validation
        const passwordInputs = DOM.findAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('blur', () => this.validatePassword(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        // Confirm password validation
        const confirmPassword = DOM.$('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => this.validateConfirmPassword());
            confirmPassword.addEventListener('input', () => this.clearError(confirmPassword));
        }

        // Name validation
        const nameInput = DOM.$('registerName');
        if (nameInput) {
            nameInput.addEventListener('blur', () => this.validateName(nameInput));
            nameInput.addEventListener('input', () => this.clearError(nameInput));
        }
    }

    // ===== VALIDAÇÕES =====
    validateEmail(input) {
        const email = input.value.trim();
        const errorElement = DOM.$(input.id + 'Error');

        if (!email) {
            this.showError(errorElement, 'Email é obrigatório');
            return false;
        }

        if (!Utils.isValidEmail(email)) {
            this.showError(errorElement, 'Email inválido');
            return false;
        }

        this.clearError(input);
        return true;
    }

    validatePassword(input) {
        const password = input.value;
        const errorElement = DOM.$(input.id + 'Error');

        if (!password) {
            this.showError(errorElement, 'Senha é obrigatória');
            return false;
        }

        if (input.id === 'registerPassword' && password.length < 6) {
            this.showError(errorElement, 'Senha deve ter pelo menos 6 caracteres');
            return false;
        }

        this.clearError(input);
        return true;
    }

    validateConfirmPassword() {
        const password = DOM.$('registerPassword').value;
        const confirmPassword = DOM.$('confirmPassword').value;
        const errorElement = DOM.$('confirmPasswordError');

        if (!confirmPassword) {
            this.showError(errorElement, 'Confirmação de senha é obrigatória');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError(errorElement, 'Senhas não coincidem');
            return false;
        }

        this.clearError(DOM.$('confirmPassword'));
        return true;
    }

    validateName(input) {
        const name = input.value.trim();
        const errorElement = DOM.$(input.id + 'Error');

        if (!name) {
            this.showError(errorElement, 'Nome é obrigatório');
            return false;
        }

        if (name.length < 2) {
            this.showError(errorElement, 'Nome deve ter pelo menos 2 caracteres');
            return false;
        }

        this.clearError(input);
        return true;
    }

    showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError(input) {
        const errorElement = DOM.$(input.id + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    // ===== MANIPULAÇÃO DE FORMULÁRIOS =====
    async handleLogin(e) {
        e.preventDefault();

        if (this.isLoading) return;

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        console.log('handleLogin - FormData capturado:', { email, password });
        console.log('handleLogin - Todos os dados do form:', Object.fromEntries(formData));

        // Fallback: pegar diretamente dos inputs se FormData falhar
        const emailInput = DOM.$('loginEmail');
        const passwordInput = DOM.$('loginPassword');

        const emailValue = email || emailInput.value;
        const passwordValue = password || passwordInput.value;

        console.log('handleLogin - Valores finais:', { emailValue, passwordValue });

        // Validação simplificada para debug
        if (!emailValue || !passwordValue) {
            console.log('handleLogin - Email ou senha vazios');
            this.showToast('Por favor, preencha email e senha', 'error');
            return;
        }

        console.log('handleLogin - Validação passou, prosseguindo...');

        try {
            this.showLoading();

            console.log('Tentando fazer login com:', emailValue, passwordValue);
            const response = await API.login(emailValue, passwordValue);
            console.log('Resposta do login:', response);

            if (response.success) {
                this.showToast('Login realizado com sucesso!', 'success');

                console.log('Login bem-sucedido, redirecionando...');

                // Force redirect to dashboard
                this.redirectToDashboard();
            } else {
                throw new Error(response.error || 'Falha no login');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message || 'Erro no login', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const formData = new FormData(e.target);
        const userData = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            senha: formData.get('senha')
        };

        // Validate all inputs
        const nameInput = DOM.$('registerName');
        const emailInput = DOM.$('registerEmail');
        const passwordInput = DOM.$('registerPassword');

        let isValid = true;
        isValid = this.validateName(nameInput) && isValid;
        isValid = this.validateEmail(emailInput) && isValid;
        isValid = this.validatePassword(passwordInput) && isValid;
        isValid = this.validateConfirmPassword() && isValid;

        if (!isValid) return;

        try {
            this.showLoading();
            
            const response = await API.register(userData);
            
            if (response.success) {
                this.showToast('Conta criada com sucesso!', 'success');

                // Redirect to dashboard
                this.redirectToDashboard();
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showToast(error.message || 'Erro no cadastro', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // ===== NAVEGAÇÃO ENTRE FORMULÁRIOS =====
    switchToRegister() {
        this.switchForm('register');
    }

    switchToLogin() {
        this.switchForm('login');
    }

    switchForm(formType) {
        const loginForm = DOM.$('login-form');
        const registerForm = DOM.$('register-form');

        if (formType === 'register') {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
            this.currentForm = 'register';
        } else {
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
            this.currentForm = 'login';
        }

        // Clear all errors
        const errorElements = DOM.findAll('.form-error');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    // ===== UTILITÁRIOS =====
    checkAuthStatus() {
        // If already authenticated, redirect to dashboard
        if (API.isAuthenticated()) {
            window.location.href = '/';
        }
    }

    showLoading() {
        this.isLoading = true;
        const spinner = DOM.$('loading-spinner');
        if (spinner) {
            spinner.classList.remove('hidden');
        }
    }

    hideLoading() {
        this.isLoading = false;
        const spinner = DOM.$('loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        if (window.Toast) {
            Toast.show(message, type);
        } else {
            // Fallback alert
            alert(message);
        }
    }

    redirectToDashboard() {
        console.log('redirectToDashboard chamado');

        // Disable auth checking temporarily
        window.skipAuthCheck = true;

        // Force immediate redirect
        console.log('Redirecionando imediatamente...');
        window.location.href = '/';
    }
}

// ===== FUNÇÕES GLOBAIS =====
function switchToLogin() {
    if (window.authManager) {
        window.authManager.switchToLogin();
    }
}

function switchToRegister() {
    if (window.authManager) {
        window.authManager.switchToRegister();
    }
}

function togglePassword(inputId) {
    const input = DOM.$(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize auth manager
window.authManager = new AuthManager();

// Make AuthManager globally available
window.AuthManager = AuthManager;
