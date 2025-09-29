let products = [];
let categories = [];
let suppliers = [];
let editingProductId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCategories();
    loadSuppliers();
    
    // Form submit event
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
});

// Carregar produtos
async function loadProducts() {
    try {
        showLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        products = await response.json();
        renderProducts();
        showLoading(false);
    } catch (error) {
        showError('Erro ao carregar produtos: ' + error.message);
        showLoading(false);
    }
}

// Carregar categorias
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Erro ao carregar categorias');
        
        categories = await response.json();
        populateCategorySelect();
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Carregar fornecedores
async function loadSuppliers() {
    try {
        const response = await fetch('/api/suppliers');
        if (!response.ok) throw new Error('Erro ao carregar fornecedores');
        
        suppliers = await response.json();
        populateSupplierSelect();
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
    }
}

// Renderizar produtos na tabela
function renderProducts(productsToRender = products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    if (productsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">Nenhum produto encontrado</td></tr>';
        return;
    }
    
    productsToRender.forEach(product => {
        const row = document.createElement('tr');
        
        const stockClass = getStockClass(product.stock);
        const categoryName = getCategoryName(product.categoryId);
        const supplierName = getSupplierName(product.supplierId);
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.description || '-'}</td>
            <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
            <td class="${stockClass}">${product.stock}</td>
            <td>${categoryName}</td>
            <td>${supplierName}</td>
            <td>
                <button class="btn btn-warning" onclick="editProduct(${product.id})" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})" style="padding: 5px 10px; font-size: 12px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('productsTable').style.display = 'table';
}

// Obter classe CSS para estoque
function getStockClass(stock) {
    if (stock <= 10) return 'stock-low';
    if (stock <= 50) return 'stock-medium';
    return 'stock-high';
}

// Obter nome da categoria
function getCategoryName(categoryId) {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '-';
}

// Obter nome do fornecedor
function getSupplierName(supplierId) {
    if (!supplierId) return '-';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : '-';
}

// Popular select de categorias
function populateCategorySelect() {
    const select = document.getElementById('categoryId');
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Popular select de fornecedores
function populateSupplierSelect() {
    const select = document.getElementById('supplierId');
    select.innerHTML = '<option value="">Selecione um fornecedor</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        select.appendChild(option);
    });
}

// Abrir modal para novo produto
function openModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Novo Produto';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'block';
}

// Editar produto
async function editProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar produto');
        
        const product = await response.json();
        editingProductId = id;
        
        document.getElementById('modalTitle').textContent = 'Editar Produto';
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description || '';
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock;
        document.getElementById('categoryId').value = product.categoryId || '';
        document.getElementById('supplierId').value = product.supplierId || '';
        
        document.getElementById('productModal').style.display = 'block';
    } catch (error) {
        showError('Erro ao carregar produto: ' + error.message);
    }
}

// Salvar produto
async function saveProduct() {
    try {
        const formData = new FormData(document.getElementById('productForm'));
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId')) : null,
            supplierId: formData.get('supplierId') ? parseInt(formData.get('supplierId')) : null
        };
        
        const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) throw new Error('Erro ao salvar produto');
        
        closeModal();
        await loadProducts();
        showSuccess(editingProductId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
    } catch (error) {
        showError('Erro ao salvar produto: ' + error.message);
    }
}

// Deletar produto
async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar produto');
        
        await loadProducts();
        showSuccess('Produto deletado com sucesso!');
    } catch (error) {
        showError('Erro ao deletar produto: ' + error.message);
    }
}

// Buscar produtos
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        renderProducts();
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    renderProducts(filteredProducts);
}

// Fechar modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
    editingProductId = null;
}

// Mostrar loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('productsTable').style.display = show ? 'none' : 'table';
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
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeModal();
    }
}
