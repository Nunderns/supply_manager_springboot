// Funções comuns para chamadas de API

// Configuração base da API
const API_BASE_URL = '';

// Função genérica para requisições HTTP
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(API_BASE_URL + url, mergedOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Funções utilitárias
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

// Validação de formulários
function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData.get(field);
        
        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`${rule.label || field} é obrigatório`);
            continue;
        }
        
        if (value && rule.minLength && value.length < rule.minLength) {
            errors.push(`${rule.label || field} deve ter no mínimo ${rule.minLength} caracteres`);
        }
        
        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${rule.label || field} deve ter no máximo ${rule.maxLength} caracteres`);
        }
        
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.label || field} formato inválido`);
        }
        
        if (value && rule.type === 'email' && !isValidEmail(value)) {
            errors.push(`${rule.label || field} deve ser um email válido`);
        }
        
        if (value && rule.type === 'number' && isNaN(value)) {
            errors.push(`${rule.label || field} deve ser um número válido`);
        }
    }
    
    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Funções de UI
function showLoading(elementId, show = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

function showAlert(elementId, message, type = 'info') {
    const alert = document.getElementById(elementId);
    if (alert) {
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.style.display = 'block';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }
}

function hideAlert(elementId) {
    const alert = document.getElementById(elementId);
    if (alert) {
        alert.style.display = 'none';
    }
}

// Funções de manipulação de tabelas
function clearTable(tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        tbody.innerHTML = '';
    }
}

function addTableRow(tableBodyId, rowData) {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = rowData;
        tbody.appendChild(row);
    }
}

function showNoDataRow(tableBodyId, colSpan, message = 'Nenhum registro encontrado') {
    const tbody = document.getElementById(tableBodyId);
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: #666;">${message}</td></tr>`;
    }
}

// Funções de modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Funções de confirmação
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Funções de busca e filtragem
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funções de exportação
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escapar aspas e adicionar aspas se necessário
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Funções de tratamento de erros
function handleApiError(error, customMessage = '') {
    console.error('API Error:', error);
    
    let message = customMessage || 'Ocorreu um erro na requisição';
    
    if (error.message) {
        message += ': ' + error.message;
    }
    
    // Aqui você pode adicionar lógica para mostrar o erro na UI
    alert(message);
    
    // Você também pode enviar o erro para um serviço de monitoramento
    // sendErrorToMonitoring(error);
}

// Funções de autenticação (se necessário)
function getToken() {
    return localStorage.getItem('authToken');
}

function setToken(token) {
    localStorage.setItem('authToken', token);
}

function removeToken() {
    localStorage.removeItem('authToken');
}

function isAuthenticated() {
    return !!getToken();
}

// Adicionar token de autenticação às requisições
function getAuthHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Funções de paginação
function createPagination(currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';
    
    let pagination = '<div class="pagination">';
    
    // Botão anterior
    if (currentPage > 1) {
        pagination += `<button onclick="onPageChange(${currentPage - 1})">Anterior</button>`;
    }
    
    // Números das páginas
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            pagination += `<button class="active">${i}</button>`;
        } else {
            pagination += `<button onclick="onPageChange(${i})">${i}</button>`;
        }
    }
    
    // Botão próximo
    if (currentPage < totalPages) {
        pagination += `<button onclick="onPageChange(${currentPage + 1})">Próximo</button>`;
    }
    
    pagination += '</div>';
    
    return pagination;
}
