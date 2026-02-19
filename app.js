// === KONFIGURASI ===
let myChart = null; // Variabel global untuk menyimpan instance Chart
let globalHistory = [];
let currentUserData = null;
// Default Settings: Terjemahan ON, Latin OFF
let quranSettings = JSON.parse(localStorage.getItem('user_quran_settings')) || {
    translation: true,
    latin: false
};          
// === DATA PETA AL-QURAN (Mapping Halaman ke Surah) ===
const quranMap = [
    [1, "Al-Fatihah"], [2, "Al-Baqarah"], [50, "Ali 'Imran"], [77, "An-Nisa'"],
    [106, "Al-Ma'idah"], [128, "Al-An'am"], [151, "Al-A'raf"], [177, "Al-Anfal"],
    [187, "At-Taubah"], [208, "Yunus"], [221, "Hud"], [235, "Yusuf"],
    [249, "Ar-Ra'd"], [255, "Ibrahim"], [262, "Al-Hijr"], [267, "An-Nahl"],
    [282, "Al-Isra'"], [293, "Al-Kahf"], [305, "Maryam"], [312, "Ta-Ha"],
    [322, "Al-Anbiya'"], [332, "Al-Hajj"], [342, "Al-Mu'minun"], [350, "An-Nur"],
    [359, "Al-Furqan"], [367, "Asy-Syu'ara'"], [377, "An-Naml"], [385, "Al-Qasas"],
    [396, "Al-'Ankabut"], [404, "Ar-Rum"], [411, "Luqman"], [415, "As-Sajdah"],
    [418, "Al-Ahzab"], [428, "Saba'"], [434, "Fatir"], [440, "Ya-Sin"],
    [446, "As-Saffat"], [453, "Sad"], [458, "Az-Zumar"], [467, "Gafir"],
    [477, "Fussilat"], [483, "Asy-Syura"], [489, "Az-Zukhruf"], [496, "Ad-Dukhan"],
    [499, "Al-Jasiyah"], [502, "Al-Ahqaf"], [507, "Muhammad"], [511, "Al-Fath"],
    [515, "Al-Hujurat"], [518, "Qaf"], [521, "Az-Zariyat"], [523, "At-Tur"],
    [526, "An-Najm"], [528, "Al-Qamar"], [531, "Ar-Rahman"], [534, "Al-Waqi'ah"],
    [537, "Al-Hadid"], [542, "Al-Mujadilah"], [545, "Al-Hashr"], [549, "Al-Mumtahanah"],
    [551, "As-Saff"], [553, "Al-Jumu'ah"], [554, "Al-Munafiqun"], [556, "At-Tagabun"],
    [558, "At-Talaq"], [560, "At-Tahrim"], [562, "Al-Mulk"], [564, "Al-Qalam"],
    [566, "Al-Haqqah"], [568, "Al-Ma'arij"], [570, "Nuh"], [572, "Al-Jinn"],
    [574, "Al-Muzzammil"], [575, "Al-Muddassir"], [577, "Al-Qiyamah"], [578, "Al-Insan"],
    [580, "Al-Mursalat"], [582, "An-Naba'"], [583, "An-Nazi'at"], [585, "'Abasa"],
    [586, "At-Takwir"], [587, "Al-Infitar"], [587, "Al-Mutaffifin"], [589, "Al-Insyiqaq"],
    [590, "Al-Buruj"], [591, "At-Tariq"], [591, "Al-A'la"], [592, "Al-Gasyiyah"],
    [593, "Al-Fajar"], [594, "Al-Balad"], [595, "Asy-Syams"], [595, "Al-Lail"],
    [596, "Ad-Duha"], [596, "Al-Insyirah"], [597, "At-Tin"], [597, "Al-'Alaq"],
    [598, "Al-Qadr"], [598, "Al-Bayyinah"], [599, "Az-Zalzalah"], [599, "Al-'Adiyat"],
    [600, "Al-Qari'ah"], [600, "At-Takasur"], [601, "Al-'Asr"], [601, "Al-Humazah"],
    [601, "Al-Fil"], [602, "Quraisy"], [602, "Al-Ma'un"], [602, "Al-Kausar"],
    [603, "Al-Kafirun"], [603, "An-Nasr"], [603, "Al-Lahab"], [604, "Al-Ikhlas"],
    [604, "Al-Falaq"], [604, "An-Nas"]
];

function getSurahByPage(page) {
    let selectedSurah = "Al-Fatihah"; 
    for (let i = 0; i < quranMap.length; i++) {
        if (page >= quranMap[i][0]) {
            selectedSurah = quranMap[i][1];
        } else {
            break; 
        }
    }
    return selectedSurah;
}

let currentUser = localStorage.getItem('ramadhan_user_id');
let globalPosisiSkrg = 0; 
let welcomeShown = false;

// Tunggu Firebase Siap
window.addEventListener('firebase-ready', () => {
    console.log("Firebase Siap!");
    initApp();
});

function initApp() {
    // --- TAMBAHAN BARU: UPDATE TANGGAL HEADER ---
    updateHeaderDate(); 
    initPrayerTimes();
    
    // --------------------------------------------
    if (currentUser) {
        showSection('section-home');
        listenToDashboard(); 
        toggleNavbar(true);
    } else {
        // JIKA BELUM LOGIN -> Masuk Register
        showSection('section-auth');
        toggleNavbar(false);
        
        // --- LOGIKA BARU: POPUP DULU, BARU TOUR ---
        // Cek apakah user sudah pernah menyelesaikan tour?
        if (!localStorage.getItem('reg_tour_done')) {
            // Beri jeda 0.5 detik agar animasi loading halaman selesai
            setTimeout(() => {
                openModal('modal-intro');
            }, 500);
        }
        // Catatan: Fungsi startRegisterTour() nanti dipanggil 
        // oleh tombol "Mulai" di dalam modal-intro (lihat HTML langkah 1)
    }
}
// === NAVIGASI ===
function switchTab(sectionId) {
    // 1. Sembunyikan semua section
    document.querySelectorAll('section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });
    
    // 2. Tampilkan section yang dituju
    const target = document.getElementById(sectionId);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    // 3. Hapus efek 'active' dari semua tombol navigasi
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    // 4. Berikan efek 'active' ke tombol yang benar berdasarkan posisinya di HTML
    if(sectionId === 'section-home') {
        document.querySelector('#main-nav :nth-child(1)').classList.add('active');
    }
    
    if(sectionId === 'section-quran') {
        document.querySelector('#main-nav :nth-child(2)').classList.add('active');
        
        // Panggil fungsi Al-Quran saat tab ini dibuka
        if (typeof fetchSurahList === 'function') fetchSurahList();
        if (typeof checkResumeReading === 'function') checkResumeReading();
    }
    
    if(sectionId === 'section-profile') {
        // Profil sekarang ada di anak ke-5 (Home, Quran, Plus, Jadwal, Profil)
        document.querySelector('#main-nav :nth-child(5)').classList.add('active');
    }
}
// === NAVIGASI ===


// === FUNGSI KONTROL NAVIGASI ===
function toggleNavbar(show) {
    const nav = document.getElementById('main-nav');
    if (nav) {
        if (show) {
            nav.classList.remove('hidden');
            // Sedikit animasi 'Slide Up' biar cantik (opsional)
            nav.style.animation = "slideUp 0.3s ease-out";
        } else {
            nav.classList.add('hidden');
        }
    }
}

function showSection(id) {
    document.querySelectorAll('section').forEach(el => {
        el.classList.add('hidden');   
        el.classList.remove('active'); 
    });

    const target = document.getElementById(id);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

// === FITUR 1: REGISTRASI ===
const formRegister = document.getElementById('form-register');
if(formRegister) {
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formRegister.querySelector('button');
        btn.innerText = 'Menyimpan...'; btn.disabled = true;

        try {
            const userData = {
                nama: document.getElementById('reg-nama').value,
                target_khatam: parseInt(document.getElementById('reg-target').value),
                hal_awal: parseInt(document.getElementById('reg-start').value),
                hal_akhir: parseInt(document.getElementById('reg-end').value),
                posisi_skrg: parseInt(document.getElementById('reg-current').value || 0),
                created_at: new Date().toISOString()

            };

            const docRef = await window.addDoc(window.collection(window.db, "users"), userData);
            localStorage.setItem('ramadhan_user_id', docRef.id);
            currentUser = docRef.id;

            // 2. PINDAH KE HOME
            switchTab('section-home');
            listenToDashboard(); 
            // TAMPILKAN NAVIGASI SETELAH SUKSES
            toggleNavbar(true); // <--- TAMBAHKAN INI

            // 3. LOGIKA BARU: TUNGGU SEBENTAR -> TUTUP TOAST -> BUKA PESAN DEV
            setTimeout(() => {
                // A. Paksa Tutup Toast Sukses (Agar layar bersih)
                closeModal('modal-notif');

                // B. Buka Pesan Developer
                openModal('modal-dev-message');
                
            }, 2000); // User baca "Sukses" selama 2 detik, lalu ganti ke pesan Dev

// ...

        } catch (error) {
            console.error("Error reg:", error);
            showToast('error', 'Terjadi Kesalahan', error.message);
        } finally {
            btn.innerText = 'Mulai Perjalanan'; btn.disabled = false;
        }
    });
}

