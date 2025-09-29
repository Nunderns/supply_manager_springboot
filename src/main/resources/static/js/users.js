let users = [];
let editingUserId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    
    // Form submit event
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });
});

// Carregar usuários
async function loadUsers() {
    try {
        showLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Erro ao carregar usuários');
        
        users = await response.json();
        renderUsers();
        updateStats();
        showLoading(false);
    } catch (error) {
        showError('Erro ao carregar usuários: ' + error.message);
        showLoading(false);
    }
}

// Renderizar usuários na tabela
function renderUsers(usersToRender = users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (usersToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    usersToRender.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role.toLowerCase()}">${getRoleLabel(user.role)}</span></td>
            <td><span class="status-${user.status.toLowerCase()}">${user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button class="btn btn-warning" onclick="editUser(${user.id})" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})" style="padding: 5px 10px; font-size: 12px;" ${user.username === 'admin' ? 'disabled title="Não é possível deletar o usuário admin"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('usersTable').style.display = 'table';
}

// Obter label da função
function getRoleLabel(role) {
    switch (role) {
        case 'ADMIN':
            return 'Administrador';
        case 'USER':
            return 'Usuário';
        case 'MANAGER':
            return 'Gerente';
        default:
            return role;
    }
}

// Atualizar estatísticas
function updateStats() {
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('adminUsers').textContent = users.filter(u => u.role === 'ADMIN').length;
    document.getElementById('activeUsers').textContent = users.filter(u => u.status === 'ACTIVE').length;
}

// Abrir modal para novo usuário
function openModal() {
    editingUserId = null;
    document.getElementById('modalTitle').textContent = 'Novo Usuário';
    document.getElementById('userForm').reset();
    document.getElementById('status').value = 'ACTIVE';
    document.getElementById('userModal').style.display = 'block';
}

// Editar usuário
async function editUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar usuário');
        
        const user = await response.json();
        editingUserId = id;
        
        document.getElementById('modalTitle').textContent = 'Editar Usuário';
        document.getElementById('username').value = user.username;
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('password').value = ''; // Não mostra a senha atual
        document.getElementById('role').value = user.role;
        document.getElementById('status').value = user.status;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        
        document.getElementById('userModal').style.display = 'block';
    } catch (error) {
        showError('Erro ao carregar usuário: ' + error.message);
    }
}

// Salvar usuário
async function saveUser() {
    try {
        const formData = new FormData(document.getElementById('userForm'));
        const userData = {
            username: formData.get('username'),
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            status: formData.get('status'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };
        
        // Validação básica
        if (!userData.username || userData.username.trim() === '') {
            showError('Nome de usuário é obrigatório');
            return;
        }
        
        if (!userData.name || userData.name.trim() === '') {
            showError('Nome completo é obrigatório');
            return;
        }
        
        if (!userData.email || userData.email.trim() === '') {
            showError('Email é obrigatório');
            return;
        }
        
        if (!userData.role || userData.role.trim() === '') {
            showError('Função é obrigatória');
            return;
        }
        
        // Para edição, se a senha não foi informada, remove do objeto
        if (editingUserId && (!userData.password || userData.password.trim() === '')) {
            delete userData.password;
        } else if (!editingUserId && (!userData.password || userData.password.trim() === '')) {
            showError('Senha é obrigatória para novos usuários');
            return;
        }
        
        const url = editingUserId ? `/api/users/${editingUserId}` : '/api/users';
        const method = editingUserId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Erro ao salvar usuário');
        
        closeModal();
        await loadUsers();
        showSuccess(editingUserId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
    } catch (error) {
        showError('Erro ao salvar usuário: ' + error.message);
    }
}

// Deletar usuário
async function deleteUser(id) {
    const user = users.find(u => u.id === id);
    if (user && user.username === 'admin') {
        showError('Não é possível deletar o usuário admin.');
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar usuário');
        
        await loadUsers();
        showSuccess('Usuário deletado com sucesso!');
    } catch (error) {
        showError('Erro ao deletar usuário: ' + error.message);
    }
}

// Buscar usuários
function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        renderUsers();
        return;
    }
    
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        (user.phone && user.phone.toLowerCase().includes(searchTerm))
    );
    
    renderUsers(filteredUsers);
}

// Fechar modal
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
    editingUserId = null;
}

// Mostrar loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('usersTable').style.display = show ? 'none' : 'table';
}

// Mostrar sucesso
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// Mostrar erro
function showError(message) {
    const alert = document.getElementById('errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}
