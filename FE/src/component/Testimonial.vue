<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-vue-next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
const cardRef = ref(null);
const contentRef = ref(null);

const testimonials = [
  { 
    name: 'Siti Aminah', 
    role: 'Reseller Bekasi', 
    initial: 'S',
    quote: 'Enak bgt bu, dimsum nya mantap gede dan real pic 😁👍🏻 kt anak ku enakk pol 👍🏻 tebel dan full daging bu...next time pst beli lg bu 🫰🏻.' 
  },
  { 
    name: 'Budi Santoso', 
    role: 'Mitra Jakarta', 
    initial: 'B',
    quote: 'Harganya sangat kompetitif untuk kualitas hotel bintang lima. Sistem pengiriman frozen food-nya aman dan profesional. Recommended untuk yang mau mulai bisnis!' 
  }
];

const currentIndex = ref(0);
const isAnimating = ref(false);

const changeSlide = (direction) => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const tl = gsap.timeline({
    onComplete: () => {
      if (direction === 'next') {
        currentIndex.value = (currentIndex.value + 1) % testimonials.length;
      } else {
        currentIndex.value = (currentIndex.value - 1 + testimonials.length) % testimonials.length;
      }
      
      // Entrance Animation
      gsap.fromTo(contentRef.value, 
        { x: direction === 'next' ? 50 : -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", onComplete: () => isAnimating.value = false }
      );
    }
  });

  // Exit Animation
  tl.to(contentRef.value, { x: direction === 'next' ? -50 : 50, opacity: 0, duration: 0.4, ease: "power2.in" });
};

onMounted(async () => {
  await nextTick();
  const scroller = ".home-scroller";

  // Section Entrance
  gsap.from(".testi-anim", {
    scrollTrigger: {
      trigger: sectionRef.value,
      scroller: scroller,
      start: "top 80%",
    },
    y: 60,
    opacity: 0,
    stagger: 0.2,
    duration: 1,
    ease: "expo.out"
  });
});
</script>

<template>
  <section ref="sectionRef" class="w-full py-24 lg:py-40 bg-[#FBBF24] relative overflow-hidden flex items-center justify-center">
    
    <!-- WATERMARK QUOTE -->
    <div class="absolute top-0 left-10 opacity-10 pointer-events-none select-none">
      <span class="text-[30rem] font-black text-[#111827] leading-none">“</span>
    </div>

    <div class="max-w-6xl w-full px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
      
      <!-- LEFT: TITLING -->
      <div class="lg:col-span-5 space-y-8 testi-anim">
        <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 border-[#111827]/10 bg-white/20 backdrop-blur-sm">
          <Star :size="14" fill="#111827" class="text-[#111827]" />
          <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[#111827]">Suara Mitra Kami</span>
        </div>
        
        <h2 class="text-6xl lg:text-7xl font-black text-[#111827] tracking-tighter uppercase leading-[0.9] italic">
          APA KATA <br/><span class="text-white not-italic">MEREKA?</span>
        </h2>
        
        <p class="text-lg text-[#111827]/60 font-medium italic max-w-sm">
          Kepercayaan Anda adalah prioritas kami dalam menjaga kualitas setiap butir dimsum.
        </p>

        <!-- Nav Buttons -->
        <div class="flex gap-4 pt-4">
          <button @click="changeSlide('prev')" class="w-14 h-14 rounded-2xl border-2 border-[#111827] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-all active:scale-90 group">
            <ChevronLeft :size="24" />
          </button>
          <button @click="changeSlide('next')" class="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center text-white hover:bg-[#8B0000] transition-all shadow-xl active:scale-90 group">
            <ChevronRight :size="24" />
          </button>
        </div>
      </div>

      <!-- RIGHT: THE CARD -->
      <div class="lg:col-span-7 relative testi-anim">
        <!-- Floating Initial Circle -->
        <div class="absolute -top-10 -right-4 lg:-top-16 lg:-right-8 w-24 h-24 lg:w-32 lg:h-32 bg-[#FBBF24] rounded-3xl rotate-12 shadow-2xl flex items-center justify-center border-8 border-[#111827] z-20">
          <span class="text-4xl lg:text-5xl font-black text-[#111827]">{{ testimonials[currentIndex].initial }}</span>
        </div>

        <!-- The Monolith Box -->
        <div ref="cardRef" class="bg-[#111827] rounded-[4rem] p-10 lg:p-20 text-white shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <!-- Pattern Overlay -->
          <div class="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
          
          <Quote class="text-[#FBBF24] opacity-20 mb-8" :size="60" />

          <div ref="contentRef" class="relative z-10">
            <h3 class="text-2xl lg:text-2xl font-bold leading-tight tracking-tight mb-12 italic min-h-[160px]">
              "{{ testimonials[currentIndex].quote }}"
            </h3>
            
            <div class="flex items-center gap-6 pt-8 border-t border-white/5">
              <div class="w-12 h-1 bg-[#FBBF24]"></div>
              <div>
                <p class="text-xl lg:text-2xl font-black uppercase tracking-widest text-[#FBBF24]">
                  {{ testimonials[currentIndex].name }}
                </p>
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-1">
                  {{ testimonials[currentIndex].role }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}
</style>