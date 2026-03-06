<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { ChevronLeft, Search, ChefHat, Sparkles, Flame, Plus, ShoppingBag, X, Star, Minus, ChevronRight } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { settings } from '@/store/settings'; 
import api from '@/utils/api';
import gsap from 'gsap';
import CartDrawer from '@/component/menu/CartDrawer.vue';

const router = useRouter();

// --- DATA STATE ---
const categories = ref([]);
const products = ref([]);
const isLoading = ref(true);

// --- UI STATE ---
const activeCategory = ref('all');
const searchQuery = ref('');
const isDrawerOpen = ref(false);
const cart = ref([]);

// --- MODAL STATE (New Feature) ---
const selectedProduct = ref(null);
const currentImageIndex = ref(0);
const modalQty = ref(1);

// --- COMPUTED LOGIC ---
const isSearching = computed(() => searchQuery.value.length > 0);

const filteredProducts = computed(() => {
  let result = products.value;
  // 1. Filter by Category
  if (activeCategory.value !== 'all' && !isSearching.value) {
    result = result.filter(p => p.categoryId === activeCategory.value);
  }
  // 2. Filter by Search
  if (isSearching.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }
  return result;
});

const groupedDisplay = computed(() => {
  if (isSearching.value) return [{ id: 'search', name: 'Hasil Pencarian', products: filteredProducts.value }];
  
  // Logic to show grouping headers only if "All" is selected, otherwise just show the grid
  if (activeCategory.value !== 'all') {
    const cat = categories.value.find(c => c.id === activeCategory.value);
    return [{ id: cat.id, name: cat.name, products: filteredProducts.value }];
  }

  // Group by category for "All" view
  let groups = [];
  categories.value.forEach(cat => {
    const prods = products.value.filter(p => p.categoryId === cat.id);
    if (prods.length > 0) groups.push({ ...cat, products: prods });
  });
  return groups;
});

// --- HELPER FUNCTIONS ---
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const getImages = (imageJson) => {
  try {
    let images = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    if (Array.isArray(images) && images.length > 0) {
      return images.map(img => `${import.meta.env.VITE_IMAGE_URL}/${img}`);
    }
  } catch (e) { return ['/placeholder.png']; }
  return ['/placeholder.png']; // Fallback
};

// --- MODAL ACTIONS ---
const openProductModal = (product) => {
  selectedProduct.value = product;
  currentImageIndex.value = 0;
  modalQty.value = 1;
  document.body.style.overflow = 'hidden'; // Stop background scroll
  
  nextTick(() => {
    gsap.fromTo(".product-modal-content", 
      { scale: 0.9, opacity: 0, y: 50 }, 
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
    );
  });
};

const closeProductModal = () => {
  gsap.to(".product-modal-content", { 
    scale: 0.9, opacity: 0, duration: 0.2, 
    onComplete: () => {
      selectedProduct.value = null;
      document.body.style.overflow = '';
    }
  });
};

const nextImage = () => {
  const imgs = getImages(selectedProduct.value.images);
  currentImageIndex.value = (currentImageIndex.value + 1) % imgs.length;
};

const prevImage = () => {
  const imgs = getImages(selectedProduct.value.images);
  currentImageIndex.value = (currentImageIndex.value - 1 + imgs.length) % imgs.length;
};

// --- CART LOGIC ---
const loadCart = () => {
  const saved = localStorage.getItem('damel_cart');
  if (saved) cart.value = JSON.parse(saved);
};

const saveCart = () => {
  localStorage.setItem('damel_cart', JSON.stringify(cart.value));
};

