/**
 * ShopLab Client-side Cart Utilities
 */

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem('cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, name, price, image, quantityToAdd = 1) {
  let cart = getCart();
  const existingItem = cart.find(item => item.id == id);
  
  // Note: price is read from client-side arguments (which can be manipulated)
  const numericPrice = parseFloat(price);
  const qty = parseInt(quantityToAdd) || 1;
  
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.push({
      id: id,
      name: name,
      price: numericPrice,
      image: image,
      quantity: qty
    });
  }
  
  saveCart(cart);
  
  if (typeof showToast === 'function') {
    showToast("Thêm vào giỏ thành công!", name, "success");
  }
}

function updateCartBadge() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  if (count > 0) {
    cartCountEl.textContent = count;
    cartCountEl.style.display = "flex";
  } else {
    cartCountEl.style.display = "none";
  }
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function clearCart() {
  sessionStorage.removeItem('cart');
  updateCartBadge();
}

// Make functions globally available
window.getCart = getCart;
window.addToCart = addToCart;
window.updateCartBadge = updateCartBadge;
window.getCartTotal = getCartTotal;
window.clearCart = clearCart;