// === FITUR 2: DASHBOARD REALTIME ===
let unsubscribeDashboard = null; 

function listenToDashboard() {
    if(!currentUser) return;
    document.getElementById('display-target').innerText = '...';

    const userDocRef = window.doc(window.db, "users", currentUser);

    unsubscribeDashboard = window.onSnapshot(userDocRef, async (docSnap) => {
        
        if (docSnap.exists()) {
            const user = docSnap.data();
            // === TAMBAHKAN BARIS INI (PENTING) ===
            currentUserData = user;
            globalPosisiSkrg = user.posisi_skrg || 0;

            // --- REVISI FITUR WELCOME POPUP ---
            // Gunakan variabel 'welcomeShown' (bukan sessionStorage) agar muncul tiap refresh
            if (!welcomeShown) {
                // Pastikan data bookmark BENAR-BENAR ADA sebelum menampilkan
                if (user.last_surah && user.last_ayat) {
                    document.getElementById('welcome-title').innerText = `Hallo, ${user.nama.split(' ')[0]}!`;
                    document.getElementById('welcome-surah').innerText = user.last_surah;
                    document.getElementById('welcome-ayat').innerText = user.last_ayat;
                    
                    openModal('modal-welcome');
                    
                    // Tandai sudah muncul, agar tidak muncul berulang saat update realtime (misal saat input progres)
                    welcomeShown = true; 
                }
            }

            // WELCOME POPUP
            if (!sessionStorage.getItem('welcome_shown')) {
                if(user.last_surah && user.last_ayat) {
                    document.getElementById('welcome-title').innerText = `Hallo, ${user.nama.split(' ')[0]}!`;
                    document.getElementById('welcome-surah').innerText = user.last_surah;
                    document.getElementById('welcome-ayat').innerText = user.last_ayat;
                    openModal('modal-welcome');
                }
                sessionStorage.setItem('welcome_shown', 'true');
            }
            
            // HISTORY LOGS
            const todayStr = new Date().toISOString().split('T')[0];
            const logsRef = window.collection(window.db, "logs");
            const qLogs = window.query(
                logsRef, 
                window.where("user_id", "==", currentUser),
                window.orderBy("timestamp", "desc"),
                window.limit(10)
            );

            const logsSnap = await window.getDocs(qLogs);
            let history = [];
            let capaianHariIni = 0;

            logsSnap.forEach((logDoc) => {
                const logData = logDoc.data();
                if(logData.date === todayStr) {
                    capaianHariIni += parseInt(logData.jumlah);
                }
                history.push(logData);
            });
            globalHistory = history;
            calculateSmartTarget(user, capaianHariIni, history);
            
            // --- TAMBAHAN BARU: GAMBAR GRAFIK ---
            // Kita kirim seluruh data history ke fungsi chart
            renderChart(history);

            // ... (kode sebelumnya) ...
            document.getElementById('p-nama-display').innerText = user.nama;
            
            const joinDate = new Date(user.created_at);
            document.getElementById('p-joined').innerText = "Bergabung: " + joinDate.toLocaleDateString('id-ID');

            // Isi Form Edit Lengkap
            document.getElementById('p-edit-nama').value = user.nama;
            document.getElementById('p-edit-target').value = user.target_khatam;
            document.getElementById('p-edit-start').value = user.hal_awal; // Baru
            document.getElementById('p-edit-end').value = user.hal_akhir;   // Baru

            // --- TAMBAHAN BARU: RENDER LENCANA ---
            renderBadges(user.badges || []); // Kirim array badges user
            
            

        } else {
            console.log("User tidak ditemukan! Melakukan reset otomatis...");
            localStorage.removeItem('ramadhan_user_id');
            window.location.reload();
        }
    });
}

function calculateSmartTarget(user, capaianHariIni, history) {
    const todayStr = new Date().toISOString().split('T')[0];
    const ramadhanEnd = new Date("2026-03-19"); 
    const today = new Date();
    
    let diffTime = ramadhanEnd - today;
    let sisaHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (sisaHari < 1) sisaHari = 1;

    const totalHalamanQuran = (user.hal_akhir - user.hal_awal) + 1;
    const totalTargetProject = totalHalamanQuran * user.target_khatam;
    const posisiAwalHariIni = user.posisi_skrg - capaianHariIni;
    const sudahSelesaiStartOfDay = posisiAwalHariIni - user.hal_awal;
    const sisaBebanStartOfDay = totalTargetProject - sudahSelesaiStartOfDay;

    let targetHarianFixed = Math.ceil(sisaBebanStartOfDay / sisaHari);
    if (targetHarianFixed < 0) targetHarianFixed = 0;
    
    let sisaHariBesok = sisaHari - 1; if(sisaHariBesok < 1) sisaHariBesok = 1;
    let targetBesok = Math.ceil((sisaBebanStartOfDay - capaianHariIni) / sisaHariBesok);

    let progressPersen = Math.round(((user.posisi_skrg - user.hal_awal) / totalTargetProject) * 100);
    if(progressPersen > 100) progressPersen = 100;

    const smart = {
        sisa_hari: sisaHari,
        sisa_halaman: totalTargetProject - (user.posisi_skrg - user.hal_awal),
        target_harian_ini: targetHarianFixed,
        capaian_hari_ini: capaianHariIni,
        target_besok: targetBesok,
        progress_persen: progressPersen
    };

    updateMainCard(smart, user);

    document.getElementById('display-sisa-hari').innerText = smart.sisa_hari + ' Hari';
    document.getElementById('display-sisa-hal').innerText = smart.sisa_halaman + ' Hal';
    document.getElementById('input-page').value = user.posisi_skrg;

    renderHistoryFirebase(history, todayStr);
}

function renderHistoryFirebase(history, todayStr) {
    const container = document.getElementById('history-container');
    container.innerHTML = ''; 

    const historyLama = history.filter(h => h.date !== todayStr);
    if(historyLama.length === 0) {
        if (!container.innerHTML) container.innerHTML = '<div style="text-align:center; color:#aaa; padding:10px;">Belum ada riwayat lama.</div>';
    }

    historyLama.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        const dateObj = new Date(item.timestamp);
        const dateStr = dateObj.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
        
        li.innerHTML = `
            <div class="date">${dateStr}</div>
            <div class="page">+${item.jumlah} Hal</div>
        `;
        container.appendChild(li);
    });
}

function updateMainCard(smart, user) {
    const card = document.querySelector('.summary-card');
    const cardTitle = document.querySelector('.summary-header span');
    const displayNum = document.getElementById('display-target');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');

    card.classList.remove('gold-mode', 'orange-mode');
    card.style.background = ''; 

    const capaianHariIni = smart.capaian_hari_ini || 0;
    const sisaHari = smart.sisa_hari;
    
    const posisiAwalHariIni = user.posisi_skrg - capaianHariIni;
    const totalHalamanQuran = (parseInt(user.hal_akhir) - parseInt(user.hal_awal)) + 1;
    const totalTargetProject = totalHalamanQuran * parseInt(user.target_khatam);
    
    const sudahSelesaiStartOfDay = posisiAwalHariIni - parseInt(user.hal_awal);
    const sisaBebanStartOfDay = totalTargetProject - sudahSelesaiStartOfDay;
    
    let targetHarianFixed = Math.ceil(sisaBebanStartOfDay / sisaHari);
    if (targetHarianFixed < 0) targetHarianFixed = 0;

    let sisaTargetRealtime = targetHarianFixed - capaianHariIni;

    if (sisaTargetRealtime <= 0) {
        card.classList.add('gold-mode');
        cardTitle.innerHTML = '<i class="ph ph-check-circle"></i> Target Tercapai!';
        
        let sisaHariBesok = sisaHari - 1; if(sisaHariBesok < 1) sisaHariBesok = 1;
        let targetBesok = Math.ceil((sisaBebanStartOfDay - capaianHariIni) / sisaHariBesok);
        
        displayNum.innerHTML = `${targetBesok}<small>Target Besok (Hal)</small>`;
        progressText.innerHTML = `Luar biasa! Hari ini tuntas ${capaianHariIni} hal.`;
    }
    else if (capaianHariIni > 0 && sisaTargetRealtime > 0) {
        card.classList.add('orange-mode');
        cardTitle.innerHTML = '<i class="ph ph-clock-clockwise"></i> Sedikit Lagi!';
        displayNum.innerHTML = `${sisaTargetRealtime}<small>Halaman Lagi</small>`;
        progressText.innerHTML = `Semangat! Kamu sudah baca ${capaianHariIni} hal.`;
    } 
    else {
        cardTitle.innerText = "Target Hari Ini";
        displayNum.innerHTML = `${targetHarianFixed} <small>Halaman</small>`;
        progressText.innerText = `Yuk mulai tadarus hari ini.`;
    }

    progressBar.style.width = smart.progress_persen + '%';
}

