<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { 
  Plus, Search, Edit2, Trash2, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, WifiOff, X, UploadCloud, Eye, Save, Loader2, 
  Sparkles
} from 'lucide-vue-next';
import gsap from 'gsap';
import api from '@/utils/api';
import { showToast } from '@/utils/eventBus';



// --- 1. ALL STATE DECLARATIONS (REFS) MUST BE AT THE TOP ---
const products = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const hasError = ref(false);

const searchQuery = ref('');
const sortKey = ref('name');
const sortOrder = ref(1);
const currentPage = ref(1);
const rowsPerPage = ref(5);

const isPanelOpen = ref(false);
const form = ref({
  id: null,
  name: '',
  categoryId: '',
  price: 0,
  resellerPrice: 0,
  description: '',
  status: 'active',
  imagePreviews: [], 
  imageFiles: []    
});

const isCategoryModalOpen = ref(false); // <--- DEFINED HERE
const newCategoryName = ref('');
const isSavingCategory = ref(false);

const isDeleteModalOpen = ref(false);
const productToDelete = ref(null);
const isDeleting = ref(false);

const activePreviewIndex = ref(0);

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
  if (!files.length) return;

  // Force initialize if somehow undefined
  if (!form.value.imagePreviews) form.value.imagePreviews = [];
  if (!form.value.imageFiles) form.value.imageFiles = [];

  files.forEach(file => {
    // 1. Add actual file for Backend upload
    form.value.imageFiles.push(file);
    
    // 2. Create local URL for the "Live Preview"
    const url = URL.createObjectURL(file);
    form.value.imagePreviews.push(url);
  });

  // 3. Set the preview swiper to show the newly added image
  activePreviewIndex.value = form.value.imagePreviews.length - 1;
  
};

const openCreatePanel = () => {
  form.value = { 
    id: null, 
    name: '', 
    categoryId: '', 
    price: 0, 
    resellerPrice: 0, 
    description: '', 
    status: 'active', 
    imagePreviews: [], // MUST be array
    imageFiles: []     // MUST be array
  };
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
    imagePreviews: getImageUrlArray(product.images), // Helper ensures array
    imageFiles: [] 
  };
  isPanelOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name || !form.value.categoryId) return alert("Nama dan Kategori wajib diisi");
  
  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('categoryId', Number(form.value.categoryId)); // Force Number
    formData.append('price', Number(form.value.price));           // Force Number
    formData.append('resellerPrice', Number(form.value.resellerPrice)); // Force Number
    formData.append('description', form.value.description || '');
    formData.append('status', form.value.status);
    
    // --- THE FIX: TELL BACKEND WHICH IMAGES TO KEEP ---
    // Filter out 'blob:' URLs (those are new files)
    // Keep only the filenames from the existing URLs (those are old files)
    const existingToKeep = form.value.imagePreviews
      .filter(url => !url.startsWith('blob:')) 
      .map(url => url.split('/').pop()); // Gets just "123.jpg" from "http://.../123.jpg"
    
    formData.append('existingImages', JSON.stringify(existingToKeep));

    // Append NEW files
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
    showToast("Produk berhasil disimpan!");
  } catch (e) {
    // This will now show the SPECIFIC Joi error instead of a generic 500
    alert("Gagal: " + (e.response?.data?.message || e.message));
  } finally { isSaving.value = false; }
};

