<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { 
  Plus, Search, Edit2, Trash2, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, WifiOff, X, UploadCloud, Eye, Save, Loader2 
} from 'lucide-vue-next';
import gsap from 'gsap';
import api from '@/utils/api';

// --- DATABASE STATE ---
const products = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const hasError = ref(false);

// --- TABLE & SEARCH STATE ---
const searchQuery = ref('');
const sortKey = ref('name');
const sortOrder = ref(1);
const currentPage = ref(1);
const rowsPerPage = ref(5);

// --- SIDE PANEL & FORM STATE ---
const isPanelOpen = ref(false);
const form = ref({
  id: null,
  name: '',
  categoryId: '',
  price: 0,
  resellerPrice: 0,
  description: '',
  status: 'active',
  imagePreviews: [], // Changed to Array
  imageFiles: []     // Changed to Array
});


const removeImage = (index) => {
  form.value.imagePreviews.splice(index, 1);
  form.value.imageFiles.splice(index, 1);
};


// --- API ACTIONS ---
const loadData = async () => {
  isLoading.value = true;
  hasError.value = false;
  try {
    const [prodRes, catRes] = await Promise.all([
      api.get('/products'),
      api.get('/categories')
    ]);
    products.value = prodRes.data.data || [];
    categories.value = catRes.data.data || [];
    
    // Use nextTick to wait for the DOM to render the rows
    await nextTick();
    
    // MAKE SURE THE CLASS MATCHES: .ledger-row (for Products)
    if (document.querySelectorAll('.ledger-row').length > 0) {
      gsap.from(".ledger-row", {
        opacity: 0,
        x: -20,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  } catch (e) { 
    hasError.value = true; 
  } finally { 
    isLoading.value = false; 
  }
};

// --- MULTIPLE IMAGE HELPERS ---
const handleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    // FIX: Fallback to empty array if somehow undefined
    const currentFiles = form.value.imageFiles || [];
    const currentPreviews = form.value.imagePreviews || [];

    form.value.imageFiles = [...currentFiles, ...files];
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    form.value.imagePreviews = [...currentPreviews, ...newPreviews];
  }
};

const openCreatePanel = () => {
  form.value = { id: null, name: '', categoryId: '', price: 0, resellerPrice: 0, description: '', status: 'active', imagePreview: null, imageFile: null };
  isPanelOpen.value = true;
};

const openEditPanel = (product) => {
  form.value = {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    resellerPrice: product.resellerPrice,
    description: product.description || '',
    status: product.status,
    imagePreviews: getImageUrlArray(product.images), // Use the helper
    imageFiles: [] // Fresh start for new uploads
  };
  isPanelOpen.value = true;
};



const handleSubmit = async () => {
  if (!form.value.name || !form.value.categoryId) return alert("Nama dan Kategori wajib diisi");
  
  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('categoryId', form.value.categoryId);
    formData.append('price', form.value.price);
    formData.append('resellerPrice', form.value.resellerPrice);
    formData.append('description', form.value.description);
    formData.append('status', form.value.status);
    
    // Append all files in the array
    form.value.imageFiles.forEach(file => {
      formData.append('images', file); 
    });

    if (form.value.id) {
      await api.put(`/products/${form.value.id}`, formData);
    } else {
      await api.post('/products', formData);
    }
    
    await loadData();
    isPanelOpen.value = false;
  } catch (e) {
    alert("Gagal: " + (e.response?.data?.message || e.message));
  } finally { isSaving.value = false; }
};


const handleDelete = async (id) => {
    if(!confirm("Hapus produk ini secara permanen?")) return;
    try {
        await api.delete(`/products/${id}`);
        await loadData();
    } catch (e) { alert("Gagal menghapus"); }
}

// --- COMPUTED LOGIC ---
const filteredAndSortedProducts = computed(() => {
  const items = products.value || [];
  let result = items.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  return result.sort((a, b) => {
    let modifier = sortOrder.value;
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];
    if(sortKey.value === 'category') { aVal = a.category?.name || ''; bVal = b.category?.name || ''; }
    if (aVal < bVal) return -1 * modifier;
    if (aVal > bVal) return 1 * modifier;
    return 0;
  });
});