// === FITUR 3: CATAT NGAJI (INTERAKTIF MODAL) ===
// 1. TAHAP 1: TOMBOL SIMPAN DI KLIK -> BUKA POPUP
const formInput = document.getElementById('form-input');
let tempNewPage = 0;
let tempOldPage = 0;

if(formInput) {
    // Pastikan pakai cloneNode untuk membuang listener lama (opsional tapi aman)
    // Tapi karena kita sudah replace full code, listener lama hilang otomatis.
    formInput.addEventListener('submit', (e) => {
        e.preventDefault();
        
        tempNewPage = parseInt(document.getElementById('input-page').value);
        tempOldPage = globalPosisiSkrg;

        if((tempNewPage - tempOldPage) <= 0) {
            
            showToast('error', 'Halaman baru harus lebih besar!', `Halaman terakhir yang kamu baca adalah ${tempOldPage}. Masukkan halaman yang lebih besar untuk menambah progres.`);
            return;
        }

        const detectedSurah = getSurahByPage(tempNewPage);
        
        document.getElementById('bm-surah').value = detectedSurah;
        document.getElementById('bm-ayat').value = ""; 
        
        openModal('modal-bookmark');
    });
}

// 2. TAHAP 2: KONFIRMASI DI MODAL -> KIRIM KE FIREBASE
const formBookmark = document.getElementById('form-bookmark');
if(formBookmark) {
    formBookmark.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = formBookmark.querySelector('button[type="submit"]');
        btn.innerText = 'Menyimpan...'; btn.disabled = true;

        const finalSurah = document.getElementById('bm-surah').value;
        const finalAyat = document.getElementById('bm-ayat').value;

        try {


            
            const jumlahDibaca = tempNewPage - tempOldPage;
            const todayStr = new Date().toISOString().split('T')[0];

            // --- PERUBAHAN DISINI (DITUKAR URUTANNYA) ---
            
            // 1. SIMPAN LOG DULUAN (Supaya siap saat dibaca dashboard)
            await window.addDoc(window.collection(window.db, "logs"), {
                user_id: currentUser,
                date: todayStr,
                timestamp: new Date().toISOString(),
                start: tempOldPage,
                end: tempNewPage,
                jumlah: jumlahDibaca,
                detail_bookmark: `${finalSurah} : ${finalAyat}` 
            });

            // 2. BARU UPDATE USER (Pemicu Refresh Dashboard)
            // Saat ini jalan, Log di atas sudah ada. Jadi hitungan pasti benar.
            const userRef = window.doc(window.db, "users", currentUser);
            await window.updateDoc(userRef, {
                posisi_skrg: tempNewPage,
                last_surah: finalSurah,
                last_ayat: finalAyat,
                last_update: new Date().toISOString()
            });

            // ---------------------------------------------

            // 3. UPDATE STATE LOKAL
            globalPosisiSkrg = tempNewPage;

            // 4. UPDATE TAMPILAN SECTION INPUT
            const inputField = document.getElementById('input-page');
            inputField.value = tempNewPage; 
            inputField.placeholder = tempNewPage;

            // 5. TUTUP & PINDAH
            closeModal('modal-bookmark');
            showToast('success', 'Tersimpan', `Bookmark diperbarui: ${finalSurah} : ${finalAyat}`);     
            
            switchTab('section-home');

            // ... di dalam formBookmark.addEventListener ...
        
            // ... (Proses simpan logs & update user SELESAI) ...
            
            // --- TAMBAHAN BARU: CEK LENCANA ---
            // Kita butuh data log terbaru. Karena log baru saja ditambah,
            // cara paling aman & cepat adalah panggil ulang fetch log sederhana 
            // atau kirim log manual. Biar akurat, kita fetch sebentar:
            
            const logsRef = window.collection(window.db, "logs");
            const qLogs = window.query(logsRef, window.where("user_id", "==", currentUser));
            const logsSnap = await window.getDocs(qLogs);
            
            // Buat objek user sementara yang sudah diupdate posisinya
            const tempUser = { 
                posisi_skrg: tempNewPage, 
                hal_awal: parseInt(document.getElementById('reg-start')?.value || 1), // Ambil dari cache/form
                hal_akhir: parseInt(document.getElementById('reg-end')?.value || 604),
                badges: [] // Nanti diambil dari DB di fungsi check, tapi di sini kita butuh logic
                // *Koreksi*: Fungsi checkAndUnlockBadges butuh 'currentBadges' dari DB.
                // Lebih aman kita fetch user terbaru dulu sedikit.
            };
            
            const userSnap = await window.getDocs(window.query(window.collection(window.db, "users"), window.where("__name__", "==", currentUser)));
            let latestUser = null;
            userSnap.forEach(doc => latestUser = doc.data());

            if(latestUser) {
                 await checkAndUnlockBadges(latestUser, logsSnap.docs); 
            }
            // ----------------------------------

            // 5. TUTUP & PINDAH
            closeModal('modal-bookmark');
// ...

        } catch (error) {
            console.error(error);
            showToast('error', 'Terjadi Kesalahan', error.message);
        } finally {
            btn.innerText = 'Konfirmasi & Simpan'; btn.disabled = false;
        }
    });
}

// === FUNGSI MODAL (WAJIB ADA & EXPORT KE WINDOW) ===
function openModal(id) {
    const el = document.getElementById(id);
    if(el) {
        el.classList.remove('hidden');
        el.classList.add('active'); 
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if(el) {
        el.classList.add('hidden');
        el.classList.remove('active');
    }
}

// === PENTING: EXPORT AGAR HTML BISA BACA ===
window.openModal = openModal;
window.closeModal = closeModal;

// === FUNGSI CHART: VISUALISASI 7 HARI TERAKHIR ===
function renderChart(history) {
    const ctx = document.getElementById('myChart');
    if (!ctx) return; // Jaga-jaga kalau elemen belum ada

    // 1. SIAPKAN DATA 7 HARI TERAKHIR
    // Kita butuh array tanggal (Label) dan array jumlah (Data)
    const labels = [];
    const dataPoints = [];
    const today = new Date();

    // Loop mundur dari hari ini ke 6 hari lalu
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        
        // Format YYYY-MM-DD untuk pencocokan data
        const dateKey = d.toISOString().split('T')[0];
        
        // Format Tampilan (Misal: "14 Feb")
        const labelDisplay = d.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
        labels.push(labelDisplay);

        // Cari total halaman di tanggal ini dari history
        // (Kita filter history yang tanggalnya == dateKey, lalu jumlahkan)
        const totalHariIni = history
            .filter(h => h.date === dateKey)
            .reduce((sum, item) => sum + parseInt(item.jumlah), 0);
            
        dataPoints.push(totalHariIni);
    }

    // 2. HANCURKAN CHART LAMA (PENTING!)
    // Kalau tidak dihancurkan, chart akan menumpuk dan berkedip saat update
    if (myChart) {
        myChart.destroy();
    }

    // 3. GAMBAR CHART BARU
    myChart = new Chart(ctx, {
        type: 'bar', // Tipe grafik: Batang
        data: {
            labels: labels, // ["8 Feb", "9 Feb", ...]
            datasets: [{
                label: 'Halaman Dibaca',
                data: dataPoints, // [10, 0, 5, 20, ...]
                backgroundColor: '#D4AF37', // Warna Emas
                borderRadius: 4, // Sudut batang membulat
                barThickness: 10 // Ketebalan batang (opsional)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false } // Sembunyikan legenda biar bersih
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { display: true, borderDash: [2, 2] } // Garis putus-putus tipis
                },
                x: {
                    grid: { display: false } // Hilangkan garis vertikal
                }
            }
        }
    });
}

