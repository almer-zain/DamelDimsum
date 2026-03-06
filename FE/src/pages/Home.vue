

<template>
  <div class="bg-[#FFF5F0] overflow-x-hidden">
    <!-- Header -->
    <header
      class="fixed top-0 w-full z-[1000] bg-[#FFF5F0] shadow-sm transition-transform duration-500"
      :class="{ 'animate-slideDown': true }"
    >
      <div class="flex justify-between items-center px-5 md:px-10 lg:px-20 py-5">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
            <img
              src="@/assets/images/LogoDamelDimsum.png"
              alt="Dimsum Icon"
              class="w-[150%] h-[250%] object-contain"
            />
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:block">
          <ul class="flex gap-6 lg:gap-10 list-none">
            <li><a href="#home" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Home</a></li>
            <li><a href="#tentang-kami" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Tentang Kami</a></li>
            <li><router-link to="/menu" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Produk</router-link></li>
            <li><a href="#program" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Program</a></li>
          </ul>
        </nav>

        <!-- Header Right -->
        <div class="flex gap-3 lg:gap-5 items-center">
          <span class="hidden md:block cursor-pointer">
            <img
              src="/src/assets/images/Vector.png"
              alt="Search"
              class="w-6 h-6 object-contain"
            />
          </span>
          <a
            href="#pesan"
            class="bg-gradient-to-br from-[#C62828] to-[#771816] text-white px-5 lg:px-8 py-2 lg:py-3 rounded-full font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C62828]/40 transition-all text-sm lg:text-base"
          >
            Pesan Sekarang
          </a>
          
          <!-- Mobile Menu Toggle -->
          <div class="md:hidden flex flex-col gap-1.5 cursor-pointer" @click="toggleMenu">
            <span class="w-6 h-0.5 bg-[#C62828] rounded transition-all"></span>
            <span class="w-6 h-0.5 bg-[#C62828] rounded transition-all"></span>
            <span class="w-6 h-0.5 bg-[#C62828] rounded transition-all"></span>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-[#FFF5F0] shadow-lg"
      >
        <ul class="flex flex-col gap-4 p-5">
          <li><a href="#home" @click="closeMobileMenu" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Home</a></li>
          <li><a href="#tentang-kami" @click="closeMobileMenu" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Tentang Kami</a></li>
          <li><router-link to="/menu" @click="closeMobileMenu" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Produk</router-link></li>
          <li><a href="#program" @click="closeMobileMenu" class="text-[#333] font-medium hover:text-[#C62828] transition-colors">Program</a></li>
        </ul>
      </nav>
    </header>

    <!-- Hero Section -->
    <section
      id="home"
      class="hero-section relative min-h-screen flex items-center overflow-hidden pt-28 md:pt-32 lg:pt-36 pb-20 md:pb-24 px-5 md:px-10 lg:px-20"
    >

      <!-- Hero Content -->
      <div class="relative z-[2] w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        
        <!-- Left: Text -->
        <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
          <!-- Tag -->
          <span class="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xl border border-white/25 px-5 py-2 rounded-full text-[0.82rem] font-bold tracking-wide w-fit mb-6 animate-fade-up">
            <span>🔥</span>
            #DimsumPilihan
          </span>

          <!-- Headline -->
          <h1 class="font-bebas text-[clamp(3rem,8vw,7.5rem)] leading-[1.02] tracking-tight mb-5 text-white animate-fade-up-2">
            Rasa Mewah<br>
            Harga <span class="text-[#FFB74D] relative accent-underline">Murah</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-[clamp(0.88rem,1.8vw,1.05rem)] leading-[1.7] text-white/90 max-w-[420px] mb-9 font-light animate-fade-up-3">
            Kami hadir dengan dimsum berkualitas, dibuat <em>fresh</em> setiap hari,
            dengan harga yang tetap terjangkau untuk semua kalangan.
          </p>

          <!-- CTA Button -->
          <div class="mb-11 animate-fade-up-4">
            <a href="https://wa.me/6285747855881" 
               class="relative inline-flex items-center gap-3 bg-cta-gradient text-white px-[34px] py-4 rounded-full text-base font-bold no-underline shadow-[0_6px_28px_rgba(229,57,53,0.45)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_10px_36px_rgba(229,57,53,0.6)] overflow-hidden cta-shine"
               target="_blank" 
               rel="noopener">
              <svg class="w-[22px] h-[22px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Join Reseller Dimsum
            </a>
          </div>

          <!-- Testimonial -->
          <div class="flex items-center gap-4 animate-fade-up-5">
            <div class="flex">
              <div class="w-11 h-11 rounded-full border-3 border-[#8B0000] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Pelanggan 1" loading="lazy" class="w-full h-full object-cover"/>
              </div>
              <div class="w-11 h-11 rounded-full border-3 border-[#8B0000] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.3)] -ml-3">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Pelanggan 2" loading="lazy" class="w-full h-full object-cover"/>
              </div>
              <div class="w-11 h-11 rounded-full border-3 border-[#8B0000] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.3)] -ml-3">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135823.png" alt="Pelanggan 3" loading="lazy" class="w-full h-full object-cover"/>
              </div>
            </div>
            <div class="leading-[1.3] text-white">
              <div class="text-[0.82rem] font-semibold">Testimoni Pelanggan</div>
              <div class="text-[#FFD54F] text-[0.85rem] font-bold">⭐ 5,0 Rating</div>
            </div>
          </div>
        </div>

        <!-- Right: Visual -->
        <div class="relative flex items-center justify-center w-full max-w-[520px] mx-auto aspect-square">
          <!-- Glow layers -->
          <div class="absolute inset-0 rounded-full z-0 glow-orange scale-[1.15] blur-[36px] animate-glow-pulse"></div>
          <div class="absolute inset-0 rounded-full z-0 glow-red scale-105 blur-[50px] animate-glow-pulse-reverse"></div>

          <!-- Ring -->
          <div class="absolute inset-[6%] rounded-full ring-border z-[1] animate-ring-spin"></div>

          <!-- Plate -->
          <img
            class="relative z-[2] w-[82%] max-w-[420px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-plate-float"
            src="@/assets/images/Group 25.png"
            alt="Piring Dimsum Premium Dàmel"
            loading="eager"
          />

          <!-- Decorative spice dots -->
          <div class="absolute w-7 h-7 rounded-full bg-[#FB8C00] top-[8%] right-[12%] opacity-70 animate-spice-float shadow-[0_4px_12px_rgba(251,140,0,0.4)] z-[3]"></div>
          <div class="absolute w-[18px] h-[18px] rounded-full bg-[#E53935] top-[22%] left-[6%] opacity-55 animate-spice-float-2 z-[3]"></div>
          <div class="absolute w-[14px] h-[14px] rounded-full bg-[#FFB74D] bottom-[18%] left-[14%] opacity-60 animate-spice-float-3 z-[3]"></div>
          <div class="absolute w-[22px] h-[22px] rounded-full bg-[#FFE0B2] top-[50%] right-[4%] opacity-45 blur-[2px] animate-spice-float-4 z-[3]"></div>

          <!-- Brand card -->
          <div class="absolute bottom-[2%] -left-[4%] lg:left-[-4%] z-10 bg-white/18 backdrop-blur-[18px] border border-white/28 rounded-[18px] p-3 px-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.25)] whitespace-nowrap transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_40px_rgba(0,0,0,0.35)] animate-card-slide-left" 
               role="complementary" 
               aria-label="Kontak Dàmel Dimsum">
            <div class="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-[#C62828] to-[#E53935] flex items-center justify-center text-2xl flex-shrink-0">
              🍽️
            </div>
            <div>
              <div class="font-bold text-[0.88rem] text-white">Dàmel Dimsum</div>
              <div class="text-[0.75rem] text-white/85">085747855881</div>
            </div>
            <div class="w-10 h-10 bg-gradient-to-br from-[#C62828] to-[#E53935] rounded-full flex items-center justify-center text-xl flex-shrink-0 hidden sm:flex">
              📞
            </div>
          </div>

          <!-- Product card -->
          <div class="absolute bottom-[0%] -right-[6%] lg:right-[-6%] z-10 bg-white/18 backdrop-blur-[18px] border border-white/28 rounded-[18px] p-3 px-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.25)] whitespace-nowrap transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_40px_rgba(0,0,0,0.35)] animate-card-slide-right" 
               role="complementary" 
               aria-label="Produk unggulan">
            <div class="w-[54px] h-[54px] rounded-[14px] bg-gradient-to-br from-[#f5e6d3] to-[#ffe0b2] flex items-center justify-center text-[2rem] flex-shrink-0">
              🥟
            </div>
            <div>
              <div class="font-bold text-[0.88rem] text-white">Dimsum Ori 4 Pcs</div>
              <div class="text-[#FFD54F] text-[0.78rem] tracking-[2px]">★★★★★</div>
              <div class="font-extrabold text-[#FFB74D] text-[0.92rem] mt-0.5">Rp 12.000</div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- About Section -->
    <section id="tentang-kami" class="py-16 md:py-20 px-5 md:px-10 lg:px-20 bg-[#FFF5F0]">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div class="animate-on-scroll">
          <img
            src="@/assets/images/image 1.png"
            alt="Dimsum dalam steamer"
            class="w-full max-w-lg rounded-3xl shadow-2xl"
          />
        </div>
        <div class="animate-on-scroll">
          <span class="text-orange-500 font-semibold text-sm tracking-widest uppercase mb-3 block">
            TENTANG KAMI
          </span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl text-[#333] font-bold leading-tight mb-5">
            Yuk, Kenalan Sama<br />Dàmel Dimsum
          </h2>
          <p class="text-[#666] leading-relaxed mb-4">
            Dàmel Dimsum menghadirkan berbagai pilihan dimsum yang dibuat dari bahan segar dan diproduksi setiap hari. Kami berkomitmen menyajikan dimsum berkualitas tinggi dengan cita rasa autentik, diproses secara higienis, dan tetap terjangkau untuk semua kalangan
          </p>
          <p class="text-[#666] leading-relaxed">
            Dengan standar kebersihan dan kehalalan yang terjaga, Dàmel Dimsum terus berinovasi untuk memberikan pengalaman kuliner terbaik serta menjadi mitra terpercaya bagi pelanggan dan mitra usaha kami
          </p>
        </div>
      </div>
    </section>


    
    <!-- Features Section -->
    <section class="py-16 md:py-20 px-5 md:px-10 lg:px-20 bg-white text-center">
      <h2 class="text-3xl md:text-4xl lg:text-5xl text-[#333] font-bold mb-12 md:mb-16 animate-on-scroll">
        Kenapa Pilih Dàmel Dimsum?
      </h2>
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="bg-gradient-to-br from-[#C62828] to-[#B71C1C] p-12 md:p-16 rounded-3xl text-white cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#C62828]/40 transition-all animate-on-scroll"
        >
          <div class="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-5 p-4">
            <img :src="feature.icon" :alt="feature.title" class="w-full h-full object-contain brightness-0 invert" />
          </div>
          <h3 class="text-xl font-semibold mt-5">{{ feature.title }}</h3>
        </div>
      </div>
    </section>

    <!-- Reseller Section -->
    <section id="program" class="py-16 md:py-20 px-5 md:px-10 lg:px-20 bg-gradient-to-br from-[#8B0000] via-[#C62828] to-[#B71C1C] text-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div class="animate-on-scroll">
          <span class="text-yellow-400 font-bold text-sm tracking-widest mb-4 inline-block relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-0.5 after:bg-yellow-400">
            PROGRAM RESELLER
          </span>
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5">
            Gabung Bersama<br />Reseller Dàmel Dimsum!
          </h2>
          <p class="opacity-95 leading-relaxed max-w-md">
            Jadi bagian dari reseller Dàmel Dimsum dan tumbuh bersama menghadirkan dimsum berkualitas untuk lebih banyak pelanggan!
          </p>
        </div>

        <div class="bg-gradient-to-br from-[#C62828]/90 to-[#8B0000]/90 rounded-[30px] grid grid-cols-1 md:grid-cols-2 items-center shadow-2xl overflow-hidden min-h-[350px] animate-on-scroll">
          <div class="p-8 md:p-10 flex items-center justify-center">
            <img
              src="@/assets/images/Group 28.png"
              alt="Dimsum Steamer"
              class="w-full max-w-[320px] object-contain drop-shadow-2xl"
            />
          </div>
          <div class="p-8 md:p-12 text-center md:text-left">
            <h3 class="text-2xl md:text-3xl font-bold mb-4">Yuk Jadi Reseller</h3>
            <p class="opacity-95 mb-6 text-sm md:text-base">
              Bergabung sebagai reseller Dàmel Dimsum dengan produk siap jual dan panduan penjualan
            </p>
            <a
              href="#"
              class="inline-block bg-gradient-to-br from-[#FFB74D] to-[#FF9800] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/60 transition-all"
            >
              Program Reseller
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-24 px-5 md:px-10 lg:px-20 bg-[#FFF5F0] overflow-visible">
      <div class="max-w-7xl mx-auto">
        
        <div class="mb-20 relative">
          <span class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2 block relative w-fit">
            PRODUK KAMI
            <span class="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500"></span>
          </span>
          <div class="flex items-start gap-2">
            <h2 class="text-3xl md:text-5xl text-[#333] font-extrabold leading-tight">
              Menu Favorit Yang Selalu<br />Bikin Ketagihan
            </h2>
            <span class="w-3 h-3 bg-[#E53935] rounded-full mt-2"></span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-end">
          
          <div class="relative mb-20 lg:mb-0 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div class="relative w-full max-w-sm mx-auto">
              <div class="absolute -top-10 left-0 md:-left-4 flex flex-col items-center z-20">
              
              </div>

              <img 
                src="@/assets/images/dimsum2 2.png" 
                alt="Tumpukan Dimsum" 
                class="w-full h-auto object-contain drop-shadow-2xl z-10 relative scale-110"
              />

              <div class="absolute -bottom-10 right-0 md:-right-4 flex flex-col items-center z-20">
                 <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="" class="text-[#666] -rotate-12 mb-1">
                  
                </svg>
              </div>
            </div>

            <div class="mt-16 max-w-xs mx-auto lg:mx-0 relative">
              <div class="absolute -left-8 top-2 w-4 h-4 bg-[#FFD54F] rounded-sm transform -rotate-12"></div>
              <h3 class="text-xl font-bold text-[#333] leading-snug">
                Pilihan Dimsum Terlaris Kami Untuk Anda, Tersedia Original & Mentai
              </h3>
            </div>
          </div>

          <div class="mt-24 lg:mt-0">
            <div class="bg-[#C62828] rounded-[40px] p-8 pt-32 relative text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 z-0">
              <div class="absolute -top-35 left-1/2 -translate-x-1/2 w-90 h-90">
                <img 
                  src="@/assets/images/DimsumOri4 (1).png" 
                  alt="Dimsum Ori" 
                  class="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" 
                />
              </div>
              
              <h3 class="text-[#FFB74D] text-2xl font-extrabold mb-4">Dimsum Ori</h3>
              <p class="text-white text-sm leading-relaxed mb-8 opacity-95 h-16">
                Dimsum kukus dengan isian ayam, udang, cumi, beef, dan mozzarella, disajikan hangat dengan cita rasa yang pas
              </p>
              
              <button class="w-full bg-[#D32F2F] bg-opacity-50 border border-white/20 hover:bg-[#B71C1C] text-white py-3 rounded-2xl font-semibold transition-colors shadow-lg">
                Lihat Menu Lainnya
              </button>
            </div>
          </div>

          <div class="mt-24 lg:mt-0">
            <div class="bg-[#C62828] rounded-[40px] p-8 pt-32 relative text-center shadow-xl hover:-translate-y-2 transition-transform duration-300 z-0">
              <div class="absolute -top-35 left-1/2 -translate-x-1/2 w-90 h-90">
                 <img 
                  src="@/assets/images/DimsumMentai4 2.png" 
                  alt="Dimsum Mentai" 
                  class="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" 
                />
              </div>
              
              <h3 class="text-[#FFB74D] text-2xl font-extrabold mb-4">Dimsum Mentai</h3>
              <p class="text-white text-sm leading-relaxed mb-8 opacity-95 h-16">
                Dimsum kukus isi ayam, udang, cumi, beef, dan mozzarella, dipadukan dengan saus mentai yang lembut dan gurih
              </p>
              
              <button class="w-full bg-[#D32F2F] bg-opacity-50 border border-white/20 hover:bg-[#B71C1C] text-white py-3 rounded-2xl font-semibold transition-colors shadow-lg">
                Lihat Menu Lainnya
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
    
<!-- Testimoni -->
    <section class="py-16 md:py-20 px-5 md:px-10 lg:px-20 bg-[#FFF5F0] text-center">
  <div class="animate-on-scroll mb-12 md:mb-16">
    <span class="text-orange-500 font-bold text-sm tracking-widest inline-block relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-0.5 after:bg-orange-500">
      TESTIMONI
    </span>
    <h2 class="text-3xl md:text-4xl lg:text-5xl text-[#333] font-bold mt-4">Apa Kata Mereka?</h2>
  </div>

  <div class="relative max-w-6xl mx-auto">
    <div class="bg-gradient-to-br from-[#C62828] via-[#E53935] to-[#C62828] rounded-[40px] p-6 md:p-12 relative overflow-hidden shadow-2xl">
      
      <div class="absolute w-[300px] h-[300px] -top-24 -left-12 rounded-full opacity-30 blur-xl bg-gradient-radial from-orange-400 to-transparent pointer-events-none"></div>
      <div class="absolute w-[250px] h-[250px] -bottom-20 right-24 rounded-full opacity-20 blur-xl bg-gradient-radial from-orange-400 to-transparent pointer-events-none"></div>

      <div class="relative z-10 overflow-hidden">
        <div
          class="flex gap-8 transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${currentSlide * (isMobile ? 100 : 50)}%)` }"
        >
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="min-w-full md:min-w-[calc(50%-16px)] bg-gradient-to-br from-[#8B0000]/80 to-[#B71C1C]/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border-2 border-orange-500/30 flex flex-col items-center"
          >
            <div class="w-20 h-20 bg-white rounded-full mb-6 overflow-hidden shadow-xl border-4 border-white/20">
              <img :src="testimonial.avatar" :alt="testimonial.name" class="w-full h-full object-cover" />
            </div>
            
            <div class="text-yellow-400 text-2xl mb-5 tracking-widest">★★★★★</div>
            
            <p class="text-white opacity-98 leading-relaxed text-center italic">
              "{{ testimonial.text }}"
            </p>
            <p class="text-orange-200 font-bold mt-4 text-sm">{{ testimonial.name }}</p>
          </div>
        </div>
      </div>

      <div class="hidden md:block">
        <button
          @click="prevSlide"
          class="absolute top-1/2 left-4 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C62828] shadow-lg hover:bg-orange-50 transition-all font-bold"
        >
          ‹
        </button>
        <button
          @click="nextSlide"
          class="absolute top-1/2 right-4 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C62828] shadow-lg hover:bg-orange-50 transition-all font-bold"
        >
          ›
        </button>
      </div>
    </div>

    <div class="flex justify-center gap-3 mt-8">
      <span
        v-for="(dot, index) in totalSlides"
        :key="index"
        @click="goToSlide(index)"
        class="h-3 rounded-full cursor-pointer transition-all hover:bg-orange-500"
        :class="currentSlide === index ? 'w-8 bg-[#C62828]' : 'w-3 bg-gray-300'"
      ></span>
    </div>
  </div>
</section>

    <!-- Footer -->
    <footer class="bg-gradient-to-br from-[#8B0000] to-[#C62828] text-white py-12 md:py-16 px-5 md:px-10 lg:px-20">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-10">
        <div>
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
              <img src="@/assets/images/Male Memojis.png" alt="Dimsum Icon" class="w-full h-full object-contain" />
            </div>
            <span class="font-bold text-2xl">Dàmel Dimsum</span>
          </div>
          <p class="opacity-90 leading-relaxed mb-3">
            Kami hadir dengan kualitas terbaik dan harga paling terjangkau untuk semua kalangan.
          </p>
          <p class="opacity-90 leading-relaxed">Nikmati kelezatan dimsum premium di setiap sajian.</p>
        </div>

        <div>
          <h3 class="text-2xl font-semibold mb-5">Hubungi Kami</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Location" class="w-5 h-5" />
              <span class="text-[#FFB74D] font-semibold">Alamat:</span>
              <span>Purwokerto, Desa Bana Mahakaruna</span>
            </div>
            <div class="flex items-center gap-3">
              <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Address" class="w-5 h-5" />
              <span class="text-sm">Blok T no 29 Karanganyar KSS RT 1 RW 8</span>
            </div>
            <div class="flex items-center gap-3">
              <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Phone" class="w-5 h-5" />
              <span class="text-[#FFB74D] font-semibold">No Telepon:</span>
              <span>+6283 21 2786881</span>
            </div>
            <div class="flex items-center gap-3">
              <img src="https://cdn-icons-png.flaticon.com/512/2838/2838590.png" alt="Clock" class="w-5 h-5" />
              <span class="text-[#FFB74D] font-semibold">Jam Operasional:</span>
              <span>Setiap Hari Pukul 10.00 - 17.00</span>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-white/20 pt-8 text-center opacity-80">
        <p>Copyright © 2026 </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const isMobileMenuOpen = ref(false);
const currentSlide = ref(0);
const isMobile = ref(false);

const features = [
  {
    icon: '/src/assets/images/no pengawet 1.png',
    title: 'Tanpa Pengawet'
  },
  {
    icon: '/src/assets/images/halal 1.png',
    title: 'Halal'
  },
  {
    icon: '/src/assets/images/harga terjangkau 1.png',
    title: 'Harga Terjangkau'
  }
];

const testimonials = [
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    name: 'User 1',
    text: 'Enakkk tee dimsum nya guede guedebangett mantepp full daging😍'
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
    name: 'User 2',
    text: 'Dimsum nya enak bangetttt mba, bakal ketagihan dan langganan ini 👍😁😁'
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135823.png',
    name: 'User 3',
    text: 'Dimsum paling enak yang pernah saya coba! Teksturnya pas, rasanya mantap, dan harganya sangat terjangkau.'
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
    name: 'User 4',
    text: 'Sebagai reseller, saya sangat puas dengan kualitas produk dan pelayanan dari Dàmel Dimsum. Recommended banget! 🔥'
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
    name: 'User 5',
    text: 'Sebagai reseller, saya sangat puas dengan kualitas produk dan pelayanan dari Dàmel Dimsum. Recommended banget! 🔥'
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135807.png',
    name: 'User 6',
    text: 'Anak-anak saya suka sekali dengan varian mentai nya! Harganya affordable dan rasanya juara 😊👍'
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
    name: 'User 7',
    text: 'Sebagai reseller, saya sangat puas dengan kualitas produk dan pelayanan dari Dàmel Dimsum. Recommended banget! 🔥'
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135755.png',
    name: 'User 8',
    text: 'Gak nyesel beli dimsum disini, porsinya banyak, enak, fresh, dan harganya ramah di kantong! 💯'
  }
];

const totalSlides = computed(() => {
  return isMobile.value ? testimonials.length : Math.ceil(testimonials.length / 2);
});

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % totalSlides.value;
};

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? totalSlides.value - 1 : currentSlide.value - 1;
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

let autoSlideInterval;

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);

  // Auto slide
  autoSlideInterval = setInterval(() => {
    nextSlide();
  }, 5000);

  // Animate on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeIn');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');

