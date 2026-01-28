// ECO BLOOM Store Functionality

let storeProducts = [];
let wishlist = JSON.parse(localStorage.getItem('ecobloom_wishlist')) || [];
let cart = JSON.parse(localStorage.getItem('ecobloom_cart')) || [];
let currentCurrency = 'USD';
let currentProduct = null;

// Currency detection
function detectCurrency() {
    try {
        const userLang = navigator.language || 'en-US';
        const formatter = new Intl.NumberFormat(userLang, { style: 'currency', currency: 'USD' });
        const parts = formatter.formatToParts(0);
        const currencyPart = parts.find(p => p.type === 'currency');
        if (currencyPart && currencyPart.value !== '$') {
            // Keep USD as default but could implement conversion logic here
            currentCurrency = 'USD';
        }
    } catch (e) {
        currentCurrency = 'USD';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    detectCurrency();
    loadProducts();
    initEventListeners();
    renderWishlist();
    checkAdminStatus();
    
    // Check for product view query param
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('view');
    if (viewId) {
        openProductDetail(viewId);
    }
});

function initEventListeners() {
    // Search
    document.getElementById('searchInput')?.addEventListener('input', debounce(filterProducts, 300));
    document.getElementById('mobileSearchInput')?.addEventListener('input', debounce(filterProducts, 300));
    
    // Filters
    document.getElementById('categoryFilter')?.addEventListener('change', filterProducts);
    document.getElementById('sortFilter')?.addEventListener('change', filterProducts);
    
    // Dark mode
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
    document.getElementById('mobileDarkModeToggle')?.addEventListener('click', toggleDarkMode);
    
    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', toggleMobileMenu);
    
    // Data sync across tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'ecobloom_products') {
            loadProducts();
        }
    });
}

function loadProducts() {
    storeProducts = JSON.parse(localStorage.getItem('ecobloom_products')) || [];
    if (storeProducts.length === 0) {
        loadDemoProducts();
    }
    renderProducts();
}

