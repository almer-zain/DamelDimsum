<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Star, CheckCircle, Loader2, Sparkles, TrendingUp, 
  ShieldCheck, MapPin, User, Store, ChevronLeft, Send 
} from 'lucide-vue-next';
import { settings } from '@/store/settings'; // Import global settings
import gsap from 'gsap';
import { showToast } from '@/utils/eventBus';

const router = useRouter();
const isSubmitting = ref(false);
const isConfirmModalOpen = ref(false);

// FORM STATE
const form = ref({
  nameOwner: '',
  nameShop: '',
  whatsapp: '',
  city: '',
  address: ''
});

// --- LIFECYCLE ---
onMounted(() => {
  document.documentElement.style.overflow = 'auto';
  document.body.style.overflow = 'auto';
  window.scrollTo(0, 0);

  setTimeout(() => {
    gsap.fromTo(".hero-content > *", 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power4.out" }
    );
    gsap.fromTo(".form-card", 
      { y: 60, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.2, delay: 0.2, ease: "expo.out" }
    );
  }, 600);
});

onUnmounted(() => {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

// --- LOGIC ---
const preSubmitCheck = () => {
  if (!form.value.nameOwner || !form.value.whatsapp || !form.value.city) {
    return showToast('Mohon lengkapi Nama, WhatsApp, dan Kota ya!', 'error');
  }
  isConfirmModalOpen.value = true;
};

const handleRegister = () => {
  isConfirmModalOpen.value = false;
  isSubmitting.value = true;

  // 1. Get Admin Phone Number from DB
  let adminPhone = settings.mainWhatsapp || '628123456789';
  adminPhone = adminPhone.replace(/\D/g, '');
  if (adminPhone.startsWith('0')) adminPhone = '62' + adminPhone.slice(1);

  // 2. Build the Professional Registration Message
  let message = `📝 *PENDAFTARAN MITRA BARU*\n`;
  message += `Halo *${settings.siteName || 'Damel Dimsum'}*,\n`;
  message += `Saya tertarik untuk bergabung menjadi Reseller. Berikut data saya:\n\n`;
  
  message += `👤 *Identitas Pemilik*\n`;
  message += `▪️ Nama: ${form.value.nameOwner}\n`;
  message += `▪️ WhatsApp: ${form.value.whatsapp}\n\n`;

  message += `🏪 *Detail Toko*\n`;
  message += `▪️ Nama Toko: ${form.value.nameShop || '-'}\n`;
  message += `▪️ Kota: ${form.value.city}\n`;
  message += `▪️ Alamat: ${form.value.address || '-'}\n\n`;

  message += `Mohon info langkah selanjutnya untuk kemitraan ini. Terima kasih! 🙏`;

  // 3. Open WhatsApp
  const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
  
  showToast('Membuka WhatsApp...', 'success');
  
  setTimeout(() => {
    window.open(waUrl, '_blank');
    isSubmitting.value = false;
    // Optional: Reset form after sending
    form.value = { nameOwner: '', nameShop: '', whatsapp: '', city: '', address: '' };
  }, 1000);
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] font-['Poppins'] relative pb-32 overflow-x-hidden">
    
    <!-- BACKGROUND DECORATION -->
    <div class="fixed inset-0 pointer-events-none z-0">
       <div class="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
       <div class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#8B0000]/10 rounded-full blur-[150px] animate-pulse"></div>
       <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 pt-12 relative z-10">
      
      <!-- NAV -->
      <div class="mb-12 hero-content opacity-100">
        <button @click="router.push('/')" class="group inline-flex items-center gap-3 text-[#111827] font-black uppercase tracking-widest text-xs hover:text-[#8B0000] transition-colors bg-transparent border-none cursor-pointer">
          <div class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-[#8B0000] transition-colors">
             <ChevronLeft :size="16" class="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Beranda
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        
        <!-- LEFT: THE SALES PITCH -->
        <div class="lg:col-span-5 hero-content lg:sticky lg:top-40 space-y-10">
           <div class="opacity-0 inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm">
              <Sparkles :size="16" class="text-[#FBBF24]" />
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Official Partnership</span>
           </div>
           
           <div class="opacity-0">
             <h1 class="text-5xl lg:text-7xl font-black text-[#111827] tracking-tighter uppercase italic leading-[0.9] mb-6">
               Mulai <br/><span class="text-[#8B0000] not-italic">Cuan.</span>
             </h1>
             <p class="text-gray-500 font-medium text-base lg:text-lg leading-relaxed max-w-lg">
               Bergabung dengan keluarga Damel. Kirim data dirimu via WhatsApp dan admin kami akan memandu langkah bisnismu selanjutnya.
             </p>
           </div>

           <div class="opacity-0 space-y-6 pt-6 border-t border-gray-200">
             <div class="flex gap-5 items-center group">
               <div class="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#111827] group-hover:bg-[#8B0000] group-hover:text-white transition-colors shrink-0">
                 <TrendingUp :size="24" />
               </div>
               <div>
                 <h4 class="font-black uppercase text-sm text-[#111827]">Sistem Cepat</h4>
                 <p class="text-xs text-gray-400 mt-1 font-medium">Tanpa antre, pendaftaran langsung terhubung ke admin.</p>
               </div>
             </div>
             
             <div class="flex gap-5 items-center group">
               <div class="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#111827] group-hover:bg-[#8B0000] group-hover:text-white transition-colors shrink-0">
                 <ShieldCheck :size="24" />
               </div>
               <div>
                 <h4 class="font-black uppercase text-sm text-[#111827]">Resmi & Terpercaya</h4>
                 <p class="text-xs text-gray-400 mt-1 font-medium">Bahan premium kualitas hotel langsung dari pusat.</p>
               </div>
             </div>
           </div>
        </div>

        <!-- RIGHT: THE FORM CARD -->
        <div class="lg:col-span-7 form-card opacity-0">
           <div class="bg-white rounded-[3rem] p-8 lg:p-14 shadow-2xl border border-gray-100 relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#8B0000] to-[#FBBF24]"></div>
              
              <div class="mb-10 text-center">
                  <h3 class="text-2xl font-black text-[#111827] uppercase tracking-tight italic">Registrasi <span class="text-[#8B0000]">Reseller</span></h3>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Data Anda akan langsung dikirim ke WhatsApp Admin</p>
              </div>
              
              <form @submit.prevent="preSubmitCheck" class="space-y-8 relative z-10">
                 <!-- Form Fields (Same as before) -->
                 <div class="space-y-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Kamu *</label>
                            <input v-model="form.nameOwner" type="text" placeholder="Contoh: Budi Santoso" required class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor WhatsApp *</label>
                            <input v-model="form.whatsapp" type="text" placeholder="08..." required class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Toko</label>
                            <input v-model="form.nameShop" type="text" placeholder="Opsional" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kota Kamu *</label>
                            <input v-model="form.city" type="text" placeholder="Contoh: Bekasi" required class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                        <textarea v-model="form.address" rows="3" placeholder="Jalan, RT/RW, Kelurahan..." class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all shadow-inner resize-none"></textarea>
                    </div>
                 </div>

                 <!-- Submit -->
                 <div class="pt-6">
                     <button type="submit" :disabled="isSubmitting" class="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#111827] transition-all active:scale-95 flex items-center justify-center gap-3">
                       <Loader2 v-if="isSubmitting" class="animate-spin" :size="18" />
                       <Send v-else :size="18" />
                       <span>Kirim via WhatsApp</span>
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
          <div class="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle :size="40" class="text-[#FBBF24]" /></div>
          <h4 class="font-black uppercase tracking-tighter text-2xl text-[#111827] mb-2">Kirim Data?</h4>
          <p class="text-[10px] font-bold text-gray-400 uppercase leading-relaxed px-4">Kamu akan diarahkan ke WhatsApp Admin untuk validasi data.</p>
          <div class="flex flex-col gap-3 mt-10">
            <button @click="handleRegister" class="w-full bg-[#111827] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">YA, LANJUTKAN</button>
            <button @click="isConfirmModalOpen = false" class="w-full py-4 font-black text-[10px] uppercase text-gray-400">Cek Lagi</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>