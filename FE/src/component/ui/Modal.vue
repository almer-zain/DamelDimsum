<script setup>
import { X } from 'lucide-vue-next';
import gsap from 'gsap';

defineProps({
  show: Boolean,
  title: String,
  width: { type: String, default: 'max-w-md' }
});

const emit = defineEmits(['close']);

const onEnter = (el, done) => {
  const overlay = el.querySelector('.modal-overlay');
  const content = el.querySelector('.modal-content');
  const tl = gsap.timeline({ onComplete: done });

  tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    .fromTo(content, 
      { opacity: 0, y: 50, scale: 0.9, rotationX: -15 }, 
      { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.2"
    );
};

const onLeave = (el, done) => {
  const overlay = el.querySelector('.modal-overlay');
  const content = el.querySelector('.modal-content');
  const tl = gsap.timeline({ onComplete: done });

  tl.to(content, { opacity: 0, y: 20, scale: 0.95, duration: 0.3, ease: "power2.in" })
    .to(overlay, { opacity: 0, duration: 0.2 }, "-=0.1");
};
</script>

<template>
  <Teleport to="body">
    <transition :css="false" @enter="onEnter" @leave="onLeave">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 [perspective:1000px]">
        <div class="modal-overlay absolute inset-0 bg-[#111827]/40 backdrop-blur-sm" @click="emit('close')"></div>
        <div :class="['modal-content relative w-full bg-[#FDFBF7] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#C5A059]/30', width]">
          <div class="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
          <div class="relative z-10 px-10 py-8 border-b border-gray-100 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-5 bg-[#8B0000]"></div>
              <h3 class="text-xl font-black text-[#1F2937] uppercase tracking-tighter">{{ title }}</h3>
            </div>
            <button @click="emit('close')" class="p-2 hover:bg-red-50 text-gray-400 hover:text-[#8B0000] rounded-full transition-all"><X :size="20" /></button>
          </div>
          <div class="relative z-10 p-10"><slot name="body"></slot></div>
          <div class="relative z-10 px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4"><slot name="footer"></slot></div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>