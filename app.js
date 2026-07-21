// GANTI DENGAN URL WEB APP GAS ANDA YANG BARU SETELAH DEPLOY!
const API_URL = 'https://script.google.com/macros/s/AKfycbwrPWOrKcPSdzxYXQ6Tkdc8z3qzVMj2rwszhPdqJgd9a-ADP8Iqyh2hfLos6t7UtB-iAw/exec';
let appData = null;


// ==========================================
// SINKRONISASI TOMBOL KEMBALI (BACK) ANDROID
// ==========================================
window.addEventListener('popstate', (e) => {
  if (document.body.classList.contains('swal2-shown')) {
    Swal.close(); 
    return; 
  }
  
  if (e.state && e.state.page) {
    if (e.state.page === 'dashboard') renderDashboard(true);
    else if (e.state.page === 'pembayaran') renderPembayaran(null, true);
    else if (e.state.page === 'laporan') renderLaporan('Uang Ujian', true);
    else if (e.state.page === 'setting') renderSetting(true);
  } else {
    renderDashboard(true);
  }
});

const nativeSwalFire = Swal.fire;
Swal.fire = function(...args) {
  // Hanya tambah histori JIKA sebelumnya tidak ada popup sama sekali
  if (!document.body.classList.contains('swal2-shown')) {
    history.pushState({ isPopup: true }, "", location.hash || "#");
  }
  
  return nativeSwalFire.apply(this, args).then((result) => {
    // Beri jeda 150ms. Jika berganti dari popup Loading ke Sukses, histori tidak akan dihapus
    setTimeout(() => {
      if (!document.body.classList.contains('swal2-shown') && history.state && history.state.isPopup) {
        history.back(); 
      }
    }, 150); 
    return result;
  });
};

// Pendaftaran Service Worker untuk PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(reg => console.log('Service Worker terdaftar', reg))
    .catch(err => console.log('Service Worker gagal', err));
}

// ==========================================
// KODE BARU: PENGATURAN PASSWORD SISTEM
// ==========================================
const PIN_SISTEM = "112233"; // Silakan ganti PIN ini sesuai keinginan Anda

// Fetch Data saat aplikasi dimuat (VERSI SELALU TERKUNCI)
window.onload = async () => {
  // Sistem akan langsung menahan layar dan memunculkan form login
  document.getElementById('login-screen').classList.remove('hidden');
};

// ==========================================
// KODE BARU: FUNGSI PROSES VERIFIKASI
// ==========================================
function prosesLogin() {
  const password = document.getElementById('inputPassword').value;
  
  if (password === PIN_SISTEM) {
    // Langsung buka aplikasi tanpa menyimpan jejak login di browser
    tampilkanAplikasiUtama();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Akses Ditolak',
      text: 'PIN yang Anda masukkan salah!',
      confirmButtonColor: '#0f766e'
    });
    document.getElementById('inputPassword').value = ''; // Kosongkan form otomatis
  }
}

async function tampilkanAplikasiUtama() {
  // Transisi UI dari Layar Kunci ke Aplikasi Utama
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  
  history.replaceState({ page: 'dashboard' }, "", "#beranda");
  
  try {
    const response = await fetch(API_URL);
    appData = await response.json();
    
    renderDashboard(true); 
  } catch (error) {
    Swal.fire('Error', 'Gagal memuat data dari server. Periksa koneksi Anda.', 'error');
  }
}

