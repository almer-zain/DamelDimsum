<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { 
  Users, Search, CheckCircle, XCircle, Trash2, Edit, Eye,
  MessageCircle, MapPin, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, Filter, WifiOff, X, Save, User, Store, Loader2
} from 'lucide-vue-next';
import gsap from 'gsap';
import api from '@/utils/api';
import { showToast } from '@/utils/eventBus';

// --- STATE ---
const resellers = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const hasError = ref(false);

// --- UI STATE ---
const isPanelOpen = ref(false);
const panelMode = ref('view'); // 'view' or 'edit'
const searchQuery = ref('');
const statusFilter = ref('all');
const sortKey = ref('nameShop');
const sortOrder = ref(1);
const currentPage = ref(1);
const rowsPerPage = ref(8);

// --- FORM STATE ---
const selectedReseller = ref(null);
const editForm = ref({
  id: null,
  nameOwner: '',
  nameShop: '',
  whatsapp: '',
  city: '',
  address: '',
  status: 'pending'
});


const getStatusClass = (status) => {
  if (status === 'approved') return 'bg-green-50 border-green-200 text-green-700';
  if (status === 'rejected') return 'bg-red-50 border-red-200 text-red-700';
  return 'bg-yellow-50 border-yellow-200 text-yellow-700';
};

// --- API ACTIONS ---
const fetchResellers = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/resellers/admin');
    resellers.value = res.data.data || [];
  } catch (e) { hasError.value = true; } 
  finally { 
    isLoading.value = false;
    gsap.from(".reseller-row", { opacity: 0, x: -10, stagger: 0.05, duration: 0.4 });
  }
};

const openPanel = (reseller, mode = 'view') => {
  if (mode === 'create') {
    selectedReseller.value = null;
    editForm.value = { id: null, nameOwner: '', nameShop: '', whatsapp: '', city: '', address: '', status: 'approved' }; // Default to approved if admin creates
  } else {
    selectedReseller.value = reseller;
    editForm.value = { ...reseller };
  }
  panelMode.value = mode;
  isPanelOpen.value = true;
};


const handleUpdate = async () => {
  isSaving.value = true;
  try {
    await api.patch(`/resellers/admin/${selectedReseller.value.id}`, editForm.value);
    showToast('Data mitra berhasil diperbarui');
    await fetchResellers();
    isPanelOpen.value = false;
  } catch (e) {
    showToast('Gagal memperbarui data', 'error');
  } finally { isSaving.value = false; }
};

const handleVerify = async (id, status) => {
  try {
    await api.patch(`/resellers/admin/${id}/verify`, { status });
    showToast(`Status diperbarui ke ${status}`);
    fetchResellers();
    isPanelOpen.value = false;
  } catch (e) { showToast('Gagal update status', 'error'); }
};

const handleDelete = async (id) => {
  if (!confirm("Hapus reseller ini secara permanen?")) return;
  try {
    await api.delete(`/resellers/admin/${id}`);
    showToast('Reseller dihapus');
    fetchResellers();
    isPanelOpen.value = false;
  } catch (e) { showToast('Gagal menghapus', 'error'); }
};

// --- LOGIC (Computed & Sort) ---
const sortBy = (key) => {
  if (sortKey.value === key) sortOrder.value *= -1;
  else { sortKey.value = key; sortOrder.value = 1; }
};


const filteredAndSortedResellers = computed(() => {
  let result = resellers.value.filter(r => {
    // Handle null values safely
    const cityStr = r.city ? r.city.toLowerCase() : '';
    const shopStr = r.nameShop ? r.nameShop.toLowerCase() : '';
    const searchStr = searchQuery.value.toLowerCase();
    
    return (cityStr.includes(searchStr) || shopStr.includes(searchStr)) && 
           (statusFilter.value === 'all' || r.status === statusFilter.value);
  });

  return result.sort((a, b) => {
    let modifier = sortOrder.value;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });
});



const paginatedResellers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredAndSortedResellers.value.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedResellers.value.length / rowsPerPage.value));

