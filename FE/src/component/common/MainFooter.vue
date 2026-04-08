<script setup>
import { onMounted, ref, computed } from 'vue';
import { 
  Phone, Mail, MapPin, Instagram, Facebook, 
  ArrowRight, Globe, ShieldCheck 
} from 'lucide-vue-next';
import { settings } from '@/store/settings';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const footerRef = ref(null);

// --- DYNAMIC UTILS ---
const dynamicLogo = computed(() => {
  if (!settings.siteLogo) return null;
  return `${import.meta.env.VITE_IMAGE_URL}/${settings.siteLogo}`;
});

const instagramUrl = computed(() => {
  return settings.instagram 
    ? `https://instagram.com/${settings.instagram.replace('@', '')}` 
    : '#';
});

const facebookUrl = computed(() => {
  return settings.instagram 
    ? `https://facebook.com/${settings.instagram.replace('@', '')}` 
    : '#';
});


const formattedPhone = computed(() => {
  return settings.mainWhatsapp ? `+${settings.mainWhatsapp}` : 'N/A';
});

onMounted(() => {
  gsap.from(".footer-col", {
    scrollTrigger: {
      trigger: footerRef.value,
      scroller: ".home-scroller",
      start: "top 90%",
    },
    y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out"
  });
});
</script>

<template>
  <footer ref="footerRef" class="relative bg-[#111827] pt-24 pb-12 px-6 lg:px-20 overflow-hidden font-['Poppins']">
    
    <!-- BACKGROUND DECORATION -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
    <div class="absolute -bottom-20 -left-20 opacity-[0.02] pointer-events-none select-none">
      <h1 class="text-[20rem] font-black italic text-white leading-none uppercase">Damel</h1>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        
        <!-- COL 1: BRAND IDENTITY -->
        <div class="footer-col space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl shadow-red-900/20 flex items-center justify-center overflow-hidden">
              <!-- DYNAMIC LOGO -->
              <img :src="dynamicLogo || '/src/assets/images/LogoDamelDimsum.png'" crossorigin="anonymous" alt="Logo" class="w-full h-full object-contain" />
            </div>
            <div>
              <h4 class="text-white font-black tracking-[0.3em] uppercase leading-none italic">{{ settings.siteName || 'DÀMEL' }}</h4>
            </div>
          </div>
          <p class="text-gray-400 text-xs font-medium leading-relaxed max-w-[250px]">
            Menyajikan kualitas Dimsum hotel bintang lima langsung ke meja makan Anda. Dibuat fresh setiap hari.
          </p>
          <div class="flex gap-4">
            <!-- DYNAMIC INSTAGRAM -->
            <a :href="instagramUrl" target="_blank" class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#8B0000] hover:text-white transition-all"><Instagram :size="18" /></a>
            <a :href="facebookUrl" class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#8B0000] hover:text-white transition-all"><Facebook :size="18" /></a>
          </div>
        </div>

        <!-- COL 2: NAVIGATION -->
        <div class="footer-col space-y-8">
          <h5 class="text-white font-black uppercase tracking-[0.4em] text-[10px] border-b border-white/5 pb-4">Eksplorasi</h5>
          <nav class="flex flex-col gap-4">
            <router-link to="/" class="text-gray-400 hover:text-[#D4AF37] transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">Home <ArrowRight :size="12" /></router-link>
            <router-link to="/menu" class="text-gray-400 hover:text-[#D4AF37] transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">Katalog Menu <ArrowRight :size="12" /></router-link>
            <router-link to="/find-reseller" class="text-gray-400 hover:text-[#D4AF37] transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">Cari Reseller <ArrowRight :size="12" /></router-link>
            <!-- STAFF ACCESS REMOVED -->
          </nav>
        </div>

        <!-- COL 3: CONTACT INFO -->
        <div class="footer-col space-y-8">
          <h5 class="text-white font-black uppercase tracking-[0.4em] text-[10px] border-b border-white/5 pb-4">Kontak Pusat</h5>
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]"><Phone :size="14" /></div>
              <div>
                <p class="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">WhatsApp</p>
                <p class="text-white font-bold text-md">{{ formattedPhone }}</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]"><Mail :size="14" /></div>
              <div>
                <p class="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Email Bisnis</p>
                <p class="text-white font-bold text-sm">{{ settings.email || 'halo@dameldimsum.com' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- COL 4: LOCATION -->
        <div class="footer-col space-y-8">
          <h5 class="text-white font-black uppercase tracking-[0.4em] text-[10px] border-b border-white/5 pb-4">Lokasi Produksi</h5>
          <div class="flex items-start gap-4">
            <div class="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]"><MapPin :size="14" /></div>
            <div>
              <p class="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Kantor Utama</p>
              <!-- DYNAMIC ADDRESS -->
              <p class="text-white font-bold text-sm leading-relaxed max-w-[200px]">
                {{ settings.address || 'Purwokerto, Jawa Tengah, Indonesia' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM BAR -->
      <div class="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">
          &copy; 2026 {{ settings.siteName || 'Damel Dimsum House' }}.
        </p>
        <div class="flex items-center gap-8">
           <span class="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
              <Globe :size="12" /> INDONESIA
           </span>
        </div>
      </div>
    </div>
  </footer>
</template>