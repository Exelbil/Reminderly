// DATA SEEDING DEFAULT (Sesuai isi komponen mockup Anda)
let notes = [
    { id: 1, title: "Tittle", content: "Content" },
    { id: 2, title: "Tittle", content: "Content" },
    { id: 3, title: "Tittle", content: "Content" }
];

let tasks = [
    { id: 101, title: "Digital marketing", datetime: "2026-05-31 18:00", done: false },
    { id: 102, title: "Redesign website", datetime: "2026-05-31 19:30", done: false },
    { id: 103, title: "Make landing page", datetime: "2026-05-31 08:00", done: true }
];

let alarmSoundUrl = "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";
let currentPlayingAudio = null;
let itemIndexToDelete = null;
let isCompletedHidden = false;

// 1. FUNGSI UTAMA HILANGKAN SPLASH SCREEN AUTOMATICALLY
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('opacity-0');
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }
    }, 1500); // Tampil selama 1.5 detik
});

// 2. NAVIGASI PERPINDAHAN TAB MENU (NOTE, TASK, SETTING)
function switchTab(tabName) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    
    const targetPane = document.getElementById(`pane-${tabName}`);
    if (targetPane) targetPane.classList.remove('hidden');

    // Reset style semua tombol navigasi
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('bg-brand-purple', 'text-white');
        btn.classList.add('text-slate-500', 'hover:bg-slate-50');
    });
    document.querySelectorAll('.mobile-btn').forEach(btn => {
        btn.classList.remove('text-brand-purple');
        btn.classList.add('text-slate-400');
    });

    // Pasang style aktif ke tombol yang diklik
    const activeSide = document.getElementById(`side-btn-${tabName}`);
    const activeNav = document.getElementById(`nav-btn-${tabName}`);
    if (activeSide) {
        activeSide.classList.add('bg-brand-purple', 'text-white');
        activeSide.classList.remove('text-slate-500');
    }
    if (activeNav) activeNav.classList.add('text-brand-purple');
}

// 3. PENGATURAN AUDIO ALARM MP3 CUSTOM DARI DEVICE
const mp3Uploader = document.getElementById('mp3-uploader');
if (mp3Uploader) {
    mp3Uploader.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            alarmSoundUrl = URL.createObjectURL(file); // Konversi file lokal menjadi path URL sementara
            document.getElementById('active-ringtone-name').innerText = file.name;
        }
    });
}

// 4. SISTEM JAM REALTIME & DETEKSI WAKTU ALARM BERDERING
setInterval(() => {
    const skrg = new Date();
    const liveTimer = document.getElementById('live-timer');
    if (liveTimer) {
        liveTimer.innerText = skrg.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    // Format pencocokan waktu jam lokal (HH:MM)
    const formatJamMenit = `${String(skrg.getHours()).padStart(2, '0')}:${String(skrg.getMinutes()).padStart(2, '0')}`;
    
    tasks.forEach(t => {
        if (!t.done && t.datetime.split(' ')[1] === formatJamMenit && !currentPlayingAudio) {
            startAlarm(t.title);
        }
    });
}, 1000);

function startAlarm(title) {
    currentPlayingAudio = new Audio(alarmSoundUrl);
    currentPlayingAudio.loop = true; // Setel loop terus menerus
    currentPlayingAudio.play().catch(() => console.log("Izin audio browser dibutuhkan. Klik layar terlebih dahulu."));

    document.getElementById('alarm-text').innerText = title;
    document.getElementById('alarm-banner').classList.remove('hidden');
}

const btnStopAlarm = document.getElementById('btn-stop-alarm');
if (btnStopAlarm) {
    btnStopAlarm.addEventListener('click', () => {
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            currentPlayingAudio = null;
        }
        document.getElementById('alarm-banner').classList.add('hidden');
    });
}