function renderDashboard(isBack = false) {
  if (!isBack) history.pushState({ page: 'dashboard' }, "", "#beranda");
  updateNav(0);
  if (!appData) return;
  
  const s = appData.statistik;
  const formatRupiah = (val) => val.toLocaleString('id-ID');

  // Ambil data pengeluaran dari server (jika belum ada, set 0)
  const keluarUjian = s.pengeluaranUjian || 0;
  const keluarRapor = s.pengeluaranRapor || 0;
  
  // Hitung Saldo Bersih
  const saldoUjian = s.pemasukanUjian - keluarUjian;
  const saldoRapor = s.pemasukanRapor - keluarRapor;

  const html = `
    <div class="fade-in px-5">
      <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex justify-center items-center text-xl"><i class="fas fa-users"></i></div>
        <div>
          <p class="text-xs text-gray-500 font-semibold uppercase">Total Santri Aktif</p>
          <h2 class="text-2xl font-bold text-gray-800">${s.totalSantri} Orang</h2>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4">
        <div class="flex justify-between items-center mb-3 border-b pb-2">
          <h3 class="font-bold text-gray-700">Kas Ujian</h3>
          <span class="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold border border-emerald-100">Saldo: Rp ${formatRupiah(saldoUjian)}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="bg-blue-50 p-2 rounded-xl border border-blue-100"><p class="text-[9px] text-gray-500 uppercase mb-1">Total Masuk</p><p class="text-sm font-bold text-blue-600">Rp ${formatRupiah(s.pemasukanUjian)}</p></div>
          <div class="bg-red-50 p-2 rounded-xl border border-red-100"><p class="text-[9px] text-gray-500 uppercase mb-1">Total Keluar</p><p class="text-sm font-bold text-red-500">Rp ${formatRupiah(keluarUjian)}</p></div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4">
         <div class="flex justify-between items-center mb-3 border-b pb-2">
          <h3 class="font-bold text-gray-700">Kas Rapor</h3>
          <span class="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold border border-emerald-100">Saldo: Rp ${formatRupiah(saldoRapor)}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="bg-blue-50 p-2 rounded-xl border border-blue-100"><p class="text-[9px] text-gray-500 uppercase mb-1">Total Masuk</p><p class="text-sm font-bold text-blue-600">Rp ${formatRupiah(s.pemasukanRapor)}</p></div>
          <div class="bg-red-50 p-2 rounded-xl border border-red-100"><p class="text-[9px] text-gray-500 uppercase mb-1">Total Keluar</p><p class="text-sm font-bold text-red-500">Rp ${formatRupiah(keluarRapor)}</p></div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('app-content').innerHTML = html;
}

// ==========================================
// HALAMAN SANTRI (DENGAN DROPDOWN FILTER CERDAS)
// ==========================================
let filterTingkat = 'Semua';

function renderPembayaran(filterManual = null, isBack = false) {
  // Tambahkan baris ini
  if (!isBack) history.pushState({ page: 'pembayaran' }, "", "#santri");
  
  updateNav(1);
  if (!appData) return;
  if (filterManual) filterTingkat = filterManual; 
  
  const uniqueClasses = [...new Set(appData.santri.map(s => s.kelas))].sort();

  // 2. Terapkan Filter
  let dataSantri = appData.santri;
  if (filterTingkat !== 'Semua') {
    // Ubah ke uppercase agar pencarian tidak sensitif huruf besar/kecil
    dataSantri = dataSantri.filter(s => s.kelas.toUpperCase().includes(filterTingkat.toUpperCase()));
  }

// PERBAIKAN: Gunakan kurung kurawal agar bisa memanipulasi string
  const listHTML = dataSantri.map((s, index) => {
    
    // Mengamankan tanda kutip agar tidak memotong kode JavaScript
    const namaAman = s.nama.replace(/'/g, "\\'");
    const kelasAman = s.kelas.replace(/'/g, "\\'");
    
    return `
    <div class="santri-card bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-3 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer" onclick="bukaFormPembayaran('${namaAman}', '${kelasAman}')">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 min-w-[40px] bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm border border-teal-100">
          ${index + 1}
        </div>
        <div>
          <h4 class="font-bold text-sm">${s.nama}</h4>
          <p class="text-xs text-gray-500">${s.nis} • ${s.kelas}</p>
        </div>
      </div>
      
      <button onclick="lihatRiwayat('${namaAman}', event)" class="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold border border-blue-100 hover:bg-blue-500 hover:text-white transition-colors shadow-sm flex items-center gap-1 z-10">
        <i class="fas fa-history"></i> Riwayat
      </button>
      
    </div>
  `}).join('');

  document.getElementById('app-content').innerHTML = `
   <div class="max-w-2xl mx-auto pb-20 pt-4 px-7">
      <div class="relative mb-4">
        <select onchange="renderPembayaran(this.value)" class="w-full bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-emerald-500 appearance-none cursor-pointer">
          <option value="Semua" ${filterTingkat === 'Semua' ? 'selected' : ''}>📋 Semua Data Santri</option>
          <optgroup label="Tingkatan">
            <option value="TK" ${filterTingkat === 'TK' ? 'selected' : ''}>🏫 TK</option>
            <option value="IBT" ${filterTingkat === 'IBT' ? 'selected' : ''}>🏫 Ibtidaiyah (IBT)</option>
            <option value="SANA" ${filterTingkat === 'SANA' ? 'selected' : ''}>🏫 Sanawiyah (SANA)</option>
          </optgroup>
         <optgroup label="Kelas Spesifik - TK">
            ${uniqueClasses.filter(c => c.toUpperCase().includes('TK')).map(c => `<option value="${c}" ${filterTingkat === c ? 'selected' : ''}>📌 ${c}</option>`).join('')}
          </optgroup>
          <optgroup label="Kelas Spesifik - Ibtidaiyah">
            ${uniqueClasses.filter(c => c.toUpperCase().includes('IBT')).map(c => `<option value="${c}" ${filterTingkat === c ? 'selected' : ''}>📌 ${c}</option>`).join('')}
          </optgroup>
          <optgroup label="Kelas Spesifik - Sanawiyah">
            ${uniqueClasses.filter(c => c.toUpperCase().includes('SANA')).map(c => `<option value="${c}" ${filterTingkat === c ? 'selected' : ''}>📌 ${c}</option>`).join('')}
          </optgroup>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-500">
          <i class="fas fa-chevron-down"></i>
        </div>
      </div>

      <div class="flex items-center gap-2 mb-6">
        <div class="relative flex-1">
          <i class="fas fa-search absolute left-4 top-3.5 text-gray-400 text-sm"></i>
          <input type="text" id="inputPencarian" onkeyup="filterSantri()" placeholder="Cari nama atau NIS..." 
                 class="w-full bg-white border border-gray-100 shadow-sm rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
        </div>
        <button onclick="bukaFormImport()" 
                class="bg-white border border-gray-100 shadow-sm text-blue-600 px-4 py-3.5 rounded-2xl hover:bg-blue-50 transition-all group">
          <i class="fas fa-file-import text-lg group-hover:scale-110 transition-transform"></i>
        </button>
      </div>
      
      ${dataSantri.length === 0 ? '<p class="text-center text-sm text-gray-400 py-10">Data tidak ditemukan.</p>' : ''}
      <div class="pb-10" id="listSantri">${listHTML}</div>
    </div>
  `;
}

// ==========================================
// FUNGSI POP-UP INPUT PEMBAYARAN
// ==========================================
function bukaFormPembayaran(nama = '', kelas = '') {
  Swal.fire({
    title: 'Input Pembayaran',
    html: `
      <div class="text-left mt-2">
        <label class="block text-xs font-bold mb-1">Nama Santri</label>
        <input id="swal-nama" class="w-full border rounded-xl p-2 mb-3 bg-gray-50 text-sm" value="${nama}" readonly>
        
        <input type="hidden" id="swal-kelas" value="${kelas}">
        
        <label class="block text-xs font-bold mb-1">Jenis</label>
        <select id="swal-jenis" class="w-full border rounded-xl p-2 mb-3 bg-white text-sm">
          <option value="Uang Ujian">Uang Ujian</option>
          <option value="Uang Rapor">Uang Rapor</option>
        </select>
        
        <label class="block text-xs font-bold mb-1">Nominal</label>
        <input id="swal-nominal" type="text" class="w-full border rounded-xl p-2 mb-3 text-sm font-bold text-teal-600" placeholder="Contoh: 10.000" oninput="formatRupiah(this)">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    confirmButtonColor: '#10b981',
    position: 'bottom',
    customClass: { popup: 'rounded-t-3xl' }
  }).then((result) => {
    if (result.isConfirmed) simpanData();
  });
}

