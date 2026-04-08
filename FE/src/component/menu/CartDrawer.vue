<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Maximize2 } from 'lucide-vue-next'; // Added Maximize2
import { useRouter } from 'vue-router'; // Added Router
import gsap from 'gsap';

const props = defineProps({
  isOpen: Boolean,
  cart: Array
});

const emit = defineEmits(['close', 'update-qty', 'checkout']);
const router = useRouter(); // Initialize router

const drawerRef = ref(null);
const overlayRef = ref(null);

const cartTotal = computed(() => props.cart.reduce((acc, item) => acc + (item.price * item.qty), 0));
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// --- NAVIGATION ---
const goToFullCart = () => {
  emit('close'); // Close drawer first for smooth transition
  router.push('/cart');
};


// --- ANIMATIONS (Fixed for Centering) ---
watch(() => props.isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    gsap.to(overlayRef.value, { autoAlpha: 1, duration: 0.3 });
    // We use xPercent: -50 to maintain your CSS centering
    gsap.to(drawerRef.value, { y: 0, xPercent: -50, duration: 0.5, ease: "expo.out" });
  } else {
    document.body.style.overflow = '';
    gsap.to(drawerRef.value, { y: '100%', xPercent: -50, duration: 0.4, ease: "expo.in" });
    gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.3, delay: 0.1 });
  }
});

onMounted(() => {
  gsap.set(drawerRef.value, { y: '100%', xPercent: -50 });
  gsap.set(overlayRef.value, { autoAlpha: 0 });
});
</script>

<template>
  <teleport to="body">
    <!-- OVERLAY -->
    <div 
      ref="overlayRef"
      @click="$emit('close')"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] opacity-0 invisible"
    ></div> 

    <!-- DRAWER -->
    <div 
      ref="drawerRef"
      class="fixed max-w-[55rem] left-1/2 bottom-0 w-full bg-white rounded-t-[2.5rem] z-[9999] max-h-[85vh] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.3)]"
    >
      <!-- Handle -->
      <div class="w-full flex justify-center pt-4 pb-2 cursor-pointer" @click="$emit('close')">
        <div class="w-16 h-1.5 bg-gray-200 rounded-full"></div>
      </div>

      <!-- Header -->
      <div class="px-8 pb-6 border-b border-gray-100 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#FBBF24] rounded-full flex items-center justify-center text-[#8B0000]">
            <ShoppingBag :size="20" />
          </div>
          <h3 class="text-xl font-black text-[#111827] uppercase tracking-tighter">Pesanan Anda</h3>
        </div>
        
        <!-- NEW: FULL CART BUTTON -->
        <button 
          @click="goToFullCart"
          class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 hover:text-[#8B0000] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Maximize2 :size="14" /> Layar Penuh
        </button>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <div v-if="cart.length === 0" class="text-center py-10 text-gray-400 font-bold uppercase text-xs tracking-widest italic">
           Belum ada dimsum terpilih...
        </div>
        
        <div v-else v-for="item in cart" :key="item.id" class="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
           <!-- Qty Control -->
           <div class="flex flex-col items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              <button @click="$emit('update-qty', item.id, 1)" class="w-6 h-6 flex items-center justify-center text-[#111827] hover:text-[#8B0000] active:scale-75 transition-all"><Plus :size="14" /></button>
              <span class="text-xs font-black">{{ item.qty }}</span>
              <button @click="$emit('update-qty', item.id, -1)" class="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 active:scale-75 transition-all">
                <Minus v-if="item.qty > 1" :size="14" />
                <Trash2 v-else :size="14" />
              </button>
           </div>

           <div class="flex-1">
             <h4 class="font-bold text-[#111827] text-sm uppercase leading-tight">{{ item.name }}</h4>
             <p class="text-[10px] text-gray-400 mt-1 font-medium">{{ formatCurrency(item.price) }} / pcs</p>
           </div>

           <div class="text-right">
             <p class="font-black text-[#8B0000]">{{ formatCurrency(item.price * item.qty) }}</p>
           </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 bg-white border-t border-gray-100 pb-10">
        <div class="flex justify-between items-center mb-6 px-2">
           <span class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Estimasi Total</span>
           <span class="text-2xl font-black text-[#111827]">{{ formatCurrency(cartTotal) }}</span>
        </div>

        <!-- BUTTON GROUP -->
        <div class="space-y-3">
          <!-- Primary Action -->
          <button 
            @click="$emit('checkout')"
            class="w-full py-5 bg-[#25D366] hover:bg-[#111827] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-900/10 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Konfirmasi via WhatsApp <ArrowRight :size="18" />
          </button>

          <!-- Secondary Action: Other Payment -->
          <button 
            @click="router.push('/cart')"
            class="w-full py-4 bg-gray-50 text-gray-400 hover:text-[#111827] hover:bg-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
          >
            Metode Pembayaran Lain
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* Scrollbar cleanup */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
</style>