// 5. RENDER KOMPONEN UI KARTU (NOTE GRID & TASK LIST)
function renderAll() {
    const noteGrid = document.getElementById('note-grid');
    if (noteGrid) {
        noteGrid.innerHTML = notes.map((n, i) => `
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs relative group">
                <h4 class="font-bold text-slate-700 text-sm mb-1">${n.title}</h4>
                <p class="text-xs text-slate-400">${n.content}</p>
                <button onclick="openDeleteModal(${i})" class="absolute top-3 right-3 text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition">🗑️</button>
            </div>
        `).join('');
    }

    const progList = document.getElementById('task-list-progress');
    const doneList = document.getElementById('task-list-done');

    if (progList && doneList) {
        const progressTasks = tasks.filter(t => !t.done);
        const doneTasks = tasks.filter(t => t.done);

        progList.innerHTML = progressTasks.map(t => `
            <div class="bg-white p-4 rounded-2xl border border-slate-50 flex justify-between items-center shadow-xs">
                <div class="flex items-center gap-3">
                    <input type="checkbox" onchange="toggleTaskStatus(${t.id})" class="w-4 h-4 rounded border-slate-300 accent-brand-purple cursor-pointer">
                    <div>
                        <p class="text-sm font-semibold text-slate-700">${t.title}</p>
                        <p class="text-[10px] text-slate-400 mt-0.5">⏰ ${t.datetime}</p>
                    </div>
                </div>
                <button onclick="deleteTaskData(${t.id})" class="text-xs text-slate-400 hover:text-slate-600">Edit</button>
            </div>
        `).join('');

        if (isCompletedHidden) {
            doneList.innerHTML = '';
        } else {
            doneList.innerHTML = doneTasks.map(t => `
                <div class="bg-white/60 p-4 rounded-2xl border border-slate-100 flex justify-between items-center opacity-70">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" checked onchange="toggleTaskStatus(${t.id})" class="w-4 h-4 rounded border-slate-300 accent-brand-purple cursor-pointer">
                        <div>
                            <p class="text-sm font-medium line-through text-slate-400">${t.title}</p>
                            <p class="text-[10px] text-slate-300 mt-0.5">⏰ ${t.datetime}</p>
                        </div>
                    </div>
                    <button onclick="deleteTaskData(${t.id})" class="text-xs text-slate-300">Edit</button>
                </div>
            `).join('');
        }
    }
}

// 6. FORM MODAL INPUT LOGIC
function toggleModal(show) { 
    const modal = document.getElementById('input-modal');
    if (modal) modal.classList.toggle('hidden', !show); 
}

const btnGlobalAdd = document.getElementById('btn-global-add');
if (btnGlobalAdd) {
    btnGlobalAdd.addEventListener('click', () => toggleModal(true));
}

function saveData() {
    const title = document.getElementById('form-title').value;
    const date = document.getElementById('form-date').value;
    const time = document.getElementById('form-time').value;
    const type = document.getElementById('form-type').value;

    if (!title) return alert("Judul agenda kosong!");

    if (type === 'note') {
        notes.push({ id: Date.now(), title, content: "Catatan baru ditambahkan." });
    } else {
        tasks.push({
            id: Date.now(),
            title,
            datetime: `${date || '2026-05-31'} ${time || '12:00'}`,
            done: false
        });
    }
    toggleModal(false);
    renderAll();
    
    // Reset field form input
    document.getElementById('form-title').value = '';
    document.getElementById('form-date').value = '';
    document.getElementById('form-time').value = '';
}

// 7. OPERASI MANIPULASI DATA (CRUD)
function openDeleteModal(index) { 
    itemIndexToDelete = index; 
    const delModal = document.getElementById('delete-modal');
    if (delModal) delModal.classList.remove('hidden'); 
}
function closeDeleteModal() { 
    const delModal = document.getElementById('delete-modal');
    if (delModal) delModal.classList.add('hidden'); 
}

const btnConfirmDelete = document.getElementById('btn-confirm-delete');
if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
        if (itemIndexToDelete !== null) { 
            notes.splice(itemIndexToDelete, 1); 
            itemIndexToDelete = null; 
        }
        closeDeleteModal();
        renderAll();
    });
}

window.toggleTaskStatus = (id) => { const t = tasks.find(t => t.id === id); if(t) t.done = !t.done; renderAll(); };
window.deleteTaskData = (id) => { tasks = tasks.filter(t => t.id !== id); renderAll(); };
window.toggleCompletedSection = () => { 
    isCompletedHidden = !isCompletedHidden; 
    document.getElementById('completed-chevron').innerText = isCompletedHidden ? '▲' : '▼';
    renderAll(); 
};

// INITIAL RUN EXECUTIONS
renderAll();