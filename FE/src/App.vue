<script setup>
import { onMounted, computed, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import { settings, fetchSettings } from '@/store/settings';
import { useEventBus } from '@/utils/eventBus';
import Toast from '@/component/ui/Toast.vue';
import gsap from 'gsap';

const route = useRoute();
const toast = ref({ show: false, message: '', type: 'success' });
const bus = useEventBus();

// --- GLOBAL TOAST LISTENER ---
bus.on('show-toast', (data) => {
  toast.value = { show: true, message: data.message, type: data.type };
  gsap.fromTo(".toast-container", { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" });
  setTimeout(() => gsap.to(".toast-container", { opacity: 0, onComplete: () => toast.value.show = false }), 3000);
});

// --- HEAD MANAGEMENT ---
onMounted(fetchSettings);

watch(() => settings.siteName, (newName) => {
  if (newName) document.title = `${newName} | Official Site`;
}, { immediate: true });

useHead({
  link: computed(() => [
    { rel: 'icon', type: 'image/png', href: settings.siteFavicon ? `${import.meta.env.VITE_IMAGE_URL}/${settings.siteFavicon}` : '/favicon.ico' },
  ]),
});

const onEnter = (el, done) => {
  // If going to Admin, just fade in quickly without the slide
  if (route.path.startsWith('/admin')) {
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, onComplete: done });
    return;
  }

  gsap.fromTo(el, 
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", onComplete: done }
  );
};

const onLeave = (el, done) => {
  // Always check if the element still exists in the DOM
  if (!el || !el.parentNode) {
    done();
    return;
  }

  // If leaving Admin, just fade out
  if (route.path.startsWith('/admin')) {
    gsap.to(el, { opacity: 0, duration: 0.3, onComplete: done });
    return;
  }

  gsap.to(el, { 
    y: -30, 
    opacity: 0, 
    duration: 0.4, 
    ease: "power2.in", 
    onComplete: done 
  });
};
</script>

<template>
  <!-- Global Toast -->

  <div class="fixed top-8 right-8 z-[99999] pointer-events-none">
    <Toast 
      :show="toast.show" 
      :message="toast.message" 
      :type="toast.type" 
      class="toast-container pointer-events-auto" 
    />
  </div>

  <!-- THE ANIMATED ROUTER VIEW -->
  <router-view v-slot="{ Component }">
    <transition :css="false" mode="out-in" @enter="onEnter" @leave="onLeave">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style scoped>
/* No CSS needed, GSAP handles it all */
</style>