<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ArrowRight, Contact, MessageCircle, Phone, Users } from 'lucide-vue-next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollIndicator from './ScrollIndicator.vue';

gsap.registerPlugin(ScrollTrigger);

const plateContainer = ref(null);
const rotatingTextWrapper = ref(null);
let resizeObserver = null;

const updateCircleLayout = () => {
  const wrapper = rotatingTextWrapper.value;
  const plate = plateContainer.value;
  if (!wrapper || !plate) return;

  wrapper.innerHTML = '';
  const size = plate.offsetWidth;
  if (size === 0) return;

  const isMobile = window.innerWidth < 1024;
  
  // RADIUS FIX: 
  const radius = size * 0.48; 
  
  // FONT SIZE FIX:
  const fontSize = isMobile ? size / 18 : size / 25; 

  const textString = "RASA MEWAH HARGA MURAH • RASA MEWAH HARGA MURAH • ";
  const chars = textString.split("");
  const angleStep = 360 / chars.length;

  chars.forEach((char, i) => {
    const span = document.createElement("span");
    span.innerText = char;
    span.style.position = "absolute";
    span.style.left = "50%";
    span.style.top = "50%";
    span.style.fontSize = `${fontSize}px`;
    span.style.fontWeight = "900";
    span.style.color = "#FAF7F0";
    span.style.opacity = "60%";
    span.style.textTransform = "uppercase";
    span.style.whiteSpace = "nowrap";
    span.style.lineHeight = "1";

    const rotation = i * angleStep;
    span.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${radius}px)`;
    wrapper.appendChild(span);
  });
};

onMounted(() => {
  const tl = gsap.timeline();
  tl.from(".hero-word", { x: -30, opacity: 0, stagger: 0.05, duration: 0.6, ease: "power3.out" })
    .from(".hero-meta", { y: 15, opacity: 0, stagger: 0.1, duration: 0.6 }, "-=0.4");

  resizeObserver = new ResizeObserver(() => {
    updateCircleLayout();
  });
  if (plateContainer.value) resizeObserver.observe(plateContainer.value);

  gsap.to(rotatingTextWrapper.value, {
    rotation: 360,
    duration: 40, 
    ease: "none",
    repeat: -1
  });

  const isMobile = window.innerWidth < 1024;

  // --- PREMIUM PARALLAX ENGINE ---
  const scroller = ".home-scroller"; 
  const sectionTrigger = ".hero-section-wrapper"; // We'll add this class to the top div

  // 1. TEXT LAYER (Fast)
  gsap.to(".hero-parallax-fast", {
    y: -120, 
    ease: "none",
    scrollTrigger: {
      trigger: sectionTrigger, // Trigger from the whole slide
      scroller: scroller,
      start: "top top",
      end: "bottom top",
      scrub: 1.5, // Smoothing value (1.5s delay makes it feel premium)
    }
  });

  // 2. META LAYER (Mid)
  gsap.to(".hero-parallax-mid", {
    y: -60,
    ease: "none",
    scrollTrigger: {
      trigger: sectionTrigger,
      scroller: scroller,
      start: "top top",
      end: "bottom top",
      scrub: 1.2,
    }
  });

  // 3. PLATE LAYER (Slow/Deep)
  // We use an ID here to be very specific
  gsap.to("#plate-parallax-target", {
    y: 100, 
    scale: 1.15,
    rotation: 10,
    ease: "none",
    scrollTrigger: {
      trigger: sectionTrigger,
      scroller: scroller,
      start: "top top",
      end: "bottom top",
      scrub: 2, // Slower scrub for the heaviest object
    }
  });

  gsap.to(plateContainer.value, {
    y: isMobile ? 30 : 80, 
    ease: "none",
    scrollTrigger: {
      trigger: plateContainer.value,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});


</script>

<template>
  <div class="relative min-h-screen max-lg:h-[120vh] max-lg:pt-10 w-full overflow-hidden font-['Poppins'] flex items-center">
    <div class="z-10 relative w-full bg-[#8B0000] h-screen max-lg:h-[120vh] pt-10 ">

      <div class="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center relative z-10 px-6 lg:px-0">
        
        <!-- LEFT CONTENT -->
        <div class="relative flex flex-col justify-center lg:pl-10 xl:pl-16 z-20 order-2 lg:order-1 text-center lg:text-left">
            <div class="hero-meta max-lg:hero-parallax-mid mb-4">
              <span class="inline-block px-4 py-1.5 rounded-full border border-[#C62828]/20 bg-white/80 backdrop-blur-sm text-[14px] lg:text-xs font-black uppercase tracking-[0.25em] text-[#C62828]">
                  #DimsumPilihan
              </span>
            </div>

            <div class="leading-[0.85] max-lg:hero-parallax-fast tracking-tighter mix-blend-multiply">
              <h1 class="hero-word text-[7vw] lg:text-[6vw] font-black text-[#ffffff]">Rasa Mewah</h1>
              <h1 class="hero-word text-[7vw] lg:text-[6vw] font-black text-[#ffffff]/90 mt-1">Harga <span class="text-[#FB8C00]">Murah</span></h1>
            </div>

            <div class="hero-meta max-lg:hero-parallax-mid mt-6 lg:mt-8 max-w-lg mx-auto lg:mx-0">
              <div class="w-12 h-1 bg-[#D4AF37] mb-4 mx-auto lg:ml-0"></div>
              <p class="text-md lg:text-xl text-[#ffffff]/70 font-medium italic mb-6 leading-relaxed">
                  "Kelezatan bintang lima dengan harga kaki lima. Dibuat fresh setiap hari."
                  
              </p>
              
              <div class="flex flex-col sm:flex-row flex-wrap max-lg:pb-10 justify-center lg:justify-start gap-3">
                  <router-link to="/find-reseller" class="bg-[#C62828]  px-6 py-4 rounded-full text-md lg:text-xl text-[#ffffff]/80 font-black italic tracking-relaxed shadow-xl shadow-red-900/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
                    Pesan Sekarang <ArrowRight :size="18" />
                  </router-link>
                  <router-link to="/register-reseller" class="px-6 py-4 rounded-full cursor-pointer border-2 border-[#111827]/10 text-[#111827]  text-md lg:text-xl font-black italic tracking-relaxed hover:border-[#C62828] hover:text-[#C62828] transition-all flex items-center justify-center gap-3 bg-white/80">
                    <MessageCircle :size="20" /> Gabung Reseller
                  </router-link>
              </div>
            </div>
        </div>

        <!-- PLATE WRAPPER -->
        <div id="plate-parallax-target" ref="plateContainer" class="relative order-1 lg:order-2  lg:mb-0 scale-100 lg:scale-110 right-0 lg:right-[-15%] w-full max-w-[500px] lg:max-w-none aspect-square flex items-center justify-center mx-auto">
            <!-- TEXT WRAPPER (Spinning) -->
            <div 
              ref="rotatingTextWrapper" 
              class="absolute inset-0 z-0 scale-80 flex items-center justify-center pointer-events-none"
            >
             <!-- Spans injected here -->
            </div>

            <!-- IMAGE -->
            <img 
              src="@/assets/images/cropped_circle_image.png" 
              class="relative z-10 w-[70%] h-[70%] object-contain drop-shadow-[-20px_20px_40px_rgba(0,0,0,0.3)] lg:drop-shadow-[-40px_40px_80px_rgba(0,0,0,0.4)]" 
              alt="Dimsum Plate"
            />
        </div>

      </div>
      <ScrollIndicator />

    </div>
  </div>
</template>

<style scoped>
:global(body) {
  overflow-x: hidden;
}

* {
  font-family: 'Poppins', sans-serif;
}

/* GPU acceleration for smoother parallax */
.hero-parallax-fast, 
.hero-parallax-mid, 
#plate-parallax-target {
  will-change: transform;
  backface-visibility: hidden;
}


</style>
