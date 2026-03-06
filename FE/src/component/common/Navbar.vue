<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShoppingBag, X, Phone, MapPin, Instagram, Facebook, Menu, ChevronRight, Mail } from 'lucide-vue-next';
import { settings } from '@/store/settings';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { cartStore } from '@/store/cart';

gsap.registerPlugin(ScrollToPlugin);

const route = useRoute();
const router = useRouter();


// --- DATABASE CONNECTED UTILS ---
const dynamicLogo = computed(() => {
  if (!settings.siteLogo) return null;
  return `${import.meta.env.VITE_IMAGE_URL}/${settings.siteLogo}`;
});

const formattedPhone = computed(() => {
  return settings.mainWhatsapp ? `+${settings.mainWhatsapp}` : '+62 123 4568 9000';
});

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const mobileMenuRef = ref(null);
const menuOverlayRef = ref(null);

// This is now reactive. If an item is added in Menu.vue, this updates instantly.
const cartCount = computed(() => cartStore.count.value);

let menuTl;
let scrollerElement = null;

// --- SCROLL WATCHER ---
const handleScroll = (e) => {
  // Check the scroll position of the div, not the window
  const scrollPos = e.target.scrollTop !== undefined ? e.target.scrollTop : window.scrollY;
  isScrolled.value = scrollPos > 20;
};

onMounted(() => {
  // Find the custom scroller (Home) or fallback to window (Menu)
  scrollerElement = document.querySelector('.home-scroller');
  
  if (scrollerElement) {
    scrollerElement.addEventListener('scroll', handleScroll);
  } else {
    window.addEventListener('scroll', handleScroll);
  }

  // Mobile Menu Setup
  gsap.set(mobileMenuRef.value, { x: '100%' });
  menuTl = gsap.timeline({ paused: true });
  menuTl
    .to(menuOverlayRef.value, { autoAlpha: 1, duration: 0.2, ease: "power2.inOut" })
    .to(mobileMenuRef.value, { x: 0, duration: 0.35, ease: "expo.out" }, "-=0.2")
    .from(".m-link", { x: 50, opacity: 0, stagger: 0.08, duration: 0.25, ease: "power4.out" }, "-=0.4")
    .from(".m-footer-item", { opacity: 0, y: 20, stagger: 0.1, duration: 0.25 }, "-=0.3");
});

watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    menuTl.play();
  } else {
    document.body.style.overflow = '';
    menuTl.reverse();
  }
});

onUnmounted(() => {
  if (scrollerElement) {
    scrollerElement.removeEventListener('scroll', handleScroll);
  } else {
    window.removeEventListener('scroll', handleScroll);
  }
  if (menuTl) menuTl.kill();
});

// --- NAVIGATION CONFIG (FIXED) ---
// CHANGE BACK TO '#' ONLY. The 'home' part is handled by logic.
const navLinks = [
  { name: 'berada', path: '#home' },
  { name: 'Tentang Kami', path: '#about' }, // Fixed: was home#about
  { name: 'Keunggulan', path: '#features' }, // Fixed: was home#features
  { name: 'Produk', path: '/menu' }, 
  { name: 'Reseller', path: '#reseller' }, // Fixed: was home#reseller
];
const handleNavClick = async (path) => {
  isMobileMenuOpen.value = false;

  if (path.startsWith('#')) {
    if (route.path === '/') {
      const target = document.querySelector(path);
      if (target) gsap.to('.home-scroller', { scrollTop: target.offsetTop, duration: 1.2, ease: "power3.inOut" });
    } else {
      await router.push('/');
      setTimeout(() => {
        const target = document.querySelector(path);
        if (target) gsap.to('.home-scroller', { scrollTop: target.offsetTop, duration: 1.2, ease: "power3.inOut" });
      }, 600);
    }
  } else {
    // Normal navigation to /menu, /find-reseller, or /cart
    if (route.path !== path) router.push(path);
  }
};
</script>