const addToCart = (product, qty = 1) => {
  const existing = cart.value.find(item => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.value.push({ ...product, qty });
  }
  saveCart();
  closeProductModal(); // Close modal if open
  
  // Animate FAB
  gsap.fromTo(".cart-fab", { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
};

const updateQty = (id, change) => {
  const index = cart.value.findIndex(item => item.id === id);
  if (index !== -1) {
    const newQty = cart.value[index].qty + change;
    if (newQty > 0) cart.value[index].qty = newQty;
    else {
      cart.value.splice(index, 1);
      if (cart.value.length === 0) isDrawerOpen.value = false;
    }
    saveCart();
  }
};

const cartCount = computed(() => cart.value.reduce((acc, item) => acc + item.qty, 0));
const cartTotal = computed(() => cart.value.reduce((acc, item) => acc + (item.price * item.qty), 0));

const handleCheckout = () => {
  // 1. Get Phone Number from DB or use fallback
  let phone = settings.mainWhatsapp || '628123456789';
  
  // Sanitize: Remove '+' or dashes, ensure it starts with 62 (Indonesia)
  phone = phone.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  }

  // 2. Build the Professional Message
  let message = `👋 Halo *${settings.siteName || 'Damel Dimsum'}*,\n`;
  message += `Saya ingin memesan menu dari website:\n\n`;
  
  message += `--------------------------------\n`;
  message += `🛒 *DETAIL PESANAN*\n`;
  message += `--------------------------------\n`;

  cart.value.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    // Format: 1. Dimsum Ayam (2x) - Rp 30.000
    message += `${index + 1}. ${item.name} *(${item.qty}x)* — ${formatCurrency(subtotal)}\n`;
  });

  message += `--------------------------------\n\n`;
  message += `💰 *TOTAL BAYAR: ${formatCurrency(cartTotal.value)}*\n\n`;
  message += `Mohon info ongkir dan pembayarannya ya. Terima kasih! 🙏`;

  // 3. Send
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

// --- INIT ---
onMounted(async () => {
  loadCart();
  try {
    const [catRes, prodRes] = await Promise.all([api.get('/categories'), api.get('/products')]);
    categories.value = catRes.data.data || [];
    products.value = prodRes.data.data || [];
  } catch (e) { console.error(e); } 
  finally { isLoading.value = false; }
});


const mainContainerRef = ref()

const handleExit = () => {
  // 1. Lock scroll to prevent jankiness during exit
  document.body.style.overflow = 'hidden';

  // 2. Animate the whole container out
  gsap.to(mainContainerRef.value, {
    y: 100,       // Slide down
    opacity: 0,   // Fade out
    duration: 0.5,
    ease: "power3.in", // "Accelerate" out
    onComplete: () => {
      // 3. Navigate and cleanup
      document.body.style.overflow = '';
      router.push('/');
    }
  });
};


</script>

