<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ShieldCheck, Zap, Star, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-vue-next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
let mm;

onMounted(async () => {
  await nextTick();
  const scroller = ".home-scroller";
  mm = gsap.matchMedia();

  // --- DESKTOP ---
  mm.add("(min-width: 1024px)", () => {
    // Setup initial state: Stack them perfectly
    gsap.set(".chapter-card", { autoAlpha: 1, scale: 1, y: 0 });
    gsap.set(".chapter-2, .chapter-3", { autoAlpha: 0, scale: 0.95 }); // Slightly scaled down before entering

    // Timeline

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.value,
        scroller,
        start: "top top",
        end: "+=400%",
        pin: true,
        scrub: 1,
        snap: {
          snapTo: "labels",
          duration: { min: 0.2, max: 0.6 },
          delay: 0.1,
          ease: "power2.out"
        },
        invalidateOnRefresh: true
      }
    });


    // --- THE MASTER SEQUENCE ---
    // Note: use ease: "none" inside a scrub timeline for the smoothest linear tracking.

    tl.addLabel("bab1")
      .to({}, { duration: 1 }) // HOLD BAB 1

      // TRANSITION 1: Chapter 1 -> Chapter 2 (and Yellow BG)
      .to(sectionRef.value, { backgroundColor: "#FBBF24", duration: 1.5, ease: "none" }, "step1")
      .to(".indicator-dot", { y: 40, backgroundColor: "#111827", duration: 1.5, ease: "none" }, "step1")
      .to(".chapter-1", { autoAlpha: 0, scale: 0.95, duration: 1.5, ease: "none" }, "step1")
      .to(".chapter-2", { autoAlpha: 1, scale: 1, duration: 1.5, ease: "none" }, "step1")
      
      .addLabel("bab2")
      .to({}, { duration: 1 }) // HOLD BAB 2

      // TRANSITION 2: Chapter 2 -> Chapter 3 (and Red BG)
      .to(sectionRef.value, { backgroundColor: "#8B0000", duration: 1.5, ease: "none" }, "step2")
      .to(".indicator-dot", { y: 80, backgroundColor: "#FBBF24", duration: 1.5, ease: "none" }, "step2")
      .to(".text-dynamic", { color: "#FFFFFF", duration: 1.5, ease: "none" }, "step2")
      .to(".chapter-2", { autoAlpha: 0, scale: 0.95, duration: 1.5, ease: "none" }, "step2")
      .to(".chapter-3", { autoAlpha: 1, scale: 1, duration: 1.5, ease: "none" }, "step2")
      
      .addLabel("bab3")
      .to({}, { duration: 1 }); // HOLD BAB 3
  });

  // --- MOBILE ---
  mm.add("(max-width: 1023px)", () => {
    gsap.set(sectionRef.value, { backgroundColor: "#FBBF24", height: "auto" });
    gsap.set(".chapter-card", { autoAlpha: 0, y: 50 });

    ScrollTrigger.batch(".chapter-card", {
      scroller: scroller,
      start: "top 85%",
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          overwrite: true
        });
      },
      invalidateOnRefresh: true
    });
  });
});