// === FITUR 4: EDIT PROFIL LENGKAP ===
const formProfile = document.getElementById('form-profile');
if(formProfile) {
    formProfile.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formProfile.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Menyimpan...'; btn.disabled = true;

        try {
            const newName = document.getElementById('p-edit-nama').value;
            const newTarget = parseInt(document.getElementById('p-edit-target').value);
            const newStart = parseInt(document.getElementById('p-edit-start').value);
            const newEnd = parseInt(document.getElementById('p-edit-end').value);

            // Update Firebase
            const userRef = window.doc(window.db, "users", currentUser);
            await window.updateDoc(userRef, {
                nama: newName,
                target_khatam: newTarget,
                hal_awal: newStart,
                hal_akhir: newEnd,
                last_update: new Date().toISOString()
            });

            showToast('success', 'Sukses', 'Profil kamu berhasil diupdate.');
            // Tampilan akan auto-update via onSnapshot

        } catch (error) {
            console.error(error);
            showToast('error',"Gagal update: " + error.message);
        } finally {
            btn.innerText = originalText; btn.disabled = false;
        }
    });
}

// === FITUR BAHAYA: RESET PROGRES ===
// Hapus HandleLogout lama, ganti dengan ini:

// === FITUR BAHAYA: RESET PROGRES (VERSI POPUP KEREN) ===
function handleResetProgress() {
    // Panggil Popup Konfirmasi Kita
    showConfirmDialog(
        "Reset Progres?", 
        "Semua riwayat bacaan akan dihapus permanen dan tidak bisa dikembalikan. Yakin?",
        
        // Fungsi ini hanya jalan kalau user klik "YA"
        async () => {
            const btn = document.querySelector('.btn-danger-outline');
            if(btn) { btn.innerText = "Mereset..."; btn.disabled = true; }

            try {
                // Logika hapus sama seperti sebelumnya...
                const resetPage = parseInt(document.getElementById('p-edit-start').value) || 1;
                
                const logsRef = window.collection(window.db, "logs");
                const qLogs = window.query(logsRef, window.where("user_id", "==", currentUser));
                const snapshot = await window.getDocs(qLogs);

                const deletePromises = [];
                snapshot.forEach((doc) => deletePromises.push(window.deleteDoc(doc.ref)));
                await Promise.all(deletePromises);

                const userRef = window.doc(window.db, "users", currentUser);
                await window.updateDoc(userRef, {
                    posisi_skrg: resetPage,
                    last_surah: null,
                    last_ayat: null,
                    last_update: new Date().toISOString()
                });

                // Ganti Alert Sukses jadi Toast
                showToast('success', 'Selesai', 'Data berhasil di-reset ke nol.');
                switchTab('section-home');

            } catch (error) {
                showToast('error', 'Gagal', error.message);
            } finally {
                if(btn) { 
                    btn.innerHTML = '<i class="ph ph-arrow-counter-clockwise"></i> Reset Progres Nol'; 
                    btn.disabled = false; 
                }
            }
        }
    );
}
// === SISTEM NOTIFIKASI KUSTOM ===

// 1. Tampilkan Pesan Sukses/Error (Pengganti Alert)
function showToast(type, title, message) {
    const modal = document.getElementById('modal-notif');
    const iconBox = document.getElementById('notif-icon-container');
    const icon = document.getElementById('notif-icon');
    const h3 = document.getElementById('notif-title');
    const p = document.getElementById('notif-msg');
    const actionBox = document.getElementById('notif-actions');

    // Reset Class Warna
    iconBox.className = 'notif-icon-box'; 
    
    // Setup Tampilan Berdasarkan Tipe
    if(type === 'success') {
        iconBox.classList.add('status-success');
        icon.className = 'ph ph-check-circle';
        // Auto Close setelah 2 detik untuk sukses (Opsional, tapi enak dilihat)
        // setTimeout(() => closeModal('modal-notif'), 2000); 
    } else if (type === 'error') {
        iconBox.classList.add('status-error');
        icon.className = 'ph ph-x-circle';
    } else {
        iconBox.classList.add('status-warning');
        icon.className = 'ph ph-info';
    }

    h3.innerText = title;
    p.innerText = message;

    // Tombol OK Saja
    actionBox.innerHTML = `
        <button class="btn-primary btn-full" onclick="closeModal('modal-notif')">Mengerti</button>
    `;

    openModal('modal-notif');
}

// 2. Tampilkan Konfirmasi (Pengganti Confirm)
// Ini butuh callback karena custom modal tidak mem-pause code seperti native confirm
function showConfirmDialog(title, message, onYes) {
    const modal = document.getElementById('modal-notif');
    const iconBox = document.getElementById('notif-icon-container');
    const icon = document.getElementById('notif-icon');
    const h3 = document.getElementById('notif-title');
    const p = document.getElementById('notif-msg');
    const actionBox = document.getElementById('notif-actions');

    // Setup Tampilan Warning
    iconBox.className = 'notif-icon-box status-error'; // Merah karena bahaya
    icon.className = 'ph ph-warning';
    
    h3.innerText = title;
    p.innerText = message;

    // Tombol Ya & Tidak
    actionBox.innerHTML = ''; // Kosongkan dulu
    
    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn-cancel';
    btnCancel.innerText = 'Batal';
    btnCancel.onclick = () => closeModal('modal-notif');

    const btnYes = document.createElement('button');
    btnYes.className = 'btn-primary';
    btnYes.style.backgroundColor = '#dc3545'; // Merah
    btnYes.style.color = 'white';
    btnYes.innerText = 'Ya, Lanjutkan';
    
    // Saat klik YES, jalankan fungsi yang dikirim (callback)
    btnYes.onclick = () => {
        closeModal('modal-notif');
        onYes(); // <--- JALANKAN AKSI
    };

    actionBox.appendChild(btnCancel);
    actionBox.appendChild(btnYes);

    openModal('modal-notif');
}

// Export agar bisa dipakai
window.showToast = showToast;
window.showConfirmDialog = showConfirmDialog;

// === FITUR ONBOARDING (TUTORIAL PEMULA) ===
function startTour() {
    // Cek apakah user sudah pernah lihat tutorial?
    if (localStorage.getItem('app_tour_done')) return;

    const driver = window.driver.js.driver;

    const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: false,
        doneBtnText: "Siap Mengaji!",
        nextBtnText: "Lanjut",
        prevBtnText: "Mundur",
        steps: [
            { 
                element: '.summary-card', 
                popover: { 
                    title: 'Target Harian', 
                    description: 'Kartu ini menghitung otomatis berapa halaman yang harus kamu baca hari ini agar khatam tepat waktu.' 
                } 
            },
            { 
                element: '.center-btn', 
                popover: { 
                    title: 'Catat Progres', 
                    description: 'Selesai membaca? Klik tombol Plus (+) ini untuk menyimpan halaman terakhirmu.' 
                } 
            },
            { 
                element: '.chart-card', 
                popover: { 
                    title: 'Pantau Grafik', 
                    description: 'Lihat konsistensi bacaanmu selama 7 hari terakhir di sini. Usahakan grafiknya stabil!' 
                } 
            },
            { 
                element: '.bottom-nav', 
                popover: { 
                    title: 'Profil & Reset', 
                    description: 'Ingin ubah target khatam atau reset ulang? Masuk ke menu Profil di sini.' 
                } 
            }
        ],
        onDestroyed: () => {
            // Tandai sudah pernah lihat, agar tidak muncul lagi
            localStorage.setItem('app_tour_done', 'true');
            // Panggil sapaan Ahlan wa Sahlan setelah tour selesai
            showToast('success', 'Siap Beraksi', 'Selamat menjalani ibadah tadarus!');
        }
    });

    tour.drive();
}

// === TOUR KHUSUS HALAMAN REGISTER ===
// === TOUR KHUSUS HALAMAN REGISTER (REVISI) ===
function startRegisterTour() {
    // Cek lagi (double check) biar aman
    if (localStorage.getItem('reg_tour_done')) return;

    const driver = window.driver.js.driver;
    

    const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: false,
        doneBtnText: "Siap, Bismillah",
        nextBtnText: "Lanjut",
        prevBtnText: "Mundur",
        steps: [
            // STEP 1: Langsung ke Target (Judul 'Ahlan wa Sahlan' di-skip sesuai request)
            { 
                element: '#reg-target', 
                popover: { 
                    title: 'Tentukan Targetmu', 
                    description: '<b>Tips:</b><br>1x Khatam ≈ 20 Halaman (1 Juz) per hari.<br>Pilihlah target yang realistis.' 
                } 
            },
            // STEP 2: Sorot Form Row (Halaman Awal & Akhir)
            { 
                element: '.form-row', 
                popover: { 
                    title: 'Sesuaikan Mushafmu', 
                    description: 'Standar Al-Quran Madinah adalah hal. 1 s/d 604. <br>Jika Al-Quranmu berbeda (misal Al-Quran lokal), ubah angkanya di sini agar hitungan akurat.' 
                } 
            },
            // STEP 3: Posisi Start
            { 
                element: '#reg-current', 
                popover: { 
                    title: 'Posisi Start', 
                    description: 'Jika hari ini kamu sudah mencuri start (sudah baca), isi halaman terakhirmu di sini.' 
                } 
            }
        ],
        onDestroyed: () => {
            localStorage.setItem('reg_tour_done', 'true');
            
            
        }
        
        
    });

    tour.drive();
    
    
}

