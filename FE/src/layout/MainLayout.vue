<script setup>
import MainFooter from '@/component/common/MainFooter.vue';
import Navbar from '@/component/common/Navbar.vue';
import gsap from 'gsap';

// --- GSAP PAGE TRANSITIONS ---
// This runs when a new page is appearing
const onEnter = (el, done) => {
  // 1. Set initial state (Invisible and slightly down)
  gsap.set(el, { autoAlpha: 0, y: 50, scale: 0.98 });
  
  // 2. Animate in (Slide up, fade in, scale up)
  gsap.to(el, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: 0.8,
    ease: "power4.out", // Premium "Apple" ease
    onComplete: done
  });
};

// This runs when the current page is leaving
const onLeave = (el, done) => {
  gsap.to(el, {
    autoAlpha: 0,
    y: -20, // Slide up slightly as it fades
    duration: 0.4,
    ease: "power2.in",
    onComplete: done
  });
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] selection:bg-[#8B0000] selection:text-white flex flex-col overflow-hidden">
    
    <!-- Navbar (Stays fixed, doesn't animate out) -->
    <Navbar />

    <!-- Page Content -->
    <main class="relative z-10 flex-1">
      <!-- 
        mode="out-in": Old page finishes leaving BEFORE new page starts entering.
        :css="false": We tell Vue "We are using GSAP, ignore CSS classes".
      -->
      <router-view v-slot="{ Component }">
        <transition 
          mode="out-in" 
          :css="false" 
          @enter="onEnter" 
          @leave="onLeave"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Background Texture (Persistent) -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] z-0"></div>
    
  </div>
</template>