// Fungsi ini bekerja real-time mendeteksi setiap ketikan keyboard
function formatRupiah(input) {
  // Hapus semua huruf/simbol, sisakan angka saja
  let angka = input.value.replace(/[^0-9]/g, '');
  // Tambahkan titik setiap 3 digit
  input.value = angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ==========================================
// FUNGSI SIMPAN DATA (DENGAN AUTO-REFRESH & VALIDASI)
// ==========================================
async function simpanData() {
  const namaInput = document.getElementById('swal-nama')?.value;
  const kelasInput = document.getElementById('swal-kelas')?.value;
  const jenisInput = document.getElementById('swal-jenis')?.value;
  const nominalInput = Number(document.getElementById('swal-nominal')?.value.replace(/\./g, ''));

  if (appData && appData.pembayaran) {
    const setting = getPengaturanBiaya();
    const kelasTeks = kelasInput.toUpperCase();
    let target = 0;
    
    if (jenisInput === "Uang Ujian") {
      if (kelasTeks.includes("TK")) target = setting.tk_ujian;
      else if (kelasTeks.includes("IBT")) target = setting.ibt_ujian;
      else if (kelasTeks.includes("SANA")) target = setting.sana_ujian;
    } else {
      if (kelasTeks.includes("TK")) target = setting.tk_rapor;
      else if (kelasTeks.includes("IBT")) target = setting.ibt_rapor;
      else if (kelasTeks.includes("SANA")) target = setting.sana_rapor;
    }

    const riwayatSantri = appData.pembayaran.filter(p => p.nama === namaInput && p.jenis === jenisInput);
    const totalTerbayar = riwayatSantri.reduce((sum, r) => sum + r.nominal, 0);
    
    if (totalTerbayar >= target) {
      Swal.fire({ icon: 'error', title: 'Sudah Lunas!', html: `Santri <b>${namaInput}</b> sudah LUNAS untuk <b>${jenisInput}</b>.` });
      return;
    }

    if ((totalTerbayar + nominalInput) > target) {
      let sisa = target - totalTerbayar;
      Swal.fire({ icon: 'warning', title: 'Nominal Berlebih!', html: `Tagihan <b>${jenisInput}</b> tersisa <b>Rp ${sisa.toLocaleString('id-ID')}</b>. Jangan input lebih dari ini.` });
      return;
    }
  }

  const payload = {
    action: 'simpan_pembayaran',
    data: { nama: namaInput, kelas: kelasInput, jenis: jenisInput, nominal: nominalInput }
  };

  // ANIMASI LOADING KEREN 1: Mengirim Data
  Swal.fire({ 
    title: 'Menyimpan Transaksi...', 
    html: 'Mohon tunggu, data sedang dikirim ke server.',
    allowOutsideClick: false, 
    showConfirmButton: false,
    didOpen: () => { Swal.showLoading() }
  });
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    
    const textResponse = await response.text();
    const result = JSON.parse(textResponse);
    
    if(result.success) {
      // ANIMASI LOADING KEREN 2: Sinkronisasi Layar
      Swal.fire({ 
        title: 'Memperbarui Data...', 
        html: 'Transaksi berhasil! Menyinkronkan tampilan...',
        allowOutsideClick: false, 
        showConfirmButton: false,
        didOpen: () => { Swal.showLoading() }
      });
      
      // Ambil data baru secara diam-diam
      await muatUlangDataTanpaReload();
      
      // Munculkan Centang Hijau (tanpa reload page!)
      Swal.fire({ 
        icon: 'success', 
        title: 'Sukses!', 
        text: result.message, 
        timer: 2000, 
        showConfirmButton: false 
      });
    } else {
      Swal.fire('Gagal', result.message, 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Data gagal terkirim. Coba lagi.', 'error');
  }
}

// ==========================================
// FUNGSI LIHAT RIWAYAT (MENAMPILKAN SISA CICILAN)
// ==========================================
function lihatRiwayat(namaSantri, event) {
  if (event) event.stopPropagation(); 
  if (!appData || !appData.pembayaran) return;
  
  const riwayatSantri = appData.pembayaran.filter(p => p.nama === namaSantri);
  const santri = appData.santri.find(s => s.nama === namaSantri);
  const kelas = santri ? santri.kelas.toUpperCase() : "";
  
  const setting = getPengaturanBiaya();
  let targetUjian = 0, targetRapor = 0;
  
  if (kelas.includes('TK')) { targetUjian = setting.tk_ujian; targetRapor = setting.tk_rapor; }
  else if (kelas.includes('IBT')) { targetUjian = setting.ibt_ujian; targetRapor = setting.ibt_rapor; }
  else if (kelas.includes('SANA')) { targetUjian = setting.sana_ujian; targetRapor = setting.sana_rapor; }
  
  let totalUjian = riwayatSantri.filter(r => r.jenis === 'Uang Ujian').reduce((sum, r) => sum + r.nominal, 0);
  let totalRapor = riwayatSantri.filter(r => r.jenis === 'Uang Rapor').reduce((sum, r) => sum + r.nominal, 0);
  
  let sisaUjian = targetUjian - totalUjian;
  let sisaRapor = targetRapor - totalRapor;

  let infoSisaPanel = `
    <div class="bg-emerald-50 p-3 rounded-xl mb-4 border border-emerald-100 flex justify-between text-left shadow-sm">
      <div class="flex-1 border-r border-emerald-200 pr-2">
        <p class="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sisa Ujian</p>
        <p class="text-sm font-bold ${sisaUjian <= 0 ? 'text-emerald-600' : 'text-red-500'}">
          ${sisaUjian <= 0 ? '<i class="fas fa-check-circle"></i> LUNAS' : 'Rp ' + sisaUjian.toLocaleString('id-ID')}
        </p>
      </div>
      <div class="flex-1 pl-3">
        <p class="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sisa Rapor</p>
        <p class="text-sm font-bold ${sisaRapor <= 0 ? 'text-emerald-600' : 'text-red-500'}">
          ${sisaRapor <= 0 ? '<i class="fas fa-check-circle"></i> LUNAS' : 'Rp ' + sisaRapor.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  `;

  let listRiwayatHTML = '';
  if (riwayatSantri.length === 0) {
    listRiwayatHTML = `<div class="text-center py-4"><p class="text-xs text-gray-400">Belum ada cicilan/pembayaran.</p></div>`;
  } else {
    listRiwayatHTML = riwayatSantri.map(r => `
      <div class="flex justify-between items-center border-b border-gray-100 py-3 last:border-0">
        <div class="text-left">
          <p class="text-xs font-bold text-gray-800 uppercase">${r.jenis}</p>
          <p class="text-[10px] text-gray-400 mt-0.5"><i class="far fa-calendar-alt"></i> ${new Date(r.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</p>
        </div>
        <div class="text-right font-bold text-emerald-600 text-sm flex items-center gap-3">
          <span>+ Rp ${r.nominal.toLocaleString('id-ID')}</span>
          <button onclick="konfirmasiHapus(${r.row})" class="text-red-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  Swal.fire({
    title: `<div class="text-base text-gray-800 pt-2 font-bold"><i class="fas fa-history text-blue-500 mr-1"></i> Detail Pembayaran</div>`,
    html: `
      <p class="text-xs text-gray-500 mb-3 font-bold border-b pb-2">${namaSantri}</p>
      ${infoSisaPanel}
      <p class="text-[10px] font-bold text-gray-400 uppercase text-left mb-1 px-1">Riwayat Cicilan</p>
      <div class="max-h-56 overflow-y-auto hide-scroll bg-white p-3 rounded-2xl shadow-inner border border-gray-100">
        ${listRiwayatHTML}
      </div>
    `,
    showCloseButton: true,
    showConfirmButton: false,
    customClass: { popup: 'rounded-[32px] bg-gray-50' }
  });
} // <---- INI ADALAH PENUTUP KURUNG KURAWAL YANG SEBELUMNYA HILANG!

// ==========================================
// FUNGSI HAPUS (Dikeluarkan agar bisa diakses HTML)
// ==========================================
function konfirmasiHapus(rowIndex) {
  Swal.fire({
    title: 'Hapus Transaksi?',
    text: "Data ini akan dihapus dari database secara permanen.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      kirimHapusKeServer(rowIndex);
    }
  });
}

async function kirimHapusKeServer(index) {
  Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'hapus_pembayaran', data: { index: index } })
    });
    location.reload(); // Refresh setelah hapus
  } catch (error) {
    Swal.fire('Error', 'Gagal menghapus data', 'error');
  }
}

// ==========================================
// FITUR PENCARIAN & IMPORT EXCEL
// ==========================================
function filterSantri() {
  const keyword = document.getElementById('inputPencarian').value.toLowerCase();
  const cards = document.querySelectorAll('.santri-card');
  
  cards.forEach(card => {
    const textData = card.innerText.toLowerCase();
    if (textData.includes(keyword)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

function updateNav(index) {
  const btns = document.querySelectorAll('.nav-btn');
  btns.forEach((btn, i) => {
    btn.className = i === index 
      ? 'nav-btn text-emerald-600 flex flex-col items-center gap-1' 
      : 'nav-btn text-gray-400 flex flex-col items-center gap-1 hover:text-emerald-500 transition-colors';
  });
}

function bukaFormImport() {
  Swal.fire({
    title: 'Import Data Santri',
    html: `
      <div class="text-left mt-2 text-sm">
        <p class="text-xs text-gray-500 mb-3">Pilih file Excel (.xlsx) atau CSV. Pastikan baris pertama (Header) berisi kolom: <b>NIS</b>, <b>Nama</b>, <b>Kelas</b>.</p>
        <input type="file" id="fileImport" accept=".xlsx, .xls, .csv" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Proses Import',
    confirmButtonColor: '#10b981',
    preConfirm: () => {
      const file = document.getElementById('fileImport').files[0];
      if (!file) {
        Swal.showValidationMessage('Silakan pilih file terlebih dahulu');
        return false;
      }
      return file;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      prosesImportExcel(result.value);
    }
  });
}

function prosesImportExcel(file) {
  const reader = new FileReader();
  Swal.fire({ title: 'Membaca File...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() }});

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const namaSheetPertama = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[namaSheetPertama];
    
    const rawJSON = XLSX.utils.sheet_to_json(worksheet);
    if (rawJSON.length === 0) {
      Swal.fire('File Kosong', 'Tidak ada data di dalam file Excel.', 'error');
      return;
    }

    const normalizedData = rawJSON.map(row => {
      const newRow = {};
      for (let key in row) {
        newRow[key.toString().toUpperCase().trim()] = row[key];
      }
      return newRow;
    });
    
    if (!normalizedData[0].NIS || !normalizedData[0].NAMA || !normalizedData[0].KELAS) {
      Swal.fire('Format Salah', 'Pastikan baris pertama memiliki kolom: NIS, NAMA, dan KELAS', 'error');
      return;
    }

    const dataSantri = normalizedData.map(row => ({
      NIS: row.NIS,
      Nama: row.NAMA,
      Kelas: row.KELAS
    }));

    kirimDataImportKeServer(dataSantri);
  };

  reader.readAsArrayBuffer(file);
}

async function kirimDataImportKeServer(dataSantri) {
  Swal.fire({ title: 'Mengupload Data...', text: `Memproses ${dataSantri.length} baris`, allowOutsideClick: false, didOpen: () => { Swal.showLoading() }});
  
  const payload = {
    action: 'import_santri',
    data: dataSantri
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.success) {
      Swal.fire('Sukses', result.message, 'success').then(() => location.reload());
    } else {
      Swal.fire('Gagal', result.message, 'error');
    }
  } catch (error) {
    Swal.fire('Info Jaringan', 'Data terkirim, namun respons browser terblokir CORS. Silakan refresh dan cek database.', 'info');
  }
}

// ==========================================
// FITUR LAPORAN & GRAFIK
// ==========================================
function renderLaporan(tabAktif = 'Uang Ujian', isBack = false) {
  // Tambahkan baris ini
  if (!isBack) history.pushState({ page: 'laporan' }, "", "#laporan");
  
  updateNav(3); 
  if (!appData) return;

  const dataBayar = appData.pembayaran || [];
  const dataTerfilter = tabAktif === 'Semua' ? dataBayar : dataBayar.filter(d => d.jenis === tabAktif);
  
  const settingBiaya = getPengaturanBiaya();
  let totalTarget = 0;

  appData.santri.forEach(s => {
    const teksKelas = s.kelas.toUpperCase();
    let biayaUjian = 0, biayaRapor = 0;

    if (teksKelas.includes('TK')) { biayaUjian = settingBiaya.tk_ujian; biayaRapor = settingBiaya.tk_rapor; }
    else if (teksKelas.includes('IBT')) { biayaUjian = settingBiaya.ibt_ujian; biayaRapor = settingBiaya.ibt_rapor; }
    else if (teksKelas.includes('SANA')) { biayaUjian = settingBiaya.sana_ujian; biayaRapor = settingBiaya.sana_rapor; }

    if (tabAktif === 'Semua') totalTarget += (biayaUjian + biayaRapor);
    else if (tabAktif === 'Uang Ujian') totalTarget += biayaUjian;
    else if (tabAktif === 'Uang Rapor') totalTarget += biayaRapor;
  });

  const totalMasuk = dataTerfilter.reduce((sum, item) => sum + item.nominal, 0);
  const totalSisa = totalTarget - totalMasuk;
  const persentase = totalTarget === 0 ? 0 : Math.round((totalMasuk / totalTarget) * 100);

document.getElementById('app-content').innerHTML = `
<div class="max-w-2xl mx-auto pb-12 pt-4 px-7">
      <div class="flex bg-gray-200/70 p-1.5 rounded-2xl mb-6 shadow-inner">
        <button onclick="renderLaporan('Uang Ujian')" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${tabAktif === 'Uang Ujian' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Ujian</button>
        <button onclick="renderLaporan('Uang Rapor')" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${tabAktif === 'Uang Rapor' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Rapor</button>
      </div>

      <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[32px] p-7 shadow-xl shadow-emerald-200 mb-8 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full blur-xl -ml-5 -mb-5"></div>
        <div class="relative z-10">
            <p class="text-emerald-100 text-[11px] font-medium uppercase tracking-widest mb-1">Sisa Kekurangan</p>
            <h2 class="text-3xl font-extrabold text-white mb-6">Rp ${(totalSisa).toLocaleString('id-ID')}</h2>
            <div class="mb-6">
                <div class="flex justify-between text-[11px] text-emerald-100 mb-2 font-medium">
                    <span>Progress Pembayaran</span><span class="font-bold text-white">${persentase}%</span>
                </div>
                <div class="w-full bg-emerald-900/40 rounded-full h-2.5">
                    <div class="bg-white h-2.5 rounded-full transition-all duration-1000 shadow-sm" style="width: ${persentase}%"></div>
                </div>
            </div>
            <div class="flex justify-between items-center border-t border-emerald-400/30 pt-4">
                <div>
                    <p class="text-[10px] text-emerald-200 uppercase tracking-wider mb-1">Total Target</p>
                    <p class="text-sm font-bold text-white">Rp ${(totalTarget/1000).toLocaleString('id-ID')}K</p>
                </div>
                <div class="w-px h-8 bg-emerald-400/30"></div>
                <div class="text-right">
                    <p class="text-[10px] text-emerald-200 uppercase tracking-wider mb-1">Total Masuk</p>
                    <p class="text-sm font-bold text-white">Rp ${(totalMasuk/1000).toLocaleString('id-ID')}K</p>
                </div>
            </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 mb-8">
        <h3 class="text-[11px] font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2"><i class="fas fa-chart-pie text-emerald-500 text-sm"></i> Statistik Pembayaran</h3>
        <div class="relative h-48 w-full flex justify-center"><canvas id="laporanChart"></canvas></div>
      </div>

      <div>
        <h3 class="text-[11px] font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2"><i class="fas fa-history text-emerald-500 text-sm"></i> Riwayat Transaksi Terbaru</h3>
        ${dataTerfilter.length === 0 ? '<div class="text-center py-10 text-xs text-gray-400">Belum ada transaksi.</div>' : ''}
     
	 <div class="flex flex-col gap-3">
          ${dataTerfilter.map((t, index) => {
            // 1. Ambil target biaya berdasarkan kelas dan jenis transaksi
            let target = 0;
            const kelasTeks = t.kelas.toUpperCase();
            if (t.jenis === 'Uang Ujian') {
              if (kelasTeks.includes('TK')) target = settingBiaya.tk_ujian;
              else if (kelasTeks.includes('IBT')) target = settingBiaya.ibt_ujian;
              else if (kelasTeks.includes('SANA')) target = settingBiaya.sana_ujian;
            } else {
              if (kelasTeks.includes('TK')) target = settingBiaya.tk_rapor;
              else if (kelasTeks.includes('IBT')) target = settingBiaya.ibt_rapor;
              else if (kelasTeks.includes('SANA')) target = settingBiaya.sana_rapor;
            }

            // 2. Hitung total yang sudah dibayar santri ini untuk jenis transaksi tersebut (sampai saat ini)
            const totalTerbayar = dataBayar
              .filter(p => p.nama === t.nama && p.jenis === t.jenis)
              .reduce((sum, p) => sum + p.nominal, 0);

            // 3. Tentukan warna berdasarkan status lunas atau nyicil
            const isLunas = totalTerbayar >= target;
            const warnaTeks = isLunas ? 'text-emerald-600' : 'text-orange-500';
            const warnaIkon = isLunas ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-500 border-orange-100';

            return `
            <div class="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex justify-between items-center overflow-hidden">
              
              <!-- Bagian Kiri: Nomor, Nama, dan Tanggal -->
              <div class="flex items-center gap-3.5 flex-1 min-w-0">
                <div class="w-10 h-10 min-w-[40px] rounded-full ${warnaIkon} flex items-center justify-center font-bold text-sm border">
                  ${index + 1}
                </div>
                <div class="truncate">
                  <h4 class="font-bold text-sm text-gray-800 truncate">${t.nama}</h4>
                  <p class="text-[10px] text-gray-400 mt-0.5 truncate">${t.kelas} • ${new Date(t.tanggal).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              
              <!-- Bagian Kanan: Nominal dan Jenis -->
              <div class="text-right flex-shrink-0 ml-3">
                <p class="text-sm font-bold ${warnaTeks}">+ Rp ${t.nominal.toLocaleString('id-ID')}</p>
                <p class="text-[9px] font-medium text-gray-400 mt-1 uppercase tracking-wider">${t.jenis}</p>
              </div>
              
            </div>
          `}).join('')}
        </div>
	 
      </div>
    </div>
  `;
  renderChart(totalMasuk, totalSisa);
}

function renderChart(masuk, sisa) {
    const ctx = document.getElementById('laporanChart');
    if (!ctx) return;

    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    if (masuk === 0 && sisa === 0) sisa = 1; 

    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Dana Masuk', 'Kekurangan Target'],
            datasets: [{
                data: [masuk, sisa],
                backgroundColor: ['#10b981', '#f3f4f6'],
                borderWidth: 0,
                hoverOffset: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 11, family: "'Inter', sans-serif" }, color: '#6b7280' } },
                tooltip: { callbacks: { label: function(context) { let label = context.label || ''; if (label) { label += ': Rp '; } if (context.parsed !== null) { label += context.parsed.toLocaleString('id-ID'); } return label; } } }
            }
        }
    });
}