/* Font families */
.font-bebas {
  font-family: 'Bebas Neue', sans-serif;
}

/* Custom backgrounds */
.hero-bg-radial {
  background:
    radial-gradient(ellipse 80% 60% at 30% 50%, #a01010 0%, transparent 70%),
    radial-gradient(ellipse 60% 70% at 75% 40%, #6b0f0f 0%, transparent 65%),
    linear-gradient(145deg, #7a0c0c 0%, #3d0606 50%, #1a0505 100%);
}

.grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E") center/200px repeat;
  pointer-events: none;
}

.accent-underline::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #FB8C00, transparent);
  border-radius: 4px;
  opacity: 0.45;
  z-index: -1;
}

.bg-cta-gradient {
  background: linear-gradient(135deg, #E53935, #FB8C00);
}

.cta-shine::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.18));
  pointer-events: none;
}

.ring-border {
  box-shadow: inset 0 0 0 14px #FB8C00, inset 0 0 0 18px #E53935;
}

.glow-orange {
  background: radial-gradient(circle, rgba(251,140,0,0.55) 0%, transparent 65%);
}

.glow-red {
  background: radial-gradient(circle, rgba(229,57,53,0.35) 0%, transparent 60%);
}

/* Animations */
@keyframes orbFloat {
  to { transform: translate(30px, -25px) scale(1.08); }
}

