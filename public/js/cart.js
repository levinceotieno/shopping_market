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
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
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
            ${item.name} - $${item.price} x ${item.quantity} 
            <button onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        cartList.appendChild(li);
        total += item.price * item.quantity;
	itemCount += item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = itemCount;
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }

    const address = prompt('Enter your delivery address:');
    const pickupPoint = prompt('Enter your pickup point:');
    const isNairobi = confirm('Is the delivery within Nairobi?');

    if (!address || !pickupPoint) {
        showToast('Address and pickup point are required!');
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
        showToast('Order placed successfully!');
        cart = [];
        updateCartDisplay();
    })
    .catch((error) => {
        console.error('Error:', error);
        showToast('An error occurred while placing the order.');
    });
}

function clearOrderHistory() {
    fetch('/orders/clear', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        showToast('Order history cleared successfully!');
        // Additional code to update the UI can be added here
    })
    .catch((error) => {
        console.error('Error:', error);
        showToast('An error occurred while clearing order history.');
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
