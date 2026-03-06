<script setup>
import { onMounted, ref, watch, nextTick, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LayoutDashboard, Package, Users, Settings, LogOut, Menu, X } from 'lucide-vue-next'; // Added Menu, X
import gsap from 'gsap';
import { settings } from '@/store/settings';
import { showToast } from '@/utils/eventBus';
import api from '@/utils/api';

const sidebarRef = ref(null);
const activeIndicatorRef = ref(null);
const menuItemsRef = ref([]);

const router = useRouter();
const route = useRoute();

// --- RESPONSIVE STATE ---
const isMobileOpen = ref(false); // Controls mobile drawer visibility

// --- DYNAMIC LOGO LOGIC ---
const dynamicLogo = computed(() => {
  if (!settings.siteLogo) return null; 
  return `${import.meta.env.VITE_IMAGE_URL}/${settings.siteLogo}`;
});

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Products', icon: Package, path: '/admin/products' },
  { name: 'Resellers', icon: Users, path: '/admin/resellers' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

const handleLogout = async () => {
  try {
    await api.post('/v1/auth/logout'); // Fixed path
    localStorage.removeItem('admin');
    
    // Close mobile menu if open
    isMobileOpen.value = false;
    
    setTimeout(() => {
      router.push('/login');
      showToast('Sesi berakhir, sampai jumpa!');
    }, 400);
  } catch (e) {
    showToast('Gagal memproses logout', 'error');
  }
};

onMounted(() => {
  // Only play the big slide-in animation if we are on Desktop
  if (window.innerWidth >= 1024) {
    const tl = gsap.timeline();
    tl.from(sidebarRef.value, { x: -256, duration: 0.8, ease: 'power4.out' })
      .from('.logo-area', { opacity: 0, y: -20, duration: 0.4 }, "-=0.4")
      .to(menuItemsRef.value, { opacity: 1, x: -10, stagger: 0.1, duration: 0.4, ease: 'power2.out' }, "-=0.2");
  } else {
    // On mobile, just ensure the active indicator is placed correctly
    gsap.set(menuItemsRef.value, { opacity: 1, x: -10 });
  }
  
  moveIndicator();
});

const moveIndicator = () => {
  nextTick(() => {
    const currentPath = route.path;
    let activeIndex = menuItems.findIndex(item => currentPath === item.path);
    if (activeIndex === -1) {
       activeIndex = menuItems.findIndex(item => item.path !== '/admin' && currentPath.startsWith(item.path));
    }
    if (activeIndex === -1) activeIndex = 0;

    const targetEl = menuItemsRef.value[activeIndex];
    
    if (targetEl && activeIndicatorRef.value) {
      gsap.to(activeIndicatorRef.value, {
        y: targetEl.offsetTop,
        height: targetEl.offsetHeight,
        duration: 0.5,
        ease: 'elastic.out(1, 0.8)' 
      });
    }
  });
};

watch(() => route.path, () => {
  moveIndicator();
  // Auto-close mobile menu when navigating
  isMobileOpen.value = false;
});
</script>

<template>
  <!-- MOBILE TRIGGER BUTTON (Only visible on lg and smaller) -->
  <button 
    @click="isMobileOpen = true" 
    class="lg:hidden fixed top-6 left-6 z-[45] bg-[#111827] text-white p-3 rounded-xl shadow-xl hover:bg-[#8B0000] transition-colors"
  >
    <Menu :size="24" />
  </button>

  <!-- MOBILE OVERLAY -->
  <div 
    v-if="isMobileOpen" 
    @click="isMobileOpen = false" 
    class="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
  ></div>

  <!-- 
    THE SIDEBAR 
    Fixed on mobile (sliding in from left based on isMobileOpen).
    Relative on Desktop (lg:relative) so it sits normally in the flex container.
  -->
  <aside 
    ref="sidebarRef"
    class="w-64 h-screen bg-subtle-wood text-white flex flex-col shadow-2xl border-r border-white/5 transition-transform duration-300 z-[60]"
    :class="[
      'fixed lg:relative top-0 left-0',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- MOBILE CLOSE BUTTON -->
    <button 
      @click="isMobileOpen = false" 
      class="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
    >
      <X :size="24" />
    </button>

    <!-- Logo Section -->
    <div class="logo-area p-8 border-b border-white/5 flex flex-col items-center mt-6 lg:mt-0">
      <img 
        :src="dynamicLogo || '/src/assets/images/LogoDamelDimsum.png'" 
        alt="Logo" 
        crossorigin="anonymous"
        class="w-16 h-16 mb-4 object-contain" 
      />
      <h1 class="text-lg font-bold tracking-[0.2em] uppercase text-white text-center">Damel Admin</h1>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 mt-6 px-4 space-y-2 relative">
      <div ref="activeIndicatorRef" class="absolute left-0 w-full bg-white/5 rounded-lg pointer-events-none">
        <div class="absolute left-0 top-0 h-full w-1.5 bg-[#8B0000] rounded-r-full shadow-[0_0_15px_#8B0000]"></div>
      </div>
      
      <router-link 
        v-for="(item, index) in menuItems" 
        :key="item.name"
        :to="item.path"
        :ref="el => { if (el) menuItemsRef[index] = el.$el }"
        class="sidebar-link relative flex items-center gap-4 p-4 rounded-lg transition-all duration-300 z-10 group"
        :class="{ 'active-link': route.path === item.path || (item.path !== '/admin' && route.path.startsWith(item.path)) }"
      >
        <component 
          :is="item.icon" 
          :size="24" 
          stroke-width="1.5"
          class="transition-transform group-hover:scale-110"
          :class="route.path === item.path || (item.path !== '/admin' && route.path.startsWith(item.path)) ? 'text-white' : 'text-gray-500'"
        />
        <span class="tracking-wide text-sm font-medium uppercase">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Logout Section -->
    <div class="logout-area p-6 mt-auto">
      <button @click="handleLogout" class="w-full flex items-center justify-center gap-3 p-3 rounded-xl text-red-400 bg-red-950/30 border border-red-900/50 hover:bg-[#8B0000] hover:text-white hover:border-[#8B0000] transition-all duration-300 group shadow-lg">
        <LogOut :size="20" class="transition-transform group-hover:-translate-x-1" />
        <span class="font-bold uppercase text-[10px] tracking-[0.2em]">Sign Out</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
aside { font-family: 'Poppins', sans-serif; }
.active-link { color: #ffffff !important; font-weight: 700; }
</style>