const handleSave = async () => {
  isSaving.value = true;
  try {
    // CLEAN BEFORE SEND (Double protection)
    const cleanedData = {
        ...editForm.value,
        whatsapp: editForm.value.whatsapp.replace(/\D/g, '')
    };

    if (panelMode.value === 'create') {
      await api.post('/resellers/apply', cleanedData);
      showToast('Mitra baru berhasil ditambahkan');
    } else {
      await api.patch(`/resellers/admin/${selectedReseller.value.id}`, cleanedData);
      showToast('Data mitra diperbarui');
    }
    await fetchResellers();
    isPanelOpen.value = false;
  } catch (e) {
    showToast(e.response?.data?.message || 'Gagal menyimpan', 'error');
  } finally { isSaving.value = false; }
};
// --- ANIMATIONS  ---
watch(isPanelOpen, async (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'; 
    // Wait for the teleported element to actually exist in the DOM
    await nextTick(); 
    
    // Animate IN
    gsap.fromTo(".teleport-overlay", 
      { autoAlpha: 0 }, 
      { autoAlpha: 1, duration: 0.3 }
    );
    gsap.fromTo(".teleport-panel", 
      { x: '100%', autoAlpha: 0 }, // Start off-screen right
      { x: '0%', autoAlpha: 1, duration: 0.5, ease: "expo.out" }
    );
  } else {
    document.body.style.overflow = '';
    // Animate OUT
    gsap.to(".teleport-panel", { x: '100%', duration: 0.4, ease: "expo.in" });
    gsap.to(".teleport-overlay", { autoAlpha: 0, duration: 0.3, delay: 0.1 });
  }
});


