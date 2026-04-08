<script setup>
import { onMounted, ref, computed, nextTick } from 'vue';
import { 
  Save, Globe, Phone, Lock, Eye, Bell, Loader2,
  Camera, ShieldAlert, UploadCloud, CheckCircle 
} from 'lucide-vue-next';
import Modal from '@/component/ui/Modal.vue';
import api from '@/utils/api';
import gsap from 'gsap';
import { showToast } from '@/utils/eventBus';

// --- STATE ---
const isLoading = ref(true);
const isSaving = ref(false);
const isSavingPassword = ref(false);
const settings = ref({
  siteName: '',
  mainWhatsapp: '',
  email: '',
  instagram: '',
  facebook: '', // ADD THIS
  address: '',
  announcement: '',
  siteLogo: '',
  siteFavicon: ''
});

// --- MODAL STATES ---
const isPasswordModalOpen = ref(false);
const isLogoModalOpen = ref(false);
const isFaviconModalOpen = ref(false);
const passwordForm = ref({ old: '', new: '', confirm: '' });

// --- UTILS ---
const logoUrl = computed(() => {
  if (!settings.value.siteLogo) return '/src/assets/images/LogoDamelDimsum.png'; // Default fallback
  
  // If it's a full URL (external), use it. Otherwise, point to backend uploads.
  if (settings.value.siteLogo.startsWith('http')) return settings.value.siteLogo;
  return `${import.meta.env.VITE_IMAGE_URL}/${settings.value.siteLogo}`;
});

// --- API ACTIONS ---
const loadSettings = async () => {
  try {
    const res = await api.get('/settings');
    // Merge backend data into local settings state
    Object.assign(settings.value, res.data.data);
  } catch (e) {
    console.error("Failed to load settings");
  } finally {
    isLoading.value = false;
  }
};


const handleSaveSettings = async () => {
  isSaving.value = true;
  try {
    await api.patch('/settings', settings.value);
    showToast('Konfigurasi berhasil disimpan!');
  } catch (e) {
    showToast('Gagal menyimpan pengaturan.', 'error');
  } finally {
    isSaving.value = false;
  }
};



const handleUpdatePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    return showToast('Konfirmasi password tidak cocok.', 'error');
  }
  
  isSavingPassword.value = true;
  try {
    await api.patch('/auth/change-password', {
      oldPassword: passwordForm.value.old,
      newPassword: passwordForm.value.new
    });
    showToast('Sandi akses berhasil diubah!');
    isPasswordModalOpen.value = false;
    passwordForm.value = { old: '', new: '', confirm: '' };
  } catch (e) {
    showToast(e.response?.data?.message || 'Gagal mengubah password.', 'error');
  } finally {
    isSavingPassword.value = false;
  }
};