function loadDemoProducts() {
    storeProducts = [
        {
            id: '1',
            name: 'Premium Ceylon Cinnamon Quills',
            price: 18.99,
            category: 'spices',
            description: 'Organic C-5 grade Ceylon cinnamon quills. True cinnamon (Cinnamomum verum) from Sri Lanka. Low coumarin, delicate sweet flavor.',
            images: ['https://images.unsplash.com/photo-1599639668363-325b9655cd3d?w=800&q=80'],
            featured: true,
            rating: 4.8,
            reviews: 24,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Organic Virgin Coconut Oil',
            price: 24.50,
            category: 'coconut',
            description: 'Cold-pressed, unrefined virgin coconut oil in glass jar. Perfect for cooking, skincare, and hair care. 500ml.',
            images: ['https://images.unsplash.com/photo-1623685267413-0b0c7d6b36d5?w=800&q=80'],
            featured: true,
            rating: 4.9,
            reviews: 36,
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            name: 'Ceylon Black Tea OP',
            price: 12.99,
            category: 'tea',
            description: 'High-grown organic black tea from Uva region. Rich, full-bodied flavor with golden liquor. 100g loose leaf.',
            images: ['https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=800&q=80'],
            featured: false,
            rating: 4.7,
            reviews: 18,
            createdAt: new Date().toISOString()
        },
        {
            id: '4',
            name: 'Handwoven Coconut Basket',
            price: 32.00,
            category: 'handicraft',
            description: 'Sustainable eco-friendly basket handwoven from coconut palm leaves. Perfect for storage or decoration.',
            images: ['https://images.unsplash.com/photo-1596138252452-450089261e26?w=800&q=80'],
            featured: false,
            rating: 4.6,
            reviews: 12,
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('ecobloom_products', JSON.stringify(storeProducts));
}

function renderProducts(productsToRender = storeProducts) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        document.getElementById('noResults').classList.remove('hidden');
        return;
    } else {
        document.getElementById('noResults').classList.add('hidden');
    }
    
    productsToRender.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    const isWishlisted = wishlist.includes(product.id);
    const mainImage = product.images?.[0] || 'https://via.placeholder.com/400';
    const categoryName = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    
    div.innerHTML = `
        <div class="product-image-container">
            <span class="product-badge">${categoryName}</span>
            <img src="${mainImage}" class="product-image" alt="${product.name}" loading="lazy">
            <div class="product-actions">
                <button onclick="toggleWishlistItem('${product.id}', this)" class="action-btn ${isWishlisted ? 'active' : ''}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                    <i class="fas fa-heart"></i>
                </button>
                <button onclick="openProductDetail('${product.id}')" class="action-btn" title="Quick View">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="p-5">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-stone-900 dark:text-white line-clamp-1">${product.name}</h3>
            </div>
            <div class="flex items-center gap-1 mb-2">
                <span class="stars text-sm">${renderStars(product.rating || 0)}</span>
                <span class="text-xs text-stone-500">(${product.reviews || 0})</span>
            </div>
            <p class="text-stone-600 dark:text-stone-400 text-sm mb-4 line-clamp-2">${product.description}</p>
            <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-emerald-700 dark:text-emerald-400">$${product.price.toFixed(2)}</span>
                <a href="https://wa.me/94775577148?text=${encodeURIComponent(`Hi, I'm interested in "${product.name}" ($${product.price}). Can you provide more details?`)}" 
                   target="_blank"
                   class="btn-whatsapp text-sm py-2 px-4">
                    <i class="fab fa-whatsapp"></i>
                    Buy Now
                </a>
            </div>
        </div>
    `;
    
    return div;
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star star-empty"></i>';
        }
    }
    return stars;
}

function filterProducts() {
    const searchTerm = (document.getElementById('searchInput')?.value || document.getElementById('mobileSearchInput')?.value || '').toLowerCase();
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const sort = document.getElementById('sortFilter')?.value || 'newest';
    
    let filtered = storeProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm) || 
                           p.description.toLowerCase().includes(searchTerm);
        const matchCategory = category === 'all' || p.category === category;
        return matchSearch && matchCategory;
    });
    
    // Sorting
    filtered.sort((a, b) => {
        switch(sort) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'newest':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
    
    renderProducts(filtered);
}

function openProductDetail(productId) {
    const product = storeProducts.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    const modal = document.getElementById('productModal');
    const content = document.getElementById('modalContent');
    
    const categoryName = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    
    content.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8 p-6">
            <div>
                <div class="main-image-container mb-4" id="mainImageContainer">
                    <img src="${product.images[0]}" class="main-image" id="mainImage" alt="${product.name}">
                    <div class="zoom-lens" id="zoomLens"></div>
                </div>
                <div class="image-gallery" id="gallery">
                    ${product.images.map((img, idx) => `
                        <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                    `).join('')}
                </div>
            </div>
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm text-emerald-600 font-semibold">${categoryName}</span>
                    ${product.featured ? '<span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Featured</span>' : ''}
                </div>
                <h2 class="text-3xl font-bold text-stone-900 dark:text-white mb-4">${product.name}</h2>
                <div class="flex items-center gap-2 mb-4">
                    <span class="stars text-lg">${renderStars(product.rating || 0)}</span>
                    <span class="text-stone-500">(${product.reviews || 0} reviews)</span>
                </div>
                <p class="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">$${product.price.toFixed(2)}</p>
                <p class="text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">${product.description}</p>
                
                <div class="space-y-4 mb-8">
                    <div class="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                        <i class="fas fa-check-circle text-emerald-500"></i>
                        <span>100% Organic Certified</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                        <i class="fas fa-check-circle text-emerald-500"></i>
                        <span>Ethically Sourced from Sri Lanka</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                        <i class="fas fa-check-circle text-emerald-500"></i>
                        <span>Free Worldwide Shipping Available</span>
                    </div>
                </div>
                
                <div class="flex gap-4">
                    <a href="https://wa.me/94775577148?text=${encodeURIComponent(`Hi ECO BLOOM, I'm interested in purchasing "${product.name}" (Price: $${product.price}). Please provide ordering details.`)}"
                       target="_blank"
                       class="flex-1 btn-whatsapp text-center py-4 text-lg">
                        <i class="fab fa-whatsapp mr-2"></i>
                        Buy Now via WhatsApp
                    </a>
                    <button onclick="toggleWishlistItem('${product.id}')" 
                            class="p-4 border-2 border-stone-300 dark:border-stone-600 rounded-full hover:border-red-500 hover:text-red-500 transition-colors ${wishlist.includes(product.id) ? 'text-red-500 border-red-500' : ''}">
                        <i class="fas fa-heart text-xl"></i>
                    </button>
                </div>
                
                <div class="mt-8 pt-8 border-t border-stone-200 dark:border-stone-700">
                    <h4 class="font-bold mb-4">Customer Reviews</h4>
                    <div id="reviewsList" class="space-y-4">
                        ${loadReviews(product.id)}
                    </div>
                    <button onclick="showReviewForm('${product.id}')" class="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                        <i class="fas fa-pen mr-1"></i>Write a Review
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Setup zoom if desktop
    if (window.innerWidth > 768) {
        setupZoom();
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.body.style.overflow = '';
    currentProduct = null;
}

function changeMainImage(src, thumb) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

function setupZoom() {
    const container = document.getElementById('mainImageContainer');
    const img = document.getElementById('mainImage');
    const lens = document.getElementById('zoomLens');
    
    if (!lens || !container) return;
    
    container.addEventListener('mousemove', moveLens);
    container.addEventListener('mouseenter', () => lens.style.display = 'block');
    container.addEventListener('mouseleave', () => lens.style.display = 'none');
    
    function moveLens(e) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - 50;
        const y = e.clientY - rect.top - 50;
        
        lens.style.left = Math.max(0, Math.min(x, rect.width - 100)) + 'px';
        lens.style.top = Math.max(0, Math.min(y, rect.height - 100)) + 'px';
        
        img.style.transform = 'scale(1.5)';
        img.style.transformOrigin = `${(e.clientX - rect.left) / rect.width * 100}% ${(e.clientY - rect.top) / rect.height * 100}%`;
    }
}