// ==========================================
// PENGATURAN BIAYA (TERHUBUNG KE GOOGLE SHEETS)
// ==========================================
function getPengaturanBiaya() {
  return appData.setting || {
    tk_ujian: 50000, tk_rapor: 40000,
    ibt_ujian: 100000, ibt_rapor: 75000,
    sana_ujian: 150000, sana_rapor: 100000
  };
}

function renderSetting(isBack = false) {
  if (!isBack) history.pushState({ page: 'setting' }, "", "#pengaturan");
  
  updateNav(4); 
  const setting = getPengaturanBiaya();
  
  const html = `
   <div class="max-w-2xl mx-auto pb-24 pt-4 px-7">
    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-sliders-h text-emerald-500"></i> Pengaturan Biaya
      </h2>
      
      <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <p class="text-xs text-gray-500 mb-4">Atur nominal tagihan otomatis berdasarkan tingkatan santri.</p>
        
        <h3 class="text-sm font-bold text-gray-700 mt-4 mb-2 bg-emerald-50 p-2 rounded-lg"><i class="fas fa-child text-emerald-600 mr-2"></i> Tingkat TK</h3>
        <div class="grid grid-cols-2 gap-3 mb-2">
          <div><label class="text-[10px] font-bold text-gray-400 uppercase">Uang Ujian</label><input type="text" id="set_tk_ujian" value="${setting.tk_ujian.toLocaleString('id-ID')}" oninput="formatRupiah(this)" class="w-full mt-1 border rounded-xl p-2 text-sm bg-gray-50 font-bold text-teal-600"></div>
          <div><label class="text-[10px] font-bold text-gray-400 uppercase">Uang Rapor</label><input type="text" id="set_tk_rapor" value="${setting.tk_rapor.toLocaleString('id-ID')}" oninput="formatRupiah(this)" class="w-full mt-1 border rounded-xl p-2 text-sm bg-gray-50 font-bold text-teal-600"></div>
        </div>

        <h3 class="text-sm font-bold text-gray-700 mt-6 mb-2 bg-blue-50 p-2 rounded-lg"><i class="fas fa-book-reader text-blue-600 mr-2"></i> Tingkat Ibtidaiyah (IBT)</h3>
        <div class="grid grid-cols-2 gap-3 mb-2">
          <div><label class="text-[10px] font-bold text-gray-400 uppercase">Uang Ujian</label><input type="text" id="set_ibt_ujian" value="${setting.ibt_ujian.toLocaleString('id-ID')}" oninput="formatRupiah(this)" class="w-full mt-1 border rounded-xl p-2 text-sm bg-gray-50 font-bold text-teal-600"></div>
          <div><label class="text-[10px] font-bold text-gray-400 uppercase">Uang Rapor</label><input type="text" id="set_ibt_rapor" value="${setting.ibt_rapor.toLocaleString('id-ID')}" oninput="formatRupiah(this)" class="w-full mt-1 border rounded-xl p-2 text-sm bg-gray-50 font-bold text-teal-600"></div>
        </div>

        <h3 class="text-sm font-bold text-gray-700 mt-6 mb-2 bg-orange-50 p-2 rounded-lg"><i class="fas fa-user-graduate text-orange-600 mr-2"></i> Tingkat Sanawiyah (SANA)</h3>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div><label class="text-[10px] font-bold text-gray-400 uppercase">Uang Ujian</label><input type="text" id="set_sana_ujian" value="${setting.sana_ujian.toLocaleString('id-ID')}" oninput="formatRupiah(this)" class="w-full mt-1 border rounded-xl p-2 text-sm bg-gray-50 font-bold text-teal-600"></div>
          <div><label class="text-[10px] font-bold text-gray-400 uppercase">Uang Rapor</label><input type="text" id="set_sana_rapor" value="${setting.sana_rapor.toLocaleString('id-ID')}" oninput="formatRupiah(this)" class="w-full mt-1 border rounded-xl p-2 text-sm bg-gray-50 font-bold text-teal-600"></div>
        </div>

        <button onclick="simpanSettingBiaya()" class="w-full bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-700 transition shadow-md mt-2">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  `;
  document.getElementById('app-content').innerHTML = html;
}