// === FITUR SHARE STORY V2.0 (DENGAN GRAFIK) ===
// === FITUR SHARE STORY V3.1 (FIX DATA & TAMPILAN) ===
async function generateShareImage() {
    showToast('info', 'Sedang Meracik...', 'Membuat grafik estetik untuk Story-mu 🎨');

    // 1. PASTIKAN DATA VALID (Ambil dari Variabel Global/Firebase)
    // Kita gunakan data user yang terakhir diambil oleh dashboard
    // Asumsi: Variabel 'currentUser' valid. Kita ambil data fresh/pakai yang ada.
    
    // Fallback: Jika data di layar masih "-", set ke "0"
    let currentRead = document.getElementById('input-page').value;
    if(!currentRead || currentRead === "") currentRead = "0";

    let sisaDisplay = document.getElementById('display-sisa-hal').innerText;
    if(sisaDisplay === "-" || sisaDisplay === "...") sisaDisplay = "0";

    // Masukkan ke Template
    document.getElementById('share-total-read').innerText = currentRead + " Hal";
    document.getElementById('share-left').innerText = sisaDisplay;

    // 2. LOGIKA CHART (Sama seperti sebelumnya)
    const labels = [];
    const dataPoints = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        labels.push(d.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}));

        const dateKey = d.toISOString().split('T')[0];
        // Gunakan globalHistory yang sudah diset di listenToDashboard
        // Pastikan globalHistory tidak undefined (kasus user baru)
        const safeHistory = (typeof globalHistory !== 'undefined') ? globalHistory : [];
        
        const totalHariIni = safeHistory
            .filter(h => h.date === dateKey)
            .reduce((sum, item) => sum + parseInt(item.jumlah), 0);
        dataPoints.push(totalHariIni);
    }

    // 3. LOGIKA TANGGAL & STATUS
    const ramadhanStart = new Date("2026-02-19"); 
    const diffTime = Math.abs(today - ramadhanStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    document.getElementById('share-day-num').innerText = diffDays;
    
    const progressText = document.querySelector('.progress-text').innerText;
    const statusEl = document.getElementById('share-status');
    
    // Logika Status Sederhana
    // Jika hari ini sudah baca > 0, status ON TRACK. Jika target tercapai, TUNTAS.
    const bacaanHariIni = dataPoints[6]; // Data hari ini (indeks terakhir)
    
    if(progressText.includes("Tercapai")) {
        statusEl.innerText = "TUNTAS";
        statusEl.style.color = "#FFD700"; // Emas
    } else if (bacaanHariIni > 0) {
        statusEl.innerText = "ON TRACK";
        statusEl.style.color = "#ffffff"; // Putih bersih biar kontras
    } else {
        statusEl.innerText = "BELUM MULAI";
        statusEl.style.color = "#ff6b6b"; // Merah soft
    }

    // 4. GAMBAR CHART
    const ctxShare = document.getElementById('shareChartCanvas').getContext('2d');
    if(window.shareChartInstance) window.shareChartInstance.destroy();

    const gradient = ctxShare.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)'); // Emas transparan
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0.0)');

    window.shareChartInstance = new Chart(ctxShare, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                borderColor: '#FFD700',
                backgroundColor: gradient,
                borderWidth: 8,
                pointRadius: 0, 
                fill: true,
                tension: 0.4 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, 
            layout: { padding: { left: -10, right: -10, bottom: -10, top: 20 } },
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, min: 0 }, // min 0 agar grafik tidak nempel bawah
                x: { display: false }
            }
        }
    });

    // 5. EKSEKUSI FOTO (Beri jeda sedikit lebih lama)
    setTimeout(async () => {
        try {
            const shareArea = document.getElementById('share-area');
            // scale: 2 bikin gambar lebih tajam (retina quality)
            const canvas = await html2canvas(shareArea, { 
                scale: 2, 
                useCORS: true,
                backgroundColor: null // Transparansi aman
            });
            
            const link = document.createElement('a');
            link.download = `Tadarus_Day${diffDays}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            showToast('success', 'Siap Upload! 📸', 'Story tersimpan.');
        } catch (err) {
            console.error(err);
            showToast('error', 'Gagal', 'Gagal membuat gambar.');
        }
    }, 300); // Jeda 300ms biar chart render sempurna
}

// === TOUR KONTEKSTUAL: FITUR SHARE (HARI KE-6) ===
function checkShareFeatureTour() {
    // 1. Cek apakah sudah pernah dilihat?
    if (localStorage.getItem('share_tour_done')) return;

    // 2. Hitung Hari Ramadhan Ke-Berapa
    // (Sesuaikan tanggal ini dengan tanggal mulai puasa di aplikasi)
    const ramadhanStart = new Date("2026-02-19"); 
    const today = new Date();
    
    // Hitung selisih waktu
    const diffTime = today - ramadhanStart;
    const dayNum = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 3. LOGIKA PEMICU (HANYA MUNCUL DI HARI KE-6)
    // Tips Debug: Ganti angka 6 menjadi angka hari ini (misal 1) untuk mengetes sekarang
    if (dayNum === 6) { 
        
        const driver = window.driver.js.driver;
        const driverObj = driver({
            showProgress: false,
            animate: true,
            allowClose: false,
            steps: [
                {
                    element: '.btn-share-icon', // Target tombol share kecil
                    popover: {
                        title: '✨ Konsistensi yang Hebat!',
                        description: 'Sudah masuk hari ke-6 dan kamu masih bertahan. <br>Bagikan semangatmu ke teman-teman lewat Story sekarang!',
                        side: "bottom",
                        align: 'end',
                        doneBtnText: 'Oke, Paham',
                        onPopoverRendered: (popover) => {
                            // Style khusus biar tombolnya emas
                            const btn = popover.wrapper.querySelector('.driver-popover-done-btn');
                            if(btn) btn.style.backgroundColor = '#D4AF37';
                        }
                    }
                }
            ],
            onDestroyed: () => {
                // Tandai sudah selesai, jangan muncul lagi besok
                localStorage.setItem('share_tour_done', 'true');
            }
        });

        // Jalankan Tour
        setTimeout(() => {
            driverObj.drive();
        }, 2000); // Muncul 2 detik setelah buka web
    }
}

function updateHeaderDate() {
    const headerDate = document.querySelector('.hijri-date');
    if (!headerDate) return;

    // TENTUKAN TANGGAL MULAI PUASA (1 Ramadhan)
    // Format: YYYY-MM-DD
    const startRamadhan = new Date("2026-02-19"); 
    const today = new Date();

    // Hitung selisih waktu
    const diffTime = today - startRamadhan;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Logika Tampilan
    if (diffDays < 1) {
        // Belum mulai (H-Sekian)
        const daysLeft = Math.abs(diffDays);
        headerDate.innerText = `Menuju Ramadhan (${daysLeft} Hari Lagi)`;
    } else if (diffDays > 30) {
        // Sudah lewat (Syawal)
        headerDate.innerText = "1 Syawal 1447 H (Taqabbalallahu Minna)";
    } else {
        // Sedang Berjalan
        // +1 karena diffDays start dari 0 jika hari yang sama, tapi kita pakai Math.ceil jadi aman 1
        // Mari kita pastikan logika hari ke-1:
        // Jika today == startRamadhan, diff ~0. Sesuatu yang kecil. Math.ceil akan 1 (jika jam today > start)
        // Kita kunci saja agar minimal 1.
        const currentDay = diffDays < 1 ? 1 : diffDays;
        headerDate.innerText = `${currentDay} Ramadhan 1447 H`;
    }
}

// =========================================
// === FITUR RATING SPESIAL HARI KE-26 (FIXED) ===
// =========================================

let currentRating = 0;

// --- BAGIAN 1: SETUP UI (Jalankan sekali di paling bawah file) ---
function setupRatingUIListener() {
    const stars = document.querySelectorAll('.star');
    const btnSubmit = document.getElementById('btn-submit-rating');
    const feedbackArea = document.getElementById('rating-feedback');

    // Penjagaan: Jika elemen tidak ada (misal belum di-load), berhenti.
    if(stars.length === 0) return;

    stars.forEach(star => {
        // Hapus listener lama dulu (untuk menghindari duplikasi jika fungsi ini terpanggil ulang)
        const newStar = star.cloneNode(true);
        star.parentNode.replaceChild(newStar, star);
    });

    // Ambil ulang elemen yang sudah bersih dari listener lama
    const refreshedStars = document.querySelectorAll('.star');
    
    refreshedStars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            currentRating = val;
            
            // Loop untuk mewarnai bintang
            refreshedStars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                // Reset kelas animasi dulu
                s.classList.remove('star-shake'); 

                if (sVal <= val) {
                    // Bintang Terpilih: Pakai icon solid (isi)
                    s.classList.remove('ph-star'); 
                    s.classList.add('ph-star-fill', 'active');
                } else {
                    // Bintang Tidak Terpilih: Pakai icon outline (garis)
                    s.classList.remove('ph-star-fill', 'active');
                    s.classList.add('ph-star');
                }
            });

            // Efek Goyang jika bintang 5
            if(val === 5) refreshedStars[4].classList.add('star-shake');

            // Munculkan tombol kirim dan textarea
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = "1";
            if(feedbackArea.style.display === "none" || feedbackArea.style.display === "") {
                 feedbackArea.style.display = "block";
                 // Beri jeda sedikit agar transisi halus, lalu fokus
                 setTimeout(() => feedbackArea.focus(), 100);
            }
        });
    });
}


// --- BAGIAN 2: LOGIKA TRIGGER (Panggil di dalam listenToDashboard) ---
function checkDay26Trigger() {
    // TENTUKAN TANGGAL MULAI PUASA
    const ramadhanStart = new Date("2026-02-19"); // <--- PASTI KAN INI BENAR
    const today = new Date();
    const diffTime = today - ramadhanStart;
    const dayNum = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // --- TIPS DEBUGGING ---
    // Agar bisa ngetes SEKARANG, ubah angka '26' di bawah menjadi angka hari ini.
    // Contoh: Jika hari ini 16 Feb 2026 (sebelum mulai), dayNum mungkin negatif atau 0.
    // Ubah sementara syaratnya menjadi: if (dayNum !== 26 && ...
    // ATAU ubah ramadhanStart di atas menjadi tanggal 26 hari yang lalu.
    
    // KONDISI NORMAL:
    if (dayNum === 26 && !localStorage.getItem('app_rated')) {
        console.log("Hari ke-26 terdeteksi! Memunculkan rating...");
        setTimeout(() => {
            openModal('modal-rating');
            // Setup listenernya di sini untuk memastikan elemen sudah siap
            setupRatingUIListener();
        }, 3000);
    }
}


// --- BAGIAN 3: FUNGSI KIRIM (Tetap sama) ---
async function submitRating() {
    const btn = document.getElementById('btn-submit-rating');
    const feedback = document.getElementById('rating-feedback').value;
    
    if(currentRating === 0) return; // Jaga-jaga

    btn.innerText = "Mengirim..."; 
    btn.disabled = true;

    try {
        const userRef = window.doc(window.db, "users", currentUser);
        await window.updateDoc(userRef, {
            app_rating: currentRating,
            app_feedback: feedback,
            rating_date: new Date().toISOString()
        });

        localStorage.setItem('app_rated', 'true');
        closeModal('modal-rating');
        showToast('success', 'Terima Kasih! ⭐', 'Masukanmu sangat berarti.');

    } catch (error) {
        console.error("Gagal rating:", error);
        // Fallback: anggap sudah rating secara lokal
        localStorage.setItem('app_rated', 'true');
        closeModal('modal-rating');
        showToast('success', 'Tersimpan', 'Ratingmu telah dicatat secara lokal.');
    } finally {
         btn.innerText = "Kirim Penilaian"; 
         btn.disabled = false;
    }
}

// Export fungsi agar bisa dipanggil HTML
window.submitRating = submitRating;

// === SISTEM GAMIFIKASI (BADGES) ===

// 1. Konfigurasi Lencana (Syarat & Tampilan)
const BADGES_CONFIG = [
    {
        id: "badge_first",
        name: "Langkah Awal",
        icon: "ph-footprints",
        desc: "Melakukan input progres pertama kali.",
        check: (user, logs) => logs.length >= 1
    },
    {
        id: "badge_spirit",
        name: "Istiqomah",
        icon: "ph-fire",
        desc: "Melakukan input progres sebanyak 5 kali.",
        check: (user, logs) => logs.length >= 5
    },
    {
        id: "badge_juz1",
        name: "5 Juz",
        icon: "ph-book-open-text",
        desc: "Membaca total 100 halaman.",
        check: (user, logs) => (user.posisi_skrg - user.hal_awal) >= 100
    },
    {
        id: "badge_khatam",
        name: "Khatam",
        icon: "ph-crown",
        desc: "Menyelesaikan seluruh halaman Al-Quran.",
        check: (user, logs) => user.posisi_skrg >= user.hal_akhir
    }
];

// 2. Fungsi Render (Menampilkan Lencana di Profil)
function renderBadges(userBadges = []) {
    const container = document.getElementById('badges-container');
    if(!container) return;
    
    container.innerHTML = ''; // Bersihkan loading

    BADGES_CONFIG.forEach(badge => {
        // Cek apakah user punya badge ini?
        const isUnlocked = userBadges.includes(badge.id);
        
        const div = document.createElement('div');
        div.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
        
        // Tooltip sederhana pakai 'title'
        div.title = isUnlocked ? "Tercapai!" : "Syarat: " + badge.desc;
        
        div.innerHTML = `
            <div class="badge-icon">
                <i class="ph ${badge.icon}" ${isUnlocked ? 'style="color: #D4AF37;"' : ''}></i>
            </div>
            <span class="badge-name">${badge.name}</span>
        `;
        
        container.appendChild(div);
    });
}

// 3. Fungsi Cek & Unlock (Dijalankan setelah input)
async function checkAndUnlockBadges(user, logs) {
    let newBadgesUnlocked = [];
    const currentBadges = user.badges || []; // Ambil array badges user (atau kosong)

    BADGES_CONFIG.forEach(badge => {
        // Jika belum punya badge ini...
        if (!currentBadges.includes(badge.id)) {
            // ...dan syarat terpenuhi
            if (badge.check(user, logs)) {
                newBadgesUnlocked.push(badge.id);
            }
        }
    });

    // Jika ada lencana baru yang terbuka
    if (newBadgesUnlocked.length > 0) {
        const updatedBadges = [...currentBadges, ...newBadgesUnlocked];
        
        // 1. Update Firebase
        const userRef = window.doc(window.db, "users", currentUser);
        await window.updateDoc(userRef, {
            badges: updatedBadges
        });

        // 2. Tampilkan Notifikasi Meriah
        newBadgesUnlocked.forEach(badgeId => {
            const badgeInfo = BADGES_CONFIG.find(b => b.id === badgeId);
            showToast('success', 'LENCANA BARU! 🏅', `Selamat! Kamu mendapatkan lencana "${badgeInfo.name}"`);
        });
    }
}

// === FITUR JADWAL SHOLAT & IMSAKIYAH ===
// === FITUR JADWAL SHOLAT & IMSAKIYAH (UPDATE LOKASI OTOMATIS) ===
let prayerInterval = null;

function initPrayerTimes() {
    // 1. Cek Lokasi User via GPS Browser
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Dapat lokasi, kirim koordinat, isDefault = false
                fetchPrayerData(position.coords.latitude, position.coords.longitude, false);
            },
            (error) => {
                // Jika user menolak akses lokasi, pakai Default (Jakarta)
                console.warn("Lokasi ditolak, pakai default Jakarta.");
                fetchPrayerData(-6.2088, 106.8456, true); 
                showToast('info', 'Lokasi Default', 'Menampilkan jadwal Jakarta karena akses lokasi tidak diizinkan.');
                
            }
        );
    } else {
        // Browser jadul yang tidak support GPS
        fetchPrayerData(-6.2088, 106.8456, true);
        startRegisterTour()
    }
}

async function fetchPrayerData(lat, lng, isDefault = false) {
    try {
        const locNameEl = document.getElementById('prayer-location-name');

        // === 1. TERJEMAHKAN KOORDINAT JADI NAMA KOTA ===
        if (isDefault) {
            if (locNameEl) locNameEl.innerText = "Lokasi: Jakarta Pusat (Default)";
        } else {
            try {
                if (locNameEl) locNameEl.innerText = "Mendeteksi lokasi...";
                // Gunakan API gratis untuk mengubah Lat/Lng menjadi Nama Kota
                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`);
                const geoData = await geoRes.json();
                
                // Ambil data kota/kabupaten/kecamatan
                const city = geoData.locality || geoData.city || geoData.principalSubdivision || "Lokasi Anda";
                if (locNameEl) locNameEl.innerText = `Lokasi: ${city}`;
            } catch (e) {
                console.warn("Gagal menerjemahkan nama lokasi");
                if (locNameEl) locNameEl.innerText = "Lokasi: Titik GPS Ditemukan";
            }
        }

        // === 2. AMBIL JADWAL SHOLAT (ALADHAN) ===
        const date = new Date();
        // Method 20 = Kemenag RI (Standard Indonesia)
        const url = `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=20`;
        
        const response = await fetch(url);
        const data = await response.json();
        const timings = data.data.timings;

        renderPrayerList(timings);
        startPrayerCountdown(timings);

    } catch (error) {
        console.error("Gagal ambil jadwal:", error);
        const locNameEl = document.getElementById('prayer-location-name');
        if (locNameEl) locNameEl.innerText = "Gagal memuat jadwal";
    }
}