<template>
  <div ref="mainContainerRef" class="min-h-screen bg-[#FDFBF7] font-['Poppins'] pb-32">
    
    <!-- FIXED BACKGROUND (Non-Blurry, Clean) -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
       <!-- Subtle Grain -->
       <div class="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
       <!-- Floating Orbs (Fixed position so they don't scroll infinitely) -->
       <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#8B0000]/5 rounded-full blur-[100px]"></div>
       <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[80px]"></div>
    </div>

    <!-- HEADER & NAV -->
    <div class="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div class="max-w-4xl mx-auto px-4 py-3">
        
        <!-- Top Row -->
        <div class="flex items-center gap-3 mb-3">
          <button @click="router.push('/')" class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#111827] hover:bg-[#8B0000] hover:text-white transition-all shadow-sm">
            <ChevronLeft :size="20" />
          </button>
          
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari dimsum..." 
              class="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm font-bold text-[#111827] outline-none focus:bg-white focus:ring-2 focus:ring-[#8B0000]/20 transition-all"
            />
          </div>
        </div>

        <!-- Category Selector (The "Select") -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button 
            @click="activeCategory = 'all'"
            class="whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border"
            :class="activeCategory === 'all' ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#8B0000]'"
          >
            Semua
          </button>
          <button 
            v-for="cat in categories" :key="cat.id"
            @click="activeCategory = cat.id"
            class="whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border"
            :class="activeCategory === cat.id ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#8B0000]'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="max-w-4xl mx-auto px-4 pt-6 relative z-10">
      
      <!-- HERO BANNER (Collapsible) -->
      <transition name="slide-up">
        <div v-if="!isSearching && activeCategory === 'all'" class="mb-10 relative w-full bg-[#8B0000] rounded-[2rem] p-8 overflow-hidden shadow-2xl flex items-center justify-between min-h-[200px]">
           <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
           <div class="relative z-10 w-2/3 space-y-2">
             <div class="inline-flex items-center gap-2 px-3 py-1 bg-black/20 rounded-lg text-white">
               <Flame :size="12" class="text-[#FBBF24]" /><span class="text-[9px] font-black uppercase">Premium Taste</span>
             </div>
             <h1 class="text-3xl lg:text-4xl font-black text-white italic tracking-tighter leading-[0.9]">
               DIMSUM <span class="text-[#FBBF24]">ASLI.</span>
             </h1>
             <p class="text-xs text-white/80 max-w-[200px] leading-relaxed">Dibuat dari bahan segar pilihan tanpa pengawet.</p>
           </div>
           <div class="absolute -right-4 bottom-[-20px] w-40 rotate-12">
              <img src="@/assets/images/dimsum2 2.png" class="w-full drop-shadow-2xl" />
           </div>
        </div>
      </transition>

      <!-- MENU GRID -->
      <div v-if="isLoading" class="py-20 text-center">
        <ChefHat :size="40" class="text-[#8B0000] animate-bounce mx-auto mb-2" />
        <p class="text-xs font-black uppercase tracking-widest text-gray-400">Loading...</p>
      </div>

      <div v-else class="space-y-10">
        <div v-for="group in groupedDisplay" :key="group.id">
          
          <h3 class="text-lg font-black text-[#111827] uppercase tracking-tight mb-4 flex items-center gap-3">
             <span class="w-1.5 h-6 bg-[#8B0000] rounded-full"></span> {{ group.name }}
          </h3>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div 
              v-for="product in group.products" :key="product.id"
              @click="openProductModal(product)"
              class="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#8B0000]/30 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div class="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
                 <img :src="getImages(product.images)[0]" crossorigin="anonymous" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <h4 class="font-bold text-[#111827] text-xs uppercase leading-tight line-clamp-2 mb-1">{{ product.name }}</h4>
              <p class="font-black text-[#8B0000] text-sm mt-auto">{{ formatCurrency(product.price) }}</p>
              
              <!-- Quick Add -->
              <button 
                @click.stop="addToCart(product)"
                class="mt-3 w-full py-2 bg-[#111827] text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#8B0000] transition-colors flex items-center justify-center gap-2"
              >
                <Plus :size="12" /> Add
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- PRODUCT DETAIL MODAL (The New Feature) -->
    <transition name="fade">
      <div v-if="selectedProduct" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeProductModal"></div>
        
        <div class="product-modal-content bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
          
          <!-- Modal Header (Image Gallery) -->
          <div class="relative h-64 bg-gray-100">
             <img :src="getImages(selectedProduct.images)[currentImageIndex]" crossorigin="anonymous" class="w-full h-full object-cover" />
             
             <button @click="closeProductModal" class="absolute top-4 right-4 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#111827] hover:bg-white shadow-lg"><X :size="20" /></button>
             
             <!-- Pagination Dots -->
             <div v-if="getImages(selectedProduct.images).length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button v-for="(_, idx) in getImages(selectedProduct.images)" :key="idx" 
                  @click="currentImageIndex = idx"
                  class="w-2 h-2 rounded-full transition-all shadow-sm"
                  :class="currentImageIndex === idx ? 'bg-[#8B0000] w-4' : 'bg-white'"
                ></button>
             </div>

             <!-- Navigation Arrows -->
             <div v-if="getImages(selectedProduct.images).length > 1" class="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                <button @click.stop="prevImage" class="pointer-events-auto w-8 h-8 rounded-full bg-white/30 backdrop-blur flex items-center justify-center hover:bg-white"><ChevronLeft :size="16" /></button>
                <button @click.stop="nextImage" class="pointer-events-auto w-8 h-8 rounded-full bg-white/30 backdrop-blur flex items-center justify-center hover:bg-white"><ChevronRight :size="16" /></button>
             </div>
          </div>

          <!-- Modal Body -->
          <div class="p-8 pb-32 overflow-y-auto">
             <div class="flex justify-between items-start mb-2">
                <div>
                   <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ categories.find(c => c.id === selectedProduct.categoryId)?.name }}</span>
                   <h2 class="text-2xl font-black text-[#111827] uppercase leading-tight">{{ selectedProduct.name }}</h2>
                </div>
                <div class="bg-[#FDFBF7] border border-[#FBBF24] px-3 py-1 rounded-lg text-xs font-black text-[#8B0000]">
                   {{ formatCurrency(selectedProduct.price) }}
                </div>
             </div>
             
             <div class="h-[1px] w-full bg-gray-100 my-4"></div>
             
             <h5 class="text-xs font-bold text-[#111827] uppercase mb-2">Deskripsi</h5>
             <p class="text-sm text-gray-500 leading-relaxed">
               {{ selectedProduct.description || 'Dimsum premium dibuat dengan bahan-bahan pilihan tanpa pengawet. Tekstur kenyal, rasa daging yang kuat, dan disajikan dengan saus spesial.' }}
             </p>

             <div class="mt-6 flex items-center gap-4 text-xs font-bold text-gray-400">
               <div class="flex items-center gap-1"><Sparkles :size="14" class="text-[#FBBF24]" /> Fresh Made</div>
               <div class="flex items-center gap-1"><ChefHat :size="14" class="text-[#FBBF24]" /> Halal</div>
             </div>
          </div>

          <!-- Modal Footer (Sticky) -->
          <div class="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6 flex items-center gap-4">
             <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                <button @click="modalQty > 1 ? modalQty-- : null" class="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-[#111827] disabled:opacity-50"><Minus :size="16" /></button>
                <span class="w-4 text-center font-black text-sm">{{ modalQty }}</span>
                <button @click="modalQty++" class="w-10 h-10 flex items-center justify-center bg-[#111827] rounded-lg shadow-sm text-white"><Plus :size="16" /></button>
             </div>
             <button @click="addToCart(selectedProduct, modalQty)" class="flex-1 bg-[#8B0000] text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-xl active:scale-95 transition-all">
               Tambah {{ formatCurrency(selectedProduct.price * modalQty) }}
             </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- FAB -->
    <transition name="slide-up">
      <div v-if="cart.length > 0" class="cart-fab fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <button 
          @click="isDrawerOpen = true"
          class="w-full max-w-md bg-[#111827] text-white p-3 pr-4 rounded-[1.5rem] shadow-2xl flex items-center justify-between border border-white/10 active:scale-95 transition-transform"
        >
          <div class="flex items-center gap-4 pl-3">
             <div class="relative"><ShoppingBag :size="24" class="text-[#FBBF24]" /><span class="absolute -top-1 -right-1 w-4 h-4 bg-[#8B0000] rounded-full text-[9px] font-black flex items-center justify-center border border-[#111827]">{{ cartCount }}</span></div>
             <div class="text-left flex flex-col"><span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span><span class="text-sm font-black">{{ formatCurrency(cartTotal) }}</span></div>
          </div>
          <div class="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Detail <ChevronLeft class="rotate-90" :size="12" /></div>
        </button>
      </div>
    </transition>

    <CartDrawer 
      :is-open="isDrawerOpen" 
      :cart="cart" 
      @close="isDrawerOpen = false" 
      @update-qty="updateQty" 
      @checkout="handleCheckout" 
    />

  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>