const paginatedProducts = computed(() => {
  const items = filteredAndSortedProducts.value || [];
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return items.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedProducts.value.length / rowsPerPage.value));

// --- HELPERS ---
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const getImageUrl = (imageJson) => {
  if (!imageJson) return '/placeholder.png'; // Make sure you have a placeholder in public/
  
  try {
    // If it's already an array (Sequelize sometimes does this)
    let images = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    
    if (Array.isArray(images) && images.length > 0) {
      // Use the VITE_IMAGE_URL from your .env
      return `${import.meta.env.VITE_IMAGE_URL}/${images[0]}`;
    }
    return '/placeholder.png';
  } catch (e) {
    console.error("Image Parse Error", e);
    return '/placeholder.png';
  }
};

const sortBy = (key) => {
  if (sortKey.value === key) { sortOrder.value *= -1; } 
  else { sortKey.value = key; sortOrder.value = 1; }
  currentPage.value = 1;
};

// --- ANIMATIONS ---
watch(isPanelOpen, (val) => {
  if (val) {
    // We use autoAlpha (which handles opacity + visibility)
    gsap.to(".side-panel", { 
      xPercent:  -100, 
      autoAlpha: 1, 
      duration: 0.6, 
      ease: "expo.out" 
    });
    gsap.to(".overlay", { autoAlpha: 1, duration: 0.3 });
  } else {
    gsap.to(".side-panel", { 
      xPercent: 0, 
      autoAlpha: 0, 
      duration: 0.4, 
      ease: "expo.in" 
    });
    gsap.to(".overlay", { autoAlpha: 0, duration: 0.3 });
  }
});

const isCategoryModalOpen = ref(false);
const newCategoryName = ref('');
const isSavingCategory = ref(false);

const handleQuickCreateCategory = async () => {
  if (!newCategoryName.value) return;
  isSavingCategory.value = true;
  try {
    const res = await api.post('/categories', { name: newCategoryName.value });
    // 1. Refresh categories list
    const catRes = await api.get('/categories');
    categories.value = catRes.data.data;
    
    // 2. Automatically select the newly created category for the product
    form.value.categoryId = res.data.data.id;
    
    // 3. Reset and close
    newCategoryName.value = '';
    isCategoryModalOpen.value = false;
  } catch (e) {
    alert(e.response?.data?.message || "Gagal membuat kategori");
  } finally {
    isSavingCategory.value = false;
  }
};

onMounted(loadData);

// --- DELETE MODAL STATE ---
const isDeleteModalOpen = ref(false);
const productToDelete = ref(null);
const isDeleting = ref(false);

// --- MODAL ACTIONS ---
const openDeleteModal = (product) => {
  productToDelete.value = product;
  isDeleteModalOpen.value = true;
  // GSAP animation for the modal popup handled by watch or v-if hook
};

const confirmDelete = async () => {
  if (!productToDelete.value) return;
  isDeleting.value = true;
  try {
    await api.delete(`/products/${productToDelete.value.id}`);
    await loadData(); // Refresh table
    isDeleteModalOpen.value = false;
  } catch (e) {
    alert("Gagal menghapus produk");
  } finally {
    isDeleting.value = false;
    productToDelete.value = null;
  }
};



// --- IMAGE ARRAY HELPER ---
// This turns the Backend string into a list of full URLs
const getImageUrlArray = (imageJson) => {
  if (!imageJson) return [];
  
  try {
    // 1. If it's a string from DB, parse it. If it's already an array, use it.
    let images = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    
    if (!Array.isArray(images)) return [];

    // 2. Map filenames to full URLs
    return images.map(img => {
      if (img.startsWith('blob:') || img.startsWith('http')) return img;
      return `${import.meta.env.VITE_IMAGE_URL}/${img}`;
    });
  } catch (e) {
    console.error("JSON Parse error for images", e);
    return [];
  }
};


// Swiper State for Live Preview
const activePreviewIndex = ref(0);

