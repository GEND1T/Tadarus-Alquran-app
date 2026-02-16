// === KONFIGURASI ===
let myChart = null; // Variabel global untuk menyimpan instance Chart
let globalHistory = [];
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
    // --------------------------------------------
    if (currentUser) {
        showSection('section-home');
        listenToDashboard(); 
    } else {
        // JIKA BELUM LOGIN -> Masuk Register
        showSection('section-auth');
        
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
    document.querySelectorAll('section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });
    
    const target = document.getElementById(sectionId);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(sectionId === 'section-home') document.querySelector('.nav-item:nth-child(1)').classList.add('active');
    if(sectionId === 'section-profile') document.querySelector('.nav-item:nth-child(3)').classList.add('active');
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
            globalPosisiSkrg = user.posisi_skrg || 0;

            // --- REVISI FITUR WELCOME POPUP ---
            // Gunakan variabel 'welcomeShown' (bukan sessionStorage) agar muncul tiap refresh
            if (!welcomeShown) {
                // Pastikan data bookmark BENAR-BENAR ADA sebelum menampilkan
                if (user.last_surah && user.last_ayat) {
                    document.getElementById('welcome-title').innerText = `Ahlan, ${user.nama.split(' ')[0]}!`;
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
                    document.getElementById('welcome-title').innerText = `Ahlan, ${user.nama.split(' ')[0]}!`;
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

            // --- TAMBAHAN BARU: RATING HARI 26 ---
            
            // -------------------------------------
            
            // -------------------------------------
            // -------------------------------------
            

        } else {
            console.log("User tidak ditemukan! Melakukan reset otomatis...");
            localStorage.removeItem('ramadhan_user_id');
            window.location.reload();
        }
    });
}

function calculateSmartTarget(user, capaianHariIni, history) {
    const todayStr = new Date().toISOString().split('T')[0];
    const ramadhanEnd = new Date("2026-03-20"); 
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
                element: '.nav-item:nth-child(3)', 
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
    const ramadhanStart = new Date("2026-02-18"); 
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
            link.download = `RamadhanTracker_Day${diffDays}.png`;
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
    const ramadhanStart = new Date("2026-02-18"); 
    const today = new Date();
    
    // Hitung selisih waktu
    const diffTime = today - ramadhanStart;
    const dayNum = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 3. LOGIKA PEMICU (HANYA MUNCUL DI HARI KE-6)
    // Tips Debug: Ganti angka 6 menjadi angka hari ini (misal 1) untuk mengetes sekarang
    if (dayNum === 1) { 
        
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
    const startRamadhan = new Date("2026-02-18"); 
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
    const ramadhanStart = new Date("2026-02-18"); // <--- PASTI KAN INI BENAR
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