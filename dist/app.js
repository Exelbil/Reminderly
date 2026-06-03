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
let isSidebarCollapsed = false;

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('opacity-0');
            setTimeout(() => { splash.style.display = 'none'; }, 500);
        }
    }, 1500);

    const mp3Uploader = document.getElementById('mp3-uploader');
    if (mp3Uploader) {
        mp3Uploader.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                alarmSoundUrl = URL.createObjectURL(file);
                const ringtoneNameElement = document.getElementById('active-ringtone-name');
                if (ringtoneNameElement) ringtoneNameElement.innerText = file.name;
            }
        });
    }

    renderAll();
    setTimeout(() => { switchTab('note'); }, 0);
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-panel');
    const body = document.getElementById('main-body');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const openTrigger = document.getElementById('sidebar-open-trigger');

    isSidebarCollapsed = !isSidebarCollapsed;

    if (isSidebarCollapsed) {
        sidebar.classList.remove('md:flex');
        sidebar.classList.add('hidden');
        body.classList.remove('md:pl-72');
        body.classList.add('md:pl-0');
        if (toggleBtn) toggleBtn.innerText = "▶";
        if (openTrigger) {
            openTrigger.classList.remove('hidden');
            openTrigger.classList.add('flex');
        }
    } else {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('md:flex');
        body.classList.remove('md:pl-0');
        body.classList.add('md:pl-72');
        if (toggleBtn) toggleBtn.innerText = "◀";
        if (openTrigger) {
            openTrigger.classList.remove('flex');
            openTrigger.classList.add('hidden');
        }
    }
}

function switchTab(tabName) {
    document.getElementById('pane-note').classList.add('hidden');
    document.getElementById('pane-task').classList.add('hidden');
    document.getElementById('pane-account').classList.add('hidden');
    
    const target = document.getElementById(`pane-${tabName}`);
    if (target) target.classList.remove('hidden');

    const searchWrapper = document.getElementById('search-wrapper');
    if (searchWrapper) {
        if (tabName === 'account') {
            searchWrapper.classList.add('hidden');
        } else {
            searchWrapper.classList.remove('hidden');
        }
    }

    const liveTimer = document.getElementById('live-timer');
    if (liveTimer) {
        const headerContainer = liveTimer.parentElement;
        if (tabName === 'account') {
            headerContainer.classList.remove('justify-between');
            headerContainer.classList.add('justify-center');
        } else {
            headerContainer.classList.remove('justify-center');
            headerContainer.classList.add('justify-between');
        }
    }

    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('bg-brand-purple', 'text-white', 'shadow-sm', 'shadow-purple-100');
        btn.classList.add('text-slate-500', 'hover:bg-slate-50');
    });
    const activeSide = document.getElementById(`side-btn-${tabName}`);
    if (activeSide) {
        activeSide.classList.remove('text-slate-500', 'hover:bg-slate-50');
        activeSide.classList.add('bg-brand-purple', 'text-white', 'shadow-sm', 'shadow-purple-100');
    }
}

setInterval(() => {
    const skrg = new Date();
    const liveTimer = document.getElementById('live-timer');
    if (liveTimer) {
        liveTimer.innerText = skrg.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    const formatJamMenit = `${String(skrg.getHours()).padStart(2, '0')}:${String(skrg.getMinutes()).padStart(2, '0')}`;
    
    tasks.forEach(t => {
        if (!t.done && t.datetime.split(' ')[1] === formatJamMenit && !currentPlayingAudio) {
            startAlarm(t.title);
        }
    });
}, 1000);

function startAlarm(title) {
    currentPlayingAudio = new Audio(alarmSoundUrl);
    currentPlayingAudio.loop = true;
    currentPlayingAudio.play().catch(() => console.log("Izin audio browser dibutuhkan."));

    const alarmText = document.getElementById('alarm-text');
    const alarmBanner = document.getElementById('alarm-banner');
    if (alarmText) alarmText.innerText = title;
    if (alarmBanner) alarmBanner.classList.remove('hidden');
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-stop-alarm') {
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            currentPlayingAudio = null;
        }
        const alarmBanner = document.getElementById('alarm-banner');
        if (alarmBanner) alarmBanner.classList.add('hidden');
    }
});

