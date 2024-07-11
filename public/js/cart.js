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

function updateCartDisplay() {
    const cartList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    cartList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${item.imageUrl}" alt="${item.name}" class="cart-image"> ${item.name} - $${item.price} x ${item.quantity}`;
        cartList.appendChild(li);
	total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }

    const address = prompt('Enter your delivery address:');
    const pickupPoint = prompt('Enter your pickup point:');

    if (!address || !pickupPoint) {
        showToast('Address and pickup point are required!');
        return;
    }

    const order = {
        products: cart.map(item => ({ product: item.id, quantity: item.quantity, imageUrl: item.imageUrl })),
        totalPrice: parseFloat(document.getElementById('cart-total').textContent),
        address,
        pickupPoint
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
