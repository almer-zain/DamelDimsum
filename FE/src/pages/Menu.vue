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

// --- DATABASE CONNECTED UTILS ---

// THE FIX: Only show categories that actually have at least one product
const categoriesWithProducts = computed(() => {
  return categories.value.filter(cat => 
    products.value.some(prod => prod.categoryId === cat.id)
  );
});

// Update your groupedDisplay to use this new filtered list
const groupedDisplay = computed(() => {
  if (isSearching.value) return [{ id: 'search', name: 'Hasil Pencarian', products: filteredProducts.value }];
  
  if (activeCategory.value !== 'all') {
    const cat = categories.value.find(c => c.id === activeCategory.value);
    return [{ id: cat.id, name: cat.name, products: filteredProducts.value }];
  }

  let groups = [];
  // Use the filtered categories here
  categoriesWithProducts.value.forEach(cat => {
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


// Returns a single image URL for the card thumbnail
const getThumbnail = (imageJson) => {
  if (!imageJson) return null; // Let the template fallback handle it
  try {
    let images = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    if (Array.isArray(images) && images.length > 0) {
      return `${import.meta.env.VITE_IMAGE_URL}/${images[0]}`;
    }
  } catch (e) {
    console.warn("Failed to parse thumbnail");
    return null;
  }
  return null;
};


const getProductQty = (id) => {
  const item = cart.value.find(i => i.id === id);
  return item ? item.qty : 0;
};


</script>
<template>
  <div>

    <!-- PRODUCT DETAIL MODAL -->
     <Teleport to="body">
    <transition name="fade">
      <div v-if="selectedProduct" class="fixed inset-0 z-[100] flex h-[100vh] items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeProductModal"></div>
        
        <div class="product-modal-content  bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col border-t-[8px] lg:border-t-[10px] border-[#8B0000]">
          
          <!-- ... Modal Header/Body/Footer (Untouched logic, matches previous design) ... -->
          <!-- Modal Header (Image Gallery) -->
          <div class="relative h-64 bg-gray-50">
             <img :src="getImages(selectedProduct.images)[currentImageIndex]" crossorigin="anonymous" class="w-full h-full object-contain p-4 drop-shadow-xl" />
             
             <button @click="closeProductModal" class="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#111827] hover:bg-[#8B0000] hover:text-white shadow-lg transition-colors"><X :size="20" /></button>
             
             <!-- Pagination Dots -->
             <div v-if="getImages(selectedProduct.images).length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button v-for="(_, idx) in getImages(selectedProduct.images)" :key="idx" 
                  @click="currentImageIndex = idx"
                  class="w-2 h-2 rounded-full transition-all shadow-sm"
                  :class="currentImageIndex === idx ? 'bg-[#8B0000] w-4' : 'bg-gray-300'"
                ></button>
             </div>

             <!-- Navigation Arrows -->
             <div v-if="getImages(selectedProduct.images).length > 1" class="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
                <button @click.stop="prevImage" class="pointer-events-auto w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-[#111827] shadow-md hover:bg-[#8B0000] hover:text-white transition-colors"><ChevronLeft :size="16" /></button>
                <button @click.stop="nextImage" class="pointer-events-auto w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-[#111827] shadow-md hover:bg-[#8B0000] hover:text-white transition-colors"><ChevronRight :size="16" /></button>
             </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 pb-36 overflow-y-auto">
             <div class="flex justify-between items-start mb-4">
                <div>
                   <span class="text-[10px] font-black text-[#8B0000] uppercase tracking-widest">{{ categories.find(c => c.id === selectedProduct.categoryId)?.name }}</span>
                   <h2 class="text-2xl lg:text-3xl font-black text-[#111827] uppercase leading-tight mt-1">{{ selectedProduct.name }}</h2>
                </div>
             </div>
             
             <div class="inline-block bg-[#FDFBF7] border border-[#FBBF24] px-4 py-2 rounded-xl text-lg font-black text-[#8B0000] mb-6 shadow-sm">
                 {{ formatCurrency(selectedProduct.price) }}
             </div>
             
             <h5 class="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Deskripsi</h5>
             <p class="text-xs lg:text-sm text-gray-600 font-medium leading-relaxed">
               {{ selectedProduct.description || 'Dimsum premium dibuat dengan bahan-bahan pilihan tanpa pengawet. Tekstur kenyal, rasa daging yang kuat, dan disajikan dengan saus spesial.' }}
             </p>

             <div class="mt-8 flex flex-wrap items-center gap-4">
               <div class="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-[#111827] bg-gray-50 px-4 py-2 rounded-lg border border-gray-100"><Sparkles :size="14" class="text-[#FBBF24]" /> Fresh Made</div>
               <div class="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-[#111827] bg-gray-50 px-4 py-2 rounded-lg border border-gray-100"><ChefHat :size="14" class="text-[#FBBF24]" /> Halal</div>
             </div>
          </div>

          <!-- Modal Footer (Sticky) -->
          <div class="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 lg:p-6 flex items-center gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
             <div class="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button @click="modalQty > 1 ? modalQty-- : null" class="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-[#111827] disabled:opacity-50 hover:text-[#8B0000] transition-colors"><Minus :size="16" /></button>
                <span class="w-6 text-center font-black text-base lg:text-lg">{{ modalQty }}</span>
                <button @click="modalQty++" class="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-[#111827] rounded-lg shadow-sm text-white hover:bg-[#8B0000] transition-colors"><Plus :size="16" /></button>
             </div>
             <button @click="addToCart(selectedProduct, modalQty)" class="flex-1 bg-[#8B0000] text-white py-4 lg:py-5 rounded-xl font-black uppercase text-xs lg:text-sm tracking-widest shadow-xl shadow-red-900/20 active:scale-95 transition-all">
               Tambah • {{ formatCurrency(selectedProduct.price * modalQty) }}
             </button>
          </div>
          
        </div>
      </div>
    </transition>
    </Teleport>
  <div ref="mainContainerRef" class="min-h-screen bg-[#FDFBF7] font-['Poppins'] pb-32">
    
    <!-- FIXED BACKGROUND -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FDFBF7]">
       <!-- Subtle Grain -->
       <div class="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
    </div>

    <!-- HEADER & NAV (Sticky) -->
    <div class="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md transition-all duration-300 pt-4 pb-2 lg:pt-6 lg:pb-4 shadow-sm lg:shadow-none">
      <div class="max-w-6xl mx-auto px-4 lg:px-6">
        
        <!-- Top Row (Responsive stacking) -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 lg:mb-6">
          <!-- Back Button -->
          <button @click="router.push('/')" class="w-full sm:w-auto group flex items-center justify-center sm:justify-start gap-3 h-12 px-4 sm:px-0 sm:w-12 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#8B0000] hover:text-[#8B0000] transition-colors shrink-0 text-[#111827]">
             <ChevronLeft :size="20" class="group-hover:-translate-x-1 transition-transform" />
             <span class="sm:hidden font-black uppercase text-xs tracking-widest text-inherit">Kembali</span>
          </button>
          
          <!-- Search Bar -->
          <div class="relative w-full max-w-xl">
            <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari Menu Dimsum..." 
              class="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-[#111827] outline-none focus:border-[#8B0000] focus:shadow-lg transition-all"
            />
          </div>
        </div>

        <!-- Category Selector -->
        <div class="flex sm:justify-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          <button 
            @click="activeCategory = 'all'"
            class="whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="activeCategory === 'all' ? 'bg-[#8B0000] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#8B0000]'"
          >
            Semua
          </button>
          
          <!-- THE FIX: v-for changed to categoriesWithProducts -->
          <button 
            v-for="cat in categoriesWithProducts" :key="cat.id"
            @click="activeCategory = cat.id"
            class="whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="activeCategory === cat.id ? 'bg-[#8B0000] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#8B0000]'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="max-w-6xl mx-auto px-4 lg:px-6 pt-6 lg:pt-10 relative z-10">
      
      <!-- HERO BANNER -->
      <transition name="slide-up">
        <div v-if="!isSearching && activeCategory === 'all'" class="mb-12 lg:mb-20 relative w-full bg-[#9b1c1c] rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-16 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between border-4 border-[#9b1c1c]/50 min-h-[250px]">
           
           <div class="relative z-10 w-full md:w-1/2 space-y-4 text-center md:text-left mb-8 md:mb-0">
             <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-black/20 rounded-full text-[#FBBF24]">
               <Flame :size="12" />
               <span class="text-[9px] font-black uppercase tracking-widest text-white">Rasa Premium</span>
             </div>
             <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white italic tracking-tighter leading-[0.9]">
               DIMSUM <br/><span class="text-[#FBBF24]">PILIHAN.</span>
             </h1>
             <p class="text-[11px] lg:text-xs text-white/90 leading-relaxed font-medium max-w-sm mx-auto md:mx-0">
               Dimsum kukus dengan pilihan daging kualitas tinggi, dibuat segar dengan tekstur lembut dan rasa gurih di setiap gigitan.
             </p>
           </div>

           <!-- Responsive Hero Image -->
           <div class="relative z-10 w-48 sm:w-64 lg:w-96 md:-mr-12 lg:-mr-20">
              <img src="@/assets/images/dimsum2 2.png" class="w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
           </div>
        </div>
      </transition>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="py-20 text-center">
        <div class="w-12 h-12 border-4 border-[#FBBF24] border-t-[#8B0000] rounded-full animate-spin mx-auto mb-4"></div>
        <p class="font-black uppercase tracking-widest text-[10px] lg:text-xs text-gray-400">Memuat Menu...</p>
      </div>

      <!-- MENU GRID -->
      <div v-else class="space-y-24 lg:space-y-32">
        <div v-for="group in groupedDisplay" :key="group.id">
          
          <!-- Category Header -->
          <div class="text-center mb-16 lg:mb-24">
            <span class="inline-block px-5 py-1.5 bg-white rounded-full text-[9px] lg:text-[10px] font-black text-[#8B0000] uppercase tracking-widest mb-4 shadow-sm border border-gray-100">
              Produk Kami
            </span>
            <h3 class="text-3xl sm:text-4xl font-black text-[#111827] uppercase tracking-tighter">
               DIMSUM <span class="text-[#8B0000]">{{ group.name }}</span>
            </h3>
          </div>

          <!-- RESPONSIVE GRID: 1 col on mobile, 2 on tablet, 3 on desktop -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-20 lg:gap-y-28 mt-10">
            <div 
              v-for="product in group.products" :key="product.id"
              @click="openProductModal(product)"
              class="group relative bg-[#9b1c1c] rounded-[2rem] p-6 lg:p-8 pt-20 lg:pt-24 text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full border border-[#8B0000]"
            >
              
              <!-- Floating Image (Responsive sizing) -->
              <div class="absolute -top-14 lg:-top-16 left-1/2 -translate-x-1/2 w-40 h-40 lg:w-48 lg:h-48 z-20">
                 <div class="relative w-full h-full transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
                    <img v-if="getThumbnail(product.images)" :src="getThumbnail(product.images)" crossorigin="anonymous" class="w-full h-full object-contain" />
                    <div v-else class="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                      <Sparkles class="text-gray-300" :size="32" />
                    </div>
                 </div>
              </div>

              <!-- Content -->
              <div class="relative pt-10 z-10 flex flex-col h-full items-center">
                <h4 class="font-black text-[#FBBF24] text-base lg:text-lg uppercase leading-tight mb-2 lg:mb-3 line-clamp-2">
                  {{ product.name }}
                </h4>
                
                <p class="text-[9px] lg:text-[10px] text-white/80 font-medium leading-relaxed line-clamp-3 mb-6 lg:mb-8 flex-1">
                  {{ product.description || 'Paket dimsum original dengan pilihan daging segar, dibuat tanpa bahan pengawet.' }}
                </p>

                <div class="mt-auto w-full space-y-4">
                   <div class="font-black text-white text-xl lg:text-2xl text-left pl-2">
                      <span class="text-xs mr-1 opacity-80">Rp</span>{{ formatCurrency(product.price).replace('Rp', '').trim() }}
                   </div>
                   
                   <button 
                     @click.stop="addToCart(product)"
                     class="w-full py-3 lg:py-3.5 bg-[#c82828] text-white rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#8B0000] transition-colors flex items-center justify-center gap-2 shadow-inner"
                   >
                     Tambah <Plus :size="14" />
                   </button>
                </div>
              </div>

              <!-- Dynamic Qty Badge -->
              <div v-if="getProductQty(product.id) > 0" class="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 z-30 bg-[#FBBF24] text-[#8B0000] font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#FDFBF7] shadow-lg">
                {{ getProductQty(product.id) }}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>


    <!-- FAB (Floating Cart Button) -->
    <transition name="slide-up">
      <div v-if="cart.length > 0" class="cart-fab fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <button 
          @click="isDrawerOpen = true"
          class="w-full max-w-md bg-[#111827] text-white p-3 pr-4 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-between border border-white/10 active:scale-95 transition-transform"
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
  </div>

</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>