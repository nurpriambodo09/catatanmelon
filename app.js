// ==========================================
// 1. REGISTRASI SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker aktif:', reg.scope))
      .catch((err) => console.error('Service Worker gagal:', err));
  });
}

// ==========================================
// 2. LOGIKA APLIKASI, TANGGAL & CHECKLIST
// ==========================================
const noteInput = document.getElementById('noteInput');
const addBtn = document.getElementById('addBtn');
const noteList = document.getElementById('noteList');

// --- Fungsi 1: Mendapatkan Hari & Tanggal Sekarang ---
function getFormattedDate() {
  const opsi = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  // Menghasilkan format Indonesia, contoh: "Selasa, 7 Jul 2026"
  return new Date().toLocaleDateString('id-ID', opsi);
}

// --- Fungsi 2: Memuat Catatan dari Storage saat Aplikasi Dibuka ---
function loadNotes() {
  const savedNotes = JSON.parse(localStorage.getItem('pwa_notes')) || [];
  savedNotes.forEach(noteObj => {
    // noteObj sekarang berisi id, teks, tanggal, dan status selesai (isDone)
    createNoteElement(noteObj);
  });
}

// --- Fungsi 3: Membuat Elemen Daftar HTML di Layar ---
function createNoteElement(noteObj) {
  const li = document.createElement('li');
  li.setAttribute('data-id', noteObj.id);
  if (noteObj.isDone) {
    li.classList.add('completed'); // Beri gaya coret jika sudah selesai
  }

  // A. Kotak Centang (Checkbox)
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = noteObj.isDone;
  checkbox.addEventListener('change', () => {
    li.classList.toggle('completed', checkbox.checked);
    toggleNoteStatusInStorage(noteObj.id, checkbox.checked);
  });

  // B. Konten Teks & Tanggal
  const contentDiv = document.createElement('div');
  contentDiv.className = 'note-content';

  const textSpan = document.createElement('span');
  textSpan.className = 'note-text';
  textSpan.textContent = noteObj.text;

  const dateSpan = document.createElement('span');
  dateSpan.className = 'note-date';
  dateSpan.textContent = noteObj.date;

  contentDiv.appendChild(textSpan);
  contentDiv.appendChild(dateSpan);

  // C. Tombol Hapus
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.className = 'delete-btn';
  deleteBtn.addEventListener('click', () => {
    li.remove();
    deleteNoteFromStorage(noteObj.id);
  });

  // Gabungkan semua komponen ke dalam baris list (li)
  li.appendChild(checkbox);
  li.appendChild(contentDiv);
  li.appendChild(deleteBtn);
  noteList.appendChild(li);
}

// --- Fungsi 4: Menyimpan Catatan Baru ke localStorage ---
function saveNoteToStorage(noteObj) {
  const savedNotes = JSON.parse(localStorage.getItem('pwa_notes')) || [];
  savedNotes.push(noteObj);
  localStorage.setItem('pwa_notes', JSON.stringify(savedNotes));
}

// --- Fungsi 5: Mengubah Status Centang (Selesai/Belum) di localStorage ---
function toggleNoteStatusInStorage(id, isDone) {
  let savedNotes = JSON.parse(localStorage.getItem('pwa_notes')) || [];
  savedNotes = savedNotes.map(note => {
    if (note.id === id) {
      note.isDone = isDone;
    }
    return note;
  });
  localStorage.setItem('pwa_notes', JSON.stringify(savedNotes));
}

// --- Fungsi 6: Menghapus Catatan dari localStorage Berdasarkan ID ---
function deleteNoteFromStorage(id) {
  let savedNotes = JSON.parse(localStorage.getItem('pwa_notes')) || [];
  savedNotes = savedNotes.filter(note => note.id !== id);
  localStorage.setItem('pwa_notes', JSON.stringify(savedNotes));
}

// --- Event Listener: Ketika Tombol 'Tambah' Diklik ---
addBtn.addEventListener('click', () => {
  const text = noteInput.value.trim();
  if (text !== '') {
    const newNote = {
      id: Date.now(), // Gunakan timestamp sebagai ID unik
      text: text,
      date: getFormattedDate(),
      isDone: false
    };

    createNoteElement(newNote); // Tampilkan di layar
    saveNoteToStorage(newNote); // Simpan ke storage
    noteInput.value = '';        // Bersihkan input
  }
});

// Jalankan fungsi memuat otomatis saat aplikasi pertama dibuka
loadNotes();