</script>
<template>
    <div class="space-y-6 max-w-7xl mx-auto px-4 pb-10">
    <!-- ERROR BANNER -->
    <div v-if="hasError" class="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-700">
      <WifiOff :size="24" />
      <div>
        <p class="font-bold">Gagal Menghubungkan ke Server</p>
        <p class="text-xs">PGagal memuat data Products. Pastikan backend sudah aktif dan database terhubung.</p>
      </div>
      <button @click="loadProducts" class="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Coba Lagi</button>
    </div>

      <!-- Responsive Header Area -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-4 bg-[#8B0000]"></div>
            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#8B0000]">Katalog Inventaris</span>
          </div>
          <h3 class="text-3xl sm:text-4xl font-black text-[#111827] tracking-tighter uppercase">Menu <span class="text-[#8B0000]">Produk</span></h3>
        </div>
        <button @click="openCreatePanel" class="w-full sm:w-auto bg-[#8B0000] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95">
          + TAMBAH MENU
        </button>
      </div>

    <!-- Search Area -->
      <div class="relative group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827] group-focus-within:text-[#8B0000] transition-colors" :size="18" />
        <input 
          v-model="searchQuery"
          @input="currentPage = 1"
          type="text" 
          placeholder="Cari menu atau kategori..." 
          class="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#8B0000] outline-none transition-all font-bold shadow-sm"
        />
      </div>

    <!-- The Table -->
     <!-- Responsive Table Container -->
      <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <!-- Horizontal Scroll Wrapper -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead class="bg-gray-50/50 border-b border-gray-100">
              <tr class="select-none">
            <th class="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Preview</th>
            
            <th @click="sortBy('name')" class="p-4 text-[10px] font-black uppercase tracking-widest text-[#111827] cursor-pointer hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-1">
                Nama <ChevronUp v-if="sortKey === 'name' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'name' && sortOrder === -1" :size="12" />
              </div>
            </th>

            <th @click="sortBy('category')" class="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <div class="flex items-center justify-center gap-1">
                Kategori <ChevronUp v-if="sortKey === 'category' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'category' && sortOrder === -1" :size="12" />
              </div>
            </th>

            <th @click="sortBy('price')" class="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right cursor-pointer hover:bg-gray-100 transition-colors">
              <div class="flex items-center justify-end gap-1">
                Umum <ChevronUp v-if="sortKey === 'price' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'price' && sortOrder === -1" :size="12" />
              </div>
            </th>

            <th @click="sortBy('resellerPrice')" class="p-4 text-[10px] font-black uppercase tracking-widest text-[#8B0000] text-right cursor-pointer hover:bg-gray-100 transition-colors">
              <div class="flex items-center justify-end gap-1">
                Reseller <ChevronUp v-if="sortKey === 'resellerPrice' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'resellerPrice' && sortOrder === -1" :size="12" />
              </div>
            </th>

            <th @click="sortBy('status')" class="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <div class="flex items-center justify-center gap-1">
                Status <ChevronUp v-if="sortKey === 'status' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'status' && sortOrder === -1" :size="12" />
              </div>
            </th>

            <th class="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Aksi</th>
          </tr>
        </thead>
        
            <tbody class="divide-y divide-gray-50">
          <!-- SKELETON LOADING -->
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="p-3"><div class="w-14 h-14 bg-gray-100 rounded-lg"></div></td>
                <td class="p-3"><div class="h-4 bg-gray-100 rounded w-24 mb-2"></div><div class="h-2 bg-gray-50 rounded w-12"></div></td>
                <td class="p-3"><div class="h-6 bg-gray-50 rounded w-16 mx-auto"></div></td>
                <td class="p-3"><div class="h-4 bg-gray-50 rounded w-16 ml-auto"></div></td>
                <td class="p-3"><div class="h-4 bg-gray-50 rounded w-16 ml-auto"></div></td>
                <td class="p-3"><div class="h-6 bg-gray-50 rounded-full w-20 mx-auto"></div></td>
                <td class="p-3 text-center"><div class="h-8 bg-gray-50 rounded w-12 mx-auto"></div></td>
            </tr>
          </template>

          <!-- REAL DATA -->
          <template v-else>
            <tr v-for="product in paginatedProducts" :key="product.id" class="ledger-row group hover:bg-gray-50 transition-colors">
                <td class="p-3">
                <div class="w-14 h-14 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <img 
                      v-if="getImageUrl(product.images)" 
                      :src="getImageUrl(product.images)" 
                      class="w-full h-full object-cover" 
                    />
                </div>
                </td>
                <td class="p-3">
                <p class="font-black text-[#111827] leading-tight uppercase">{{ product.name }}</p>
                <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">ID: #0{{ product.id }}</p>
                </td>
                <td class="p-3 text-center">
                <span class="text-[10px] font-black text-[#C5A059] uppercase border border-[#C5A059]/30 px-2 py-0.5 rounded">
                    {{ product.category?.name || 'Uncategorized' }}
                </span>
                </td>
                <td class="p-3 text-right font-bold text-gray-400 text-sm">{{ formatCurrency(product.price) }}</td>
                <td class="p-3 text-right"><span class="text-sm font-black text-[#8B0000]">{{ formatCurrency(product.resellerPrice) }}</span></td>
                <td class="p-3 text-center">
                <div class="inline-flex items-center px-3 py-1 rounded-full border text-[9px] font-black uppercase transition-all" :class="product.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500'">
                    <div :class="product.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-400'" class="w-1.5 h-1.5 rounded-full mr-2"></div>
                    {{ product.status }}
                </div>
                </td>
                <td class="p-3 text-center">
                <div class="flex justify-center gap-2">
                    <!-- EDIT BUTTON -->
                    <button 
                      @click="openEditPanel(product)" 
                      class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:text-[#111827] hover:bg-white hover:shadow-md transition-all active:scale-90"
                    >
                      <Edit2 :size="14" />
                    </button>
                    
                      <!-- TRASH BUTTON -->
                      <button 
                        @click="openDeleteModal(product)" 
                        class="p-2 bg-red-50 text-red-300 rounded-lg hover:text-[#8B0000] hover:bg-white hover:shadow-md transition-all active:scale-90"
                      >
                        <Trash2 :size="14" />
                      </button>
                </div>
                </td>
            </tr>
          </template>
        </tbody>
      </table>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && paginatedProducts.length === 0" class="p-20 text-center text-gray-300 italic text-sm">
        Belum ada produk terdaftar...
      </div>

        <!-- Pagination Footer -->
        <div class="bg-gray-50/50 border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Showing {{ paginatedProducts.length }} of {{ filteredAndSortedProducts.length }} Products
          </span>
        <div class="flex items-center gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
            <ChevronLeft :size="16" />
          </button>
          <div class="flex gap-1">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page" class="w-8 h-8 rounded-lg text-xs font-black transition-all" :class="currentPage === page ? 'bg-[#8B0000] text-white shadow-lg shadow-[#8B0000]/20' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'">
              {{ page }}
            </button>
          </div>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- --- SIDE PANEL EDITOR --- -->
    <div class="overlay fixed inset-0 bg-black/40 z-[60] hidden opacity-0" @click="isPanelOpen = false"></div>
    
    <div class="side-panel fixed top-0 right-0 h-full w-full lg:max-w-[900px] bg-[#FAF7F0] z-[70] invisible opacity-0 translate-x-full flex flex-col border-l-[12px] border-[#8B0000] shadow-2xl">
      <div class="p-6 bg-[#111827] text-white flex justify-between items-center shadow-lg">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-[#8B0000] rounded-xl"><Plus :size="20" /></div>
          <div><h4 class="font-black uppercase tracking-widest text-xs">Manajer Inventaris</h4><p class="text-[9px] text-gray-400 uppercase font-bold">Lengkapi Data Produk</p></div>
        </div>
        <button @click="isPanelOpen = false" class="p-2 hover:bg-white/10 rounded-full"><X :size="24" /></button>
      </div>

      <div class="flex-1 overflow-y-auto flex flex-col md:flex-row">
        <!-- FORM -->
        <div class="flex-1 p-8 space-y-6 bg-white overflow-y-auto">
        <div>
          <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Galeri Foto Produk</label>
          
          <div class="grid grid-cols-3 gap-3">
            <!-- List of Previews -->
            <div v-for="(img, idx) in form.imagePreviews" :key="idx" class="relative group h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img :src="img" class="w-full h-full object-cover" />
              <button @click="removeImage(idx)" class="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X :size="12" />
              </button>
            </div>

            <!-- The Add Button -->
            <label class="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#8B0000] transition-colors">
              <input type="file" class="hidden" multiple @change="handleFileUpload" accept="image/*" />
              <Plus class="text-gray-300" :size="20" />
              <span class="text-[8px] font-black mt-1 text-gray-400 uppercase">Tambah</span>
            </label>
          </div>
        </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nama Dimsum</label>
              <input v-model="form.name" type="text" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:border-[#8B0000] outline-none" />
            </div>
            <div class="form-item">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Kategori Produk</label>
              <div class="flex gap-2">
                <select v-model="form.categoryId" class="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:border-[#8B0000] outline-none">
                  <option value="" disabled>Pilih Kategori...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                
                <!-- QUICK ADD BUTTON -->
                <button 
                  type="button"
                  @click="isCategoryModalOpen = true" 
                  class="p-4 bg-[#111827] text-white rounded-2xl hover:bg-[#8B0000] transition-colors shadow-lg"
                  title="Tambah Kategori Baru"
                >
                  <Plus :size="20" />
                </button>
              </div>
            </div>
            <div>
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Status Visibilitas</label>
              <select v-model="form.status" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm focus:border-[#8B0000] outline-none">
                <option value="active">AKTIF</option>
                <option value="inactive">NON-AKTIF</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Harga Jual (IDR)</label><input v-model="form.price" type="number" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm" /></div>
            <div><label class="text-[9px] font-black text-[#8B0000] uppercase tracking-widest mb-2 block ml-1">Harga Reseller</label><input v-model="form.resellerPrice" type="number" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm" /></div>
          </div>

          <div>
            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Deskripsi & Bahan</label>
            <textarea v-model="form.description" rows="3" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000]"></textarea>
          </div>
        </div>

        <!-- PREVIEW -->
        <div class="hidden lg:flex w-[350px] bg-[#F3F0E9] p-8 flex-col items-center">
          <div class="flex items-center gap-2 mb-8 text-[#C5A059]"><Eye :size="14" /><span class="text-[9px] font-black uppercase tracking-[0.3em]">Live View</span></div>
          <!-- The Animated Card -->
          <div class="w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 transform rotate-1 group transition-all">
          <div class="h-44 bg-gray-100 relative overflow-hidden">
            <!-- Images Wrapper -->
            <div class="flex transition-transform duration-500 h-full" :style="{ transform: `translateX(-${activePreviewIndex * 100}%)` }">
                <div v-for="(img, idx) in form.imagePreviews" :key="idx" class="min-w-full h-full">
                  <img :src="img" class="w-full h-full object-cover" />
                </div>
                <!-- Fallback if empty -->
                <div v-if="form.imagePreviews.length === 0" class="min-w-full h-full flex items-center justify-center text-gray-200 font-black text-4xl">?</div>
            </div>

            <!-- Navigation Dots -->
            <div v-if="form.imagePreviews.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full">
                <button 
                  v-for="(dot, idx) in form.imagePreviews" 
                  :key="idx" 
                  @click="activePreviewIndex = idx"
                  class="w-1.5 h-1.5 rounded-full transition-all"
                  :class="activePreviewIndex === idx ? 'bg-white scale-125' : 'bg-white/40'"
                ></button>
            </div>
            
            <div class="absolute top-4 right-4 bg-[#8B0000] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-lg">Authentic</div>
          </div>
            <div class="p-6">
               <p class="text-[8px] font-black text-[#C5A059] uppercase tracking-widest mb-1">{{ categories.find(c => c.id === form.categoryId)?.name || 'KATEGORI' }}</p>
               <h5 class="text-md font-black text-[#111827] uppercase leading-tight mb-4 min-h-[40px]">{{ form.name || 'Nama Produk...' }}</h5>
               <div class="flex justify-between items-end border-t border-dashed border-gray-200 pt-4">
                  <div><p class="text-[7px] font-bold text-gray-400 uppercase">Harga Satuan</p><p class="text-lg font-black text-[#8B0000]">{{ formatCurrency(form.price) }}</p></div>
                  <div class="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center text-white"><Plus :size="18" /></div>
               </div>
            </div>
          </div>
          <p class="mt-8 text-[9px] text-center text-gray-400 font-bold uppercase leading-relaxed px-4 italic opacity-50">Produk yang di-edit akan diperbarui secara real-time di katalog digital.</p>
        </div>
      </div>

      <div class="p-6 bg-white border-t border-gray-100 flex justify-end gap-4">
        <button @click="isPanelOpen = false" class="px-6 py-4 font-black text-[10px] uppercase text-gray-400 hover:text-[#111827]">Batal</button>
        <button @click="handleSubmit" :disabled="isSaving" class="bg-[#8B0000] text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 disabled:opacity-50">
          <Loader2 v-if="isSaving" class="animate-spin" :size="18" />
          <Save v-else :size="18" /> {{ isSaving ? 'PROSES...' : 'PUBLIKASIKAN' }}
        </button>
      </div>
    </div>
      <!-- QUICK CATEGORY MODAL -->
<div v-if="isCategoryModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
  <!-- Backdrop -->
  
  <!-- Modal Card -->
  <div class="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[10px] border-[#8B0000]">
    <div class="p-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-gray-100 rounded-lg text-[#8B0000]"><Plus :size="18" /></div>
        <h4 class="font-black uppercase tracking-widest text-sm text-[#111827]">Tambah Kategori</h4>
      </div>
      
      <div class="space-y-4">
        <p class="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">Masukkan nama kategori baru (contoh: Frozen Food, Seasonal, Hampers).</p>
        <input 
          v-model="newCategoryName" 
          type="text" 
          placeholder="Nama Kategori..." 
          class="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:border-[#8B0000]"
          @keyup.enter="handleQuickCreateCategory"
        />
      </div>
      
      <div class="flex gap-3 mt-8">
        <button @click="isCategoryModalOpen = false" class="flex-1 py-4 font-black text-[10px] uppercase text-gray-400">Batal</button>
        <button 
          @click="handleQuickCreateCategory" 
          :disabled="isSavingCategory"
          class="flex-[2] bg-[#8B0000] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="isSavingCategory" class="animate-spin" :size="14" />
          SIMPAN KATEGORI
        </button>
      </div>
    </div>
  </div>
</div>
<!-- DELETE CONFIRMATION MODAL -->
<div v-if="isDeleteModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-6">
  <!-- Backdrop -->
  
  <!-- Modal Card -->
  <div class="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border-b-[12px] border-red-600">
    <div class="p-10 text-center">
      <!-- Warning Icon -->
      <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Trash2 :size="40" class="text-red-600" />
      </div>
      
      <h4 class="font-black uppercase tracking-tighter text-2xl text-[#111827] mb-2">Hapus Produk?</h4>
      <p class="text-xs font-bold text-gray-400 uppercase leading-relaxed px-4">
        Anda akan menghapus <span class="text-red-600">"{{ productToDelete?.name }}"</span> secara permanen dari sistem.
      </p>

      <div class="flex flex-col gap-3 mt-10">
        <button 
          @click="confirmDelete" 
          :disabled="isDeleting"
          class="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isDeleting" class="animate-spin" :size="16" />
          YA, HAPUS SEKARANG
        </button>
        
        <button 
          @click="isDeleteModalOpen = false" 
          class="w-full py-4 font-black text-[10px] uppercase text-gray-400 hover:text-[#111827] tracking-widest transition-colors"
        >
          Batalkan Tindakan
        </button>
      </div>
    </div>
  </div>
</div>
  </div>
</template>