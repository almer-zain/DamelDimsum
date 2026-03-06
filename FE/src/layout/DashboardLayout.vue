<script setup>
import { onMounted, ref } from 'vue';
import Sidebar from '@/component/common/Sidebar.vue';
import Modal from '@/component/ui/Modal.vue';
import { User, LogOut, ChevronDown, Camera, Save, Loader2 } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { showToast } from '@/utils/eventBus';
import api from '@/utils/api';
import gsap from 'gsap';

const router = useRouter();
const profileMenu = ref(null);
const watermarkRef = ref(null);
const isEditProfileOpen = ref(false);
const isSaving = ref(false);

// --- FORM STATE ---
const profileForm = ref({ name: 'Loading...', username: '' });

// --- API ACTIONS ---
const fetchAdminProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    profileForm.value = res.data.data;
  } catch (e) { console.error("Gagal mengambil profil"); }
};

const handleUpdateProfile = async () => {
  isSaving.value = true;
  try {
    await api.patch('/auth/me', { name: profileForm.value.name });
    showToast('Profil berhasil diperbarui!');
    isEditProfileOpen.value = false;
  } catch (e) { showToast('Gagal memperbarui profil', 'error'); 
  } finally { isSaving.value = false; }
};

const handleLogout = async () => {
  try {
    gsap.to(".view-container", { opacity: 0, y: 20, duration: 0.3 });
    gsap.to(".sidebar-wrapper", { x: -100, opacity: 0, duration: 0.5, ease: "power2.in" });

    await api.post('/auth/logout');
    localStorage.removeItem('admin');

    setTimeout(() => {
      router.push('/login');
      showToast('Sesi berakhir, sampai jumpa!');
    }, 400);
  } catch (e) { showToast('Gagal memproses logout', 'error'); }
};

// --- ANIMATIONS ---
onMounted(() => {
  fetchAdminProfile(); 
  
  const tl = gsap.timeline();
  tl.from(".sidebar-wrapper", { x: -100, opacity: 0, duration: 1, ease: "expo.out" })
    .from(".header-block", { y: -30, rotationX: -15, transformOrigin: "top", opacity: 0, duration: 0.4, ease: "power4.out" }, "-=0.6")
    .from(".divider-line", { scaleX: 0, duration: 1, ease: "expo.inOut" }, "-=0.4")
    .from(".view-container", { y: 40, opacity: 0, duration: 0.4, ease: "power3.out" }, "-=0.6");

  window.addEventListener('mousemove', (e) => {
    if(!watermarkRef.value) return;
    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5) * 30;
    const yPos = (clientY / window.innerHeight - 0.5) * 30;
    gsap.to(watermarkRef.value, { x: xPos, y: yPos, duration: 0.5, ease: "power2.out" });
  });
});

const showSettings = () => gsap.to(profileMenu.value, { opacity: 1, y: 0, display: 'block', duration: 0.2, ease: "back.out(1.7)" });
const hideSettings = () => gsap.to(profileMenu.value, { opacity: 0, y: -10, display: 'none', duration: 0.2, ease: "power2.in" });
</script>

