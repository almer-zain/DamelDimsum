<script setup>
import { onMounted, ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import gsap from 'gsap';

const containerRef = ref(null);

onMounted(() => {
  // --- The GSAP Ripple Animation ---
  const tl = gsap.timeline({
    repeat: -1, // Loop forever
    repeatDelay: 1, // Pause for 1 second between loops
  });

  // Target the elements by class
  const ripple1 = containerRef.value.querySelector('.ripple-1');
  const ripple2 = containerRef.value.querySelector('.ripple-2');
  const text = containerRef.value.querySelector('.scroll-text');
  const icon = containerRef.value.querySelector('.scroll-icon');

  // Staggered fade in
  tl.from([text, ripple1, ripple2], {
    opacity: 0,
    y: 10,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out'
  });

  // Ripple 1: Expand and fade out
  tl.to(ripple1, {
    scale: 2.5,
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out'
  }, "-=0.5"); // Start slightly after the fade in

  // Ripple 2: Expand and fade out, with a delay
  tl.to(ripple2, {
    scale: 2.5,
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out'
  }, "<0.3"); // Start 0.3s after the first ripple

  // Move the "scroll" icon up and down
  gsap.to(icon, {
    y: 5,
    repeat: -1,
    yoyo: true,
    duration: 1.5,
    ease: 'sine.inOut',
    delay: 1 // Start after the initial fade in
  });
});
</script>

<template>
  <div 
    ref="containerRef"
    class="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-red-500/70 cursor-pointer group"
    @click="() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })"
  >
    <!-- Ripple Container -->
    <div class="relative w-8 h-8 flex items-center justify-center mb-1">
      <!-- The two ripple circles -->
      <div class="ripple-1 absolute w-full h-full border-2 border-red-500/50 rounded-full"></div>
      <div class="ripple-2 absolute w-full h-full border-2 border-red-500/50 rounded-full"></div>
      
      <!-- The Icon -->
      <ChevronDown class="scroll-icon" :size="24" />
    </div>

    <!-- The Text -->
    <p class="scroll-text text-xs font-bold uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">
      Scroll
    </p>
  </div>
</template>