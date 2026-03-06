<script setup>
import { onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import HeroSection from '@/component/HeroSection.vue';
import TentangKami from '@/component/TentangKami.vue';
import WhyChooseUs from '@/component/WhyChooseUs.vue';
import Testimonial from '@/component/Testimonial.vue';
import ResellerCTA from '@/component/ResellerCTA.vue';
import MainFooter from '@/component/common/MainFooter.vue';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Add this

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger); // Add this

const route = useRoute();


onMounted(async () => {
  await nextTick();
  
  const scroller = ".home-scroller";

  // --- THE FIX: HERO-TO-ABOUT SNAP ---
  // This creates a magnetic pull between the Hero and the About section
  ScrollTrigger.create({
    trigger: "#home",
    scroller: scroller,
    start: "top top",
    end: "bottom top", // Ends exactly where #about begins
    snap: {
      snapTo: 1, // Snaps to the end of the trigger (which is the start of #about)
      duration: 0.8,
      delay: 0, // Instant snap
      ease: "power3.inOut"
    }
  });

  // Handle external routing with hash (e.g. from /menu to /#features)
  if (route.hash) {
    setTimeout(() => {
      gsap.to(scroller, {
        duration: 1.5,
        scrollTo: { y: route.hash, autoKill: false },
        ease: "expo.inOut"
      });
    }, 500); // Give it a bit more time to ensure all sections are rendered
  }
});
</script>

<template>
  <!-- REMOVED scroll-smooth to prevent CSS fighting with GSAP ScrollTo -->
  <div class="home-scroller h-screen overflow-y-auto bg-[#111827] overscroll-none">
     
     <div id="home" class="hero-wrapper">
       <HeroSection />
     </div>
     
     <div id="about">
       <TentangKami />
     </div>
     
     <div id="features">
       <WhyChooseUs />
     </div>
     
     <div id="testimonials">
       <Testimonial />
     </div>
     
     <div id="reseller">
       <ResellerCTA />
     </div>
     
     <MainFooter />
  </div>
</template>

<style scoped>
html, body { margin: 0; height: 100%; overflow: hidden; }
.home-scroller::-webkit-scrollbar { display: none; }
.home-scroller { scroll-behavior: auto !important; } 

</style>