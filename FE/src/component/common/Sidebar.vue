<script setup>
import { onMounted, ref, watch, nextTick, computed, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LayoutDashboard, Package, Users, Settings, LogOut, X } from 'lucide-vue-next';
import gsap from 'gsap';
import { settings } from '@/store/settings';
import { showToast } from '@/utils/eventBus';
import api from '@/utils/api';

const props = defineProps({ isOpen: Boolean });
// Use the defineEmits properly
const emit = defineEmits(['close']);

// --- DATABASE CONNECTED UTILS ---
const sidebarRef = ref(null);
const activeIndicatorRef = ref(null);

// THE FIX: We use a template ref function to gather the DOM elements reliably
const menuItemsRefs = ref([]);
const setItemRef = (el, index) => {
  if (el) {
    // Vue router-links render as <a> tags, we want the actual DOM element
    menuItemsRefs.value[index] = el.$el || el; 
  }
};

const router = useRouter();
const route = useRoute();

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
    await api.post('/auth/logout'); 
    localStorage.removeItem('admin');
    emit('close'); 
    setTimeout(() => {
      router.push('/login');
      showToast('Sesi berakhir, sampai jumpa!');
    }, 400);
  } catch (e) {
    showToast('Gagal memproses logout', 'error');
  }
};

const moveIndicator = async () => {
  // 1. Wait for Vue to finish any layout shifts
  await nextTick();
  
  // 2. Add a tiny delay to ensure CSS Flexbox has finished rendering
  setTimeout(() => {
    const currentPath = route.path;
    
    let activeIndex = menuItems.findIndex(item => currentPath === item.path);
    if (activeIndex === -1) {
       activeIndex = menuItems.findIndex(item => item.path !== '/admin' && currentPath.startsWith(item.path));
    }
    if (activeIndex === -1) activeIndex = 0;

    const targetEl = menuItemsRefs.value[activeIndex];
    
    if (targetEl && activeIndicatorRef.value) {
      // 3. Simple, bulletproof offsetTop calculation.
      // Because activeIndicator is inside the same <nav> as the targetEl,
      // targetEl.offsetTop is exactly the Y coordinate we need!
      gsap.to(activeIndicatorRef.value, {
        y: targetEl.offsetTop,
        height: targetEl.offsetHeight,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: true // Stop overlapping animations
      });
    }
  }, 50); // 50ms is usually enough for the browser to paint
};

onMounted(() => {
  // --- THE FIX: Only animate root sidebar on Desktop ---
  if (window.innerWidth >= 1024) {
    const tl = gsap.timeline();
    tl.from(sidebarRef.value, { x: -256, duration: 0.5, ease: 'power2.out' });
  }

  // Always animate the links (safe)
  gsap.fromTo(".sidebar-link", 
    { opacity: 0, x: -10 }, 
    { opacity: 1, x: 0, stagger: 0.1, duration: 0.4, delay: 0.2 }
  );

  window.addEventListener('resize', handleResize);
  moveIndicator();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => route.path, () => {
  moveIndicator();
  emit('close'); 
});

const handleResize = () => {
  // If we go to desktop, make sure the mobile state is reset
  if (window.innerWidth >= 1024) {
    emit('close'); 
  }
  // Recalculate the red bar position
  moveIndicator();
};


// Also watch window resize to recalculate if they flip their phone
window.addEventListener('resize', () => {
    moveIndicator();
});
</script>

<template>
  <!-- 
    THE FIX: 
    - Desktop (lg:relative, lg:translate-x-0): Sits normally in the flex layout.
    - Mobile (fixed, -translate-x-full): Slides in and out based on props.isOpen.
    - Uses z-[60] so it's above the overlay.
  -->
  <aside 
    ref="sidebarRef"
    class="w-64 h-screen bg-subtle-wood text-white flex flex-col shadow-2xl border-r border-white/5 transition-transform duration-300 z-[60]"
    :class="[
      'fixed top-0 left-0 lg:relative', 
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- MOBILE CLOSE BUTTON -->
    <button 
      @click="$emit('close')" 
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
     <!-- Navigation -->
    <nav class="flex-1 mt-6 px-4 space-y-2 relative">
      <div ref="activeIndicatorRef" class="absolute left-0 w-full bg-white/5 rounded-lg pointer-events-none">
        <div class="absolute left-0 top-0 h-full w-1.5 bg-[#8B0000] rounded-r-full shadow-[0_0_15px_#8B0000]"></div>
      </div>
      
      <!-- THE FIX: Updated the :ref syntax -->
      <router-link 
        v-for="(item, index) in menuItems" 
        :key="item.name"
        :to="item.path"
        :ref="(el) => setItemRef(el, index)" 
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