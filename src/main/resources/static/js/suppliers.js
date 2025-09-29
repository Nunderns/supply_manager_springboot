let suppliers = [];
let products = [];
let editingSupplierId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadSuppliers();
    loadProducts();
    
    // Form submit event
    document.getElementById('supplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSupplier();
    });
});

// Carregar fornecedores
async function loadSuppliers() {
    try {
        showLoading(true);
        const response = await fetch('/api/suppliers');
        if (!response.ok) throw new Error('Erro ao carregar fornecedores');
        
        suppliers = await response.json();
        renderSuppliers();
        updateStats();
        showLoading(false);
    } catch (error) {
        showError('Erro ao carregar fornecedores: ' + error.message);
        showLoading(false);
    }
}

// Carregar produtos para contagem
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        products = await response.json();
        updateStats();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Renderizar fornecedores na tabela
function renderSuppliers(suppliersToRender = suppliers) {
    const tbody = document.getElementById('suppliersTableBody');
    tbody.innerHTML = '';
    
    if (suppliersToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">Nenhum fornecedor encontrado</td></tr>';
        return;
    }
    
    suppliersToRender.forEach(supplier => {
        const row = document.createElement('tr');
        const productCount = getProductCountBySupplier(supplier.id);
        
        row.innerHTML = `
            <td>${supplier.id}</td>
            <td><strong>${supplier.name}</strong></td>
            <td>${supplier.contactPerson || '-'}</td>
            <td>${supplier.email}</td>
            <td>${supplier.phone}</td>
            <td><span class="status-${supplier.status.toLowerCase()}">${supplier.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span></td>
            <td>
                <button class="btn btn-warning" onclick="editSupplier(${supplier.id})" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteSupplier(${supplier.id})" style="padding: 5px 10px; font-size: 12px;" ${productCount > 0 ? 'disabled title="Fornecedor possui produtos vinculados"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('suppliersTable').style.display = 'table';
}

// Obter contagem de produtos por fornecedor
function getProductCountBySupplier(supplierId) {
    return products.filter(product => product.supplierId === supplierId).length;
}

// Atualizar estatísticas
function updateStats() {
    document.getElementById('totalSuppliers').textContent = suppliers.length;
    document.getElementById('activeSuppliers').textContent = suppliers.filter(s => s.status === 'ACTIVE').length;
    document.getElementById('totalProducts').textContent = products.length;
}

// Abrir modal para novo fornecedor
function openModal() {
    editingSupplierId = null;
    document.getElementById('modalTitle').textContent = 'Novo Fornecedor';
    document.getElementById('supplierForm').reset();
    document.getElementById('status').value = 'ACTIVE';
    document.getElementById('supplierModal').style.display = 'block';
}

// Editar fornecedor
async function editSupplier(id) {
    try {
        const response = await fetch(`/api/suppliers/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar fornecedor');
        
        const supplier = await response.json();
        editingSupplierId = id;
        
        document.getElementById('modalTitle').textContent = 'Editar Fornecedor';
        document.getElementById('name').value = supplier.name;
        document.getElementById('email').value = supplier.email;
        document.getElementById('phone').value = supplier.phone;
        document.getElementById('contactPerson').value = supplier.contactPerson || '';
        document.getElementById('cnpj').value = supplier.cnpj || '';
        document.getElementById('status').value = supplier.status;
        document.getElementById('address').value = supplier.address || '';
        document.getElementById('notes').value = supplier.notes || '';
        
        document.getElementById('supplierModal').style.display = 'block';
    } catch (error) {
        showError('Erro ao carregar fornecedor: ' + error.message);
    }
}

// Salvar fornecedor
async function saveSupplier() {
    try {
        const formData = new FormData(document.getElementById('supplierForm'));
        const supplierData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            contactPerson: formData.get('contactPerson'),
            cnpj: formData.get('cnpj'),
            status: formData.get('status'),
            address: formData.get('address'),
            notes: formData.get('notes')
        };
        
        // Validação básica
        if (!supplierData.name || supplierData.name.trim() === '') {
            showError('Nome do fornecedor é obrigatório');
            return;
        }
        
        if (!supplierData.email || supplierData.email.trim() === '') {
            showError('Email do fornecedor é obrigatório');
            return;
        }
        
        if (!supplierData.phone || supplierData.phone.trim() === '') {
            showError('Telefone do fornecedor é obrigatório');
            return;
        }
        
        const url = editingSupplierId ? `/api/suppliers/${editingSupplierId}` : '/api/suppliers';
        const method = editingSupplierId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(supplierData)
        });
        
        if (!response.ok) throw new Error('Erro ao salvar fornecedor');
        
        closeModal();
        await loadSuppliers();
        showSuccess(editingSupplierId ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!');
    } catch (error) {
        showError('Erro ao salvar fornecedor: ' + error.message);
    }
}

// Deletar fornecedor
async function deleteSupplier(id) {
    const productCount = getProductCountBySupplier(id);
    if (productCount > 0) {
        showError('Não é possível deletar este fornecedor pois existem produtos vinculados a ele.');
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar este fornecedor?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/suppliers/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar fornecedor');
        
        await loadSuppliers();
        showSuccess('Fornecedor deletado com sucesso!');
    } catch (error) {
        showError('Erro ao deletar fornecedor: ' + error.message);
    }
}

// Buscar fornecedores
function searchSuppliers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        renderSuppliers();
        return;
    }
    
    const filteredSuppliers = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.email.toLowerCase().includes(searchTerm) ||
        supplier.phone.toLowerCase().includes(searchTerm) ||
        (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm)) ||
        (supplier.cnpj && supplier.cnpj.toLowerCase().includes(searchTerm))
    );
    
    renderSuppliers(filteredSuppliers);
}

// Fechar modal
function closeModal() {
    document.getElementById('supplierModal').style.display = 'none';
    document.getElementById('supplierForm').reset();
    editingSupplierId = null;
}

// Mostrar loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('suppliersTable').style.display = show ? 'none' : 'table';
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
    const modal = document.getElementById('supplierModal');
    if (event.target === modal) {
        closeModal();
    }
}
