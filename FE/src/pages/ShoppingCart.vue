<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Trash2, Plus, Minus, ChevronLeft, ShoppingBag, 
  ArrowRight, Truck, ShieldCheck, Ticket 
} from 'lucide-vue-next';
import gsap from 'gsap';
import { showToast } from '@/utils/eventBus';
import { settings } from '@/store/settings';

const router = useRouter();


const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;


// --- STATE ---
const cart = ref([]);
const isLoading = ref(true);

// --- CART LOGIC ---
const loadCart = () => {
  const saved = localStorage.getItem('damel_cart');
  if (saved) cart.value = JSON.parse(saved);
  isLoading.value = false;
};

const saveCart = () => {
  localStorage.setItem('damel_cart', JSON.stringify(cart.value));
};

const updateQty = (id, change) => {
  const index = cart.value.findIndex(item => item.id === id);
  if (index !== -1) {
    const newQty = cart.value[index].qty + change;
    if (newQty > 0) cart.value[index].qty = newQty;
    else cart.value.splice(index, 1);
    saveCart();
  }
};

const removeItem = (id) => {
  cart.value = cart.value.filter(i => i.id !== id);
  saveCart();
  showToast('Item dihapus dari keranjang', 'success');
};

// --- CALCULATIONS ---
const cartTotal = computed(() => cart.value.reduce((acc, item) => acc + (item.price * item.qty), 0));
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// --- CHECKOUT LOGIC ---
const handleCheckout = () => {
  let phone = settings.mainWhatsapp || '628123456789';
  phone = phone.replace(/\D/g, '');
  
  let message = `👋 Halo *${settings.siteName || 'Damel Dimsum'}*,\n`;
  message += `Saya ingin memesan melalui website:\n\n`;
  message += `--------------------------------\n`;
  message += `🛒 *DETAIL PESANAN*\n`;
  message += `--------------------------------\n`;

  cart.value.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.qty}x) — ${formatCurrency(item.price * item.qty)}\n`;
  });

  message += `--------------------------------\n`;
  message += `💰 *TOTAL: ${formatCurrency(cartTotal.value)}*\n\n`;
  message += `Mohon segera diproses ya. Terima kasih! 🙏`;

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

// --- ANIMATIONS ---
onMounted(() => {
  loadCart();
  gsap.from(".cart-item", {
    opacity: 0,
    x: -20,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out"
  });
  gsap.from(".summary-card", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.4,
    ease: "power3.out"
  });
});


// --- IMAGE HELPER ---
const getImageUrl = (imageJson) => {
  // 1. Fallback if no data exists
  if (!imageJson || imageJson === '[]') return '/src/assets/images/LogoDamelDimsum.png';
  
  try {
    // 2. Parse the JSON (handle if it's already an array)
    const images = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    
    // 3. Return the first image or the brand logo
    if (Array.isArray(images) && images.length > 0) {
      return `${IMAGE_BASE_URL}/${images[0]}`;
    }
  } catch (e) {
    console.warn("Invalid image data found for an item");
  }
  
  // 4. Ultimate fallback
  return '/src/assets/images/LogoDamelDimsum.png';
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 font-['Poppins'] relative overflow-hidden">
    
    <!-- Background Decor -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] z-0"></div>
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B0000]/5 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="max-w-6xl mx-auto relative z-10">
      
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <button @click="router.push('/menu')" class="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#8B0000] transition-colors mb-4">
            <ChevronLeft :size="16" class="group-hover:-translate-x-1 transition-transform" /> Kembali Belanja
          </button>
          <h1 class="text-4xl lg:text-6xl font-black text-[#111827] tracking-tighter uppercase italic leading-none">
            Keranjang <span class="text-[#8B0000] not-italic">Belanja</span>
          </h1>
        </div>
        
        <div class="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-10 h-10 bg-[#FBBF24] rounded-full flex items-center justify-center text-[#8B0000]">
            <ShoppingBag :size="20" />
          </div>
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Item Terpilih</p>
            <p class="text-lg font-black text-[#111827] leading-none">{{ cart.length }} Produk</p>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div v-if="cart.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- LEFT: ITEM LIST (8 Cols) -->
        <div class="lg:col-span-8 space-y-4">
          <div v-for="item in cart" :key="item.id" class="cart-item bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl transition-all duration-500 group">
            
                <!-- Product Image -->
                <div class="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shadow-inner shrink-0 border border-gray-100">
                <img 
                    :src="getImageUrl(item.images)" 
                    crossorigin="anonymous"
                    class="w-full h-full object-cover" 
                    @error="(e) => e.target.src = '/src/assets/images/LogoDamelDimsum.png'"
                />
                </div>

            <!-- Details -->
            <div class="flex-1 text-center sm:text-left">
              <h3 class="text-lg font-black text-[#111827] uppercase tracking-tight mb-1">{{ item.name }}</h3>
              <p class="text-xs font-bold text-[#8B0000] mb-4">{{ formatCurrency(item.price) }} / pcs</p>
              
              <!-- Features -->
              <div class="flex justify-center sm:justify-start gap-3">
                 <span class="text-[8px] font-black uppercase px-2 py-1 bg-gray-50 rounded text-gray-400 border border-gray-100 italic">Freshly Steamed</span>
                 <span class="text-[8px] font-black uppercase px-2 py-1 bg-gray-50 rounded text-gray-400 border border-gray-100 italic">No MSG</span>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <button @click="updateQty(item.id, -1)" class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"><Minus :size="14" /></button>
                <span class="w-6 text-center font-black text-sm">{{ item.qty }}</span>
                <button @click="updateQty(item.id, 1)" class="w-8 h-8 rounded-lg bg-[#111827] shadow-sm flex items-center justify-center text-white hover:bg-[#8B0000] transition-colors"><Plus :size="14" /></button>
              </div>
              
              <button @click="removeItem(item.id)" class="p-3 text-gray-300 hover:text-red-600 transition-colors">
                <Trash2 :size="20" />
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: SUMMARY (4 Cols) -->
        <div class="lg:col-span-4">
          <div class="summary-card sticky top-32 space-y-6">
            
            <!-- Checkout Card -->
            <div class="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <!-- Wood pattern overlay -->
              <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>

              <h3 class="text-xl font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4 italic">Ringkasan Pesanan</h3>
              
              <div class="space-y-4 mb-10">
                <div class="flex justify-between text-sm font-medium text-gray-400">
                  <span>Subtotal</span>
                  <span class="text-white">{{ formatCurrency(cartTotal) }}</span>
                </div>
                <div class="flex justify-between text-sm font-medium text-gray-400">
                  <span>Biaya Pengiriman</span>
                  <span class="text-[#FBBF24] italic">Check via WA</span>
                </div>
                <div class="pt-4 border-t border-white/10 flex justify-between items-end">
                   <span class="text-xs font-black uppercase tracking-widest text-gray-400">Total Bayar</span>
                   <span class="text-3xl font-black text-[#FBBF24]">{{ formatCurrency(cartTotal) }}</span>
                </div>
              </div>

              <button 
                @click="handleCheckout"
                class="w-full py-5 bg-[#25D366] hover:bg-white hover:text-[#25D366] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                PESAN VIA WHATSAPP <ArrowRight :size="18" />
              </button>
            </div>

            <!-- Trust Badges -->
            <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ShieldCheck :size="20" /></div>
                <p class="text-[10px] font-bold text-gray-500 uppercase tracking-tight leading-snug">Jaminan Kualitas & <br/>Bahan Segar Pilihan</p>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Truck :size="20" /></div>
                <p class="text-[10px] font-bold text-gray-500 uppercase tracking-tight leading-snug">Pengiriman Frozen Food <br/>Aman & Cepat</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- EMPTY STATE -->
      <div v-else class="py-40 text-center bg-white rounded-[3rem] shadow-xl border border-gray-100">
         <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
            <ShoppingBag :size="48" />
         </div>
         <h2 class="text-2xl font-black text-[#111827] uppercase tracking-tighter mb-2">Keranjangmu Kosong</h2>
         <p class="text-gray-400 text-sm mb-10 max-w-xs mx-auto font-medium">Sepertinya kamu belum memilih dimsum lezat hari ini.</p>
         <button @click="router.push('/menu')" class="bg-[#8B0000] text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
            Lihat Katalog Menu
         </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.cart-item { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.cart-item:hover { transform: scale(1.01); }
</style>