@keyframes glowPulse {
  to { transform: scale(1.22); opacity: 0.8; }
}

@keyframes ringSpin {
  to { transform: rotate(360deg); }
}

@keyframes plateFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

@keyframes spiceFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.1); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes cardSlideLeft {
  from { opacity: 0; transform: translateX(-40px) translateY(16px); }
  to { opacity: 1; transform: translateX(0) translateY(0); }
}

@keyframes cardSlideRight {
  from { opacity: 0; transform: translateX(40px) translateY(16px); }
  to { opacity: 1; transform: translateX(0) translateY(0); }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation classes */
.animate-orb-float {
  animation: orbFloat 8s ease-in-out infinite alternate;
}

.animate-glow-pulse {
  animation: glowPulse 4s ease-in-out infinite alternate;
}

.animate-glow-pulse-reverse {
  animation: glowPulse 5s ease-in-out infinite alternate-reverse;
}

.animate-ring-spin {
  animation: ringSpin 30s linear infinite;
}

.animate-plate-float {
  animation: plateFloat 5s ease-in-out infinite;
}

.animate-spice-float {
  animation: spiceFloat 3.5s ease-in-out infinite;
}

.animate-spice-float-2 {
  animation: spiceFloat 4.2s 1s ease-in-out infinite;
}

.animate-spice-float-3 {
  animation: spiceFloat 3s 0.5s ease-in-out infinite;
}

.animate-spice-float-4 {
  animation: spiceFloat 5s 2s ease-in-out infinite;
}

.animate-fade-up {
  animation: fadeUp 0.7s 0.1s both;
}

.animate-fade-up-2 {
  animation: fadeUp 0.7s 0.2s both;
}

.animate-fade-up-3 {
  animation: fadeUp 0.7s 0.3s both;
}

.animate-fade-up-4 {
  animation: fadeUp 0.7s 0.4s both;
}

.animate-fade-up-5 {
  animation: fadeUp 0.7s 0.5s both;
}

.animate-card-slide-left {
  animation: cardSlideLeft 0.8s 0.6s both;
}

.animate-card-slide-right {
  animation: cardSlideRight 0.8s 0.75s both;
}

.animate-slideDown {
  animation: slideDown 0.5s ease;
}

/* Animation delays */
.animation-delay-3 {
  animation-delay: -3s;
}

.animation-delay-5 {
  animation-delay: -5s;
}

.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.animate-fadeIn {
  opacity: 1;
  transform: translateY(0);
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}

/* Smooth scroll */
</style>