function renderAll() {
    const noteGrid = document.getElementById('note-grid');
    if (noteGrid) {
        noteGrid.innerHTML = notes.map((n, i) => `
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs relative group hover:shadow-md transition-all duration-200">
                <h4 class="font-bold text-slate-700 text-sm mb-1.5">${n.title}</h4>
                <p class="text-xs text-slate-400 leading-relaxed">${n.content}</p>
                <button onclick="openDeleteModal(${i})" class="absolute top-4 right-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-150 w-6 h-6 flex items-center justify-center bg-rose-50 text-[10px] rounded-lg">❌</button>
            </div>
        `).join('');
    }

    const progList = document.getElementById('task-list-progress');
    const doneList = document.getElementById('task-list-done');

    if (progList && doneList) {
        const progressTasks = tasks.filter(t => !t.done);
        const doneTasks = tasks.filter(t => t.done);

        progList.innerHTML = progressTasks.map(t => `
            <div class="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-xs hover:border-purple-100 transition-all">
                <div class="flex items-center gap-3.5 min-w-0">
                    <input type="checkbox" onchange="toggleTaskStatus(${t.id})" class="w-4 h-4 rounded border-slate-300 accent-brand-purple cursor-pointer shrink-0">
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-slate-700 truncate">${t.title}</p>
                        <p class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">⏰ ${t.datetime}</p>
                    </div>
                </div>
                <button onclick="deleteTaskData(${t.id})" class="text-xs text-slate-400 hover:text-brand-purple transition shrink-0 pl-2">Hapus</button>
            </div>
        `).join('');

        if (isCompletedHidden) {
            doneList.innerHTML = '';
        } else {
            doneList.innerHTML = doneTasks.map(t => `
                <div class="bg-white/60 p-4 rounded-2xl border border-slate-100 flex justify-between items-center opacity-60 min-w-0">
                    <div class="flex items-center gap-3.5 min-w-0">
                        <input type="checkbox" checked onchange="toggleTaskStatus(${t.id})" class="w-4 h-4 rounded border-slate-300 accent-brand-purple cursor-pointer shrink-0">
                        <div class="min-w-0">
                            <p class="text-sm font-medium line-through text-slate-400 truncate">${t.title}</p>
                            <p class="text-[10px] text-slate-300 mt-1">⏰ ${t.datetime}</p>
                        </div>
                    </div>
                    <button onclick="deleteTaskData(${t.id})" class="text-xs text-slate-300 hover:text-rose-500 transition shrink-0 pl-2">Hapus</button>
                </div>
            `).join('');
        }
    }
}

function toggleModal(show) { 
    const modal = document.getElementById('input-modal');
    if (modal) modal.classList.toggle('hidden', !show); 
}

function saveData() {
    const title = document.getElementById('form-title').value;
    const date = document.getElementById('form-date').value;
    const time = document.getElementById('form-time').value;
    const type = document.getElementById('form-type').value;

    if (!title) return alert("Judul tidak boleh kosong, bos!");

    // Ambil tanggal & waktu yang diinput user, kalau kosong pakai waktu default sekarang
    const finalDate = date || new Date().toISOString().split('T')[0];
    const finalTime = time || "12:00";
    const datetimeFormat = `${finalDate} ${finalTime}`;

    if (type === 'note') {
        notes.push({ 
            id: Date.now(), 
            title: title, 
            content: `Pengingat terjadwal pada tanggal ${finalDate} jam ${finalTime}` 
        });
    } else {
        tasks.push({ 
            id: Date.now(), 
            title: title, 
            datetime: datetimeFormat, 
            done: false 
        });
    }

    toggleModal(false);
    renderAll();
    
    // Reset isi form
    document.getElementById('form-title').value = '';
    document.getElementById('form-date').value = '';
    document.getElementById('form-time').value = '';
}

function openDeleteModal(index) { 
    itemIndexToDelete = index; 
    const delModal = document.getElementById('delete-modal');
    if (delModal) delModal.classList.remove('hidden'); 
}

function closeDeleteModal() { 
    const delModal = document.getElementById('delete-modal');
    if (delModal) delModal.classList.add('hidden'); 
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-confirm-delete') {
        if (itemIndexToDelete !== null) { 
            notes.splice(itemIndexToDelete, 1); 
            itemIndexToDelete = null; 
        }
        closeDeleteModal();
        renderAll();
    }
});

window.toggleTaskStatus = (id) => { const t = tasks.find(t => t.id === id); if(t) t.done = !t.done; renderAll(); };
window.deleteTaskData = (id) => { tasks = tasks.filter(t => t.id !== id); renderAll(); };
window.toggleCompletedSection = () => { 
    isCompletedHidden = !isCompletedHidden; 
    const chevron = document.getElementById('completed-chevron');
    if (chevron) chevron.innerText = isCompletedHidden ? '▲' : '▼';
    renderAll(); 
};