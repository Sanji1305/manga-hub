// DOM Elements
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.total-amount');
const paymentModal = document.getElementById('paymentModal');
const successModal = document.getElementById('successModal');
const closeCartBtn = document.querySelector('.close-cart');
const closeModalBtns = document.querySelectorAll('.close-modal');
const buyNowBtns = document.querySelectorAll('.buy-now-btn');
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
const wishlistBtns = document.querySelectorAll('.wishlist-btn');
const checkoutBtn = document.querySelector('.checkout-btn');
const placeOrderBtn = document.querySelector('.place-order-btn');
const priceRange = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');

// QR Code Modal Elements
const qrCodeModal = document.getElementById('qrCodeModal');
const qrContainer = document.getElementById('qrCode');
const qrAmount = document.getElementById('qrAmount');
const statusMessage = document.querySelector('.status-message');
const cancelPaymentBtn = document.querySelector('.cancel-payment');

// Clear cart data when page loads
localStorage.removeItem('cart');

// Cart State
let cart = [];
let wishlist = [];

// Clear cart items on page load
cartItems.innerHTML = '';
document.querySelector('.subtotal').textContent = '₹0';
document.querySelector('.total-amount').textContent = '₹0';

// Payment Methods Handling
const paymentMethods = document.querySelector('.payment-methods');
const paymentOptions = document.querySelectorAll('.payment-option');
const cardForm = document.querySelector('.card-form');
const emiSelect = document.querySelector('.emi-select');

// Success Modal Handling
const closeSuccessModal = document.querySelector('.success-modal .close-modal');
const trackOrderBtn = document.querySelector('.track-btn');
const continueShoppingBtn = document.querySelector('.continue-btn');

const netBankingForm = document.querySelector('.netbanking-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadWishlist();
    setupEventListeners();
    updatePriceInputs();
});

function setupEventListeners() {
    // Cart Sidebar Toggle
    closeCartBtn.addEventListener('click', toggleCart);
    
    // Add to Cart Buttons
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const mangaItem = this.closest('.manga-item');
            console.log('Adding to cart:', mangaItem.querySelector('.manga-image img').src);
            addToCart(getMangaData(mangaItem));
        });
    });

    // Buy Now Buttons
    buyNowBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const mangaItem = this.closest('.manga-item');
            console.log('Buying now:', mangaItem.querySelector('.manga-image img').src);
            addToCart(getMangaData(mangaItem));
            showPaymentModal();
        });
    });

    // Wishlist Buttons
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mangaItem = e.target.closest('.manga-item');
            toggleWishlist(getMangaData(mangaItem));
            updateWishlistButton(btn, mangaItem.dataset.id);
        });
    });

    // Modal Close Buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Find which modal this close button is inside
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                // If closing QR modal, optionally reopen payment modal
                if (modal.id === 'qrCodeModal') {
                    paymentModal.classList.add('active');
                }
            }
        });
    });

    // Checkout Button
    checkoutBtn.addEventListener('click', showPaymentModal);

    // Place Order Button
    placeOrderBtn.addEventListener('click', () => {
        // Validate if payment method is selected
        const selectedPayment = document.querySelector('.payment-option.active');
        if (!selectedPayment) {
            showNotification('Please select a payment method', 'error');
            return;
        }

        // Validate customer name (from net banking or card form)
        let name = '';
        const accountHolder = document.getElementById('accountHolder');
        if (accountHolder && accountHolder.value) {
            name = accountHolder.value.trim();
        } else {
            const cardName = document.getElementById('cardName');
            if (cardName && cardName.value) {
                name = cardName.value.trim();
            }
        }
        if (!name) {
            showNotification('Please enter your name in the payment form', 'error');
            if (accountHolder) accountHolder.focus();
            else if (cardName) cardName.focus();
            return;
        }

        // Validate card details if card payment is selected
        const paymentType = selectedPayment.dataset.payment;
        if (["visa", "mastercard", "amex", "rupay"].includes(paymentType)) {
            const cardNumber = document.getElementById('cardNumber').value;
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;

            if (!cardNumber || !expiry || !cvv) {
                showNotification('Please fill in all card details', 'error');
                return;
            }
        }

        // Show loading state
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate payment processing
        setTimeout(() => {
            // Hide payment modal
            paymentModal.classList.remove('active');

            // Reset button state
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = 'Place Order';
            
            // Show success modal
            handlePaymentSuccess();
            
            // Clear cart
            cart = [];
            updateCart();
        }, 2000);
    });

    // Price Range Inputs
    priceRange.addEventListener('input', updatePriceInputs);
    minPrice.addEventListener('change', updatePriceRange);
    maxPrice.addEventListener('change', updatePriceRange);

    // Payment Options
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            const paymentType = option.dataset.payment;
            if (["googlepay", "phonepe", "paytm", "bhim"].includes(paymentType)) {
                handleUPIPayment(paymentType);
                cardForm.style.display = 'none';
                if (netBankingForm) netBankingForm.style.display = 'none';
            } else if (["visa", "mastercard", "amex", "rupay"].includes(paymentType)) {
                cardForm.style.display = 'block';
                if (netBankingForm) netBankingForm.style.display = 'none';
                showPaymentInstructions(paymentType);
            } else if (["sbi", "hdfc", "icici", "axis"].includes(paymentType)) {
                cardForm.style.display = 'none';
                if (netBankingForm) netBankingForm.style.display = 'block';
            } else {
                cardForm.style.display = 'none';
                if (netBankingForm) netBankingForm.style.display = 'none';
            }
        });
    });

    // Cancel Payment Button
    cancelPaymentBtn.addEventListener('click', () => {
        // Clear payment check interval
        if (qrCodeModal.dataset.checkInterval) {
            clearInterval(qrCodeModal.dataset.checkInterval);
        }
        
        // Hide QR code modal
        qrCodeModal.classList.remove('active');
        
        // Show payment modal
        paymentModal.classList.add('active');
    });
}