onMounted(() => {
  fetchResellers();
});
</script><template>
  <!-- FIX 1: Added w-full and max-w-full to prevent horizontal blowout -->
  <div class="min-h-screen w-full max-w-full space-y-6 lg:max-w-7xl mx-auto pb-10 px-4 sm:px-8">
    
    <!-- ERROR BANNER -->
    <div v-if="hasError" class="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-700">
      <WifiOff :size="24" class="shrink-0" />
      <div>
        <p class="font-bold text-sm lg:text-base">Gagal Menghubungkan ke Server</p>
        <p class="text-[10px] lg:text-xs">Pastikan backend sudah aktif.</p>
      </div>
      <button @click="fetchResellers" class="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest shrink-0">Coba Lagi</button>
    </div>

    <!-- HEADER -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b-2 border-[#111827]/10 pb-6 gap-4">
      <div class="w-full lg:w-auto">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-4 bg-[#8B0000]"></div>
          <span class="text-[11px] font-black uppercase tracking-widest text-[#8B0000]">Mitra Bisnis</span>
        </div>
        <h3 class="text-3xl sm:text-4xl font-black text-[#111827] tracking-tighter uppercase leading-none">List <span class="text-[#8B0000]">Reseller</span></h3>
      </div>
      
      <!-- FIX 2: Made buttons stack nicely on mobile without stretching weirdly -->
      <div class="flex flex-col sm:flex-row justify-start lg:justify-end items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <button @click="openPanel(null, 'create')" class="bg-[#111827] text-white px-6 py-3.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#8B0000] transition-colors flex items-center justify-center gap-2">
           <Plus :size="16" /> Tambah Mitra
        </button>
        <div class="bg-white px-4 py-3.5 sm:py-3 rounded-xl border border-gray-100 shadow-sm flex justify-center items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Verifikasi Pending</span>
        </div>
      </div>
    </div>

    <!-- TOOLBAR (Search & Select) -->
    <div class="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full">
      <!-- FIX 3: Removed min-w-[300px] which was breaking tiny phones -->
      <div class="relative flex-1 w-full">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]" :size="18" />
        <input 
          v-model="searchQuery"
          @input="currentPage = 1"
          type="text" 
          placeholder="Cari Kota atau Nama Toko..." 
          class="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white border border-gray-200 rounded-xl sm:rounded-2xl focus:border-[#8B0000] outline-none transition-all font-bold text-xs sm:text-sm shadow-sm"
        />
      </div>

      <div class="relative group w-full md:w-auto shrink-0">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Filter :size="16" class="text-[#C5A059]" />
        </div>
        <select 
          v-model="statusFilter" 
          @change="currentPage = 1"
          class="appearance-none w-full md:w-auto bg-white pl-12 pr-10 py-3.5 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#111827] outline-none cursor-pointer focus:border-[#8B0000] shadow-sm transition-all"
        >
          <option value="all">Semua Status</option>
          <option value="pending">🟡 Pending</option>
          <option value="approved">🟢 Approved</option>
          <option value="rejected">🔴 Rejected</option>
        </select>
        <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" :size="14" />
      </div>
    </div>

    <!-- TABLE CONTAINER -->
    <!-- FIX 4: Ensured w-full and overflow-hidden on the parent, overflow-x-auto on the wrapper -->
    <div class="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[400px] sm:min-h-[500px] w-full">
      <div class="w-full overflow-x-auto custom-scrollbar">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead class="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th @click="sortBy('nameShop')" class="p-4 sm:p-5 text-[9px] font-black uppercase text-[#111827] cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex items-center gap-1">
                  Toko & Pemilik <ChevronUp v-if="sortKey === 'nameShop' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'nameShop' && sortOrder === -1" :size="12" />
                </div>
              </th>
              <th @click="sortBy('city')" class="p-4 sm:p-5 text-[9px] font-black uppercase text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex items-center gap-1">
                  Kota <ChevronUp v-if="sortKey === 'city' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'city' && sortOrder === -1" :size="12" />
                </div>
              </th>
              <th class="p-4 sm:p-5 text-[9px] font-black uppercase text-gray-400 text-center">Status</th>
              <th class="p-4 sm:p-5 text-[9px] font-black uppercase text-gray-400 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <!-- SKELETON LOADING -->
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="p-4 sm:p-5"><div class="flex gap-4 items-center"><div class="w-10 h-10 bg-gray-100 rounded-full"></div><div><div class="h-3 bg-gray-100 w-24 mb-2"></div><div class="h-2 bg-gray-50 w-16"></div></div></div></td>
                  <td class="p-4 sm:p-5"><div class="h-4 bg-gray-50 w-20"></div></td>
                  <td class="p-4 sm:p-5"><div class="h-6 bg-gray-50 w-20 mx-auto rounded-full"></div></td>
                  <td class="p-4 sm:p-5"><div class="h-8 bg-gray-50 w-16 mx-auto rounded-lg"></div></td>
              </tr>
            </template>

            <!-- REAL DATA -->
            <template v-else>
              <tr v-for="reseller in paginatedResellers" :key="reseller.id" class="reseller-row group hover:bg-gray-50 transition-colors">
                <td class="p-4 sm:p-5">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-[#8B0000]/5 flex items-center justify-center text-[#8B0000] font-black border border-[#8B0000]/10 shrink-0">
                      {{ reseller.nameShop ? reseller.nameShop.charAt(0) : 'R' }}
                    </div>
                    <div>
                      <p class="font-black text-[#111827] text-xs sm:text-sm uppercase leading-tight">{{ reseller.nameShop }}</p>
                      <p class="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">{{ reseller.nameOwner }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4 sm:p-5"><span class="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-tighter">{{ reseller.city }}</span></td>
                <td class="p-4 sm:p-5 text-center">
                  <span :class="getStatusClass(reseller.status)" class="text-[8px] sm:text-[9px] font-black uppercase px-2 sm:px-3 py-1 rounded-full border whitespace-nowrap">
                    {{ reseller.status }}
                  </span>
                </td>
                <td class="p-4 sm:p-5">
                  <div class="flex justify-center gap-2">
                    <button @click="openPanel(reseller, 'view')" class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:text-[#111827] transition-all"><Eye :size="14" class="sm:w-4 sm:h-4" /></button>
                    <button @click="openPanel(reseller, 'edit')" class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:text-[#8B0000] transition-all"><Edit :size="14" class="sm:w-4 sm:h-4" /></button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && paginatedResellers.length === 0" class="py-20 text-center text-gray-300 italic text-xs sm:text-sm">
        Belum ada reseller terdaftar di kategori ini...
      </div>

      <!-- Pagination Footer -->
      <div class="bg-gray-50 border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
        <span class="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Showing {{ paginatedResellers.length }} of {{ filteredAndSortedResellers.length }} Resellers
        </span>
        <div class="flex items-center gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="p-1.5 sm:p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-30"><ChevronLeft :size="16" /></button>
          <div class="flex gap-1">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page" class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-black transition-all" :class="currentPage === page ? 'bg-[#8B0000] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'">
              {{ page }}
            </button>
          </div>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-1.5 sm:p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-30"><ChevronRight :size="16" /></button>
        </div>
      </div>
    </div>


    <!-- === TELEPORTED SIDE PANEL === -->
    <teleport to="body">
      <div v-show="isPanelOpen" class="fixed inset-0 z-[9998] pointer-events-none">
        
        <!-- OVERLAY -->
        <div 
          @click="isPanelOpen = false" 
          class="teleport-overlay absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
          style="opacity: 0; visibility: hidden;"
        ></div>
        
        <!-- PANEL -->
        <div 
          class="teleport-panel absolute top-0 right-0 h-full w-full lg:w-[450px] bg-[#FDFBF7] z-[9999] flex flex-col border-l-0 lg:border-l-[12px] border-[#8B0000] shadow-2xl pointer-events-auto"
          style="transform: translateX(100%); opacity: 0; visibility: hidden;"
        >
          
          <!-- Panel Header -->
          <div class="p-4 sm:p-6 bg-[#111827] text-white flex justify-between items-center shadow-lg shrink-0">
            <div class="flex items-center gap-3 sm:gap-4">
              <div class="p-2 sm:p-3 bg-[#8B0000] rounded-xl shadow-inner"><Users :size="16" class="sm:w-5 sm:h-5" /></div>
              <div>
                <h4 class="font-black uppercase tracking-widest text-[10px] sm:text-[11px]">
                   {{ panelMode === 'create' ? 'Mitra Baru' : 'Detail Mitra' }}
                </h4>
                <p class="text-[8px] sm:text-[9px] text-gray-400 uppercase font-bold">
                   {{ panelMode === 'view' ? 'Pratinjau Data' : panelMode === 'edit' ? 'Mode Editor' : 'Input Data' }}
                </p>
              </div>
            </div>
            <button @click="isPanelOpen = false" class="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"><X :size="20" class="sm:w-6 sm:h-6" /></button>
          </div>

          <!-- Panel Body -->
          <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white">
            
            <!-- VIEW MODE -->
            <div v-if="panelMode === 'view' && selectedReseller" class="space-y-6 sm:space-y-8">
               <div class="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-[2rem] border border-gray-100">
                  <div class="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center text-xl sm:text-3xl font-black text-[#8B0000] border-2 border-[#FBBF24] uppercase shrink-0">
                    {{ selectedReseller.nameShop ? selectedReseller.nameShop.charAt(0) : 'R' }}
                  </div>
                  <div>
                    <h2 class="text-base sm:text-xl font-black text-[#111827] uppercase leading-tight">{{ selectedReseller.nameShop || 'Tanpa Nama Toko' }}</h2>
                    <p class="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ selectedReseller.nameOwner }}</p>
                  </div>
               </div>

               <div class="grid gap-4 sm:gap-6">
                  <div class="space-y-1">
                    <label class="text-[8px] sm:text-[9px] font-black text-[#8B0000] uppercase tracking-widest">WhatsApp Aktif</label>
                    <div class="flex items-center gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                      <Phone :size="14" class="text-emerald-500 sm:w-4 sm:h-4" />
                      <p class="font-bold text-[#111827] text-xs sm:text-sm">+{{ selectedReseller.whatsapp }}</p>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[8px] sm:text-[9px] font-black text-[#8B0000] uppercase tracking-widest">Kota & Alamat</label>
                    <div class="flex items-start gap-3 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                      <MapPin :size="14" class="text-[#FBBF24] mt-1 shrink-0 sm:w-4 sm:h-4" />
                      <p class="font-bold text-gray-600 text-xs sm:text-sm leading-relaxed uppercase tracking-tight">
                        {{ selectedReseller.city }} <br/>
                        <span class="text-[9px] sm:text-[11px] font-medium normal-case text-gray-400">{{ selectedReseller.address }}</span>
                      </p>
                    </div>
                  </div>
               </div>

               <!-- Approval Actions -->
               <div v-if="selectedReseller.status === 'pending'" class="pt-4 sm:pt-6 border-t border-gray-100 flex gap-3 sm:gap-4">
                  <button @click="handleVerify(selectedReseller.id, 'approved')" class="flex-1 bg-green-600 text-white py-3 sm:py-4 rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Setujui</button>
                  <button @click="handleVerify(selectedReseller.id, 'rejected')" class="flex-1 bg-red-50 text-red-600 py-3 sm:py-4 rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest border border-red-100 active:scale-95 transition-all">Tolak</button>
               </div>
            </div>

            <!-- EDIT / CREATE MODE -->
            <div v-else class="space-y-4 sm:space-y-6">
                <div class="form-item"><label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase mb-1 sm:mb-2 block ml-1">Nama Owner *</label><input v-model="editForm.nameOwner" type="text" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all" /></div>
                <div class="form-item"><label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase mb-1 sm:mb-2 block ml-1">Nama Toko</label><input v-model="editForm.nameShop" type="text" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all" /></div>
                <div class="form-item"><label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase mb-1 sm:mb-2 block ml-1">WhatsApp *</label><input v-model="editForm.whatsapp" type="text" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all" /></div>
                <div class="form-item"><label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase mb-1 sm:mb-2 block ml-1">Kota *</label><input v-model="editForm.city" type="text" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all" /></div>
                <div class="form-item"><label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase mb-1 sm:mb-2 block ml-1">Alamat Lengkap *</label><textarea v-model="editForm.address" rows="3" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all resize-none"></textarea></div>
                
                <!-- Inside Side Panel > Create/Edit Section -->
                <div class="form-item">
                    <label class="text-[9px] font-black text-gray-400 uppercase mb-2 block ml-1">Status Kemitraan</label>
                    <select v-model="editForm.status" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all">
                        <option value="pending">🟡 Pending (Butuh Review)</option>
                        <option value="approved">🟢 Approved (Aktif di Web)</option>
                        <option value="rejected">🔴 Rejected (Ditolak)</option>
                    </select>
                </div>
            </div>
          </div>

          <!-- Footer Action -->
          <div class="p-4 sm:p-6 bg-white border-t border-gray-100 flex justify-between items-center gap-2 sm:gap-4 shrink-0">
            <button v-if="selectedReseller && panelMode !== 'create'" @click="handleDelete(selectedReseller.id)" class="p-3 sm:p-4 text-red-300 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors active:scale-90"><Trash2 :size="18" class="sm:w-5 sm:h-5" /></button>
            <div v-else></div>
            
            <div class="flex justify-end gap-2 sm:gap-3 flex-1">
                <button @click="isPanelOpen = false" class="px-4 sm:px-6 py-3 sm:py-4 font-black text-[9px] sm:text-[10px] uppercase text-gray-400 hover:text-[#111827]">Tutup</button>
                <button v-if="panelMode === 'edit' || panelMode === 'create'" @click="handleSave" :disabled="isSaving" class="bg-[#111827] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                    <Loader2 v-if="isSaving" class="animate-spin sm:w-4 sm:h-4" :size="14" />
                    <Save v-else :size="14" class="sm:w-4 sm:h-4" /> Simpan
                </button>
            </div>
          </div>
        </div>

      </div>
    </teleport>

  </div>
</template>

<style scoped>
/* Clean up scrollbar inside the table */
.custom-scrollbar::-webkit-scrollbar { height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>