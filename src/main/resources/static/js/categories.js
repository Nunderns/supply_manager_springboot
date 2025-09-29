let categories = [];
let products = [];
let editingCategoryId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadProducts();
    
    // Form submit event
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategory();
    });
});

// Carregar categorias
async function loadCategories() {
    try {
        showLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Erro ao carregar categorias');
        
        categories = await response.json();
        renderCategories();
        updateStats();
        showLoading(false);
    } catch (error) {
        showError('Erro ao carregar categorias: ' + error.message);
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

// Renderizar categorias na tabela
function renderCategories(categoriesToRender = categories) {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '';
    
    if (categoriesToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">Nenhuma categoria encontrada</td></tr>';
        return;
    }
    
    categoriesToRender.forEach(category => {
        const row = document.createElement('tr');
        const productCount = getProductCountByCategory(category.id);
        
        row.innerHTML = `
            <td>${category.id}</td>
            <td><strong>${category.name}</strong></td>
            <td>${category.description || '-'}</td>
            <td><span class="badge bg-primary">${productCount}</span></td>
            <td>${formatDate(category.createdAt)}</td>
            <td>
                <button class="btn btn-warning" onclick="editCategory(${category.id})" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteCategory(${category.id})" style="padding: 5px 10px; font-size: 12px;" ${productCount > 0 ? 'disabled title="Categoria possui produtos vinculados"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('categoriesTable').style.display = 'table';
}

// Obter contagem de produtos por categoria
function getProductCountByCategory(categoryId) {
    return products.filter(product => product.categoryId === categoryId).length;
}

// Atualizar estatísticas
function updateStats() {
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalProducts').textContent = products.length;
}

// Abrir modal para nova categoria
function openModal() {
    editingCategoryId = null;
    document.getElementById('modalTitle').textContent = 'Nova Categoria';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').style.display = 'block';
}

// Editar categoria
async function editCategory(id) {
    try {
        const response = await fetch(`/api/categories/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar categoria');
        
        const category = await response.json();
        editingCategoryId = id;
        
        document.getElementById('modalTitle').textContent = 'Editar Categoria';
        document.getElementById('name').value = category.name;
        document.getElementById('description').value = category.description || '';
        
        document.getElementById('categoryModal').style.display = 'block';
    } catch (error) {
        showError('Erro ao carregar categoria: ' + error.message);
    }
}

// Salvar categoria
async function saveCategory() {
    try {
        const formData = new FormData(document.getElementById('categoryForm'));
        const categoryData = {
            name: formData.get('name'),
            description: formData.get('description')
        };
        
        // Validação básica
        if (!categoryData.name || category.name.trim() === '') {
            showError('Nome da categoria é obrigatório');
            return;
        }
        
        const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories';
        const method = editingCategoryId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) throw new Error('Erro ao salvar categoria');
        
        closeModal();
        await loadCategories();
        showSuccess(editingCategoryId ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
    } catch (error) {
        showError('Erro ao salvar categoria: ' + error.message);
    }
}

// Deletar categoria
async function deleteCategory(id) {
    const productCount = getProductCountByCategory(id);
    if (productCount > 0) {
        showError('Não é possível deletar esta categoria pois existem produtos vinculados a ela.');
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar categoria');
        
        await loadCategories();
        showSuccess('Categoria deletada com sucesso!');
    } catch (error) {
        showError('Erro ao deletar categoria: ' + error.message);
    }
}

// Buscar categorias
function searchCategories() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        renderCategories();
        return;
    }
    
    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm) ||
        (category.description && category.description.toLowerCase().includes(searchTerm))
    );
    
    renderCategories(filteredCategories);
}

// Fechar modal
function closeModal() {
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
    editingCategoryId = null;
}

// Mostrar loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('categoriesTable').style.display = show ? 'none' : 'table';
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
    const modal = document.getElementById('categoryModal');
    if (event.target === modal) {
        closeModal();
    }
}
