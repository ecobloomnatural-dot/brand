// Admin Panel Functionality

let products = JSON.parse(localStorage.getItem('ecobloom_products')) || [];
let categories = JSON.parse(localStorage.getItem('ecobloom_categories')) || [
    { id: 'spices', name: 'Ceylon Spices' },
    { id: 'coconut', name: 'Coconut Products' },
    { id: 'tea', name: 'Tea & Herbs' },
    { id: 'oil', name: 'Essential Oils' },
    { id: 'handicraft', name: 'Handicrafts' }
];
let reviews = JSON.parse(localStorage.getItem('ecobloom_reviews')) || [];

let currentImages = [];
let editingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadAdminProducts();
    initEventListeners();
});

function initEventListeners() {
    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
}

function loadDashboardStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalReviews').textContent = reviews.length;
    
    // Calculate storage used
    const storage = new Blob([JSON.stringify(localStorage)]).size;
    const sizeInMB = (storage / (1024 * 1024)).toFixed(2);
    document.getElementById('storageUsed').textContent = sizeInMB + ' MB';
}

function loadAdminProducts() {
    const grid = document.getElementById('adminProductsGrid');
    const searchTerm = document.getElementById('adminSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    
    grid.innerHTML = '';
    
    let filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm) || 
                           p.description.toLowerCase().includes(searchTerm);
        const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });
    
    if (filtered.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
    } else {
        document.getElementById('emptyState').classList.add('hidden');
        
        filtered.forEach(product => {
            const card = createAdminProductCard(product);
            grid.appendChild(card);
        });
    }
}

function createAdminProductCard(product) {
    const div = document.createElement('div');
    div.className = 'admin-card group';
    
    const categoryName = categories.find(c => c.id === product.category)?.name || product.category;
    const mainImage = product.images?.[0] || 'https://via.placeholder.com/400';
    
    div.innerHTML = `
        <div class="flex gap-4">
            <img src="${mainImage}" class="w-24 h-24 object-cover rounded-lg" alt="${product.name}">
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="text-lg font-bold text-stone-900 dark:text-white truncate">${product.name}</h3>
                    ${product.featured ? '<span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Featured</span>' : ''}
                </div>
                <p class="text-sm text-emerald-600 font-semibold mb-1">$${product.price}</p>
                <p class="text-xs text-stone-500 mb-2">${categoryName}</p>
                <div class="flex items-center gap-2 text-xs text-stone-400">
                    <i class="fas fa-images"></i> ${product.images?.length || 0} photos
                    <span class="mx-1">•</span>
                    <i class="fas fa-star"></i> ${product.rating || 0} avg
                </div>
            </div>
        </div>
        <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 flex justify-end gap-2">
            <button onclick="viewProduct('${product.id}')" class="px-3 py-1.5 text-sm text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                <i class="fas fa-eye mr-1"></i>View
            </button>
            <button onclick="editProduct('${product.id}')" class="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                <i class="fas fa-edit mr-1"></i>Edit
            </button>
            <button onclick="deleteProduct('${product.id}')" class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                <i class="fas fa-trash mr-1"></i>Delete
            </button>
        </div>
    `;
    
    return div;
}

function openProductModal(productId = null) {
    editingProductId = productId;
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('imagePreviewGrid').innerHTML = '';
    currentImages = [];
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            title.textContent = 'Edit Product';
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productFeatured').checked = product.featured || false;
            
            if (product.images) {
                currentImages = [...product.images];
                renderImagePreviews();
            }
        }
    } else {
        title.textContent = 'Add New Product';
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    editingProductId = null;
}

function handleImageUpload(input) {
    const files = Array.from(input.files);
    
    if (currentImages.length + files.length > 5) {
        showToast('Maximum 5 images allowed', 'error');
        return;
    }
    
    files.forEach(file => {
        if (file.size > 2 * 1024 * 1024) {
            showToast(`${file.name} is too large (max 2MB)`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImages.push(e.target.result);
            renderImagePreviews();
        };
        reader.readAsDataURL(file);
    });
    
    input.value = '';
}

function renderImagePreviews() {
    const grid = document.getElementById('imagePreviewGrid');
    grid.innerHTML = '';
    
    currentImages.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'relative aspect-square group';
        div.innerHTML = `
            <img src="${img}" class="w-full h-full object-cover rounded-lg">
            <button type="button" onclick="removeImage(${index})" 
                class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <i class="fas fa-times text-xs"></i>
            </button>
            ${index === 0 ? '<span class="absolute bottom-1 left-1 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded">Main</span>' : ''}
        `;
        grid.appendChild(div);
    });
}

function removeImage(index) {
    currentImages.splice(index, 1);
    renderImagePreviews();
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (currentImages.length === 0) {
        showToast('Please add at least one image', 'error');
        return;
    }
    
    const productData = {
        id: editingProductId || Date.now().toString(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        images: currentImages,
        featured: document.getElementById('productFeatured').checked,
        rating: 0,
        reviews: [],
        createdAt: editingProductId ? products.find(p => p.id === editingProductId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = productData;
            showToast('Product updated successfully', 'success');
        }
    } else {
        products.push(productData);
        showToast('Product added successfully', 'success');
    }
    
    saveProducts();
    closeProductModal();
    loadAdminProducts();
    loadDashboardStats();
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    products = products.filter(p => p.id !== id);
    saveProducts();
    loadAdminProducts();
    loadDashboardStats();
    showToast('Product deleted successfully', 'success');
}

function editProduct(id) {
    openProductModal(id);
}

function viewProduct(id) {
    window.open(`index.html?view=${id}`, '_blank');
}

function saveProducts() {
    localStorage.setItem('ecobloom_products', JSON.stringify(products));
    
    // Dispatch storage event for cross-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'ecobloom_products',
        newValue: JSON.stringify(products)
    }));
}

function exportData() {
    const data = {
        products,
        categories,
        reviews,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecobloom-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully', 'success');
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.products) {
                products = data.products;
                localStorage.setItem('ecobloom_products', JSON.stringify(products));
            }
            if (data.categories) {
                categories = data.categories;
                localStorage.setItem('ecobloom_categories', JSON.stringify(categories));
            }
            if (data.reviews) {
                reviews = data.reviews;
                localStorage.setItem('ecobloom_reviews', JSON.stringify(reviews));
            }
            
            loadDashboardStats();
            loadAdminProducts();
            showToast('Data restored successfully', 'success');
        } catch (error) {
            showToast('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} text-xl"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});