// === UPDATE LOGIKA TAMPILAN JADWAL ===

function renderPrayerList(timings) {
    const container = document.getElementById('prayer-list-container');
    container.innerHTML = '';

    const displayList = [
        { key: 'Imsak', label: 'Imsak' },
        { key: 'Fajr', label: 'Subuh' },
        { key: 'Dhuhr', label: 'Dzuhur' },
        { key: 'Asr', label: 'Ashar' },
        { key: 'Maghrib', label: 'Maghrib' },
        { key: 'Isha', label: 'Isya' }
    ];

    displayList.forEach(item => {
        const time = timings[item.key];
        const div = document.createElement('div');
        div.className = 'prayer-row';
        div.id = `prayer-row-${item.key}`;
        div.innerHTML = `
            <span>${item.label}</span>
            <span>${time}</span>
        `;
        container.appendChild(div);
    });
}

function startPrayerCountdown(timings) {
    if(prayerInterval) clearInterval(prayerInterval);

    const prayerNames = {
        'Imsak': 'Imsak', 'Fajr': 'Subuh', 'Dhuhr': 'Dzuhur', 
        'Asr': 'Ashar', 'Maghrib': 'Maghrib', 'Isha': 'Isya'
    };

    function updateTimer() {
        const now = new Date();
        let nextPrayerKey = "";
        let minDiff = Infinity;

        // Cari Sholat Selanjutnya
        for (const [key, timeVal] of Object.entries(timings)) {
            if(!prayerNames[key]) continue;
            const [hours, minutes] = timeVal.split(':');
            const pTime = new Date();
            pTime.setHours(hours, minutes, 0);
            let diff = pTime - now;

            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextPrayerKey = key;
            }
        }

        // Jika semua lewat, target Subuh besok
        if (minDiff === Infinity) {
             const [hours, minutes] = timings['Fajr'].split(':');
             const nextDay = new Date();
             nextDay.setDate(nextDay.getDate() + 1);
             nextDay.setHours(hours, minutes, 0);
             minDiff = nextDay - now;
             nextPrayerKey = 'Fajr';
        }

        // 1. UPDATE TOMBOL MINI DI HEADER (Simpel)
        // Tampilkan: "Ashar 15:08"
        const nextName = prayerNames[nextPrayerKey];
        const nextTime = timings[nextPrayerKey];
        document.getElementById('mini-prayer-display').innerText = `${nextName} ${nextTime}`;

        // 2. UPDATE COUNTDOWN DI MODAL (Lengkap)
        const h = Math.floor(minDiff / (1000 * 60 * 60));
        const m = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((minDiff % (1000 * 60)) / 1000);

        const countdownStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        
        // Update elemen modal (hanya jika modal sedang terbuka biar hemat resource, tapi update terus juga gak apa-apa)
        const modalTimer = document.getElementById('modal-countdown');
        if(modalTimer) {
            modalTimer.innerText = countdownStr;
            document.getElementById('modal-next-name').innerText = `Menuju ${nextName}`;
        }

        // 3. HIGHLIGHT LIST DI MODAL
        document.querySelectorAll('.prayer-row').forEach(el => el.classList.remove('active'));
        const activeRow = document.getElementById(`prayer-row-${nextPrayerKey}`);
        if(activeRow) activeRow.classList.add('active');
    }

    updateTimer();
    prayerInterval = setInterval(updateTimer, 1000);
}