async function simpanSettingBiaya() {
  const payload = {
    action: 'simpan_setting',
    data: {
      tk_ujian: Number(document.getElementById('set_tk_ujian').value.replace(/\./g, '')),
      tk_rapor: Number(document.getElementById('set_tk_rapor').value.replace(/\./g, '')),
      ibt_ujian: Number(document.getElementById('set_ibt_ujian').value.replace(/\./g, '')),
      ibt_rapor: Number(document.getElementById('set_ibt_rapor').value.replace(/\./g, '')),
      sana_ujian: Number(document.getElementById('set_sana_ujian').value.replace(/\./g, '')),
      sana_rapor: Number(document.getElementById('set_sana_rapor').value.replace(/\./g, '')),
    }
  };
  
  Swal.fire({ title: 'Menyimpan ke Server...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() }});
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
      body: JSON.stringify(payload)
    });
    
    const textResponse = await response.text(); 
    let result;
    
    try {
      result = JSON.parse(textResponse);
    } catch (e) {
      throw new Error("Respon server salah. Cek URL API atau pengaturan Deploy Anda.");
    }
    
    if (result.success) {
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: result.message, timer: 2000, showConfirmButton: false }).then(() => {
        location.reload(); 
      });
    } else {
      Swal.fire('Gagal dari Server', result.message, 'error');
    }
  } catch (error) {
    Swal.fire('Gagal Terkirim', 'Error: ' + error.message, 'error');
  }
}