// Cart Functions
function toggleCart() {
    cartSidebar.classList.toggle('active');
}

function addToCart(mangaData) {
    const existingItem = cart.find(item => item.id === mangaData.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...mangaData, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showNotification('Added to cart!');
    toggleCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItems.innerHTML += `
            <div class="cart-item" data-id="${item.id}">
               <img src="${item.image}" alt="${item.title}" style="width: 100; height: 100px; object-fit: cover;">
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p>₹${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    cartTotal.textContent = `₹${total}`;
    document.getElementById('totalAmount').textContent = `₹${total}`;
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        saveCart();
        updateCartUI();
    }
}

// Wishlist Functions
function toggleWishlist(mangaData) {
    const index = wishlist.findIndex(item => item.id === mangaData.id);
    
    if (index === -1) {
        wishlist.push(mangaData);
        showNotification('Added to wishlist!');
    } else {
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist!');
    }
    
    saveWishlist();
}

function updateWishlistButton(btn, id) {
    const isWishlisted = wishlist.some(item => item.id === id);
    btn.classList.toggle('active', isWishlisted);
}

// Payment Modal Functions
function showPaymentModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Show payment modal
    paymentModal.classList.add('active');
    
    // Show payment methods
    paymentMethods.classList.add('active');
    
    // Update EMI option based on total amount
    const totalAmount = parseFloat(cartTotal.textContent.replace('₹', ''));
    emiSelect.disabled = totalAmount < 3000;
}

function processOrder() {
    // Validate form fields
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    if (!isValid) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }

    // Generate order details
    const orderId = generateOrderId();
    const deliveryDate = getEstimatedDeliveryDate();

    // Update success modal
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('deliveryDate').textContent = deliveryDate;

    // Show success modal
    paymentModal.classList.remove('active');
    successModal.classList.add('active');

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
}

// Helper Functions
function getMangaData(mangaItem) {
    return {
        id: mangaItem.dataset.id || Math.random().toString(36).substr(2, 9),
        title: mangaItem.querySelector('.manga-info h3').textContent,
        price: parseFloat(mangaItem.querySelector('.price').textContent.replace('₹', '')),
        image: mangaItem.querySelector('.manga-image img').src
    };
}

function generateOrderId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let orderId = 'ORD';
    for (let i = 0; i < 8; i++) {
        orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return orderId;
}

function getEstimatedDeliveryDate() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }, 100);
}

function updatePriceInputs() {
    const value = priceRange.value;
    minPrice.value = 0;
    maxPrice.value = value;
    filterMangaByPrice();
}

function updatePriceRange() {
    const min = parseInt(minPrice.value) || 0;
    const max = parseInt(maxPrice.value) || 2000;
    
    if (min > max) {
        minPrice.value = max;
    }
    
    priceRange.value = max;
    filterMangaByPrice();
}

function filterMangaByPrice() {
    const min = parseInt(minPrice.value);
    const max = parseInt(maxPrice.value);
    const mangaItems = document.querySelectorAll('.manga-item');
    
    mangaItems.forEach(item => {
        const price = parseInt(item.querySelector('.price').textContent.replace('₹', ''));
        if (price >= min && price <= max) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
            }
        });
    }

// Local Storage Functions
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
        wishlistBtns.forEach(btn => {
            const mangaItem = btn.closest('.manga-item');
            updateWishlistButton(btn, mangaItem.dataset.id);
        });
    }
    }

// Initialize tooltips and other UI elements
document.querySelectorAll('[data-tooltip]').forEach(element => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = element.dataset.tooltip;
    
    element.addEventListener('mouseenter', () => {
        document.body.appendChild(tooltip);
        const rect = element.getBoundingClientRect();
        tooltip.style.top = rect.bottom + 5 + 'px';
        tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
        tooltip.remove();
    });
});

// Handle payment method selection
function showPaymentInstructions(paymentType) {
    let instructions = '';
    
    switch(paymentType) {
        case 'googlepay':
        case 'phonepe':
        case 'paytm':
        case 'bhim':
            instructions = `Scan QR code or pay to UPI ID: mangahub@upi`;
            break;
        case 'visa':
        case 'mastercard':
        case 'amex':
        case 'rupay':
            instructions = 'Enter your card details to proceed';
            break;
        case 'sbi':
        case 'hdfc':
        case 'icici':
        case 'axis':
            instructions = 'You will be redirected to your bank\'s secure payment page';
            break;
        default:
            instructions = 'Select a payment method to proceed';
    }
    
    showNotification(instructions, 'info');
}

// Handle card form inputs
const cardNumber = document.getElementById('cardNumber');
const expiry = document.getElementById('expiry');
const cvv = document.getElementById('cvv');

cardNumber.addEventListener('input', (e) => {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, '');
    
    // Add space after every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    e.target.value = value;
});

expiry.addEventListener('input', (e) => {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, '');
    
    // Add slash after month
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    e.target.value = value;
});

cvv.addEventListener('input', (e) => {
    // Remove non-numeric characters
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Handle EMI selection
emiSelect.addEventListener('change', (e) => {
    const months = parseInt(e.target.value);
    if (months) {
        const totalAmount = parseFloat(cartTotal.textContent.replace('₹', ''));
        const emiAmount = Math.ceil(totalAmount / months);
        showNotification(`Your monthly EMI will be ₹${emiAmount}`, 'info');
    }
});

// Show success modal when clicking the close button
closeSuccessModal.addEventListener('click', () => {
    successModal.classList.remove('active');
});

// Close success modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

// Handle track order button
trackOrderBtn.addEventListener('click', () => {
    // Redirect to order tracking page
    window.location.href = 'track-order.html';
});

// Handle continue shopping button
continueShoppingBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
    window.location.href = 'index.html';
});

// Handle successful payment
function handlePaymentSuccess() {
    const orderId = generateOrderId();
    const deliveryDate = calculateDeliveryDate();
    showSuccessModal(orderId, deliveryDate);
}

// Calculate estimated delivery date (5 days from now)
function calculateDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function showSuccessModal(orderId, deliveryDate) {
    successModal.classList.add('active');
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('deliveryDate').textContent = deliveryDate;
    fillReceiptDetails();
}

// Load QR Code library
document.addEventListener('DOMContentLoaded', () => {
    const qrScript = document.createElement('script');
    qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js';
    document.head.appendChild(qrScript);
});

// UPI Payment Handling
function handleUPIPayment(paymentType) {
    const amount = document.getElementById('totalAmount').textContent.replace('₹', '');
    const orderId = generateOrderId();
    const merchantId = 'MANGAHUB' + Math.random().toString(36).substr(2, 9);
    
    // Create UPI payment URL
    const upiURL = `upi://pay?pa=your-merchant-upi@bank&pn=MangaHub&mc=5815&tid=${orderId}&tr=${orderId}&tn=Manga%20Purchase&am=${amount}&cu=INR`;
    
    // Show QR Code Modal
    showQRCodeModal(upiURL, amount);
    
    // Start payment status check
    startPaymentStatusCheck(orderId);
}

function showQRCodeModal(upiURL, amount) {
    // Generate QR Code
    QRCode.toCanvas(qrContainer, upiURL, { width: 250 }, function (error) {
        if (error) console.error(error);
    });
    
    // Update amount display
    qrAmount.textContent = `₹${amount}`;
    
    // Show modal
    qrCodeModal.classList.add('active');
    paymentModal.classList.remove('active');
    
    // Reset status message
    statusMessage.textContent = 'Waiting for payment...';
    statusMessage.style.color = '#666';
}

function startPaymentStatusCheck(orderId) {
    let checkCount = 0;
    const maxChecks = 60; // 2 minutes (checking every 2 seconds)
    
    const checkInterval = setInterval(() => {
        checkCount++;
        
        // Simulate payment status check
        // In a real implementation, this would be an API call to your backend
        if (checkCount === 10) { // Simulate successful payment after 20 seconds
            clearInterval(checkInterval);
            handlePaymentSuccess();
            qrCodeModal.classList.remove('active');
        }
        
        if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            statusMessage.textContent = 'Payment timeout. Please try again.';
            statusMessage.style.color = '#dc3545';
        }
    }, 2000);
    
    // Store interval ID for cleanup
    qrCodeModal.dataset.checkInterval = checkInterval;
}