// === FITUR INSTALL PWA ===

// 1. Dengar Sinyal dari Browser (Hanya jalan di Android/Chrome/Edge)
window.addEventListener('beforeinstallprompt', (e) => {
    // Cegah browser menampilkan popup bawaan yang membosankan
    e.preventDefault();
    // Simpan event ke variabel global biar bisa dipakai nanti
    deferredPrompt = e;
    
    // Munculkan Banner Install Keren Kita
    const banner = document.getElementById('install-banner');
    if(banner) {
        banner.classList.remove('hidden');
        banner.style.display = 'flex'; // Pastikan flex tampil
    }
});

// 2. Fungsi Saat Tombol "Install" Diklik
async function installPWA() {
    if (!deferredPrompt) return;

    // Tampilkan popup asli browser
    deferredPrompt.prompt();

    // Tunggu user klik "Terima" atau "Tolak"
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User menginstall aplikasi');
        // Sembunyikan banner karena sudah diinstall
        hideInstallBanner();
    }
    
    // Reset variabel (karena event cuma bisa dipakai sekali)
    deferredPrompt = null;
}

// 3. Fungsi Tutup Banner (Kalau user gak mau)
function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if(banner) banner.classList.add('hidden');
}

// Export fungsi
window.installPWA = installPWA;
window.hideInstallBanner = hideInstallBanner;

// ==========================================
// === FITUR AL-QURAN DIGITAL (API V4) ===
// ==========================================

let allSurahList = []; // Cache daftar surah

// 1. Ambil Daftar Surah (Dipanggil saat tab Quran dibuka)
async function fetchSurahList() {
    const container = document.getElementById('surah-list-container');
    
    // Cek jika data sudah ada, jangan fetch ulang (hemat kuota)
    if(allSurahList.length > 0) {
        renderSurahList(allSurahList);
        return;
    }

    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=id');
        const data = await response.json();
        allSurahList = data.chapters;
        renderSurahList(allSurahList);
    } catch (error) {
        container.innerHTML = '<p style="text-align:center; color:red;">Gagal memuat data. Cek koneksi internet.</p>';
        console.error(error);
    }
}

// 2. Render List ke HTML
function renderSurahList(chapters) {
    const container = document.getElementById('surah-list-container');
    container.innerHTML = '';

    chapters.forEach(surah => {
        const div = document.createElement('div');
        div.className = 'surah-item';
        div.onclick = () => openSurahDetail(surah.id, surah.name_simple);
        
        
        div.innerHTML = `
            <div style="display:flex; align-items:center;">
                <div class="surah-number">${surah.id}</div>
                <div>
                    <h4 style="margin:0; font-size:1rem;">${surah.name_simple}</h4>
                    <span style="font-size:0.8rem; color:#888;">${surah.translated_name.name} • ${surah.verses_count} Ayat</span>
                </div>
            </div>
            <div class="surah-name-arabic">${surah.name_arabic}</div>
        `;
        container.appendChild(div);
    });
}

// 3. Filter Pencarian Surah
function filterSurah() {
    const query = document.getElementById('search-surah').value.toLowerCase();
    const filtered = allSurahList.filter(s => 
        s.name_simple.toLowerCase().includes(query) || 
        s.translated_name.name.toLowerCase().includes(query)
    );
    renderSurahList(filtered);
}

