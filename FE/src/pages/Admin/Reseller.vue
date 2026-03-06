<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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
  nameOwner: '',
  nameShop: '',
  whatsapp: '',
  city: '',
  address: ''
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
  selectedReseller.value = reseller;
  panelMode.value = mode;
  editForm.value = { ...reseller };
  isPanelOpen.value = true;
};

const handleUpdate = async () => {
  isSaving.value = true;
  try {
    await api.patch(`/v1/resellers/admin/${selectedReseller.value.id}`, editForm.value);
    showToast('Data mitra berhasil diperbarui');
    await fetchResellers();
    isPanelOpen.value = false;
  } catch (e) {
    showToast('Gagal memperbarui data', 'error');
  } finally { isSaving.value = false; }
};

const handleVerify = async (id, status) => {
  try {
    await api.patch(`/v1/resellers/admin/${id}/verify`, { status });
    showToast(`Status diperbarui ke ${status}`);
    fetchResellers();
    isPanelOpen.value = false;
  } catch (e) { showToast('Gagal update status', 'error'); }
};

const handleDelete = async (id) => {
  if (!confirm("Hapus reseller ini secara permanen?")) return;
  try {
    await api.delete(`/v1/resellers/admin/${id}`);
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
  let result = resellers.value.filter(r => (
    r.city.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    r.nameShop.toLowerCase().includes(searchQuery.value.toLowerCase())
  ) && (statusFilter.value === 'all' || r.status === statusFilter.value));

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

// --- ANIMATIONS ---
watch(isPanelOpen, (val) => {
  if (val) {
    // When opening: Animate left to 'auto' (or 0 relative to right: 0) and remove transform
    gsap.to(".side-panel", { 
      left: 'auto', // Clears your left: -100%
      x: 0,         // Clears translate-x-full
      autoAlpha: 1, 
      duration: 0.5, 
      ease: "expo.out" 
    });
  } else {
    // When closing: Animate it back off-screen to the right
    gsap.to(".side-panel", { 
      x: '100%', 
      autoAlpha: 0, 
      duration: 0.4, 
      ease: "expo.in",
      onComplete: () => {
         // Reset to your initial CSS state after animation finishes so it doesn't break next time
         gsap.set(".side-panel", { clearProps: "all" });
      }
    });
  }
});

onMounted(fetchResellers);
</script><template>
  <!-- THE ANCHOR: Added 'relative' and 'overflow-hidden' to keep the panel inside this area -->
  <div class=" min-h-screen overflow-visible space-y-6 max-w-7xl mx-auto pb-10 px-4 sm:px-8">
    
    <!-- ERROR BANNER -->
    <div v-if="hasError" class="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-700">
      <WifiOff :size="24" />
      <div>
        <p class="font-bold">Gagal Menghubungkan ke Server</p>
        <p class="text-xs">Gagal memuat data Resellers. Pastikan backend sudah aktif.</p>
      </div>
      <button @click="fetchResellers" class="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Coba Lagi</button>
    </div>

    <!-- Header -->
    <div class="flex justify-between items-end border-b-2 border-[#111827]/10 pb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-4 bg-[#8B0000]"></div>
          <span class="text-[11px] font-black uppercase tracking-widest text-[#8B0000]">Mitra Bisnis</span>
        </div>
        <h3 class="text-4xl font-black text-[#111827] tracking-tighter uppercase leading-none">List <span class="text-[#8B0000]">Reseller</span></h3>
      </div>
      <div class="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Verifikasi Pending</span>
      </div>
    </div>

    <!-- Search & Custom Select -->
    <div class="flex flex-wrap gap-4 items-center">
      <div class="relative flex-1 min-w-[300px]">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]" :size="18" />
        <input 
          v-model="searchQuery"
          @input="currentPage = 1"
          type="text" 
          placeholder="Cari Kota atau Nama Toko..." 
          class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:border-[#8B0000] outline-none transition-all font-bold shadow-sm"
        />
      </div>

      <div class="relative group">
        <select 
          v-model="statusFilter" 
          @change="currentPage = 1"
          class="appearance-none bg-white px-10 py-3 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#111827] outline-none cursor-pointer focus:border-[#8B0000] shadow-sm"
        >
          <option value="all">Semua Status</option>
          <option value="pending">🟡 Pending</option>
          <option value="approved">🟢 Approved</option>
          <option value="rejected">🔴 Rejected</option>
        </select>
        <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" :size="14" />
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead class="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th @click="sortBy('nameShop')" class="p-5 text-[9px] font-black uppercase text-[#111827] cursor-pointer">Toko & Pemilik</th>
              <th @click="sortBy('city')" class="p-5 text-[9px] font-black uppercase text-gray-400 cursor-pointer">Kota</th>
              <th class="p-5 text-[9px] font-black uppercase text-gray-400 text-center">Status</th>
              <th class="p-5 text-[9px] font-black uppercase text-gray-400 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="reseller in paginatedResellers" :key="reseller.id" class="reseller-row group hover:bg-gray-50 transition-colors">
              <td class="p-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-[#8B0000]/5 flex items-center justify-center text-[#8B0000] font-black border border-[#8B0000]/10">
                    {{ reseller.nameShop.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-black text-[#111827] text-sm uppercase leading-tight">{{ reseller.nameShop }}</p>
                    <p class="text-[10px] text-gray-400 font-bold uppercase">{{ reseller.nameOwner }}</p>
                  </div>
                </div>
              </td>
              <td class="p-5"><span class="text-sm font-bold text-gray-600 uppercase tracking-tighter">{{ reseller.city }}</span></td>
              <td class="p-5 text-center">
                <span :class="getStatusClass(reseller.status)" class="text-[9px] font-black uppercase px-3 py-1 rounded-full border">
                  {{ reseller.status }}
                </span>
              </td>
              <td class="p-5">
                <div class="flex justify-center gap-2">
                  <button @click="openPanel(reseller, 'view')" class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:text-[#111827] transition-all"><Eye :size="16" /></button>
                  <button @click="openPanel(reseller, 'edit')" class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:text-[#8B0000] transition-all"><Edit :size="16" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center mt-auto">
        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Showing {{ paginatedResellers.length }} of {{ filteredAndSortedResellers.length }} Resellers
        </span>
        <div class="flex items-center gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-30"><ChevronLeft :size="16" /></button>
          <div class="flex gap-1">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page" class="w-8 h-8 rounded-lg text-xs font-black transition-all" :class="currentPage === page ? 'bg-[#8B0000] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'">
              {{ page }}
            </button>
          </div>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-30"><ChevronRight :size="16" /></button>
        </div>
      </div>
    </div>



    <div class="side-panel absolute top-[-15%] left-[-100%] h-full w-full max-h-[80vh]  bg-[#FDFBF7] z-[70] invisible opacity-0 translate-x-full flex flex-col border-l-[12px] border-[#8B0000] shadow-2xl">
      <!-- Panel Header -->
      <div class="p-6 bg-[#111827] text-white flex justify-between items-center shadow-lg">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-[#8B0000] rounded-xl shadow-inner"><Users :size="20" /></div>
          <div><h4 class="font-black uppercase tracking-widest text-[11px]">Detail Mitra</h4><p class="text-[9px] text-gray-400 uppercase font-bold">{{ panelMode === 'view' ? 'Pratinjau Data' : 'Mode Editor' }}</p></div>
        </div>
        <button @click="isPanelOpen = false" class="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"><X :size="24" /></button>
      </div>

      <!-- Panel Body -->
      <div class="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
        
        <!-- View Mode -->
        <div v-if="panelMode === 'view' && selectedReseller" class="space-y-8">
           <div class="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
              <div class="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-black text-[#8B0000] border-2 border-[#FBBF24]">
                {{ selectedReseller.nameShop.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-black text-[#111827] uppercase leading-tight">{{ selectedReseller.nameShop }}</h2>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ selectedReseller.nameOwner }}</p>
              </div>
           </div>

           <div class="grid gap-6">
              <div class="space-y-1">
                <label class="text-[9px] font-black text-[#8B0000] uppercase tracking-widest">WhatsApp Aktif</label>
                <div class="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <Phone :size="16" class="text-emerald-500" />
                  <p class="font-bold text-[#111827] text-sm">+{{ selectedReseller.whatsapp }}</p>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-black text-[#8B0000] uppercase tracking-widest">Kota & Alamat</label>
                <div class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <MapPin :size="16" class="text-[#FBBF24] mt-1 shrink-0" />
                  <p class="font-bold text-gray-600 text-sm leading-relaxed uppercase tracking-tight">
                    {{ selectedReseller.city }} <br/>
                    <span class="text-[11px] font-medium normal-case text-gray-400">{{ selectedReseller.address }}</span>
                  </p>
                </div>
              </div>
           </div>

           <!-- Approval Actions -->
           <div v-if="selectedReseller.status === 'pending'" class="pt-6 border-t border-gray-100 flex gap-4">
              <button @click="handleVerify(selectedReseller.id, 'approved')" class="flex-1 bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Setujui</button>
              <button @click="handleVerify(selectedReseller.id, 'rejected')" class="flex-1 bg-red-50 text-red-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-red-100 active:scale-95 transition-all">Tolak</button>
           </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-6">
            <div class="form-item"><label class="text-[9px] font-black text-gray-400 uppercase mb-2 block ml-1">Nama Owner</label><input v-model="editForm.nameOwner" type="text" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000] transition-all" /></div>
            <div class="form-item"><label class="text-[9px] font-black text-gray-400 uppercase mb-2 block ml-1">Nama Toko</label><input v-model="editForm.nameShop" type="text" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000] transition-all" /></div>
            <div class="form-item"><label class="text-[9px] font-black text-gray-400 uppercase mb-2 block ml-1">WhatsApp</label><input v-model="editForm.whatsapp" type="text" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000] transition-all" /></div>
            <div class="form-item"><label class="text-[9px] font-black text-gray-400 uppercase mb-2 block ml-1">Kota</label><input v-model="editForm.city" type="text" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000] transition-all" /></div>
            <div class="form-item"><label class="text-[9px] font-black text-gray-400 uppercase mb-2 block ml-1">Alamat Lengkap</label><textarea v-model="editForm.address" rows="3" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000] transition-all resize-none"></textarea></div>
        </div>

      </div>

      <!-- Footer Action -->
      <div class="p-6 bg-white border-t border-gray-100 flex justify-between gap-4">
        <button v-if="selectedReseller" @click="handleDelete(selectedReseller.id)" class="p-4 text-red-300 hover:text-red-600 transition-colors active:scale-90"><Trash2 :size="20" /></button>
        <div class="flex-1 flex justify-end gap-3">
            <button @click="isPanelOpen = false" class="px-6 py-4 font-black text-[10px] uppercase text-gray-400">Tutup</button>
            <button v-if="panelMode === 'edit'" @click="handleUpdate" :disabled="isSaving" class="bg-[#111827] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                <Loader2 v-if="isSaving" class="animate-spin" :size="16" />
                <Save v-else :size="16" /> Simpan
            </button>
        </div>
      </div>
    </div>
  </div>
</template>