const ifscInput = document.getElementById('ifsc');
const branchNameInput = document.getElementById('branchName');

if (ifscInput && branchNameInput) {
    ifscInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase(); // Always uppercase
        const ifsc = this.value.trim();
        if (ifsc.length === 11) {
            fetch(`https://ifsc.razorpay.com/${ifsc}`)
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => {
                    branchNameInput.value = data.BRANCH || '';
                    branchNameInput.readOnly = true;
                })
                .catch(() => {
                    branchNameInput.value = '';
                    branchNameInput.readOnly = false;
                });
        } else {
            branchNameInput.value = '';
            branchNameInput.readOnly = false;
        }
    });
}

const printReceiptBtn = document.querySelector('.print-receipt-btn');
const successModalContent = document.querySelector('#successModal .modal-content');

if (printReceiptBtn && successModalContent) {
    printReceiptBtn.addEventListener('click', function() {
        // Create a print window with only the receipt content
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Order Receipt</title>');
        // Add styles for print
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(style => style.outerHTML).join('');
        printWindow.document.write(styles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(successModalContent.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    });
}

function fillReceiptDetails() {
    // Customer Name
    let name = '';
    // Try to get from net banking form
    const accountHolder = document.getElementById('accountHolder');
    if (accountHolder && accountHolder.value) {
        name = accountHolder.value;
    } else {
        // Try to get from card form
        const cardName = document.getElementById('cardName');
        if (cardName && cardName.value) {
            name = cardName.value;
        }
    }
    if (!name) name = 'Customer';
    document.getElementById('customerName').textContent = name;

    // Date & Time
    const now = new Date();
    document.getElementById('orderDateTime').textContent = now.toLocaleString();

    // Payment Method
    const selectedPayment = document.querySelector('.payment-option.active');
    let paymentText = '';
    if (selectedPayment) {
        paymentText = selectedPayment.textContent.trim();
    }
    document.getElementById('paymentMethod').textContent = paymentText || 'N/A';

    // Amount
    const totalAmount = document.getElementById('totalAmount');
    document.getElementById('receiptAmount').textContent = totalAmount ? totalAmount.textContent : 'N/A';
} 