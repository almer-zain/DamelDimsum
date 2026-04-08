<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Trash2, Plus, Minus, ChevronLeft, ShoppingBag, 
  ArrowRight, Truck, ShieldCheck, CreditCard, Wallet, QrCode, Loader2,
  MessageCircle, User, MapPin, Send, Clock, CheckCircle
} from 'lucide-vue-next';
import Modal from '@/component/ui/Modal.vue'; // Reusing your modal component
import gsap from 'gsap';
import { showToast } from '@/utils/eventBus';
import { settings } from '@/store/settings';
import api from '@/utils/api'; // Import your api waiter

const router = useRouter();
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

// --- E-COMMERCE TOGGLE ---
const isTransactionEnabled = computed(() => import.meta.env.VITE_ENABLE_TRANSACTIONS === 'true');

// --- STATE ---
const cart = ref([]);
const isLoading = ref(true);
const isProcessing = ref(false);
const selectedPayment = ref(null);
const isInfoModalOpen = ref(false);

// CUSTOMER FORM
const customerForm = ref({
  name: '',
  whatsapp: '',
  email: '',
  address: '',
  city: ''
});

const isSuccessModalOpen = ref(false);
const confirmedOrderId = ref('');



// --- HISTORY LOGIC ---
const saveToHistory = (orderId, total) => {
  const history = JSON.parse(localStorage.getItem('damel_history')) || [];
  history.unshift({
    id: orderId,
    total: total,
    date: new Date().toISOString(),
  });
  // Keep only the last 10 orders
  localStorage.setItem('damel_history', JSON.stringify(history.slice(0, 10)));
};

const handleWhatsAppConfirm = () => {
  let rawPhone = settings.mainWhatsapp || '628123456789';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

  const message = `👋 Halo Admin! Saya sudah bayar via Midtrans.\n\n*ORDER ID:* ${confirmedOrderId.value}\n*Nama:* ${customerForm.value.name}\n*Total:* ${formatCurrency(cartTotal.value + 1000)}`;
  
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
};

// --- PAYMENT CHANNELS ---
const paymentMethods = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
  { id: 'digital', name: 'Bayar Digital', icon: QrCode, color: 'text-blue-500' }, // Unified digital option for Midtrans
];

// --- LOGIC ---
const loadCart = () => {
  const saved = localStorage.getItem('damel_cart');
  if (saved) cart.value = JSON.parse(saved);
  isLoading.value = false;
};

const saveCart = () => {
  localStorage.setItem('damel_cart', JSON.stringify(cart.value));
};

const handleOrderAction = () => {
  if (!selectedPayment.value) return showToast('Pilih metode pembayaran!', 'error');

  if (selectedPayment.value === 'whatsapp') {
    executeWhatsAppCheckout();
  } else {
    // Open info modal before calling Midtrans
    isInfoModalOpen.value = true;
  }
};

// --- VALIDATION LOGIC ---
const validateForm = () => {
  const f = customerForm.value;
  // 1. Basic Presence
  if (!f.name || !f.whatsapp || !f.address || !f.city || !f.email) {
    showToast('Mohon isi semua kolom data pengiriman', 'error');
    return false;
  }
  // 2. Email Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(f.email)) {
    showToast('Format email tidak valid', 'error');
    return false;
  }
  // 3. WhatsApp Numeric Check
  const waDigits = f.whatsapp.replace(/\D/g, '');
  if (waDigits.length < 10) {
    showToast('Nomor WhatsApp minimal 10 digit', 'error');
    return false;
  }
  return true;
};

const processDigitalPayment = async () => {
  // --- THE FIX: RUN VALIDATION FIRST ---
  if (!validateForm()) return;

  isProcessing.value = true;
  isInfoModalOpen.value = false;


  try {
    const response = await api.post('/orders/checkout', {
      cart: cart.value,
      customerInfo: customerForm.value
    });

    const { token, orderId } = response.data.data;

    window.snap.pay(token, {
      onSuccess: (result) => {
        showToast("Pembayaran Berhasil!", "success");

        // --- THE FIX: SANITIZE PHONE NUMBER ---
        // 1. Get the number from settings or fallback
        let rawPhone = settings.mainWhatsapp || '628123456789';
        
        // 2. Remove EVERYTHING that is not a number (spaces, dashes, plus signs)
        let cleanPhone = rawPhone.replace(/\D/g, ''); 
        
        // 3. Ensure it starts with the country code (Indonesia: 62)
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '62' + cleanPhone.slice(1);
        }

        // 4. Build the message
        const finalMessage = `👋 Halo Admin! Saya sudah bayar via Midtrans.\n\n*ORDER ID:* ${orderId}\n*Nama:* ${customerForm.value.name}\n*Kota:* ${customerForm.value.city}`;
        
        // 5. Use wa.me (The modern standard) instead of api.whatsapp.com
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
        

        localStorage.removeItem('damel_cart');
        cart.value = [];

        saveToHistory(orderId, cartTotal.value + 1000);

        confirmedOrderId.value = orderId;
        isSuccessModalOpen.value = true;

        showToast("Pembayaran Berhasil!", "success");
      },
      onPending: () => showToast("Pesanan dibuat. Silahkan selesaikan pembayaran.", "info"),
      onError: () => showToast("Gagal memproses pembayaran.", "error")
    });
  } catch (e) {
    showToast(e.response?.data?.message || "Koneksi terputus.", "error");
  } finally {
    isProcessing.value = false;
  }
};