onUnmounted(() => {
  if (mm) mm.revert();
});
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- IDLE PARTICLES -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20 hidden lg:block">
      <div class="bg-particle absolute rounded-full border border-[#8B0000]/20 w-96 h-96 top-10 left-10 animate-pulse"></div>
      <div class="bg-particle absolute rounded-full border border-[#8B0000]/20 w-64 h-64 bottom-20 right-20 animate-pulse delay-75"></div>
    </div>
    
    <!-- MAIN CONTAINER -->
    <div ref="sectionRef" class="w-full h-auto lg:h-screen relative lg:bg-[#FDFBF7] flex items-center justify-center overflow-hidden z-10 will-change-transform py-20 lg:py-0">
      
      <!-- Indicator -->
      <div class="hidden lg:flex absolute left-16 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-[100]">
        <div class="relative h-40 w-[2px] bg-black/5 rounded-full overflow-hidden">
          <div class="indicator-dot absolute top-0 left-0 w-full h-12 bg-[#8B0000] rounded-full will-change-transform"></div>
        </div>
        <span class="text-[9px] font-black uppercase tracking-[0.6em] vertical-text text-dynamic text-[#8B0000]">Cerita</span>
      </div>

      <!-- STAGE -->
      <div class="max-w-6xl w-full px-6 lg:px-10 relative lg:h-[550px] perspective-2000 flex flex-col lg:block gap-20">
        
        <!-- CHAPTER 1 -->
        <div class="chapter-card chapter-1 lg:absolute inset-0 flex flex-col lg:flex-row items-center gap-10 lg:gap-20 z-30">
          <div class="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left">
            <div class="flex items-center justify-center lg:justify-start gap-3"><Sparkles :size="16" class="text-[#8B0000]" /><span class="text-[#8B0000] font-black uppercase tracking-[0.2em] text-[14px]">Sejak 2025</span></div>
            <h2 class="text-dynamic text-6xl lg:text-9xl font-black text-[#111827] tracking-tighter uppercase italic leading-[0.75]">Buatan <span class="text-[#8B0000] not-italic">Tangan</span></h2>
            <p class="text-dynamic text-xl lg:text-2xl text-gray-500 font-medium italic leading-relaxed lg:max-w-sm">"Keaslian rasa yang diwariskan melalui sentuhan tangan penuh kasih."</p>
          </div>
          <div class="flex-1 w-full aspect-square rounded-[3rem] lg:rounded-[5rem] overflow-hidden shadow-2xl border-[8px] lg:border-[16px] border-white">
            <img src="https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=1000" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- CHAPTER 2 -->
        <div class="chapter-card chapter-2 lg:absolute inset-0 flex flex-col lg:flex-row items-center gap-10 lg:gap-20 z-20">
          <div class="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left order-1 lg:order-none">
            <span class="text-[#111827] font-black uppercase tracking-[0.4em] text-[16px] block">Standar</span>
            <h2 class="text-dynamic text-6xl lg:text-9xl font-black text-[#111827] tracking-tighter uppercase italic leading-[0.75]">Kualitas <span class="opacity-80 max-lg:text-[#8B0000]">Tinggi</span></h2>
            <div class="flex justify-center lg:justify-start gap-4">
               <div class="bg-[#111827] text-white px-6 py-4 rounded-3xl font-black text-[14px] uppercase flex items-center gap-3 shadow-xl">
                  <ShieldCheck :size="18" class="text-[#FBBF24]" /> 100% Halal
               </div>
               <div class="bg-[#111827] text-white px-6 py-4 rounded-3xl font-black text-[14px] uppercase flex items-center gap-3 shadow-xl">
                  <Zap :size="18" class="text-[#FBBF24]" /> 
                  Pengiriman Cepat
               </div>
            </div>
          </div>
          <div class="flex-1 w-full aspect-square rounded-[3rem] lg:rounded-[5rem] overflow-hidden shadow-2xl border-[8px] lg:border-[16px] border-white order-2 lg:order-none">
            <img src="../assets/images/Dimsum Ori 4pcs.png" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- CHAPTER 3 -->
        <div class="chapter-card chapter-3 lg:absolute inset-0 flex flex-col lg:flex-row items-center gap-10 lg:gap-20 z-10">
          <div class="flex-1 space-y-6 lg:space-y-8 lg:text-white text-[#111827] text-center lg:text-left order-1 lg:order-none">
            <span class="lg:text-white/40 text-[#111827]/40 font-black uppercase tracking-[0.6em] text-[10px] block">Scale</span>
            <h2 class="text-dynamic text-6xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.75]">Gabung <span class="text-[#FBBF24] max-lg:text-[#8B0000] not-italic">Bersama</span></h2>
            <p class="text-dynamic text-lg lg:text-xl lg:text-white/60 text-[#111827]/60 font-medium italic leading-relaxed lg:max-w-sm">"Jadi bagian dari reseller Damel Dimsum dan tumbuh bersama menghadirkan dimsum berkualitas"</p>
            <router-link to="/find-reseller" class="inline-flex items-center gap-6 bg-[#111827] lg:bg-white text-white lg:text-[#8B0000] px-16 py-7 rounded-full font-black text-md uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Daftar Reseller <Star :size="18" fill="currentColor" />
            </router-link>
          </div>
          <div class="flex-1 w-full aspect-square rounded-[3rem] lg:rounded-[5rem] border-[8px] lg:border-[16px] border-white/10 bg-[#111827] flex flex-col items-center justify-center p-12 text-center relative backdrop-blur-xl order-2 lg:order-none">
             <h3 class="text-white text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-[0.8] mb-8">Mulai Jadi Reseller.</h3>
             <ArrowDown class="text-[#FBBF24] animate-bounce" :size="48" />
          </div>
        </div>


        <!-- Watermark -->
        <div class="absolute -bottom-60 -right-20 opacity-[0.1] pointer-events-none select-none z-0">
          <h1 class="text-dynamic text-[15rem] lg:text-[45rem] font-black italic text-[#8B0000]">家族</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vertical-text { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); }
.perspective-2000 { perspective: 2000px; }

/* Desktop Optimizations */
.chapter-card { 
  will-change: transform, opacity; 
}

/* Mobile Optimizations */
@media (max-width: 1023px) {
  .chapter-card { 
    position: relative !important; 
    opacity: 0; 
    transform: none !important; 
    margin-bottom: 80px;
    scale: 1 !important; 
    visibility: visible !important;
  }
  
  .text-dynamic { color: #000000 !important; }
  .chapter-card span { font-weight: 900 !important; }
  .chapter-card .bg-\[\#8B0000\], .chapter-card .bg-white\/30 {
    background-color: #111827 !important;
    opacity: 0.2 !important;
  }
}
</style>