<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import gsap from 'gsap'
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const loginCard = ref(null)

// --- State ---
const formData = ref({ username: '', password: '', rememberMe: false })
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// --- GSAP Animations (Untouched) ---
onMounted(() => {
  const tl = gsap.timeline();
  tl.from(loginCard.value, { y: 100, opacity: 0, duration: 1, ease: "expo.out" });
  tl.from(".form-content > *", { x: -50, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }, "-=0.5");
  tl.from(".logo-container", { scale: 0.5, opacity: 0, duration: 1, ease: "back.out(1.7)" }, "-=0.8");
  gsap.to(".circle-bg", { x: "random(-50, 50)", y: "random(-50, 50)", duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
});

// --- Logic (Fixed for Cookies) ---
const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); 

    // 1. Send request with 'withCredentials' to enable cookie storage
    const response = await axios.post(`${baseUrl}/v1/auth/login`, {
      username: formData.value.username,
      password: formData.value.password
    }, {
      withCredentials: true // MANDATORY: This allows the browser to receive the cookie
    });

    // 2. Extract only the admin info. The 'token' is handled by the browser automatically.
    const { admin } = response.data.data;

    // 3. Save only non-sensitive info for the UI (Sidebar name, etc.)
    localStorage.setItem('admin', JSON.stringify(admin));

    // GSAP Exit Animation
    gsap.to(loginCard.value, {
      scale: 0.9,
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        router.push('/admin'); 
      }
    });

  } catch (error) {
    // Handle specific backend error format
    errorMessage.value = error.response?.data?.message || 'Gagal terhubung ke server';
    
    // Error Feedback Animation
    gsap.to(".btn-login", { x: 10, duration: 0.1, repeat: 5, yoyo: true });
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-[#F9FAFB] min-h-screen flex items-center justify-center px-5 py-8 font-['Poppins']">
    <div ref="loginCard" class="w-full max-w-6xl bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
      <div class="grid grid-cols-1 lg:grid-cols-2">
        
        <!-- Left Side - Login Form -->
        <div class="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div class="form-content">
            <h1 class="text-5xl md:text-6xl font-bold mb-4 text-[#B91C1C] tracking-tight italic">
              LOGIN <span class="text-[#111827] not-italic">ADMIN</span>
            </h1>
            <p class="text-gray-400 mb-10 font-medium uppercase text-[10px] tracking-[0.3em]">Portal Admin Damel Dimsum</p>

            <div v-if="errorMessage" class="error-msg mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <div class="flex items-center gap-3">
                <AlertCircle class="w-5 h-5 text-red-500" />
                <p class="text-sm text-red-700 font-semibold">{{ errorMessage }}</p>
              </div>
            </div>
            
            <form @submit.prevent="handleLogin" class="space-y-6">
              <div>
                <label class="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Username Pengelola</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <User :size="20" />
                  </span>
                  <input 
                    v-model="formData.username"
                    type="text" 
                    placeholder="Contoh: admin_damel"
                    class="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#B91C1C] focus:bg-white focus:outline-none transition-all font-bold text-sm"
                    :disabled="isLoading"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Sandi Akses</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <Lock :size="20" />
                  </span>
                  <input 
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Masukkan password"
                    class="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#B91C1C] focus:bg-white focus:outline-none transition-all font-bold text-sm"
                    :disabled="isLoading"
                    required
                  />
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#B91C1C]">
                    <Eye v-if="!showPassword" :size="18" />
                    <EyeOff v-else :size="18" />
                  </button>
                </div>
              </div>
              
              <div class="flex items-center justify-between pb-2">
                <label class="flex items-center cursor-pointer group">
                  <input type="checkbox" v-model="formData.rememberMe" class="w-5 h-5 text-[#B91C1C] border-gray-300 rounded focus:ring-[#B91C1C]" />
                  <span class="ml-3 text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#B91C1C] transition-colors">Ingat Perangkat Ini</span>
                </label>
              </div>
              
              <button 
                type="submit"
                :disabled="isLoading"
                class="btn-login w-full bg-[#B91C1C] text-white font-black py-5 rounded-2xl shadow-xl shadow-red-900/20 hover:bg-[#111827] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
              >
                <Loader2 v-if="isLoading" class="animate-spin" :size="18" />
                <span>{{ isLoading ? 'Mengautentikasi...' : 'Masuk Dashboard' }}</span>
              </button>
            </form>
          </div>
        </div>
        
        <!-- Right Side - Visual Section (Oriental Charcoal) -->
        <div class="hidden lg:flex relative bg-[#111827] items-center justify-center overflow-hidden">
          <div class="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
          <div class="circle-bg absolute w-[500px] h-[500px] bg-[#8B0000]/30 rounded-full blur-[120px]"></div>
          
          <div class="relative z-10 text-center">
            <div class="logo-container bg-white p-12 rounded-[3rem] shadow-2xl mb-8 inline-block border-[12px] border-white/5 transform -rotate-3">
              <img src="@/assets/images/LogoDamelDimsum.png" alt="Logo" class="w-40 h-40 object-contain" />
            </div>
            <h2 class="text-white text-xl font-black tracking-[0.4em] uppercase opacity-90">Kualitas <span class="text-[#8B0000]">Damel</span></h2>
            <div class="w-12 h-1 bg-[#C5A059] mx-auto mt-4 rounded-full"></div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  box-shadow: 0 0 0 4px rgba(185, 28, 28, 0.05);
}
</style>