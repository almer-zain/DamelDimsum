<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Search, MapPin, Phone, Store, User, CheckCircle, ChevronLeft, Sparkles } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import api from '@/utils/api';
import gsap from 'gsap';

const router = useRouter();

// --- STATE ---
const searchQuery = ref('');
const resellers = ref([]);
const isLoading = ref(true);

// --- API ACTIONS ---
const loadResellers = async () => {
  try {
    const res = await api.get('/resellers/search'); 
    resellers.value = res.data.data || [];
  } catch (e) {
    console.error("Gagal memuat data agen:", e);
  } finally {
    isLoading.value = false;
    animateEntrance();
  }
};

// --- COMPUTED LOGIC ---
const filteredResellers = computed(() => {
  if (!searchQuery.value) return resellers.value;
  const q = searchQuery.value.toLowerCase();
  return resellers.value.filter(r => 
    r.city.toLowerCase().includes(q) || 
    r.nameShop.toLowerCase().includes(q) ||
    r.nameOwner.toLowerCase().includes(q)
  );
});

// --- ANIMATIONS ---
const animateEntrance = () => {
  nextTick(() => {
    const tl = gsap.timeline();
    tl.from(".page-header", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".search-bar", { scale: 0.95, opacity: 0, duration: 0.6, ease: "back.out(1.5)" }, "-=0.4")
      .fromTo(".reseller-card", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }, "-=0.2"
      );
  });
};

// --- SCROLL FIX ---
onMounted(() => {
  document.documentElement.style.overflow = 'auto';
  document.body.style.overflow = 'auto';
  window.scrollTo(0, 0); 
  loadResellers();
});

onUnmounted(() => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

// --- WHATSAPP HELPER ---
const formatWA = (number, shopName) => {
  let cleanNumber = number.replace(/\D/g, '');
  if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.slice(1);
  const text = encodeURIComponent(`Halo ${shopName}, saya ingin pesan Dimsum Damel dari daerah saya.`);
  return `https://wa.me/${cleanNumber}?text=${text}`;
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] font-['Poppins'] pt-24 pb-32 relative overflow-x-hidden">
    
    <!-- BACKGROUND DECORATION -->
    <div class="fixed inset-0 pointer-events-none z-0">
       <!-- Subtle Rice Paper -->
       <div class="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
       <!-- Glowing Orbs -->
       <div class="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-[#FBBF24]/10 rounded-full blur-[100px] pointer-events-none"></div>
       <div class="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-[#8B0000]/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="max-w-6xl mx-auto px-6 relative z-10">
      
      <!-- TOP NAVIGATION -->
      <div class="mb-12">
        <button @click="router.push('/')" class="group flex items-center gap-3 text-[#111827] font-black uppercase tracking-widest text-xs hover:text-[#8B0000] transition-colors w-max">
          <div class="w-8 h-8 rounded-full border-2 border-[#111827] flex items-center justify-center group-hover:border-[#8B0000] transition-colors bg-white">
             <ChevronLeft :size="14" class="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Kembali ke Beranda
        </button>
      </div>

      <!-- HEADER SECTION -->
      <div class="page-header text-center mb-16 max-w-2xl mx-auto space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
            <MapPin :size="14" class="text-[#8B0000]" />
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Official Directory</span>
        </div>
        <h1 class="text-4xl lg:text-6xl font-black text-[#111827] tracking-tighter uppercase italic leading-[0.9]">
          Cari <span class="text-[#8B0000] not-italic">Agen</span> Terdekat.
        </h1>
        <p class="text-gray-500 font-medium text-sm lg:text-base leading-relaxed">
          Lebih cepat sampai, lebih hemat ongkir. Temukan mitra resmi Damel Dimsum di kota Anda dan pesan langsung via WhatsApp.
        </p>
      </div>

      <!-- MASSIVE SEARCH BAR -->
      <div class="search-bar relative max-w-3xl mx-auto mb-20 group">
        <!-- Glow Effect behind Search -->
        <div class="absolute inset-0 bg-gradient-to-r from-[#8B0000]/20 to-[#FBBF24]/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative bg-white rounded-full shadow-2xl border-4 border-white flex items-center px-8 py-5 transition-transform duration-300 group-focus-within:scale-[1.02]">
          <Search class="text-gray-400 mr-5 shrink-0 group-focus-within:text-[#8B0000] transition-colors" :size="24" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Ketik Kota, Daerah, atau Nama Toko..." 
            class="w-full text-lg lg:text-xl font-black text-[#111827] outline-none placeholder-gray-300 bg-transparent"
          />
        </div>
      </div>

      <!-- RESULTS GRID -->
      <div v-if="isLoading" class="text-center py-20 flex flex-col items-center opacity-50">
         <div class="w-12 h-12 border-4 border-[#FBBF24] border-t-[#8B0000] rounded-full animate-spin mb-4"></div>
         <p class="font-black uppercase text-[#111827] tracking-widest text-xs">Mencari Lokasi...</p>
      </div>

      <div v-else-if="filteredResellers.length === 0" class="text-center py-32 bg-white/40 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-300">
         <Store :size="48" class="text-gray-300 mx-auto mb-4" />
         <p class="font-black text-[#111827] uppercase tracking-wide text-lg mb-2">Agen Tidak Ditemukan</p>
         <p class="text-gray-500 text-sm max-w-md mx-auto mb-6">Belum ada mitra resmi Damel Dimsum di area pencarian ini.</p>
         <router-link to="/reseller" class="inline-block px-8 py-4 bg-[#111827] text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#8B0000] transition-colors shadow-lg">
           Jadilah Agen Pertama!
         </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div 
           v-for="reseller in filteredResellers" 
           :key="reseller.id"
           class="reseller-card bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(139,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
         >
           <!-- Card Top Accent -->
           <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FBBF24] to-transparent"></div>

           <!-- Header -->
           <div class="flex justify-between items-start mb-6 relative z-10">
             <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#111827] group-hover:bg-[#FBBF24] transition-colors shadow-inner">
                <Store :size="24" />
             </div>
             <div class="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 border border-emerald-100">
               <CheckCircle :size="12" /> Verified
             </div>
           </div>

           <!-- Content -->
           <div class="relative z-10 flex-1">
             <h3 class="font-black text-2xl text-[#111827] uppercase tracking-tight mb-2 group-hover:text-[#8B0000] transition-colors line-clamp-1">
               {{ reseller.nameShop || 'Mitra Damel' }}
             </h3>
             <div class="flex items-center gap-2 text-gray-400 text-xs font-bold mb-6 border-b border-gray-100 pb-6">
                <User :size="12" /> {{ reseller.nameOwner }}
             </div>

             <div class="space-y-4 mb-8">
               <div class="flex items-start gap-4">
                 <div class="w-8 h-8 rounded-full bg-[#111827]/5 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin :size="14" class="text-[#8B0000]" />
                 </div>
                 <div>
                    <span class="block text-[#111827] font-black uppercase tracking-wider text-sm mb-1">{{ reseller.city }}</span>
                    <span class="block text-gray-500 text-xs leading-relaxed line-clamp-2">{{ reseller.address }}</span>
                 </div>
               </div>
             </div>
           </div>

           <!-- Action Button -->
           <div class="mt-auto relative z-10">
             <a 
               :href="formatWA(reseller.whatsapp, reseller.nameShop)" 
               target="_blank"
               class="w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/30 transition-all active:scale-95"
             >
               <Phone :size="16" /> Chat Sekarang
             </a>
           </div>
         </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Ensure the text clamps correctly for long addresses/names */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>