function loadReviews(productId) {
    const reviews = JSON.parse(localStorage.getItem('ecobloom_reviews')) || [];
    const productReviews = reviews.filter(r => r.productId === productId).slice(0, 3);
    
    if (productReviews.length === 0) {
        return '<p class="text-stone-500 text-sm italic">No reviews yet. Be the first to review!</p>';
    }
    
    return productReviews.map(r => `
        <div class="review-card">
            <div class="flex items-center gap-3 mb-2">
                <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
                <div>
                    <p class="font-semibold text-stone-900 dark:text-white">${r.name}</p>
                    <div class="stars text-xs">${renderStars(r.rating)}</div>
                </div>
                <span class="ml-auto text-xs text-stone-500">${new Date(r.date).toLocaleDateString()}</span>
            </div>
            <p class="text-stone-600 dark:text-stone-400 text-sm">${r.comment}</p>
        </div>
    `).join('');
}

function showReviewForm(productId) {
    const name = prompt('Your name:');
    if (!name) return;
    
    const rating = parseInt(prompt('Rating (1-5):'));
    if (!rating || rating < 1 || rating > 5) return;
    
    const comment = prompt('Your review:');
    if (!comment) return;
    
    const reviews = JSON.parse(localStorage.getItem('ecobloom_reviews')) || [];
    reviews.push({
        productId,
        name,
        rating,
        comment,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('ecobloom_reviews', JSON.stringify(reviews));
    
    // Update product average rating
    const productReviews = reviews.filter(r => r.productId === productId);
    const avgRating = productReviews.reduce((a, b) => a + b.rating, 0) / productReviews.length;
    const product = storeProducts.find(p => p.id === productId);
    if (product) {
        product.rating = Math.round(avgRating * 10) / 10;
        product.reviews = productReviews.length;
        localStorage.setItem('ecobloom_products', JSON.stringify(storeProducts));
    }
    
    showToast('Review submitted successfully!', 'success');
    openProductDetail(productId); // Refresh modal
}

function toggleWishlistItem(productId, btn = null) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        }
        showToast('Removed from wishlist', 'success');
    } else {
        wishlist.push(productId);
        if (btn) {
            btn.classList.add('active', 'heart-animation');
            setTimeout(() => btn.classList.remove('heart-animation'), 1300);
        }
        showToast('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('ecobloom_wishlist', JSON.stringify(wishlist));
    renderWishlist();
    updateWishlistCount();
}

function updateWishlistCount() {
    const counts = document.querySelectorAll('#wishlistCount, #wishlistCountMobile');
    counts.forEach(count => {
        if (wishlist.length > 0) {
            count.textContent = wishlist.length;
            count.classList.remove('hidden');
        } else {
            count.classList.add('hidden');
        }
    });
}

function renderWishlist() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    
    if (wishlist.length === 0) {
        container.innerHTML = '<p class="text-center text-stone-500 py-8">Your wishlist is empty</p>';
        return;
    }
    
    container.innerHTML = wishlist.map(id => {
        const product = storeProducts.find(p => p.id === id);
        if (!product) return '';
        return `
            <div class="flex gap-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <img src="${product.images?.[0] || ''}" class="w-20 h-20 object-cover rounded-lg" alt="${product.name}">
                <div class="flex-1">
                    <h4 class="font-semibold text-stone-900 dark:text-white text-sm">${product.name}</h4>
                    <p class="text-emerald-600 font-bold mt-1">$${product.price}</p>
                    <div class="flex gap-2 mt-2">
                        <a href="https://wa.me/94775577148?text=${encodeURIComponent(`Hi, I want to buy "${product.name}"`)}" 
                           target="_blank"
                           class="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full hover:bg-emerald-700">
                            Buy Now
                        </a>
                        <button onclick="toggleWishlistItem('${product.id}')" 
                                class="text-xs text-red-600 hover:underline">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateWishlistCount();
}

function toggleWishlist() {
    const sidebar = document.getElementById('wishlistSidebar');
    const overlay = document.getElementById('wishlistOverlay');
    
    if (sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('ecobloom_darkmode', isDark);
    
    const icon = document.querySelector('#darkModeToggle i, #mobileDarkModeToggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun text-yellow-400' : 'fas fa-moon text-stone-600';
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

function checkAdminStatus() {
    if (sessionStorage.getItem('adminAuth') === 'true') {
        const links = document.querySelectorAll('#adminLink');
        links.forEach(link => link.classList.remove('hidden'));
    }
}

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

function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type} animate-fade-in-up`;
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

// Initialize dark mode from localStorage
if (localStorage.getItem('ecobloom_darkmode') === 'true') {
    document.documentElement.classList.add('dark');
}