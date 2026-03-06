<script setup>
import { CheckCircle, XCircle } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'success' // 'success' or 'error'
  }
});
</script>

<template>
  <!-- Main Toast Container -->
  <div 
    v-if="show" 
    class="sticky  top-20 right-5 z-[99999]  w-full max-w-sm p-4 rounded-xl shadow-2xl border-l-4"
    :class="{
      'bg-emerald-50 border-emerald-500': type === 'success',
      'bg-red-50 border-red-500': type === 'error'
    }"
  >
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div 
        :class="{
          'text-emerald-500': type === 'success',
          'text-red-500': type === 'error'
        }"
      >
        <CheckCircle v-if="type === 'success'" :size="20" />
        <XCircle v-else :size="20" />
      </div>
      
      <!-- Message -->
      <div class="flex-1">
        <h5 
          class="font-black text-sm uppercase tracking-wider"
          :class="{
            'text-emerald-800': type === 'success',
            'text-red-800': type === 'error'
          }"
        >
          {{ type === 'success' ? 'Berhasil' : 'Terjadi Kesalahan' }}
        </h5>
        <p class="text-xs mt-1 text-gray-500 font-medium">{{ message }}</p>
      </div>
    </div>
  </div>
</template>