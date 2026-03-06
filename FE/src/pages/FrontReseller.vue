<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Star, CheckCircle, Loader2, Sparkles, TrendingUp, ShieldCheck, MapPin, User, Store, ChevronLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import api from '@/utils/api';
import gsap from 'gsap';
import { showToast } from '@/utils/eventBus';

const router = useRouter();
const isSubmitting = ref(false);

// MATCHES SEQUELIZE MODEL
const form = ref({
  nameOwner: '',
  nameShop: '',
  whatsapp: '',
  city: '',
  address: ''
});

// --- LIFECYCLE: SCROLL FIX & ANIMATIONS ---
onMounted(() => {
  // FORCE SCROLL UNLOCK
  document.documentElement.style.overflow = 'auto';
  document.body.style.overflow = 'auto';
  window.scrollTo(0, 0); 
  
});

onUnmounted(() => {
  // Reset scroll behavior
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

// --- ADDED REFS ---
const isConfirmModalOpen = ref(false);
const isCheckingDuplicate = ref(false);

// --- MODAL ACTION ---
const preSubmitCheck = () => {
  if (!form.value.nameOwner || !form.value.whatsapp) {
    return showToast('Nama dan WhatsApp wajib diisi ya!', 'error');
  }
  isConfirmModalOpen.value = true;
};

const handleRegister = async () => {
  isConfirmModalOpen.value = false;
  isSubmitting.value = true;
  
  try {
    const res = await api.post('/resellers/apply', form.value);
    showToast('Pendaftaran terkirim! Admin akan segera hubungi kamu.', 'success');
    
    // Reset Form
    form.value = { nameOwner: '', nameShop: '', whatsapp: '', city: '', address: '' };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    // Backend will return the "Duplicate" error message here
    showToast(e.response?.data?.message || 'Gagal mengirim data.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class=" bg-[#FDFBF7] font-['Poppins'] pt-24 pb-32 relative overflow-x-hidden">
    
    <!-- BACKGROUND DECORATION (Identical to Find Reseller) -->
    <div class="fixed inset-0 pointer-events-none z-0">
       <div class="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
       <div class="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-[#FBBF24]/10 rounded-full blur-[100px] pointer-events-none"></div>
       <div class="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-[#8B0000]/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="max-w-4xl mx-auto px-6 relative z-10">
      
      <!-- TOP NAVIGATION -->
      <div class="mb-12">
        <button @click="router.push('/')" class="group flex items-center gap-3 text-[#111827] font-black uppercase tracking-widest text-xs hover:text-[#8B0000] transition-colors w-max bg-transparent">
          <div class="w-8 h-8 rounded-full border-2 border-[#111827] flex items-center justify-center group-hover:border-[#8B0000] transition-colors bg-white shadow-sm">
             <ChevronLeft :size="14" class="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Beranda
        </button>
      </div>

      <!-- HEADER SECTION -->
      <div class="page-header text-center mb-16 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
            <Star :size="14" class="text-[#FBBF24]" fill="currentColor" />
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Program Kemitraan</span>
        </div>
        <h1 class="text-4xl lg:text-6xl font-black text-[#111827] tracking-tighter uppercase italic leading-[0.9]">
          Gabung <span class="text-[#8B0000] not-italic">Keluarga</span> Dàmel.
        </h1>
        <p class="text-gray-500 font-medium text-sm lg:text-base leading-relaxed max-w-lg mx-auto">
          Mulai bisnis menjanjikan dengan dukungan penuh dari pusat. Kualitas rasa hotel bintang lima, siap Anda hadirkan di wilayah Anda.
        </p>
      </div>

      <!-- FORM CONTAINER (Designed like a premium card) -->
      <div class="form-container relative max-w-2xl mx-auto">
        
        <!-- Glow Effect behind Card -->
        <div class="absolute inset-0 bg-gradient-to-r from-[#8B0000]/10 to-[#FBBF24]/10 rounded-[3rem] blur-2xl opacity-50 pointer-events-none"></div>
        
        <div class="relative bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
            <!-- Top Branding Line -->
            <div class="w-full h-2 bg-gradient-to-r from-[#8B0000] to-[#FBBF24]"></div>
            
            <div class="p-8 lg:p-12 space-y-10">
                <div class="text-center space-y-2 border-b border-gray-50 pb-8">
                    <h3 class="text-2xl font-black text-[#111827] uppercase tracking-tight italic">Registrasi <span class="text-[#8B0000]">Mitra</span></h3>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Silahkan lengkapi data verifikasi berikut</p>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-8">
                    
                    <!-- IDENTITY -->
                    <div class="space-y-5">
                        <div class="flex items-center gap-3">
                           <User :size="16" class="text-[#8B0000]" />
                           <span class="text-[10px] font-black text-[#111827] uppercase tracking-[0.2em]">Identitas Owner</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap *</label>
                                <input v-model="form.nameOwner" type="text" placeholder="Nama Lengkap..." required class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#111827] text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">No. WhatsApp *</label>
                                <input v-model="form.whatsapp" type="text" placeholder="628..." required class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#111827] text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                    </div>

                    <!-- SHOP DETAILS -->
                    <div class="space-y-5">
                        <div class="flex items-center gap-3 pt-4 border-t border-gray-50">
                           <Store :size="16" class="text-[#8B0000]" />
                           <span class="text-[10px] font-black text-[#111827] uppercase tracking-[0.2em]">Rincian Lokasi</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Toko</label>
                                <input v-model="form.nameShop" type="text" placeholder="Contoh: Damel Bekasi" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#111827] text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kota Domisili *</label>
                                <input v-model="form.city" type="text" placeholder="Contoh: Jakarta Selatan" required class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#111827] text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap *</label>
                            <textarea v-model="form.address" rows="3" placeholder="Nama Jalan, RT/RW, Kelurahan..." required class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#111827] text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner resize-none"></textarea>
                        </div>
                    </div>

                    <!-- SUBMIT -->
                    <div class="pt-6">
                      <button 
                        type="button" 
                        @click="preSubmitCheck"
                        :disabled="isSubmitting"
                        class="w-full bg-[#111827] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-[#8B0000] hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                      >
                        <Loader2 v-if="isSubmitting" class="animate-spin" :size="18" />
                        <span>{{ isSubmitting ? 'Lagi kirim...' : 'Kirim Pendaftaran' }}</span>
                      </button>
                    </div>

                </form>
            </div>
        </div>
      </div>

    </div>


    <!-- ARE YOU SURE MODAL -->
    <div v-if="isConfirmModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-[#111827]/90 backdrop-blur-md" @click="isConfirmModalOpen = false"></div>
      
      <div class="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border-t-[12px] border-[#FBBF24]">
        <div class="p-10 text-center">
          <div class="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle :size="40" class="text-[#FBBF24]" />
          </div>
          
          <h4 class="font-black uppercase tracking-tighter text-2xl text-[#111827] mb-2">Sudah Benar?</h4>
          <p class="text-[10px] font-bold text-gray-400 uppercase leading-relaxed px-4">
            Pastikan <span class="text-[#8B0000]">Nomor WhatsApp</span> sudah aktif agar Admin bisa menghubungi kamu.
          </p>

          <div class="flex flex-col gap-3 mt-10">
            <button @click="handleRegister" class="w-full bg-[#111827] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#8B0000] transition-all">
              YA, KIRIM DATA
            </button>
            <button @click="isConfirmModalOpen = false" class="w-full py-4 font-black text-[10px] uppercase text-gray-400">
              Cek Lagi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove Webkit browser default autofill background */
input:-webkit-autofill,
textarea:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px #F9FAFB inset !important;
  -webkit-text-fill-color: #111827 !important;
}

/* Hide scrollbar for cleaner look */
div::-webkit-scrollbar { display: none; }
</style>