// ==========================================
// FUNGSI TRANSAKSI CEPAT (TOMBOL PLUS)
// ==========================================
function bukaTransaksiCepat() {
  Swal.fire({
    title: 'Pilih Jenis Transaksi',
    html: `
      <div class="grid grid-cols-2 gap-3 mt-4">
        <div onclick="bukaInputPemasukan()" class="bg-teal-50 border border-teal-200 p-4 rounded-2xl cursor-pointer hover:bg-teal-100 transition-colors flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl shadow-md"><i class="fas fa-hand-holding-usd"></i></div>
          <p class="text-xs font-bold text-teal-800 text-center mt-1">Terima<br>Pembayaran</p>
        </div>
        <div onclick="bukaInputPengeluaran()" class="bg-red-50 border border-red-200 p-4 rounded-2xl cursor-pointer hover:bg-red-100 transition-colors flex flex-col items-center gap-2">
           <div class="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-xl shadow-md"><i class="fas fa-file-invoice-dollar"></i></div>
          <p class="text-xs font-bold text-red-800 text-center mt-1">Catat<br>Pengeluaran</p>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    position: 'bottom',
    customClass: { popup: 'rounded-t-3xl' }
  });
}

// Fungsi Pemasukan memanggil form lama Anda
function bukaInputPemasukan() {
  Swal.close(); 
  setTimeout(() => {
    // Isi dari fungsi bukaTransaksiCepat Anda yang lama dipindahkan ke sini
    if (!appData || !appData.santri) return;
    const uniqueClasses = [...new Set(appData.santri.map(s => s.kelas))].sort();
    let optionsKelas = '<option value="" disabled selected>-- Pilih Kelas --</option>';
    uniqueClasses.forEach(c => { optionsKelas += `<option value="${c}">${c}</option>`; });

    Swal.fire({
      title: 'Terima Pembayaran',
      html: `
        <div class="text-left mt-2">
          <label class="block text-xs font-bold mb-1">Pilih Kelas</label>
          <select id="swal-kelas" class="w-full border rounded-xl p-2 mb-3 bg-white text-sm cursor-pointer" onchange="updateDropdownSantri(this.value)">${optionsKelas}</select>
          <label class="block text-xs font-bold mb-1">Nama Santri</label>
          <select id="swal-nama" class="w-full border rounded-xl p-2 mb-3 bg-gray-100 text-sm cursor-not-allowed" disabled><option value="">Pilih kelas terlebih dahulu...</option></select>
          <label class="block text-xs font-bold mb-1">Jenis</label>
          <select id="swal-jenis" class="w-full border rounded-xl p-2 mb-3 bg-white text-sm cursor-pointer">
            <option value="Uang Ujian">Uang Ujian</option>
            <option value="Uang Rapor">Uang Rapor</option>
          </select>
          <label class="block text-xs font-bold mb-1">Nominal</label>
          <input id="swal-nominal" type="text" class="w-full border rounded-xl p-2 mb-3 text-sm font-bold text-teal-600" placeholder="Contoh: 50.000" oninput="formatRupiah(this)">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      confirmButtonColor: '#0d9488',
      position: 'bottom',
      customClass: { popup: 'rounded-t-3xl' },
      preConfirm: () => {
        if (!document.getElementById('swal-kelas').value || !document.getElementById('swal-nama').value || !document.getElementById('swal-nominal').value) {
          Swal.showValidationMessage('Harap lengkapi semua data!'); return false;
        }
      }
    }).then((result) => { if (result.isConfirmed) simpanData(); });
  }, 300); // Jeda agar transisi animasi mulus
}