const executeWhatsAppCheckout = () => {
  let phone = settings.mainWhatsapp || '628123456789';
  phone = phone.replace(/\D/g, '');
  let message = `👋 Halo *${settings.siteName || 'Damel Dimsum'}*,\nSaya mau pesan melalui website:\n\n`;
  cart.value.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.qty}x) — ${formatCurrency(item.price * item.qty)}\n`;
  });
  message += `\nTotal: *${formatCurrency(cartTotal.value)}*`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

const updateQty = (id, change) => {
  const index = cart.value.findIndex(item => item.id === id);
  if (index !== -1) {
    const newQty = cart.value[index].qty + change;
    if (newQty > 0) cart.value[index].qty = newQty;
    else cart.value.splice(index, 1);
    saveCart();
  }
};

const removeItem = (id) => {
  cart.value = cart.value.filter(i => i.id !== id);
  saveCart();
  showToast('Item dihapus', 'success');
};

const cartTotal = computed(() => cart.value.reduce((acc, item) => acc + (item.price * item.qty), 0));
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const getImageUrl = (imageJson) => {
  if (!imageJson || imageJson === '[]') return dynamicLogo.value; // Fallback to Company Logo
  try {
    const images = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    return (Array.isArray(images) && images.length > 0) ? `${IMAGE_BASE_URL}/${images[0]}` : dynamicLogo.value;
  } catch (e) { return dynamicLogo.value; }
};
// --- HISTORY STATE ---
const showHistory = ref(false);
const history = ref([]);

const loadHistory = () => {
  const saved = localStorage.getItem('damel_history');
  if (saved) history.value = JSON.parse(saved);
};

// Helper to format the date nicely (e.g., 14 Mar, 10:30)
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// Re-send confirmation logic
const resendToWA = (order) => {
  let rawPhone = settings.mainWhatsapp || '628123456789';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

  const message = `👋 Halo Admin! Saya ingin konfirmasi ulang pesanan lama saya.\n\n*ORDER ID:* ${order.id}\n*Tanggal:* ${formatDate(order.date)}\n*Total:* ${formatCurrency(order.total)}`;
  
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
};

// Add this to your existing onMounted
onMounted(() => {
  loadCart();
  loadHistory(); // Load previous orders
  gsap.from(".cart-item", { opacity: 0, x: -20, stagger: 0.1, duration: 0.6 });
});
</script>

<template>

  <div class="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-6 font-['Poppins'] relative overflow-hidden">
    <!-- Background Decor -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] z-0"></div>

    <div class="max-w-6xl mx-auto relative z-10">
            <!-- Inside the max-w-6xl container, before the main grid -->
      <div class="mb-10">
        <button 
          @click="showHistory = !showHistory" 
          class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#111827] transition-all group"
        >
          <Clock :size="14" class="group-hover:rotate-12 transition-transform" />
          {{ showHistory ? 'Tutup Riwayat' : 'Lihat Riwayat Pesanan' }}
          <span v-if="history.length > 0" class="bg-gray-100 px-2 py-0.5 rounded-full text-[#8B0000] ml-1">{{ history.length }}</span>
        </button>

        <!-- HISTORY LIST (Snappy Slide Down) -->
        <transition 
          @enter="(el, done) => gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out', onComplete: done })"
          @leave="(el, done) => gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done })"
        >
          <div v-if="showHistory" class="overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              
              <div v-if="history.length === 0" class="col-span-full py-10 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada transaksi tersimpan</p>
              </div>

              <div 
                v-for="order in history" :key="order.id" 
                class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <p class="text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-1">Order ID</p>
                    <h5 class="text-xs font-black text-[#111827]">{{ order.id }}</h5>
                  </div>
                  <div class="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                    <ShieldCheck :size="14" />
                  </div>
                </div>

                <div class="flex justify-between items-end">
                  <div>
                    <p class="text-[10px] font-bold text-gray-400">{{ formatDate(order.date) }}</p>
                    <p class="text-sm font-black text-[#8B0000]">{{ formatCurrency(order.total) }}</p>
                  </div>
                  <button 
                    @click="resendToWA(order)"
                    class="p-3 bg-gray-50 text-gray-400 hover:text-[#25D366] hover:bg-green-50 rounded-2xl transition-all"
                    title="Kirim ulang ke WA"
                  >
                    <MessageCircle :size="16" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </transition>
      </div>
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <button @click="router.push('/menu')" class="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#8B0000] transition-colors mb-4">
            <ChevronLeft :size="16" /> Kembali Belanja
          </button>
          <h1 class="text-4xl lg:text-5xl font-black text-[#111827] tracking-tighter uppercase leading-none">
            Checkout <span class="text-[#8B0000]">Dimsum</span>
          </h1>
        </div>
      </div>

      <div v-if="cart.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- LEFT: ITEMS & PAYMENT -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- ITEM LIST -->
          <div class="space-y-4">
            <h3 class="text-sm font-black uppercase tracking-widest text-[#111827] flex items-center gap-2">
               <ShoppingBag :size="16" /> Detail Pesanan
            </h3>
            <div v-for="item in cart" :key="item.id" class="cart-item bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
              <div class="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                <img :src="getImageUrl(item.images)" crossorigin="anonymous" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <h4 class="font-black text-[#111827] text-sm uppercase leading-tight">{{ item.name }}</h4>
                <p class="text-[10px] font-bold text-[#8B0000] mt-1">{{ formatCurrency(item.price) }} / pcs</p>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-3 bg-gray-50 p-1 rounded-xl">
                  <button @click="updateQty(item.id, -1)" class="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-red-600"><Minus :size="12" /></button>
                  <span class="text-xs font-black">{{ item.qty }}</span>
                  <button @click="updateQty(item.id, 1)" class="w-7 h-7 rounded-lg bg-[#111827] flex items-center justify-center text-white"><Plus :size="12" /></button>
                </div>
                <button @click="removeItem(item.id)" class="text-gray-300 hover:text-red-600"><Trash2 :size="18" /></button>
              </div>
            </div>
          </div>

          <!-- PAYMENT METHODS (Dynamic .env) -->
           <div v-if="isTransactionEnabled" class="space-y-4">
             <h3 class="text-sm font-black uppercase tracking-widest text-[#111827] flex items-center gap-2">
               <CreditCard :size="16" /> Metode Checkout
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                v-for="method in paymentMethods" :key="method.id"
                @click="selectedPayment = method.id"
                class="p-6 rounded-3xl border-2 transition-all flex items-center gap-4 group"
                :class="selectedPayment === method.id ? 'bg-[#111827] border-[#8B0000] text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-[#8B0000]/30'"
               >
                 <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" :class="selectedPayment === method.id ? '!bg-white/10' : ''">
                    <component :is="method.icon" :size="24" :class="selectedPayment === method.id ? 'text-[#FBBF24]' : method.color" />
                 </div>
                 <div class="text-left">
                    <span class="block text-xs font-black uppercase tracking-widest">{{ method.name }}</span>
                    <span class="text-[10px] opacity-60 font-medium">{{ method.id === 'whatsapp' ? 'Pesan & Bayar Manual' : 'Gopay, QRIS, Virtual Account' }}</span>
                 </div>
               </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: SUMMARY -->
        <div class="lg:col-span-4">
          <div class="sticky top-32 space-y-6">
            <div class="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <h3 class="text-xl font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4 italic">Ringkasan</h3>
              
              <div class="space-y-4 mb-10">
                <div class="flex justify-between text-sm font-medium text-gray-400">
                  <span>Subtotal</span>
                  <span class="text-white">{{ formatCurrency(cartTotal) }}</span>
                </div>
                <div class="flex justify-between text-sm font-medium text-gray-400">
                  <span>Biaya Layanan</span>
                  <span class="text-[#FBBF24]">{{ isTransactionEnabled ? 'Rp 1.000' : 'Gratis' }}</span>
                </div>
                <div class="pt-4 border-t border-white/10 flex justify-between items-end">
                   <span class="text-xs font-black uppercase tracking-widest text-gray-400">Total</span>
                   <span class="text-3xl font-black text-[#FBBF24]">{{ formatCurrency(cartTotal + (isTransactionEnabled ? 1000 : 0)) }}</span>
                </div>
              </div>


              <button 
                @click="handleOrderAction"
                :disabled="isProcessing"
                class="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                :class="selectedPayment === 'digital' ? 'bg-[#8B0000] hover:bg-[#B91C1C] text-white' : 'bg-[#25D366] hover:bg-[#1ebd59] text-white'"
              >
                <Loader2 v-if="isProcessing" class="animate-spin" :size="18" />
                <template v-else>
                   {{ selectedPayment === 'digital' ? 'BAYAR DIGITAL' : 'PESAN VIA WHATSAPP' }}
                   <ArrowRight :size="18" />
                </template>
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- EMPTY STATE (Using Company Logo instead of Shopping Bag) -->
      <div v-else class="py-40 text-center bg-white rounded-[3rem] shadow-xl border border-gray-100">
         <div class="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100 overflow-hidden">
            <!-- DYNAMIC COMPANY LOGO -->
            <ShoppingBag  class="w-1/3 h-1/3 opacity-60"/>
         </div>
         <h2 class="text-2xl font-black text-[#111827] uppercase mb-10 tracking-widest leading-none">Keranjang Kosong</h2>
         <button @click="router.push('/menu')" class="bg-[#8B0000] text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all">
            Lihat Menu
         </button>
      </div>
    </div>

<!-- === SHIPPING INFO MODAL === -->
    <Modal :show="isInfoModalOpen" title="Detail Pengiriman" @close="isInfoModalOpen = false">
        <template #body>
            <div class="space-y-5">
                <div class="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 mb-2">
                    <p class="text-[10px] text-yellow-700 font-bold uppercase leading-relaxed text-center">
                        Data ini digunakan untuk konfirmasi pesanan & rincian pengiriman di aplikasi Midtrans.
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Nama -->
                    <div class="space-y-1">
                        <label class="text-[10px] font-black text-gray-400 uppercase ml-1">Nama Lengkap</label>
                        <div class="relative">
                           <User :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                           <input v-model="customerForm.name" type="text" placeholder="Budi Santoso" class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#8B0000]/20 text-sm" />
                        </div>
                    </div>
                    <!-- WhatsApp -->
                    <div class="space-y-1">
                        <label class="text-[10px] font-black text-gray-400 uppercase ml-1">WhatsApp</label>
                        <div class="relative">
                           <Phone :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                           <input v-model="customerForm.whatsapp" type="text" placeholder="0812..." class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#8B0000]/20 text-sm" />
                        </div>
                    </div>
                </div>

                <!-- Email (NEW) -->
                <div class="space-y-1">
                    <label class="text-[10px] font-black text-gray-400 uppercase ml-1">Email Aktif</label>
                    <div class="relative">
                       <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input v-model="customerForm.email" type="email" placeholder="contoh@mail.com" class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#8B0000]/20 text-sm" />
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-black text-gray-400 uppercase ml-1">Kota</label>
                    <div class="relative">
                       <MapPin :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input v-model="customerForm.city" type="text" placeholder="Contoh: Bekasi Barat" class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#8B0000]/20 text-sm" />
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] font-black text-gray-400 uppercase ml-1">Alamat Lengkap</label>
                    <textarea v-model="customerForm.address" rows="3" placeholder="Nama Jalan, Blok, RT/RW, No Rumah..." class="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#8B0000]/20 resize-none text-sm"></textarea>
                </div>
            </div>
        </template>
        <template #footer>
            <button 
              @click="processDigitalPayment" 
              class="w-full bg-[#111827] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-[#8B0000]"
            >
                BAYAR SEKARANG <ArrowRight :size="16" />
            </button>
        </template>
    </Modal>

    <!-- === SUCCESS / RECEIPT MODAL === -->
    <Modal :show="isSuccessModalOpen" title="Pembayaran Diterima" @close="router.push('/')">
        <template #body>
            <div class="text-center py-4">
                <!-- Large Success Icon -->
                <div class="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle :size="48" class="text-emerald-500" />
                </div>

                <h3 class="text-2xl font-black text-[#111827] uppercase tracking-tighter mb-2">Terima Kasih!</h3>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Pesanan Anda sedang diproses</p>

                <!-- Receipt Box -->
                <div class="bg-gray-50 rounded-[2rem] p-6 border-2 border-dashed border-gray-200 relative overflow-hidden">
                    <div class="space-y-3">
                        <div class="flex justify-between text-[10px] font-black uppercase text-gray-400">
                            <span>Order ID</span>
                            <span class="text-[#111827]">{{ confirmedOrderId }}</span>
                        </div>
                        <div class="flex justify-between text-[10px] font-black uppercase text-gray-400">
                            <span>Status</span>
                            <span class="text-emerald-600">SETTLED / PAID</span>
                        </div>
                    </div>
                </div>

                <p class="text-[10px] text-gray-400 font-medium mt-8 leading-relaxed px-6">
                    Klik tombol di bawah untuk mengirim bukti bayar ke WhatsApp Admin agar pesanan segera dikirim.
                </p>
            </div>
        </template>
        
        <template #footer>
            <div class="flex flex-col gap-3 w-full">
                <button 
                  @click="handleWhatsAppConfirm"
                  class="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <MessageCircle :size="18" /> KONFIRMASI WHATSAPP
                </button>
                <button @click="router.push('/')" class="py-2 text-[10px] font-black uppercase text-gray-300 hover:text-[#111827] transition-colors">
                    Kembali ke Beranda
                </button>
            </div>
        </template>
    </Modal>

  </div>
</template>