<template>
  <!-- Responsive flex: allows sidebar and main content to exist -->
  <div class="flex min-h-screen bg-[#FDFBF7] selection:bg-[#8B0000] selection:text-white overflow-hidden perspective-1000">
    
    <!-- Sidebar Wrapper -->
    <div class="sidebar-wrapper relative z-40">
      <Sidebar />
    </div>
    
    <!-- Main Content Area -->
    <main class="flex-1 h-screen overflow-hidden flex flex-col relative w-full mt-10">
      <!-- Texture Overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] z-0"></div>

      <!-- Main Scrollable Area -->
      <!-- Added responsive padding: px-4 pt-16 for mobile (to avoid overlap with mobile menu button), lg:p-12 for desktop -->
      <div class="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-20">
        <div class="px-6 pt-20 lg:p-12 max-w-7xl mx-auto w-full">
          
          <!-- Header Block -->
          <header class="header-block mb-8 lg:mb-12">
            <!-- Responsive flex-col to flex-row -->
            <div class="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-0 mb-8">
              
              <!-- Left: Titles -->
              <div class="w-full">
                <div class="flex items-center gap-3 mb-3">
                  <span class="bg-[#8B0000] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm shadow-sm">
                    Official Admin
                  </span>
                  <span class="text-[#C5A059] text-[10px] font-bold tracking-widest uppercase opacity-70">Ver 1.0.4</span>
                </div>
                <!-- Responsive text sizing -->
                <h2 class="text-4xl lg:text-6xl font-black text-[#1F2937] tracking-tighter uppercase leading-none italic">
                  Control <span class="text-[#8B0000] not-italic">Center</span>
                </h2>
                <p class="mt-2 lg:mt-4 text-[#1F2937]/50 font-medium italic text-xs lg:text-sm max-w-md leading-relaxed">
                  Sistem Manajemen Reseller & Katalog Produk Damel.
                </p>
              </div>

              <!-- Right: Profile Logic (Self-aligns to right on mobile via ml-auto or full width) -->
              <div class="relative group w-full lg:w-auto flex lg:block justify-end" @mouseenter="showSettings" @mouseleave="hideSettings">
                <div class="flex items-center gap-4 bg-white/60 backdrop-blur-md p-2 pr-6 rounded-xl border border-[#C5A059]/30 shadow-sm cursor-pointer hover:border-[#8B0000]/50 transition-colors">
                  <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white border border-[#C5A059]/20 flex items-center justify-center p-1 relative shadow-inner">
                    <img src="@/assets/images/LogoDamelDimsum.png" alt="Admin" class="w-full h-full object-contain" />
                    <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-[10px] lg:text-xs font-black text-[#1F2937] uppercase tracking-wider">{{ profileForm.name }}</p>
                      <ChevronDown :size="12" class="text-gray-400 group-hover:rotate-180 transition-transform" />
                    </div>
                    <p class="text-[8px] lg:text-[9px] text-[#8B0000] font-bold uppercase tracking-widest ">Administrator</p>
                  </div>
                </div>

                <!-- Dropdown -->
                <div ref="profileMenu" class="hidden opacity-0 absolute top-full right-0 mt-2 w-48 lg:w-56 bg-white border border-[#C5A059]/30 rounded-2xl shadow-2xl p-2 z-[99]">
                  <button @click="isEditProfileOpen = true" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#8B0000]/5 text-gray-600 hover:text-[#8B0000] transition-colors font-bold uppercase text-[10px] tracking-widest">
                    <User :size="16" /> Edit Profile
                  </button>
                  <div class="border-t border-gray-50 my-1"></div>
                  <button @click="handleLogout" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
                    <LogOut :size="16" /> Sign Out
                  </button>
                </div>
              </div>
            </div>

            <!-- Double Rule Divider -->
            <div class="divider-line relative w-full h-[3px] origin-left mt-25">
              <div class="absolute top-0 w-full h-[1px] bg-[#1F2937]/20"></div>
              <div class="absolute bottom-0 w-full h-[1px] bg-[#1F2937]/10"></div>
              <div class="absolute top-0 left-0 w-24 lg:w-32 h-[1px] bg-[#8B0000]"></div>
            </div>
          </header>

          <!-- Main Router View -->
          <div class="view-container w-full ">
            <router-view />
          </div>
        </div>
      </div>

      <!-- Watermark (Hidden on mobile to prevent squishing) -->
      <div ref="watermarkRef" class="hidden lg:block absolute bottom-10 right-10 pointer-events-none opacity-[0.04] select-none z-0">
        <h1 class="text-[15rem] font-black italic text-[#8B0000]">DAMEL</h1>
      </div>
    </main>

    <!-- EDIT PROFILE MODAL (Untouched, just added sm:p-4 for mobile safety) -->
    <!-- ... (Keep your existing Modal code here) ... -->
    <Modal :show="isEditProfileOpen" title="Profil Pengelola" @close="isEditProfileOpen = false">
        <template #body>
            <div class="space-y-6">
                <div class="flex flex-col items-center gap-4">
                    <div class="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-[#C5A059]/30 flex items-center justify-center relative group cursor-pointer overflow-hidden hover:border-[#8B0000]/50 transition-colors">
                        <img src="@/assets/images/LogoDamelDimsum.png" class="w-16 h-16 object-contain" />
                        <div class="absolute inset-0 bg-[#111827]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera class="text-white" :size="24" /></div>
                    </div>
                    <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ubah Foto Profil</p>
                </div>
                <div class="grid gap-4">
                    <div><label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Administrator</label><input v-model="profileForm.name" type="text" class="w-full mt-2 p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000] transition-all" /></div>
                    <div><label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label><input v-model="profileForm.username" type="username" class="w-full mt-2 p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000] transition-all" disabled /></div>
                </div>
            </div>
        </template>
        <template #footer>
            <button @click="isEditProfileOpen = false" class="px-6 py-2 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
            <button @click="handleUpdateProfile" :disabled="isSaving" class="bg-[#8B0000] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                <Loader2 v-if="isSaving" class="animate-spin" :size="14" />
                <Save v-else :size="14" /> {{ isSaving ? 'Menyimpan...' : 'Simpan Profil' }}
            </button>
        </template>
    </Modal>
  </div>
</template>

<style scoped>
h2 { font-family: 'Poppins', sans-serif; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 0, 0, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 0, 0, 0.4); }
.perspective-1000 { perspective: 1000px; }
</style>