// --- UPLOAD LOGIC (Fixed Name) ---
const handleIconUpload = async (event, keyName) => {
  const file = event.target.files[0];
  if (!file) return;

  // 1. Validation: Max 2MB
  if (file.size > 2 * 1024 * 1024) {
    return showToast("File terlalu besar! Maksimal 2MB", "error");
  }

  const formData = new FormData();
  formData.append('images', file); // Must match backend req.files.images
  formData.append('key', keyName);   // Must match backend req.body.key

  try {
    // 2. Explicitly set headers for this POST call
    const res = await api.post('/settings/upload-icon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const newFileName = res.data.data;
    settings.value[keyName] = newFileName;
    
    showToast(`Berhasil memperbarui ${keyName}!`);
    isLogoModalOpen.value = false;
    isFaviconModalOpen.value = false;
  } catch (e) {
    console.error("Upload Error:", e.response?.data || e.message);
    showToast(e.response?.data?.message || 'Gagal mengunggah gambar.', 'error');
  }
};

onMounted(() => {
  loadSettings();
  gsap.from(".settings-card", { opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: "power2.out" });
});
</script>

<template>
  <div class="space-y-8 mx-auto pb-20 px-4">
    

    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-[#111827]/10 pb-6 gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-4 bg-[#8B0000]"></div>
          <span class="text-[11px] font-black uppercase tracking-widest text-[#8B0000]">Konfigurasi Sistem</span>
        </div>
        <h3 class="text-4xl font-black text-[#111827] tracking-tighter uppercase leading-none">Pengaturan <span class="text-[#8B0000]">Situs</span></h3>
      </div>
      
      <button 
        @click="handleSaveSettings" 
        :disabled="isSaving || isLoading"
        class="bg-[#8B0000] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#111827] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
      >
        <Loader2 v-if="isSaving" class="animate-spin" :size="18" />
        <Save v-else :size="18" /> 
        {{ isSaving ? 'PROSES...' : 'SIMPAN PERUBAHAN' }}
      </button>
    </div>

    <div v-if="isLoading" class="py-20 text-center animate-pulse font-black text-gray-300 uppercase tracking-[0.5em]">Syncing Configuration...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- LEFT: Forms -->
      <div class="lg:col-span-2 space-y-6">
        <div class="settings-card bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div class="flex items-center gap-3 mb-6"><Globe class="text-[#C5A059]" :size="20" /><h4 class="text-lg font-black text-[#111827] uppercase tracking-tight">Identitas Utama</h4></div>
          <div class="space-y-4">
            <div><label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Website</label><input v-model="settings.siteName" type="text" class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-[#111827] outline-none focus:border-[#8B0000] transition-all" /></div>
            <div><label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Pengumuman (Banner)</label><textarea v-model="settings.announcement" rows="2" class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-[#111827] outline-none focus:border-[#8B0000] transition-all"></textarea></div>
            
          </div>
        </div>

        <div class="settings-card bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div class="flex items-center gap-3 mb-6"><Phone class="text-[#C5A059]" :size="20" /><h4 class="text-lg font-black text-[#111827] uppercase tracking-tight">Kontak Pusat</h4></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">WhatsApp Order (Utama)</label>
              <div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+</span><input v-model="settings.mainWhatsapp" type="text" class="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-[#111827] outline-none focus:border-[#8B0000] transition-all" /></div>
            </div>
            <!-- NEW EMAIL FIELD -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Bisnis (Opsional)</label>
              <div class="relative"><input v-model="settings.email" type="email" placeholder="kontak@bisnis.com" class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-[#111827] outline-none focus:border-[#8B0000] transition-all" /></div>
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Alamat Kantor / Produksi</label>
              <input v-model="settings.address" type="text" placeholder="Contoh: Jl. Merdeka No. 1, Purwokerto" class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-[#111827] outline-none focus:border-[#8B0000] transition-all" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <!-- Instagram (Existing) -->
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username Instagram</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">@</span>
              <input v-model="settings.instagram" type="text" placeholder="damel.dimsum" class="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-[#111827] outline-none focus:border-[#8B0000] transition-all" />
            </div>
          </div>

          <!-- Facebook (NEW) -->
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Halaman Facebook</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">fb.com/</span>
              <input v-model="settings.facebook" type="text" placeholder="DamelDimsumOfficial" class="w-full pl-20 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-[#111827] outline-none focus:border-[#8B0000] transition-all" />
            </div>
          </div>
        </div>
        </div>

        <div class="settings-card bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div class="flex items-center gap-3 mb-6"><Lock class="text-[#8B0000]" :size="20" /><h4 class="text-lg font-black text-[#111827] uppercase tracking-tight">Keamanan Admin</h4></div>
          <button @click="isPasswordModalOpen = true" class="w-full py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#111827] hover:border-[#8B0000] transition-all flex items-center justify-center gap-2">
            <ShieldAlert :size="14" class="text-[#8B0000]" /> Perbarui Password
          </button>
        </div>

      </div>

      <!-- RIGHT: Previews -->
      <div class="space-y-6">
        <div class="settings-card bg-[#111827] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
          <div class="relative z-10 text-center">
            <div class="flex items-center justify-center gap-2 mb-6"><Eye :size="14" class="text-[#C5A059]" /><span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059]">Branding Preview</span></div>
            
            <!-- LIVE PREVIEW BOX -->
            <div class="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-6">
              <div class="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white/20">
                <img :src="logoUrl" crossorigin="anonymous" class="w-full h-full object-cover" />
              </div>
              <h5 class="text-white font-black uppercase tracking-widest text-xs">{{ settings.siteName || 'Damel Dimsum' }}</h5>
              <div class="h-[2px] w-8 bg-[#8B0000] mx-auto mt-3"></div>
            </div>

            <div class="grid grid-cols-2 gap-3">
               <button @click="isLogoModalOpen = true" class="py-3 bg-white/5 hover:bg-[#8B0000] text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all">Ganti Logo</button>
               <button @click="isFaviconModalOpen = true" class="py-3 bg-white/5 hover:bg-[#8B0000] text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all">Favicon</button>
            </div>
          </div>
        </div>

        <div class="settings-card bg-[#8B0000] p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div class="absolute -right-4 -top-4 opacity-10"><Bell :size="80" /></div>
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-4"><Bell :size="16" class="text-[#FBBF24]" /><span class="text-[10px] font-black uppercase tracking-widest text-white/80">Halaman Utama (Header)</span></div>
            <div class="bg-black/20 p-4 rounded-xl border border-white/10">
                <p class="text-white font-bold italic text-sm leading-relaxed">"{{ settings.announcement || 'Belum ada pengumuman hari ini.' }}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- --- MODALS --- -->

    <!-- Password Modal -->

    <Modal :show="isPasswordModalOpen" title="Perbarui Kredensial Akses" @close="isPasswordModalOpen = false">
        <template #body>
            <p class="text-[10px] font-bold text-gray-400 uppercase leading-relaxed text-center mb-6">
                Untuk keamanan, masukkan sandi lama Anda dan buat sandi baru yang kuat.
            </p>
            <div class="space-y-4">
                <!-- Old Password -->
                <div class="relative">
                    <Lock :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input v-model="passwordForm.old" type="password" placeholder="Sandi Lama" class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                </div>

                <!-- New Password -->
                <div class="relative">
                    <ShieldAlert :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input v-model="passwordForm.new" type="password" placeholder="Sandi Baru" class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                </div>

                <!-- Confirm New Password -->
                <div class="relative">
                    <CheckCircle :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input v-model="passwordForm.confirm" type="password" placeholder="Ulangi Sandi Baru" class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:border-[#8B0000] outline-none transition-all shadow-inner" />
                </div>
            </div>
        </template>
        
        <template #footer>

            <div class="flex flex-col gap-3">
                <button 
                    @click="handleUpdatePassword" 
                    :disabled="isSavingPassword"
                    class="w-full bg-[#8B0000] text-white py-4 px-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Loader2 v-if="isSavingPassword" class="animate-spin" :size="16" />
                    <Save v-else :size="16" />
                    KONFIRMASI & SIMPAN
                </button>
                <button @click="isPasswordModalOpen = false" class="text-[9px] font-black uppercase text-gray-400 tracking-widest py-2">Batalkan</button>
            </div>
        </template>
    </Modal>

    <!-- Upload Modal (Logo/Favicon) -->
    <Modal :show="isLogoModalOpen || isFaviconModalOpen" :title="isLogoModalOpen ? 'Upload Logo Situs' : 'Upload Favicon'" @close="() => { isLogoModalOpen = false; isFaviconModalOpen = false; }">
        <template #body>
            <label class="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-[#8B0000]/30 transition-colors cursor-pointer group">
                <!-- THE FIX: Call handleIconUpload here -->
                <input 
                  type="file" 
                  class="hidden" 
                  @change="e => handleIconUpload(e, isLogoModalOpen ? 'siteLogo' : 'siteFavicon')" 
                  accept="image/*" 
                />
                <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud :size="40" class="text-gray-300 group-hover:text-[#8B0000]" />
                </div>
                <div class="text-center">
                    <p class="text-sm font-black text-[#111827] uppercase">Klik Pilih Gambar</p>
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">PNG, JPG atau ICO (Max 2MB, Recommended 100x100)</p>
                </div>
            </label>
        </template>
    </Modal>

  </div>
</template>