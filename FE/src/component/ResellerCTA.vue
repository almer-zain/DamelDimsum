<script setup>
import { onMounted, ref } from 'vue';
import { ArrowRight, Users, CheckCircle, Star } from 'lucide-vue-next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
const floatCard = ref(null);

// --- 3D TILT EFFECT ---
const handleTilt = (e) => {
  if (window.innerWidth < 1024) return;
  const rect = floatCard.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -10;
  const rotateY = ((x - centerX) / centerX) * 10;

  gsap.to(floatCard.value, {
    rotateX, rotateY,
    duration: 0.5,
    ease: "power2.out"
  });
};

const resetTilt = () => {
  gsap.to(floatCard.value, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.7)" });
};

onMounted(() => {
  const scroller = ".home-scroller";
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      scroller: scroller,
      start: "top 70%",
    }
  });

  tl.from(".cta-text-reveal", {
    x: -150, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out"
  })
  .from(floatCard.value, {
    x: 100, scale: 0.8, opacity: 0, duration: 1.2, ease: "back.out(1.7)"
  }, "-=0.8")
});
</script>

<template>
  <section 
    ref="sectionRef" 
    class="w-full py-24 lg:py-40 px-6 lg:px-20 bg-[#8B0000] relative overflow-hidden flex items-center"
  >
    <!-- 1. WOW FACTOR BACKGROUND (Mesh Gradients & Patterns) -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#B91C1C_0%,transparent_50%)] opacity-50"></div>
      <div class="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#450A0A_0%,transparent_50%)] opacity-70"></div>
      <!-- Rice Paper Texture -->
      <div class="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] pointer-events-none"></div>
    </div>

    <div class="max-w-[90rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center relative z-10">
      
      <!-- LEFT: PERSUASIVE CONTENT -->
      <div class="space-y-10 text-center lg:text-left">
        <div class="cta-text-reveal inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          <Star class="text-[#FBBF24]" :size="16" fill="currentColor" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-white">Join the Family</span>
        </div>

        <div class="space-y-6">
          <h2 class="cta-text-reveal text-5xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] italic">
            Gabung <span class="text-[#FBBF24] not-italic">Reseller</span> Damel.
          </h2>
          <p class="cta-text-reveal text-lg lg:text-xl text-white/70 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
            Jadilah bagian dari jaringan mitra kami dan hadirkan kelezatan dimsum kualitas hotel bintang lima ke lingkungan Anda.
          </p>
        </div>

        <!-- Trust Badges -->
        <div class="cta-text-reveal flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
          <div class="flex items-center gap-2 text-white/60 font-bold uppercase text-[10px] tracking-widest">
            <CheckCircle :size="14" class="text-[#FBBF24]" /> Produk Siap Jual
          </div>
          <div class="flex items-center gap-2 text-white/60 font-bold uppercase text-[10px] tracking-widest">
            <CheckCircle :size="14" class="text-[#FBBF24]" /> Margin Keuntungan Tinggi
          </div>
        </div>

        <div class="cta-text-reveal pt-6">
          <router-link 
            to="/register-reseller" 
            class="bg-[#FBBF24] text-[#111827] px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(251,191,36,0.3)] hover:bg-white transition-all inline-flex items-center gap-4 active:scale-95"
          >
            Daftar Sekarang <ArrowRight :size="20" />
          </router-link>
        </div>
      </div>

      <!-- RIGHT: 3D FLOATING CARD -->
      <div class="relative flex justify-center items-center perspective-2000 h-[500px]">
        
        <!-- THE GLASS CARD -->
        <div 
          ref="floatCard"
          class="relative w-full max-w-[450px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/20 p-10 lg:p-14 shadow-3xl transform-style-3d cursor-default"
          @mousemove="handleTilt"
          @mouseleave="resetTilt"
        >
          <!-- Floating Dimsum (Breaking Borders) -->
          <div class="floating-dimsum absolute -left-16 lg:-left-24 top-1/2 -translate-y-1/2 w-64 lg:w-80 drop-shadow-[0_40px_60px_rgba(0,0,0,0.5)] z-20">
            <img src="@/assets/images/dimsum2 2.png" alt="Dimsum Baskets" class="w-full h-auto" />
          </div>

          <!-- Card Content -->
          <div class="ml-auto w-1/2 lg:w-3/5 space-y-6 relative z-10 text-right">
            <h4 class="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none italic">
              Yuk Jadi <span class="text-[#FBBF24]">Reseller</span>
            </h4>
            <p class="text-xs text-white/60 font-bold leading-relaxed uppercase tracking-wider">
              Dapatkan produk fresh setiap hari & dukungan marketing penuh dari pusat.
            </p>
            
            <div class="pt-6">
              <div class="inline-block px-6 py-4 rounded-2xl bg-[#FBBF24] text-[#8B0000] font-black text-[10px] uppercase tracking-widest shadow-xl">
                 #DamelPrestige
              </div>
            </div>
          </div>
        </div>

        <!-- Background Decorative Ring -->
        <div class="absolute w-[120%] h-[120%] border border-white/5 rounded-full -z-10 animate-[spin_20s_linear_infinite]"></div>
      </div>

    </div>

    <!-- Background Watermark -->
    <div class="absolute -bottom-10 -left-10 opacity-[0.03] pointer-events-none select-none">
      <h1 class="text-[25rem] font-black italic text-white">RESELLER</h1>
    </div>
  </section>
</template>

<style scoped>
.perspective-2000 { perspective: 2000px; }
.transform-style-3d { transform-style: preserve-3d; }

</style>