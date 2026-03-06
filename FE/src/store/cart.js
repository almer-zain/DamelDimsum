import { reactive, computed } from 'vue';

// 1. Initial State
export const cartState = reactive({
  items: JSON.parse(localStorage.getItem('damel_cart')) || []
});

// 2. Persist to LocalStorage
const save = () => {
  localStorage.setItem('damel_cart', JSON.stringify(cartState.items));
};

// 3. Global Actions
export const cartStore = {
  // Get total count of items (Sum of quantities)
  count: computed(() => cartState.items.reduce((acc, item) => acc + item.qty, 0)),
  
  // Refresh data (useful when switching pages)
  refresh() {
    const saved = localStorage.getItem('damel_cart');
    if (saved) cartState.items = JSON.parse(saved);
  },

  add(product) {
    const existing = cartState.items.find(i => i.id === product.id);
    if (existing) existing.qty++;
    else cartState.items.push({ ...product, qty: 1 });
    save();
  }
};