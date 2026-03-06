<script setup>
import { onMounted, ref } from 'vue';
import { ShieldCheck, Leaf, BadgePercent, ArrowUpRight, ChefHat, Utensils, Wheat } from 'lucide-vue-next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);

const features = [
  {
    title: 'Tanpa Pengawet',
    subtitle: '100% NATURAL',
    desc: 'Kami menolak jalan pintas. Dibuat fresh setiap pagi menggunakan daging segar tanpa campuran bahan kimia.',
    icon: Leaf,
    color: 'text-white', 
  },
  {
    title: 'Terjamin Halal',
    subtitle: 'NO PORK • NO LARD',
    desc: 'Proses produksi yang ketat dan higienis. Bahan baku bersertifikat, memastikan keamanan bagi seluruh pelanggan.',
    icon: ShieldCheck,
    color: 'text-[#FBBF24]', // Gold
  },
  {
    title: 'Harga Terjangkau',
    subtitle: 'HOTEL QUALITY',
    desc: 'Misi kami adalah mendemokratisasi rasa mewah. Nikmati kualitas Dimsum restoran bintang lima dengan harga kaki lima.',
    icon: BadgePercent,
    color: 'text-white',
  }
];

// --- SUBTLE 3D HOVER EFFECT ---
const handleMouseMove = (e, cardIdx) => {
  if (window.innerWidth < 1024) return;
  
  const card = document.getElementById(`feature-card-${cardIdx}`);
  const rect = card.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Very subtle rotation (Max 3 degrees)
  const rotateX = ((y - centerY) / centerY) * -3; 
  const rotateY = ((x - centerX) / centerX) * 3;

  gsap.to(card, {
    rotateX: rotateX,
    rotateY: rotateY,
    scale: 1.02, // Tiny scale up
    duration: 0.5,
    ease: "power2.out"
  });
};

const resetCard = (cardIdx) => {
  const card = document.getElementById(`feature-card-${cardIdx}`);
  gsap.to(card, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 0.5,
    ease: "power2.out"
  });
};

// Background Parallax
const handleBgParallax = (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  gsap.to(".bg-tool", { x: x, y: y, duration: 1, ease: "power2.out" });
}

onMounted(() => {
  const scroller = ".home-scroller";

  // 1. Ensure they are hidden initially so they can "show up"
  gsap.set(".feature-wrapper", { opacity: 0, y: 50 });

  // 2. The Trigger
  gsap.to(".feature-wrapper", {
    scrollTrigger: { 
      trigger: sectionRef.value, 
      scroller: scroller, // THIS WAS THE MISSING KEY
      start: "top 85%",
      toggleActions: "play none none none"
    },
    y: 0, 
    opacity: 1, 
    stagger: 0.1, 
    duration: 0.8, 
    ease: "power2.out"
  });

  // Background Tools Parallax
  gsap.to(".bg-tool", {
    y: -50,
    scrollTrigger: {
      trigger: sectionRef.value,
      scroller: scroller,
      scrub: true
    }
  });
});
</script>

<template>
  <section 
    ref="sectionRef" 
    class="w-full py-32 px-6 lg:px-12 bg-[#FDFBF7] relative overflow-hidden"
    @mousemove="handleBgParallax"
  >
    
    <!-- 1. SUBTLE BACKGROUND TOOLS (Watermark Style) -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
        
        <!-- Icons blending into the cream background -->
        <ChefHat class="bg-tool absolute top-10 left-10 text-[#111827] opacity-[0.03] rotate-12" :size="200" />
        <Utensils class="bg-tool absolute bottom-10 right-10 text-[#8B0000] opacity-[0.03] -rotate-12" :size="250" />
        <Wheat class="bg-tool absolute top-1/2 right-1/4 text-[#D4AF37] opacity-[0.05] rotate-45" :size="150" />
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      
      <!-- Header -->
      <div class="text-center mb-20 space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8B0000]/10 bg-white shadow-sm">
          <div class="w-1.5 h-1.5 bg-[#8B0000] rounded-full animate-pulse"></div>
          <span class="text-[9px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Our Values</span>
        </div>
        <h2 class="text-5xl lg:text-6xl font-black text-[#111827] tracking-tighter uppercase">
          Kenapa Pilih <span class="text-[#8B0000] italic">Dàmel?</span>
        </h2>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div 
          v-for="(feature, idx) in features" 
          :key="idx" 
          class="feature-wrapper relative perspective-1000 group"
          @mousemove="(e) => handleMouseMove(e, idx)"
          @mouseleave="resetCard(idx)"
        >
          <!-- THE CARD -->
          <div 
            :id="`feature-card-${idx}`"
            class="relative h-full bg-[#8B0000] rounded-[2.5rem] p-10 text-white shadow-2xl overflow-hidden transform-gpu preserve-3d"
          >
            <!-- Texture Overlay -->
            <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none mix-blend-multiply"></div>
            
            <!-- Inner Content -->
            <div class="relative z-10 flex flex-col h-full items-start">
              
              <!-- Icon Circle -->
              <div class="mb-8 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <component :is="feature.icon" :size="28" :class="feature.color" />
              </div>

              <span class="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 mb-3">{{ feature.subtitle }}</span>
              <h3 class="text-2xl font-black uppercase tracking-tight mb-6 leading-none">{{ feature.title }}</h3>
              
              <!-- Divider -->
              <div class="w-10 h-[2px] bg-[#FBBF24] mb-6 group-hover:w-full transition-all duration-500"></div>
              
              <p class="text-sm font-medium text-white/80 leading-relaxed">
                {{ feature.desc }}
              </p>

              <!-- Corner Arrow -->
              <ArrowUpRight :size="24" class="absolute bottom-0 right-0 text-[#FBBF24] opacity-0 translate-y-2 -translate-x-2 group-hover:opacity-100 group-hover:translate-y-4 group-hover:translate-x-2 transition-all duration-300" />
            </div>
          </div>

          <!-- Shadow Layer (Clean, not messy) -->
          <div class="absolute inset-0 bg-[#111827] rounded-[2.5rem] -z-10 translate-y-4 translate-x-0 opacity-10 group-hover:translate-y-6 transition-all duration-500"></div>
        </div>

      </div>

    </div>
  </section>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
</style>