//cart.js
let cart = [];

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const toastContainer = document.getElementById('toast');
    toastContainer.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

function addToCart(id, name, price, imageUrl) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, imageUrl, quantity: 1 });
    }
    updateCartDisplay();
    showToast(`${name} added to cart`, 'success');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
    showToast('Item removed from cart', 'info');
}

function updateCartDisplay() {
    const cartList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');

    cartList.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-image">
            ${item.name} - Ksh. ${item.price} x ${item.quantity}
            <button onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        cartList.appendChild(li);
        total += item.price * item.quantity;
        itemCount += item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = itemCount;
}

function openModal() {
    document.getElementById('deliveryModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('deliveryModal').style.display = 'none';
}

function submitDeliveryInfo() {
    const address = document.getElementById('address').value;
    const pickupPoint = document.getElementById('pickupPoint').value;
    const isNairobi = document.querySelector('input[name="isNairobi"]:checked').value === 'yes';

    if (!address || !pickupPoint) {
        showToast('Address and pickup point are required!', 'error');
        return;
    }

    const deliveryDate = new Date();
    if (isNairobi) {
        deliveryDate.setHours(deliveryDate.getHours() + 6);
    } else {
        deliveryDate.setDate(deliveryDate.getDate() + 3);
    }

    const order = {
        products: cart.map(item => ({ product: item.id, quantity: item.quantity, imageUrl: item.imageUrl })),
        totalPrice: parseFloat(document.getElementById('cart-total').textContent),
        address,
        pickupPoint,
        deliveryDate: deliveryDate.toISOString(),
    };

    fetch('/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    })
    .then(response => response.json())
    .then(data => {
        showToast('Order placed successfully!', 'success');
        cart = [];
        updateCartDisplay();
        closeModal();
    })
    .catch((error) => {
        console.error('Error:', error);
        showToast('Login or Register to order.', 'error');
    });
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    openModal();
}

function clearOrderHistory() {
    fetch('/orders/clear', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        showToast('Order history cleared successfully!', 'success');
        // Additional code to update the UI can be added here
    })
    .catch((error) => {
        console.error('Error:', error);
        showToast('An error occurred while clearing order history.', 'error');
    });
}

function calculateDeliveryTime(address) {
    const isNairobi = address.toLowerCase().includes('nairobi');
    const deliveryTime = new Date();
    if (isNairobi) {
        deliveryTime.setHours(deliveryTime.getHours() + 6);
    } else {
        deliveryTime.setDate(deliveryTime.getDate() + 3);
    }
    return deliveryTime.toLocaleString();
}

function toggleCart() {
    const cartElement = document.getElementById('cart');
    cartElement.style.display = cartElement.style.display === 'none' ? 'block' : 'none';
}

function searchAndFilterProducts() {
    const name = document.getElementById('searchName').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
  
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (minPrice) queryParams.append('minPrice', minPrice);
    if (maxPrice) queryParams.append('maxPrice', maxPrice);
  
    fetch(`/products/search?${queryParams.toString()}`)
      .then(response => response.json())
      .then(products => {
        const productGrid = document.querySelector('.product-grid');
        productGrid.innerHTML = '';
        products.forEach(product => {
          const productElement = createProductElement(product);
          productGrid.appendChild(productElement);
        });
      })
      .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred while searching for products.', 'error');
      });
}

function clearSearchAndShowAllProducts() {
    document.getElementById('searchName').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
  
    fetch('/products')
      .then(response => response.text())
      .then(html => {
          // Replace the entire body content with the new HTML
          document.body.innerHTML = html;
          attachEventListeners();
      })
      .catch(error => {
         console.error('Error:', error);
         showToast('An error occurred while fetching all products.', 'error');
      });
}
  
// Helper function to create a product element
function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
      <img class="product-image" src="${product.image_url}" alt="${product.name}">
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">Ksh. ${product.price}</p>
      <p class="product-description">${product.description}</p>
      <p class="product-status">Status: ${product.status}</p>
      <button class="btn add-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')">Add to Cart</button>
    `;
    return div;
}  

// Add an event listener
document.addEventListener('DOMContentLoaded', attachEventListeners);

function attachEventListeners() {
    const searchForm = document.getElementById('searchForm');
    const clearSearchButton = document.getElementById('clearSearch');
  
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        searchAndFilterProducts();
      });
    }
    if (clearSearchButton) {
       clearSearchButton.addEventListener('click', clearSearchAndShowAllProducts);
    }
}  

// Initial cart display update
updateCartDisplay();