// Fungsi Form Baru untuk Pengeluaran
function bukaInputPengeluaran() {
  Swal.close();
  setTimeout(() => {
    Swal.fire({
      title: 'Catat Pengeluaran',
      html: `
        <div class="text-left mt-2">
          <label class="block text-xs font-bold mb-1 text-red-600">Ambil dari Kas</label>
          <select id="swal-kategori-keluar" class="w-full border rounded-xl p-2 mb-3 bg-white text-sm cursor-pointer">
            <option value="Uang Ujian">Kas Ujian</option>
            <option value="Uang Rapor">Kas Rapor</option>
          </select>
          
          <label class="block text-xs font-bold mb-1 text-gray-700">Nominal Keluar</label>
          <input id="swal-nominal-keluar" type="text" class="w-full border rounded-xl p-2 mb-3 text-sm font-bold text-red-500" placeholder="Contoh: 50.000" oninput="formatRupiah(this)">
          
          <label class="block text-xs font-bold mb-1 text-gray-700">Keterangan / Rincian</label>
          <textarea id="swal-ket-keluar" class="w-full border rounded-xl p-2 mb-3 text-sm bg-gray-50 h-20" placeholder="Contoh: Biaya fotocopy soal ujian..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan Pengeluaran',
      confirmButtonColor: '#ef4444',
      position: 'bottom',
      customClass: { popup: 'rounded-t-3xl' },
      preConfirm: () => {
        if (!document.getElementById('swal-nominal-keluar').value || !document.getElementById('swal-ket-keluar').value) {
          Swal.showValidationMessage('Nominal dan Keterangan harus diisi!');
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) prosesSimpanPengeluaran();
    });
  }, 300);
}

// Proses Kirim ke Server
async function prosesSimpanPengeluaran() {
  const kategori = document.getElementById('swal-kategori-keluar').value;
  const nominal = Number(document.getElementById('swal-nominal-keluar').value.replace(/\./g, ''));
  const keterangan = document.getElementById('swal-ket-keluar').value;

  // ==========================================
  // VALIDASI SALDO (MENCEGAH MINUS)
  // ==========================================
  if (appData && appData.statistik) {
    let saldoTersedia = 0;
    
    // Hitung saldo riil saat ini berdasarkan kategori yang dipilih
    if (kategori === "Uang Ujian") {
      saldoTersedia = (appData.statistik.pemasukanUjian || 0) - (appData.statistik.pengeluaranUjian || 0);
    } else if (kategori === "Uang Rapor") {
      saldoTersedia = (appData.statistik.pemasukanRapor || 0) - (appData.statistik.pengeluaranRapor || 0);
    }

    // Jika nominal pengeluaran lebih besar dari saldo yang ada, blokir!
    if (nominal > saldoTersedia) {
      Swal.fire({
        icon: 'error',
        title: 'Saldo Tidak Cukup!',
        html: `Saldo Kas <b>${kategori}</b> saat ini hanya <b>Rp ${saldoTersedia.toLocaleString('id-ID')}</b>.<br>Penarikan dibatalkan agar kas tidak minus.`
      });
      return; // Hentikan kode agar data tidak terkirim ke server
    }
  }
  // ==========================================

  const payload = {
    action: 'simpan_pengeluaran',
    data: { kategori: kategori, nominal: nominal, keterangan: keterangan }
  };

  // LOADING 1
  Swal.fire({ 
    title: 'Mencatat Pengeluaran...', 
    html: 'Mohon tunggu, menyinkronkan dengan server.',
    allowOutsideClick: false, 
    showConfirmButton: false,
    didOpen: () => Swal.showLoading() 
  });
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if(result.success) {
      // LOADING 2
      Swal.fire({ 
        title: 'Memperbarui Saldo...', 
        allowOutsideClick: false, 
        showConfirmButton: false,
        didOpen: () => Swal.showLoading() 
      });
      
      // Panggil fungsi siluman
      await muatUlangDataTanpaReload();
      
      Swal.fire({ icon: 'success', title: 'Sukses', text: result.message, timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire('Gagal', result.message, 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Gagal menghubungi server.', 'error');
  }
}

// ==========================================
// FUNGSI PENDUKUNG: FILTER NAMA SANTRI OTOMATIS
// ==========================================
function updateDropdownSantri(kelasTerpilih) {
  const selectNama = document.getElementById('swal-nama');
  
  // Saring santri yang hanya ada di kelas terpilih, lalu urutkan sesuai abjad
  const santriFilter = appData.santri
    .filter(s => s.kelas === kelasTerpilih)
    .sort((a, b) => a.nama.localeCompare(b.nama));
  
  // Kosongkan dan isi ulang pilihan nama
  selectNama.innerHTML = '<option value="" disabled selected>-- Pilih Nama Santri --</option>';
  santriFilter.forEach(s => {
    selectNama.innerHTML += `<option value="${s.nama}">${s.nama}</option>`;
  });
  
  // Nyalakan kotak input (hapus blokir disabled)
  selectNama.disabled = false;
  selectNama.classList.remove('bg-gray-100', 'cursor-not-allowed');
  selectNama.classList.add('bg-white', 'cursor-pointer');
}

// ==========================================
// FUNGSI REFRESH DATA TANPA LAYAR PUTIH
// ==========================================
async function muatUlangDataTanpaReload() {
  try {
    const response = await fetch(API_URL);
    appData = await response.json();
    
    // Render ulang antarmuka yang sedang terbuka saja
    const hash = location.hash;
    if (hash === '#santri') renderPembayaran(filterTingkat, true);
    else if (hash === '#laporan') renderLaporan('Uang Ujian', true);
    else if (hash === '#pengaturan') renderSetting(true);
    else renderDashboard(true);
  } catch (error) {
    console.error("Gagal sinkronisasi background", error);
  }
}