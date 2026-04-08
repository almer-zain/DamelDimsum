<script setup>
import { onMounted, ref } from 'vue';
import { 
  Users, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  WifiOff 
} from 'lucide-vue-next';
import gsap from 'gsap';
import api from '@/utils/api';

// --- STATE ---
const isLoading = ref(true);
const hasError = ref(false);

const stats = ref([
  { 
    title: 'Pending Resellers', 
    value: '0', 
    desc: 'Membutuhkan verifikasi', 
    icon: AlertCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-100',
    border: 'border-l-4 border-red-600'
  },
  { 
    title: 'Total Reseller', 
    value: '0', 
    desc: 'Mitra Terdaftar', 
    icon: Users, 
    color: 'text-dimsum-gold', 
    bg: 'bg-yellow-100',
    border: 'border-l-4 border-yellow-500'
  },
  { 
    title: 'Produk Aktif', 
    value: '0', 
    desc: 'Siap dipesan via WA', 
    icon: Package, 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-100',
    border: 'border-l-4 border-emerald-700'
  },
]);

const recentApplicants = ref([]);

// --- API LOGIC ---
const loadDashboardData = async () => {
  isLoading.value = true;
  hasError.value = false;

  try {
    const [resellerRes, productRes] = await Promise.all([
      api.get('/resellers/admin'),
      api.get('/products')
    ]);

    const allResellers = resellerRes.data.data || [];
    const allProducts = productRes.data.data || [];

    // Calculate Values
    const pendingCount = allResellers.filter(r => r.status === 'pending').length;
    const approvedCount = allResellers.filter(r => r.status === 'approved').length;
    const activeProducts = allProducts.filter(p => p.status === 'active').length;

    // Map to Stats
    stats.value[0].value = pendingCount.toString();
    stats.value[1].value = approvedCount.toString();
    stats.value[2].value = activeProducts.toString();

    // Map to Table
    recentApplicants.value = allResellers.slice(0, 3);

  } catch (error) {
    hasError.value = true;
    console.error("Dashboard Error:", error);
  } finally {
    isLoading.value = false;
    setTimeout(() => animateEntrance(), 50);
  }
};



onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="space-y-8">
    


    <!-- ERROR BANNER -->
    <div v-if="hasError" class="error-banner bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-700">
      <WifiOff :size="24" />
      <div>
        <p class="font-bold">Gagal Menghubungkan ke Server</p>
        <p class="text-xs">Pastikan backend sudah aktif dan database terhubung.</p>
      </div>
      <button @click="loadDashboardData" class="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Coba Lagi</button>
    </div>

    <!-- 1. Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <template v-if="isLoading">
        <!-- SKELETON CARDS -->
        <div v-for="i in 3" :key="i" class="h-36 bg-white/50 animate-pulse rounded-xl border border-gray-100 shadow-sm"></div>
      </template>

      <template v-else>
        <div 
          v-for="(stat, index) in stats" 
          :key="index"
          class="stat-card bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          :class="stat.border"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">{{ stat.title }}</p>
              <h3 class="text-4xl font-bold mt-2 text-dimsum-charcoal">{{ stat.value }}</h3>
              <p class="text-xs mt-2 text-gray-400">{{ stat.desc }}</p>
            </div>
            <div :class="`p-3 rounded-lg ${stat.bg} ${stat.color}`">
              <component :is="stat.icon" :size="24" />
            </div>
          </div>
          <component :is="stat.icon" class="absolute -bottom-4 -right-4 opacity-5 pointer-events-none" :size="100" />
        </div>
      </template>
    </div>

    <!-- 2. Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Recent Resellers -->
      <div class="recent-table lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-dimsum-charcoal flex items-center gap-2">
            <Users :size="20" class="text-dimsum-red"/>
            Pendaftar Terbaru
          </h3>
          <router-link to="/admin/resellers" class="text-sm text-dimsum-red font-semibold hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight :size="14"/>
          </router-link>
        </div>

        <div class="overflow-x-auto">
          <div v-if="isLoading" class="space-y-3">
             <div v-for="i in 3" :key="i" class="h-14 bg-gray-50 animate-pulse rounded-lg w-full"></div>
          </div>

          <table v-else class="w-full text-left">
            <thead>
              <tr class="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                <th class="pb-3 pl-2">Nama Pemilik</th>
                <th class="pb-3">Nama Toko</th>
                <th class="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="applicant in recentApplicants" :key="applicant.id" class="hover:bg-red-50/30 transition-colors">
                <td class="py-4 pl-2 font-medium text-dimsum-charcoal">{{ applicant.nameOwner }}</td>
                <td class="py-4 text-gray-600">{{ applicant.nameShop }}</td>
                <td class="py-4 text-center">
                  <span class="bg-yellow-100 text-yellow-700 text-[10px] px-3 py-1 rounded-full font-bold border border-yellow-200 uppercase">
                    {{ applicant.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!isLoading && recentApplicants.length === 0" class="p-10 text-center text-gray-400 italic">Belum ada pendaftar baru.</div>
        </div>
      </div>

      <!-- Quick Actions / Mini Banner -->
      <div class="recent-table bg-dimsum-red text-white rounded-xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-center items-center text-center">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-multiply"></div>
        
        <div class="relative z-10">
          <div class="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <TrendingUp :size="32" class="text-dimsum-gold" />
          </div>
          <h3 class="text-2xl font-bold mb-2 tracking-tighter uppercase">Tambah Produk?</h3>
          <p class="text-white/80 text-xs mb-6 italic">Update menu Dimsum Damel</p>
          <router-link 
            to="/admin/products" 
            class="bg-dimsum-gold text-dimsum-charcoal px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg hover:bg-white transition-all w-full inline-block"
          >
            Upload Produk
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.text-dimsum-charcoal { color: #1A1A1A; }
.text-dimsum-red { color: #8B0000; }
.text-dimsum-gold { color: #D4AF37; }
.bg-dimsum-red { background-color: #8B0000; }
.bg-dimsum-gold { background-color: #D4AF37; }
</style>