// 4. Buka Detail Ayat (Reader)
// Update parameter fungsi ini
async function openSurahDetail(chapterId, nameSimple, targetAyat = null) {
    const viewContainer = document.getElementById('ayat-view-container');
    const contentDiv = document.getElementById('ayat-list-content');
    const titleHeader = document.getElementById('view-surah-name');

    viewContainer.classList.remove('hidden');
    titleHeader.innerText = nameSimple;

    // Loading State
    if(targetAyat) {
        contentDiv.innerHTML = `<div style="text-align:center; padding:50px;">
            <div class="spinner"></div>
            <p>Mencari Ayat ${targetAyat}...</p>
        </div>`;
    } else {
        contentDiv.innerHTML = '<div style="text-align:center; padding:50px;">Memuat Ayat...</div>';
    }

    try {
        // === PERBAIKAN URL API ===
        // translations=33 (Indo) KOMMA 57 (Latin)
        // Hapus parameter &transliterations=... karena tidak valid
        const url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=id&fields=text_uthmani,page_number&translations=33,57&per_page=300`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Kirim data ke render
        renderAyat(data.verses, nameSimple, chapterId, targetAyat);

    } catch (error) {
        console.error("Gagal load ayat:", error);
        contentDiv.innerHTML = '<p style="text-align:center; color:red;">Gagal memuat ayat. Cek koneksi internet.</p>';
    }
}

// 5. Render Ayat (FIXED: Masalah Tanda Petik)
function renderAyat(verses, surahName, currentChapterId, targetAyat = null) { 
    const container = document.getElementById('ayat-list-content');
    container.innerHTML = '';
    container.scrollTop = 0;

    // Terapkan setting (Hide/Show)
    applyViewSettings();

    const safeSurahName = surahName.replace(/'/g, "\\'"); 

    verses.forEach(verse => {
        const pageNum = verse.page_number;
        const ayatNum = verse.verse_key.split(':')[1];
        const textArab = verse.text_uthmani;

        // === LOGIKA BARU MEMISAHKAN INDO & LATIN ===
        let textIndo = "";
        let textLatin = "";

        // Loop semua terjemahan yang didapat
        if (verse.translations) {
            verse.translations.forEach(t => {
                if (t.resource_id === 33) {
                    // ID 33 = Bahasa Indonesia
                    textIndo = t.text.replace(/<sup.*?<\/sup>/g, ''); // Bersihkan footnote
                } else if (t.resource_id === 57) {
                    // ID 57 = Transliterasi (Latin)
                    textLatin = t.text;
                }
            });
        }
        // ==========================================

        const div = document.createElement('div');
        div.className = 'ayat-row';
        div.id = `verse-${ayatNum}`;

        if (targetAyat && parseInt(ayatNum) === parseInt(targetAyat)) {
            div.style.backgroundColor = "#fff9c4"; 
            div.style.border = "2px solid #D4AF37";
        }

        div.innerHTML = `
            <div class="ayat-meta">
                <span class="ayat-badge">Ayat ${ayatNum}</span>
                <button class="btn-save-ayat" onclick="saveFromDigitalQuran(${pageNum}, '${safeSurahName}', ${ayatNum})">
                    <i class="ph ph-bookmark-simple"></i> Simpan Hal ${pageNum}
                </button>
            </div>
            
            <div class="text-arab">${textArab}</div>
            
            <div class="text-latin">${textLatin}</div>
            
            <div class="text-indo">${textIndo}</div>
        `;
        container.appendChild(div);
    });

    // B. Logika Tombol Next Surah (YANG DIPERBAIKI)
    const nextId = parseInt(currentChapterId) + 1;
    
    if (nextId <= 114) {
        // Cari nama surat selanjutnya
        const nextSurahObj = allSurahList.find(s => s.id === nextId);
        const nextName = nextSurahObj ? nextSurahObj.name_simple : "Surat Berikutnya";

        // === PERBAIKAN: AMANKAN TANDA PETIK ===
        const safeNextName = nextName.replace(/'/g, "\\'"); 
        // ======================================

        const nextDiv = document.createElement('div');
        nextDiv.className = 'next-surah-container';
        nextDiv.innerHTML = `
            <p style="color:#888; margin-bottom:10px; font-size:0.9rem;">Selesai membaca ${surahName}?</p>
            
            <button class="btn-next-surah" onclick="openSurahDetail(${nextId}, '${safeNextName}')">
                Lanjut ke ${nextName} <i class="ph ph-arrow-right"></i>
            </button>
        `;
        container.appendChild(nextDiv);
    } else {
        // Jika Khatam (Surat 114)
        const finishDiv = document.createElement('div');
        finishDiv.className = 'next-surah-container';
        finishDiv.innerHTML = `
            <p style="color:var(--gold); font-weight:bold; font-size:1.1rem;">✨ Alhamdulillah, Khatam! ✨</p>
        `;
        container.appendChild(finishDiv);
    }

    // Auto Scroll Logic
    if (targetAyat) {
        setTimeout(() => {
            const element = document.getElementById(`verse-${targetAyat}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                showToast('success', 'Ketemu!', `Melompat ke Ayat ${targetAyat}`);
            }
        }, 500);
    }
}
// ==========================================
// === INTEGRASI QURAN DIGITAL KE FORM UTAMA ===
// ==========================================

function saveFromDigitalQuran(page, surahName, ayatNum) {
    // 1. Tutup Tampilan Baca
    closeAyatView();
    
    // 2. Pindah ke Tab Home
    switchTab('section-home');

    // 3. [PENTING] Update Variabel Global
    // Ini kuncinya: Kita paksa isi variabel tempNewPage agar tombol Simpan di modal bekerja
    tempNewPage = parseInt(page); 
    tempOldPage = globalPosisiSkrg; // Update posisi lama juga untuk validasi

    // 4. Isi Formulir Input di Dashboard (Visual saja, agar user melihat angkanya berubah)
    const inputField = document.getElementById('input-page');
    if(inputField) {
        inputField.value = page;
    }

    // 5. Isi Data Lengkap ke Modal Bookmark
    // Karena dari digital Quran, kita sudah tahu pasti Nama Surat & Ayatnya
    // Jadi kita tidak perlu menebak (getSurahByPage), langsung isi saja.
    document.getElementById('bm-surah').value = surahName;
    document.getElementById('bm-ayat').value = ayatNum;

    // 6. Buka Modal Konfirmasi (Sama seperti saat tekan tombol Simpan manual)
    setTimeout(() => {
        openModal('modal-bookmark');
        showToast('info', 'Data Terisi', `Melanjutkan ${surahName} Ayat ${ayatNum}`);
    }, 300); // Beri jeda sedikit agar transisi tab selesai
}


// ==========================================
// === FUNGSI TAMBAHAN (YANG HILANG) ===
// ==========================================

// Fungsi untuk menutup tampilan baca ayat
function closeAyatView() {
    const viewContainer = document.getElementById('ayat-view-container');
    if (viewContainer) {
        viewContainer.classList.add('hidden');
    }
}

// Pastikan fungsi ini bisa dibaca oleh HTML (Global)
window.closeAyatView = closeAyatView;

// 1. Cek & Tampilkan Popup (Dipanggil saat Switch Tab)
function checkResumeReading() {
    // Pastikan data user ada & memiliki riwayat bacaan
    if (currentUserData && currentUserData.last_surah && currentUserData.last_ayat) {
        
        // Isi Data ke Modal
        document.getElementById('resume-surah-name').innerText = currentUserData.last_surah;
        document.getElementById('resume-ayat-num').innerText = currentUserData.last_ayat;
        
        // Tampilkan Popup
        // Beri jeda sedikit agar transisi tab selesai dulu baru popup muncul
        setTimeout(() => {
            openModal('modal-resume');
        }, 400); 
    }
}

// 2. Eksekusi Lanjut Baca (Saat tombol "Ya, Lanjut" diklik)
function confirmResumeReading() {
    closeModal('modal-resume');

    const surahName = currentUserData.last_surah;
    const ayatNum = currentUserData.last_ayat;

    // Cari ID Surah berdasarkan Nama
    if (allSurahList.length === 0) {
        // Jika cache kosong, fetch dulu (jarang terjadi, tapi jaga-jaga)
        fetchSurahList().then(() => {
            const surahObj = allSurahList.find(s => s.name_simple === surahName);
            if(surahObj) openSurahDetail(surahObj.id, surahName, ayatNum);
        });
    } else {
        const surahObj = allSurahList.find(s => s.name_simple === surahName);
        if (surahObj) {
            openSurahDetail(surahObj.id, surahName, ayatNum);
        }
    }
}

// ==========================================
// === LOGIKA SETTING & TOOLS QURAN ===
// ==========================================

// 1. Fungsi Lompat ke Ayat (Input Header)
function jumpToVerseManual() {
    const val = document.getElementById('jump-ayat-input').value;
    if(!val) return;

    const targetId = `verse-${val}`;
    const el = document.getElementById(targetId);

    if(el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Beri efek kedip
        el.style.transition = "background 0.5s";
        el.style.backgroundColor = "#fff9c4";
        setTimeout(() => {
            el.style.backgroundColor = "transparent";
        }, 2000);
    } else {
        showToast('error', 'Tidak Ketemu', `Ayat ${val} tidak ada di surat ini.`);
    }
}

// 2. Fungsi Simpan Setting (Dari Modal)
function saveQuranSettings() {
    quranSettings.translation = document.getElementById('check-translation').checked;
    quranSettings.latin = document.getElementById('check-latin').checked;

    // Simpan ke LocalStorage
    localStorage.setItem('user_quran_settings', JSON.stringify(quranSettings));
    
    // Terapkan langsung (Realtime)
    applyViewSettings();
}

// 3. Fungsi Terapkan Class CSS
function applyViewSettings() {
    const container = document.getElementById('ayat-list-content');
    if(!container) return;

    // Atur Checkbox di Modal sesuai state terakhir
    const chkTrans = document.getElementById('check-translation');
    const chkLatin = document.getElementById('check-latin');
    if(chkTrans) chkTrans.checked = quranSettings.translation;
    if(chkLatin) chkLatin.checked = quranSettings.latin;

    // Toggle Class di Container Utama
    // Jika user minta translation OFF -> Tambah class .hide-translation
    if (quranSettings.translation) {
        container.classList.remove('hide-translation');
    } else {
        container.classList.add('hide-translation');
    }

    // Jika user minta latin OFF -> Tambah class .hide-latin
    if (quranSettings.latin) {
        container.classList.remove('hide-latin');
    } else {
        container.classList.add('hide-latin');
    }
}