// --- DELETE FIX ---
const handleDelete = async (id) => {
    if(!confirm("Hapus produk ini?")) return;
    try {
        // Backend URL must be: /api/v1/products/:id
        await api.delete(`/products/${id}`); 
        showToast('Produk dihapus');
        await loadData();
    } catch (e) { 
        showToast('Gagal menghapus', 'error'); 
    }
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



// 1. Product Editor Panel

watch(isPanelOpen, async (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    await nextTick();
    gsap.fromTo(".teleport-overlay", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    gsap.fromTo(".teleport-panel", 
      { xPercent: 100, autoAlpha: 0 }, 
      { xPercent: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }
    );
  } else {
    document.body.style.overflow = '';
    gsap.to(".teleport-panel", { xPercent: 100, autoAlpha: 0, duration: 0.4, ease: "expo.in" });
    gsap.to(".teleport-overlay", { autoAlpha: 0, duration: 0.3, delay: 0.1 });
  }
});

// 2. Quick Category Modal
watch(isCategoryModalOpen, async (val) => {
  if (val) {
    await nextTick();
    gsap.fromTo(".category-overlay", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    gsap.fromTo(".category-panel", 
      { y: 30, autoAlpha: 0, scale: 0.95 }, 
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
  }
});

// 3. Delete Confirmation Modal
watch(isDeleteModalOpen, async (val) => {
  if (val) {
    await nextTick();
    gsap.fromTo(".delete-overlay", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    gsap.fromTo(".delete-panel", 
      { scale: 0.9, autoAlpha: 0 }, 
      { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
  }
});


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


// --- MODAL ACTIONS ---
const openDeleteModal = (product) => {
  productToDelete.value = product;
  isDeleteModalOpen.value = true;
  // GSAP animation for the modal popup handled by watch or v-if hook
};

// --- THUMBNAIL LOGIC ---
// --- THUMBNAIL LOGIC ---
const setAsThumbnail = (index) => {
  if (index === 0) return;

  // 1. Move the Preview (UI)
  const targetPreview = form.value.imagePreviews.splice(index, 1)[0];
  form.value.imagePreviews.unshift(targetPreview);

  // 2. Move the File (Data)
  // If editing, imageFiles might be shorter than imagePreviews (existing vs new)
  // This logic ensures they stay in sync if a new file is being moved
  if (form.value.imageFiles && form.value.imageFiles.length > 0) {
      const targetFile = form.value.imageFiles.splice(index, 1)[0];
      form.value.imageFiles.unshift(targetFile);
  }

  activePreviewIndex.value = 0;
  showToast('Sampul diperbarui');
};



// --- DELETE LOGIC FIX ---
const confirmDelete = async () => {
  if (!productToDelete.value) return;
  isDeleting.value = true;
  try {
    // Ensure the route matches your backend precisely: /v1/products/:id
    await api.delete(`/products/${productToDelete.value.id}`);
    showToast('Produk berhasil dihapus');
    isDeleteModalOpen.value = false;
    await loadData(); // Refresh the table
  } catch (e) {
    showToast('Gagal menghapus produk', 'error');
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
    // If Sequelize sends a string, parse it. If it's already an array, use it.
    const images = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    
    return images.map(img => {
      if (img.startsWith('blob:')) return img;
      // Change '3000' to your actual backend port!
      return `http://localhost:3000/uploads/${img}`; 
    });
  } catch (e) {
    return [];
  }
};


/// CATEGORY

// --- CATEGORY MANAGER STATE ---
const isCategoryManagerOpen = ref(false); // We'll rename the old modal
const editingCategory = ref(null); // Track if we are editing or creating
const categoryFormName = ref('');
const isProcessingCategory = ref(false);

// --- CATEGORY DELETE CONFIRMATION ---
const isDeleteCategoryConfirmOpen = ref(false);
const categoryIdToDelete = ref(null);
const isDeletingCategory = ref(false);



// Open Manager
const openCategoryManager = () => {
  editingCategory.value = null;
  categoryFormName.value = '';
  isCategoryManagerOpen.value = true;
};

// Start Editing
const editCategory = (cat) => {
  editingCategory.value = cat;
  categoryFormName.value = cat.name;
};

// Cancel Editing
const cancelCategoryEdit = () => {
  editingCategory.value = null;
  categoryFormName.value = '';
};

// Save (Create or Update)
const saveCategory = async () => {
  if (!categoryFormName.value) return;
  isProcessingCategory.value = true;
  try {
    if (editingCategory.value) {
      // UPDATE
      await api.put(`/categories/${editingCategory.value.id}`, { name: categoryFormName.value });
      showToast('Kategori diperbarui');
    } else {
      // CREATE
      await api.post('/categories', { name: categoryFormName.value });
      showToast('Kategori dibuat');
    }
    
    // Refresh list
    const res = await api.get('/categories');
    categories.value = res.data.data;
    
    cancelCategoryEdit();
  } catch (e) {
    alert(e.response?.data?.message || "Gagal menyimpan kategori");
  } finally {
    isProcessingCategory.value = false;
  }
};

// Delete Category
const deleteCategory = (id) => {
  categoryIdToDelete.value = id;
  isDeleteCategoryConfirmOpen.value = true;
};



// The actual API call
const confirmDeleteCategory = async () => {
  if (!categoryIdToDelete.value) return;
  isDeletingCategory.value = true;
  try {
    await api.delete(`/categories/${categoryIdToDelete.value}`);
    showToast('Kategori dihapus');
    
    // Refresh categories list
    const res = await api.get('/categories');
    categories.value = res.data.data;
    
    isDeleteCategoryConfirmOpen.value = false;
  } catch (e) {
    alert("Gagal menghapus: Kategori mungkin masih digunakan.");
  } finally {
    isDeletingCategory.value = false;
    categoryIdToDelete.value = null;
  }
};

</script>
<template>
  <div class="min-h-screen overflow-visible space-y-6 max-w-7xl mx-auto pb-10 px-4 sm:px-8">
    
    <!-- ERROR BANNER -->
    <div v-if="hasError" class="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-700">
      <WifiOff :size="24" class="shrink-0" />
      <div>
        <p class="font-bold text-sm lg:text-base">Gagal Menghubungkan ke Server</p>
        <p class="text-[10px] lg:text-xs">Gagal memuat data Products. Pastikan backend aktif.</p>
      </div>
      <button @click="loadData" class="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest shrink-0">Coba Lagi</button>
    </div>

    <!-- Responsive Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-2 border-[#111827]/10 pb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-4 bg-[#8B0000]"></div>
          <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#8B0000]">Katalog Inventaris</span>
        </div>
        <h3 class="text-3xl sm:text-4xl font-black text-[#111827] tracking-tighter uppercase leading-none">Menu <span class="text-[#8B0000]">Produk</span></h3>
      </div>
      <button @click="openCreatePanel" class="w-full sm:w-auto bg-[#111827] text-white px-6 py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg hover:bg-[#8B0000] transition-colors flex items-center justify-center gap-2">
         <Plus :size="16" /> Tambah Menu
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
        class="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-gray-200 rounded-xl sm:rounded-2xl focus:border-[#8B0000] outline-none transition-all font-bold text-xs sm:text-sm shadow-sm"
      />
    </div>

    <!-- The Table Container -->
    <div class="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[400px] sm:min-h-[500px]">
      <div class="overflow-x-auto w-full custom-scrollbar">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead class="bg-gray-50/50 border-b border-gray-100">
            <tr class="select-none">
              <th class="p-4 sm:p-5 text-[9px] font-black uppercase tracking-widest text-gray-400">Preview</th>
              <th @click="sortBy('name')" class="p-4 sm:p-5 text-[9px] font-black uppercase tracking-widest text-[#111827] cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex items-center gap-1">
                  Nama <ChevronUp v-if="sortKey === 'name' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'name' && sortOrder === -1" :size="12" />
                </div>
              </th>
              <th @click="sortBy('category')" class="p-4 sm:p-5 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-center gap-1">
                  Kategori <ChevronUp v-if="sortKey === 'category' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'category' && sortOrder === -1" :size="12" />
                </div>
              </th>
              <th @click="sortBy('price')" class="p-4 sm:p-5 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-end gap-1">
                  Umum <ChevronUp v-if="sortKey === 'price' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'price' && sortOrder === -1" :size="12" />
                </div>
              </th>
              <th @click="sortBy('resellerPrice')" class="p-4 sm:p-5 text-[9px] font-black uppercase tracking-widest text-[#8B0000] text-right cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-end gap-1">
                  Reseller <ChevronUp v-if="sortKey === 'resellerPrice' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'resellerPrice' && sortOrder === -1" :size="12" />
                </div>
              </th>
              <th @click="sortBy('status')" class="p-4 sm:p-5 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-center gap-1">
                  Status <ChevronUp v-if="sortKey === 'status' && sortOrder === 1" :size="12" /><ChevronDown v-if="sortKey === 'status' && sortOrder === -1" :size="12" />
                </div>
              </th>
              <th class="p-4 sm:p-5 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Aksi</th>
            </tr>
          </thead>
          
          <tbody class="divide-y divide-gray-50">
            <!-- SKELETON LOADING -->
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                  <td class="p-4 sm:p-5"><div class="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg"></div></td>
                  <td class="p-4 sm:p-5"><div class="h-4 bg-gray-100 rounded w-24 mb-2"></div><div class="h-2 bg-gray-50 rounded w-12"></div></td>
                  <td class="p-4 sm:p-5"><div class="h-6 bg-gray-50 rounded w-16 mx-auto"></div></td>
                  <td class="p-4 sm:p-5"><div class="h-4 bg-gray-50 rounded w-16 ml-auto"></div></td>
                  <td class="p-4 sm:p-5"><div class="h-4 bg-gray-50 rounded w-16 ml-auto"></div></td>
                  <td class="p-4 sm:p-5"><div class="h-6 bg-gray-50 rounded-full w-20 mx-auto"></div></td>
                  <td class="p-4 sm:p-5 text-center"><div class="h-8 bg-gray-50 rounded w-16 mx-auto"></div></td>
              </tr>
            </template>

            <!-- REAL DATA -->
            <template v-else>
              <tr v-for="product in paginatedProducts" :key="product.id" class="ledger-row group hover:bg-gray-50 transition-colors">
                  <td class="p-4 sm:p-5">
                  <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                      <img v-if="getImageUrlArray(product.images)[0]" :src="getImageUrlArray(product.images)[0]" crossorigin="anonymous" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><UploadCloud :size="16"/></div>
                  </div>
                  </td>
                  <td class="p-4 sm:p-5">
                  <p class="font-black text-[#111827] text-xs sm:text-sm leading-tight uppercase line-clamp-1">{{ product.name }}</p>
                  <p class="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: #0{{ product.id }}</p>
                  </td>
                  <td class="p-4 sm:p-5 text-center">
                  <span class="text-[9px] sm:text-[10px] font-black text-[#C5A059] uppercase border border-[#C5A059]/30 px-2 py-0.5 rounded whitespace-nowrap">
                      {{ product.category?.name || 'Uncategorized' }}
                  </span>
                  </td>
                  <td class="p-4 sm:p-5 text-right font-bold text-gray-400 text-xs sm:text-sm whitespace-nowrap">{{ formatCurrency(product.price) }}</td>
                  <td class="p-4 sm:p-5 text-right"><span class="text-xs sm:text-sm font-black text-[#8B0000] whitespace-nowrap">{{ formatCurrency(product.resellerPrice) }}</span></td>
                  <td class="p-4 sm:p-5 text-center">
                  <div class="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border text-[8px] sm:text-[9px] font-black uppercase transition-all whitespace-nowrap" :class="product.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500'">
                      <div :class="product.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-400'" class="w-1.5 h-1.5 rounded-full mr-1 sm:mr-2"></div>
                      {{ product.status }}
                  </div>
                  </td>
                  <td class="p-4 sm:p-5 text-center">
                  <div class="flex justify-center gap-2">
                      <button @click="openEditPanel(product)" class="p-2 bg-gray-100 text-gray-400 rounded-lg hover:text-[#111827] hover:bg-white hover:shadow-md transition-all active:scale-90"><Edit2 :size="14" class="sm:w-4 sm:h-4" /></button>
                      <button @click="openDeleteModal(product)" class="p-2 bg-red-50 text-red-300 rounded-lg hover:text-[#8B0000] hover:bg-white hover:shadow-md transition-all active:scale-90"><Trash2 :size="14" class="sm:w-4 sm:h-4" /></button>
                  </div>
                  </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && paginatedProducts.length === 0" class="py-20 text-center text-gray-300 italic text-xs sm:text-sm">
        Belum ada produk terdaftar...
      </div>

      <!-- Pagination Footer -->
      <div class="bg-gray-50 border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
        <span class="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Showing {{ paginatedProducts.length }} of {{ filteredAndSortedProducts.length }} Products
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
    
    <!-- === TELEPORTED SIDE PANEL EDITOR === -->
   <teleport to="body">
      <div v-show="isPanelOpen" class="fixed inset-0 z-[9998] pointer-events-none">
        
        <!-- OVERLAY -->
        <div @click="isPanelOpen = false" class="teleport-overlay absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"></div>
        
        <!-- PANEL (Responsive: w-full on mobile, 900px on desktop) -->
        <div class="teleport-panel absolute top-0 right-0 h-full w-full lg:w-[900px] bg-[#FAF7F0] z-[9999] flex flex-col border-l-0 lg:border-l-[12px] border-[#8B0000] shadow-2xl pointer-events-auto">
          
          <!-- Panel Header -->
          <div class="p-4 sm:p-6 bg-[#111827] text-white flex justify-between items-center shadow-lg shrink-0">
            <div class="flex items-center gap-3 sm:gap-4">
              <div class="p-2 sm:p-3 bg-[#8B0000] rounded-xl shadow-inner"><Plus :size="16" class="sm:w-5 sm:h-5" /></div>
              <div><h4 class="font-black uppercase tracking-widest text-[10px] sm:text-[11px]">Manajer Inventaris</h4><p class="text-[8px] sm:text-[9px] text-gray-400 uppercase font-bold">Lengkapi Data Produk</p></div>
            </div>
            <button @click="isPanelOpen = false" class="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"><X :size="20" class="sm:w-6 sm:h-6" /></button>
          </div>

          <div class="flex-1 overflow-y-auto flex flex-col lg:flex-row">
            <!-- FORM (Left side) -->
            <div class="flex-1 p-6 sm:p-8 space-y-6 bg-white overflow-y-auto">

              <div>
                <label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Galeri Foto Produk</label>

                <div class="grid grid-cols-3 gap-3">
                  <!-- List of Previews -->
                  <div 
                    v-for="(img, idx) in form.imagePreviews" 
                    :key="idx" 
                    class="relative group h-24 rounded-2xl overflow-hidden border-2 transition-all shadow-sm"
                    :class="idx === 0 ? 'border-[#8B0000] ring-2 ring-[#8B0000]/10' : 'border-gray-100'"
                  >
                  <img 
                    :src="img" 
                    crossorigin="anonymous" 
                    class="w-full h-full object-cover" 
                    @error="(e) => e.target.src = '/src/assets/images/LogoDamelDimsum.png'"
                  />
                    <!-- Overlay Actions -->
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <!-- SET AS THUMBNAIL BUTTON -->
                      <button 
                        v-if="idx !== 0"
                        type="button"
                        @click="setAsThumbnail(idx)" 
                        class="p-1.5 bg-[#FBBF24] text-[#8B0000] rounded-lg hover:scale-110 transition-transform"
                        title="Jadikan Sampul"
                      >
                        <Star :size="14" fill="currentColor" />
                      </button>

                      <!-- REMOVE BUTTON -->
                      <button 
                        type="button"
                        @click="removeImage(idx)" 
                        class="p-1.5 bg-red-600 text-white rounded-lg hover:scale-110 transition-transform"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>

                    <!-- Thumbnail Badge -->
                    <div v-if="idx === 0" class="absolute top-0 left-0 bg-[#8B0000] text-white text-[7px] font-black px-2 py-1 rounded-br-lg uppercase tracking-tighter">
                      SAMPUL
                    </div>
                  </div>

                  <!-- The Add Button -->
                  <label class="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#8B0000] hover:bg-white transition-all group">
                    <input type="file" class="hidden" multiple @change="handleFileUpload" accept="image/*" />
                    <Plus class="text-gray-300 group-hover:text-[#8B0000] transition-colors" :size="20" />
                    <span class="text-[7px] font-black mt-1 text-gray-400 uppercase">Tambah</span>
                  </label>
                </div>
              </div>


              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Nama Dimsum</label>
                  <input v-model="form.name" type="text" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all" />
                </div>
                <div>
                  <label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Kategori Produk</label>
                  <div class="flex gap-2">
                    <select v-model="form.categoryId" class="flex-1 p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all">
                      <option value="" disabled>Pilih Kategori...</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                    <button type="button" @click="openCategoryManager" class="p-3 sm:p-4 bg-[#111827] text-white rounded-xl sm:rounded-2xl hover:bg-[#8B0000] transition-colors shadow-lg active:scale-95">
                      <Plus :size="16" class="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Status Visibilitas</label>
                  <select v-model="form.status" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all">
                    <option value="active">AKTIF</option>
                    <option value="inactive">NON-AKTIF</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div><label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Harga Jual (IDR)</label><input v-model="form.price" type="number" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all" /></div>
                <div><label class="text-[8px] sm:text-[9px] font-black text-[#8B0000] uppercase tracking-widest mb-1 block ml-1">Harga Reseller</label><input v-model="form.resellerPrice" type="number" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm focus:bg-white focus:border-[#8B0000] outline-none transition-all" /></div>
              </div>

              <div>
                <label class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Deskripsi & Bahan</label>
                <textarea v-model="form.description" rows="4" class="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all resize-none"></textarea>
              </div>
            </div>


            <!-- PREVIEW SECTION (Hidden on mobile for better UX) -->
            <div class="hidden lg:flex w-[380px] bg-[#FDFBF7] p-8 flex-col items-center border-l border-gray-100 shrink-0">
              <div class="flex items-center gap-2 mb-10"><Eye :size="14" class="text-[#8B0000]" /><span class="text-[9px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Live Preview</span></div>
              
              <!-- EXACT REPLICA OF PUBLIC MENU CARD -->
              <div class=" mt-28 w-full relative bg-[#9b1c1c] rounded-[2.5rem] p-8 pt-20 text-center shadow-2xl border border-[#8B0000] flex flex-col">
                <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none mix-blend-multiply"></div>
                
                <div class="absolute -top-28 left-1/2 -translate-x-1/2 w-48 h-48 z-20">
                   <div class="relative w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
                      <!-- Swiper Logic inside the preview -->
                      <img v-if="form.imagePreviews.length > 0" :src="form.imagePreviews[activePreviewIndex]" crossorigin="anonymous" class="w-full h-full object-contain" />
                      <div v-else class="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner"><Sparkles class="text-gray-300" :size="32" /></div>
                      
                      <!-- Dots if multiple images -->
                      <div v-if="form.imagePreviews.length > 1" class="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                         <button v-for="(_, i) in form.imagePreviews" :key="i" @click="activePreviewIndex = i" class="w-1.5 h-1.5 rounded-full transition-all" :class="activePreviewIndex === i ? 'bg-white w-3' : 'bg-white/40'"></button>
                      </div>
                   </div>
                </div>

                <div class="relative z-10 flex flex-col h-full items-center mt-4">
                  <h4 class="font-black text-[#FBBF24] text-lg uppercase leading-tight mb-3 line-clamp-2">{{ form.name || 'Nama Produk' }}</h4>
                  <p class="text-[10px] text-white/80 font-medium leading-relaxed line-clamp-3 mb-8 flex-1 italic">
                    {{ form.description || 'Deskripsi singkat produk akan muncul di sini.' }}
                  </p>
                  <div class="mt-auto w-full space-y-4">
                     <div class="font-black text-white text-2xl text-left pl-2">
                        <span class="text-xs mr-1 opacity-80">Rp</span>{{ form.price ? formatCurrency(form.price).replace('Rp', '').trim() : '0' }}
                     </div>
                     <button class="w-full py-3 bg-[#c82828] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner pointer-events-none opacity-80">
                       Tambah <Plus :size="14" />
                     </button>
                  </div>
                </div>
              </div>
              <p class="mt-10 text-[9px] text-center text-gray-400 font-bold uppercase leading-relaxed px-4 italic">Tampilan simulasi di katalog publik.</p>
            </div>
          </div>

          <!-- Footer Action -->
 <div class="p-4 sm:p-6 bg-white border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 shrink-0">
            <button @click="isPanelOpen = false" class="px-6 py-3 font-black text-[10px] uppercase text-gray-400 hover:text-[#111827]">Batal</button>
            <button @click="handleSubmit" :disabled="isSaving" class="bg-[#111827] text-white px-8 sm:px-12 py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
              <Loader2 v-if="isSaving" class="animate-spin" :size="14" />
              <Save v-else :size="14" /> PUBLIKASIKAN MENU
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- === BEAUTIFUL CATEGORY DELETE CONFIRMATION === -->
    <teleport to="body">
      <div v-show="isDeleteCategoryConfirmOpen" class="fixed inset-0 z-[11000] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div @click="isDeleteCategoryConfirmOpen = false" class="absolute inset-0 bg-[#111827]/90 backdrop-blur-md transition-opacity"></div>
        
        <!-- Modal -->
        <div class="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border-t-[12px] border-red-600">
          <div class="p-10 text-center">
            <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 :size="40" class="text-red-600" />
            </div>
            
            <h4 class="font-black uppercase tracking-tighter text-2xl text-[#111827] mb-2">Hapus Kategori?</h4>
            <p class="text-xs font-bold text-gray-400 uppercase leading-relaxed px-4">
              Produk dengan kategori ini akan kehilangan label kategorinya secara permanen.
            </p>

            <div class="flex flex-col gap-3 mt-10">
              <button 
                @click="confirmDeleteCategory" 
                :disabled="isDeletingCategory"
                class="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Loader2 v-if="isDeletingCategory" class="animate-spin" :size="16" />
                YA, HAPUS SEKARANG
              </button>
              
              <button 
                @click="isDeleteCategoryConfirmOpen = false" 
                class="w-full py-4 font-black text-[10px] uppercase text-gray-400 hover:text-[#111827] tracking-widest"
              >
                Batalkan Tindakan
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
    <!-- === CATEGORY MANAGER MODAL === -->
    <teleport to="body">
      <div v-show="isCategoryManagerOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <!-- Overlay -->
        <div @click="isCategoryManagerOpen = false" class="absolute inset-0 bg-[#111827]/80 backdrop-blur-md transition-opacity"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[12px] border-[#8B0000] flex flex-col max-h-[85vh]">
          
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-[#8B0000] text-white rounded-xl"><Plus :size="18" /></div>
              <h4 class="font-black uppercase tracking-widest text-sm text-[#111827]">Manajemen Kategori</h4>
            </div>
            <button @click="isCategoryManagerOpen = false" class="p-2 hover:bg-gray-100 rounded-full transition-all"><X :size="20"/></button>
          </div>

          <!-- Input Area (Sticky Top) -->
          <div class="p-6 bg-white border-b border-gray-100">
            <label class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
              {{ editingCategory ? 'Edit Nama Kategori' : 'Tambah Kategori Baru' }}
            </label>
            <div class="flex gap-2">
              <input 
                v-model="categoryFormName" 
                type="text" 
                placeholder="Contoh: Dimsum Goreng..." 
                class="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#8B0000] transition-all"
                @keyup.enter="saveCategory"
              />
              <button 
                @click="saveCategory" 
                :disabled="isProcessingCategory || !categoryFormName"
                class="px-6 bg-[#111827] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8B0000] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Loader2 v-if="isProcessingCategory" class="animate-spin" :size="14" />
                <Save v-else :size="14" />
                {{ editingCategory ? 'Update' : 'Simpan' }}
              </button>
              <button v-if="editingCategory" @click="cancelCategoryEdit" class="px-4 text-gray-400 hover:text-red-600 font-black text-[10px] uppercase">Batal</button>
            </div>
          </div>

          <!-- List Area (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[8px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100">
                  <th class="pb-4 pl-2">Nama Kategori</th>
                  <th class="pb-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="cat in categories" :key="cat.id" class="group hover:bg-gray-50 transition-colors">
                  <td class="py-4 pl-2">
                    <span class="font-black text-[#111827] text-xs uppercase">{{ cat.name }}</span>
                  </td>
                  <td class="py-4 text-center">
                    <div class="flex justify-center gap-2">
                      <button @click="editCategory(cat)" class="p-2 text-gray-400 hover:text-[#111827] hover:bg-white hover:shadow-sm rounded-lg transition-all"><Edit2 :size="14" /></button>
                      <button @click="deleteCategory(cat.id)" class="p-2 text-red-200 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Trash2 :size="14" /></button>
                    </div>
                  </td>
                </tr>
                <tr v-if="categories.length === 0">
                  <td colspan="2" class="py-10 text-center text-gray-300 italic text-xs uppercase font-bold tracking-widest">Belum ada kategori</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </teleport>

    <!-- DELETE CONFIRMATION MODAL -->
    <teleport to="body">
      <div v-show="isDeleteModalOpen" class="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center p-4">
        <div @click="isDeleteModalOpen = false" class="delete-overlay absolute inset-0 bg-[#111827]/90 backdrop-blur-md pointer-events-auto" style="opacity: 0; visibility: hidden;"></div>
        
        <div class="delete-panel relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border-t-[12px] border-red-600 pointer-events-auto" style="transform: scale(0.9); opacity: 0; visibility: hidden;">
          <!-- ... Delete Form Content ... -->
          <div class="p-10 text-center">
            <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 :size="40" class="text-red-600" /></div>
            <h4 class="font-black uppercase tracking-tighter text-2xl text-[#111827] mb-2">Hapus Produk?</h4>
            <p class="text-xs font-bold text-gray-400 uppercase leading-relaxed px-4">
              Anda akan menghapus <span class="text-red-600">"{{ productToDelete?.name }}"</span> secara permanen.
            </p>
            <div class="flex flex-col gap-3 mt-10">
              <button @click="confirmDelete" :disabled="isDeleting" class="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Loader2 v-if="isDeleting" class="animate-spin" :size="16" /> YA, HAPUS SEKARANG
              </button>
              <button @click="isDeleteModalOpen = false" class="w-full py-4 font-black text-[10px] uppercase text-gray-400 hover:text-[#111827] tracking-widest">Batalkan Tindakan</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
</style>