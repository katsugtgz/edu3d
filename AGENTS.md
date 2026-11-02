# edu3d — engine video edukasi vertikal

Remotion + three.js (`@react-three/fiber`). Satu komposisi `EduMain`: **1080×1920 @ 30 fps** (`src/Root.tsx`). Repo ini memuat **satu video aktif** dalam satu waktu — `BEATS` dan `durationInFrames` hanya menampung satu timeline — jadi video baru MENGANTIKAN video lama: scene beat lama diganti, naskah lama dibiarkan di `docs/` sebagai arsip.

Peta file:

- `src/Root.tsx` — dimensi, fps, `durationInFrames` komposisi.
- `src/EduMain.tsx` — array `BEATS`: urutan beat, offset `from` kumulatif, durasi (`Sequence`).
- `src/scenes/Scene_<beat>.tsx` — satu file per beat; primitif 3D bersama di `src/scenes/parts.tsx`.
- `src/ui/Caption.tsx`, `src/ui/Stamp.tsx` — overlay teks HTML (`Stamp.tsx` juga mengekspor `Chip`).
- `src/theme.ts` — token warna + `safeMargin`.
- `docs/naskah-orasi.md` — **naskah contoh kerja; baca sebelum menulis naskah baru**.
- `docs/CONVENTIONS.md` — **baca sebelum menulis naskah, scene, atau overlay** (determinisme, safe area, frustum potret, token, integritas konten, realita audio).

## Alur bikin video baru

Semua perintah dijalankan dari root workspace (`clipw/`) dengan `npm --prefix edu3d run <script>`; output mendarat di `edu3d/out/`. `npm --prefix edu3d run dev` membuka Remotion Studio untuk iterasi visual.

1. **Naskah** — tulis `docs/<nama>.md` mengikuti pola `docs/naskah-orasi.md`: tabel beat (caption per layar, DurationFrames, SceneBrief) plus total frame; sumber materi dicatat di header naskah (rujukan transkrip + Catatan Produksi), seperti contohnya. Selesai bila: tiap caption bisa dilacak ke sumber yang tercatat di header naskah, dan jumlah DurationFrames sama dengan angka yang akan ditulis di `Root.tsx`.
2. **Timeline** — daftarkan tiap beat di `BEATS` (`src/EduMain.tsx`) dan set `durationInFrames` di `src/Root.tsx`; hitung ulang offset `from` kumulatif saat ada durasi berubah. Selesai bila: `npm --prefix edu3d run typecheck` keluar 0 dan penjumlahan durasi cocok dengan `durationInFrames`.
3. **Scene per beat** — satu `Scene_<beat>.tsx` per beat, urutan layer selalu: background → `ThreeCanvas` → overlay HTML; kamera lewat `CameraRig` dari `parts.tsx`. Selesai bila: tiap entri `BEATS` merender scene-nya, tanpa teks 3D, tanpa objek menyentuh tepi frame (diverifikasi di gate stills, langkah 6).
4. **Caption** — teks overlay lewat komponen `Caption` / `Stamp` / `Chip`; copy verbatim dari tabel naskah. Selesai bila: caption di layar identik karakter-per-karakter dengan naskah.
5. **Gate typecheck** — `npm --prefix edu3d run typecheck`. Selesai bila: 0 error.
6. **Gate stills** — `npm --prefix edu3d run stills` → tiga PNG di `out/stills/`. Nama file dan nomor frame (`--frame=50/320/860`, `hook/mid/outro.png`) ter-hardcode per video di `scripts.stills` (`package.json`) — untuk video baru, edit entri itu agar namanya mengikuti beat video baru dan tiap frame jatuh di dalam beat tujuannya. Selesai bila: exit 0 **dan** ketiga PNG sudah dibaca dan lolos cek visual (teks di dalam safe area, objek utuh, palet konsisten).
7. **Gate render** — `npm --prefix edu3d run render` → `out/final.mp4`. Selesai bila: exit 0 dan video diputar/spot-check (urutan beat benar, caption sinkron dengan naskah).
8. **Commit & push** — `edu3d/` adalah repo git sendiri (root `clipw/` bukan repo). Komit hanya setelah semua gate (langkah 5–7) lolos, dan setelah memeriksa `git status`: komit hanya file milik video yang sudah lolos gate — jangan menyapu sisa perubahan dari video sebelumnya. Push ke remote bila sudah terdaftar — per penulisan ini `git remote -v` masih kosong, jadi remote perlu dibuat lebih dulu.

Semua konvensi detail hidup di `docs/CONVENTIONS.md` — pegang aturan determinisme, safe area, dan anti-angka-karangan dari sana, bukan dari ingatan.