<template>
  <header 
    :class="[
      'fixed top-0 w-full z-[50] transition-all duration-700 ease-in-out',
      isScrolled ? 'py-3 bg-[#FDFBF7]/95 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.3)]' : 'py-6 bg-[#FDFBF7]'
    ]"
  >
    <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>

    <div class="max-w-[100rem] mx-auto px-6 lg:px-12 flex justify-between items-center relative z-10">
      
      <!-- LOGO -->
      <router-link to="/" class="flex items-center gap-3 group cursor-pointer">
        <div class="overflow-hidden rounded-full w-10 h-10 lg:w-12 lg:h-12 border border-white/10 group-hover:border-[#D4AF37]/50 transition-all duration-500">
            <img :src="dynamicLogo || '/src/assets/images/LogoDamelDimsum.png'" alt="Logo" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div class="flex flex-col">
          <span class="text-black font-black tracking-[0.1em] uppercase text-[21px] lg:text-base italic leading-none group-hover:text-[#D4AF37] transition-colors duration-300">
            {{ settings.siteName || 'DÀMEL' }}
          </span>
        </div>
      </router-link>

      <!-- DESKTOP NAV -->
      <nav class="hidden md:flex items-center gap-10">
        <!-- USE ANCHOR TAGS WITH HREF -->
        <a 
          v-for="link in navLinks" :key="link.name" 
          :href="link.path"
          @click="(e) => handleNavClick(e, link.path)"
          class="relative text-[12px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-black transition-all py-2 group cursor-pointer"
        >
          {{ link.name }}
          <span class="absolute bottom-0 left-0 w-0 h-[2px] bg-[#C62828] transition-all duration-500 ease-out group-hover:w-full"></span>
        </a>
      </nav>

      <!-- ACTIONS -->
      <div class="flex items-center gap-4 lg:gap-8">
        <button 
          @click="handleNavClick('/cart')"
          class="relative text-gray-600 hover:text-[#D4AF37] transition-all group active:scale-90 cursor-pointer p-2"
        >
          <ShoppingBag :size="22" stroke-width="2" />
          <!-- DYNAMIC COUNT -->
          <span v-if="cartCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-[#C62828] text-white text-[9px] font-black flex items-center justify-center rounded-full border border-[#111827] animate-pulse">
            {{ cartCount }}
          </span>
        </button>

        <button @click="isMobileMenuOpen = true" class="md:hidden text-black p-2 cursor-pointer hover:text-[#D4AF37] transition-colors active:scale-90">
          <Menu :size="30" />
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <!-- OVERLAY -->
    <div 
      ref="menuOverlayRef"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/90 z-[9998] opacity-0 invisible pointer-events-none cursor-pointer"
      :class="{ 'visible pointer-events-auto': isMobileMenuOpen }"
    ></div>

    <!-- DRAWER -->
    <div 
      ref="mobileMenuRef"
      class="fixed top-0 right-0 w-[85%] max-w-[420px] h-full !bg-[#ffffff] z-[9999] flex flex-col border-l border-white/10"
    >
      <div class="absolute inset-0 !bg-[#111827]"></div>

      <div class="relative z-10 flex flex-col h-full">
        <!-- Drawer Header -->
        <div class="flex justify-between items-center px-8 py-10">
          <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#C62828]/10 border border-[#C62828]/30 flex items-center justify-center font-black text-[#C62828] text-xs">D</div>
              <span class="text-gray-400 font-bold tracking-[0.4em] text-[9px] uppercase italic">Portals</span>
          </div>
          <button 
            @click="isMobileMenuOpen = false" 
            class="group w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-[#C62828] transition-all duration-500 cursor-pointer active:scale-90"
          >
            <X :size="24" class="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        <!-- Kinetic Links -->
        <nav class="flex-1 flex flex-col justify-center px-10 gap-4">
          <!-- USE ANCHOR TAGS HERE TOO -->
          <a 
            v-for="(link, index) in navLinks" :key="link.name" 
            :href="link.path"
            @click="(e) => handleNavClick(e, link.path)"
            class="m-link group flex flex-col py-3 cursor-pointer overflow-hidden"
          >
            <div class="flex items-center gap-4">
                <span class="text-[#D4AF37] font-black text-[10px] tracking-[0.5em] transition-transform duration-500 group-hover:-translate-y-1">0{{ index + 1 }}</span>
                <div class="h-[1px] w-0 bg-[#D4AF37]/30 transition-all duration-500 group-hover:w-12"></div>
            </div>
            <span class="text-4xl font-black text-white uppercase tracking-tighter transition-all duration-500 group-hover:text-[#D4AF37] group-hover:pl-4 flex items-center gap-2">
              {{ link.name }}
              <ChevronRight class="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-[#D4AF37]" :size="24" />
            </span>
          </a>
        </nav>

        <!-- Footer -->
        <div class="p-10 bg-white/[0.02] border-t border-white/5 space-y-8">
          <div class="m-footer-item space-y-4">
              <div class="flex items-center gap-5 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] group cursor-default">
                  <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                    <Phone :size="14" class="text-[#D4AF37]" /> 
                  </div>
                  {{ formattedPhone }}
              </div>
              <div v-if="settings.email" class="flex items-center gap-5 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] group cursor-default">
                  <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                    <Mail :size="14" class="text-[#D4AF37]" />
                  </div>
                  {{ settings.email }}
              </div>
              <div class="flex items-center gap-5 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] group cursor-default">
                  <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                    <MapPin :size="14" class="text-[#D4AF37]" />
                  </div>
                  Purwokerto, Central Java
              </div>
          </div>
          
          <div class="m-footer-item flex gap-4 items-center">
            <a href="#" class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-[#C62828] hover:-translate-y-2 transition-all duration-500 cursor-pointer shadow-lg shadow-black/20">
                <Instagram :size="22" />
            </a>
            <!-- 2. THE ORDER NOW BUTTON (Mobile Drawer) -->
            <button 
                @click="handleNavClick('/cart')"
                class="flex-1 group relative justify-center overflow-hidden bg-[#C62828] py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-[0_15px_30px_rgba(198,40,40,0.3)] cursor-pointer active:scale-95 transition-all"
            >
                <span class="relative z-10 flex justify-center">Order Now!</span>
                <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
header, .m-link { font-family: 'Poppins', sans-serif; }
.m-link span { text-shadow: 0 10px 20px rgba(0,0,0,0.2); }
div::-webkit-scrollbar { display: none; }
</style>