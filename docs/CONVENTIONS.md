# Konvensi edu3d

Dibaca agent sebelum menulis naskah, scene, atau overlay. Sumber kebenaran lain: `src/theme.ts`, dan docstring di `src/scenes/parts.tsx` serta `src/ui/*.tsx` (tiap primitif menjelaskan dirinya).

## Kanvas & format

- 1080×1920 (9:16 potret), 30 fps, satu komposisi `EduMain`. Angka-angka ini hidup di satu tempat: `src/Root.tsx`. Di kode lain ambil via `useVideoConfig()`, jangan hardcode.
- Durasi total = jumlah durasi beat. Tiga tempat yang harus berubah bersamaan saat durasi beat berubah: tabel naskah, array `BEATS` (`src/EduMain.tsx`, offset `from` kumulatif), dan `durationInFrames` (`src/Root.tsx`). Ketiganya membawa komentar penjumlahan; update ketiganya dalam satu perubahan.

## Determinisme (render harus identik frame-per-frame)

- Semua animasi diturunkan dari `useCurrentFrame()` plus `spring` (dari `remotion`), `lerp`, dan easing dari `parts.tsx`. Bukan `useFrame` dari three.js — lihat docstring `src/three/DemoScene.tsx` (placeholder yang tidak dipasang di timeline; docstring-nya menjadi rumah aturan ini).
- Random hanya lewat `random()` dari remotion dengan seed string unik per slot, pola `random(\`<inisial-scene>-<slot>-${i}\`)` (contoh: `src/scenes/Scene_hook.tsx:47`). `Math.random`, `Date.now`, dan akses jaringan tidak ada di `src/` dan tidak ditambahkan.
- Tanpa shadow map: depth cue memakai fog + pencahayaan (`SceneAtmosphere`, `parts.tsx`).

## Safe area (zona UI TikTok)

- `safeMargin` di `src/theme.ts`: top 140, bottom 320, side 48 px. Semua teks/overlay berada di dalamnya; `Caption`, `Stamp`, dan `Chip` sudah mematuhinya — overlay custom wajib ikut.
- Stamps besar ditumpuk vertikal tanpa tumpang tindih, dimulai di bawah zona 140 px (contoh: `src/scenes/Scene_hook.tsx:151-182`).

## Teks = overlay HTML, bukan teks 3D

- Caption, stamp, dan label dirender sebagai HTML absolut DI ATAS `ThreeCanvas` — tidak pernah sebagai teks 3D. Alasannya: tetap tajam dan terbaca di atas objek 3D terang (docstring `src/ui/Caption.tsx`).
- Pemilihan komponen: `Caption` untuk baris caption (opsi `accentIndex` menyorot satu baris, `staggerFrames` mengatur tempo pop-in); `Stamp` untuk kata besar ber-stempel; `Chip` untuk pill label ("KITA", "KAS NEGARA", tulisan spanduk).
- Satu font stack bersama untuk semua overlay: `OVERLAY_FONT_STACK` di `src/ui/Stamp.tsx`.

## Token warna

- Warna teks/UI selalu dari token `theme` (`src/theme.ts`): `background`, `accentYellow`, `accentRed`, `paper`, `neonGreen`, `darkTeal`.
- Material dan lampu 3D boleh memakai hex literal, tetap di dalam palet hangat kuning/merah tema (catatan review: `src/scenes/Scene_hook.tsx:25` dan `:81` — hijau dihapus dari hook); keluarga warna baru diperkenalkan hanya lewat token `theme`, bukan hex tempelan.

## Frustum potret

- Kamera FOV 42° pada kanvas 1080×1920 memberi setengah-FOV horizontal ≈ 12,2° (tan ≈ 0,214). Parametrisasi posisi objek lewat sudut layar, dikurangi radius sudut objek terbesar, agar tidak ada yang menyentuh tepi (contoh perhitungan koin: `src/scenes/Scene_hook.tsx:42-58`).
- `BackdropPlane` diberi `fog={false}` supaya bidang latar tetap datar, dan fog menangani objek scene.

## Integritas konten (video edukasi)

- Tidak mengarang angka, persen, atau nominal: satu-satunya angka yang boleh tampil adalah yang ada di sumber (`docs/naskah-orasi.md`: "Nol angka/persen/nominal di seluruh caption"). Data yang tidak tersedia diganti metafora visual, bukan perkiraan.
- Kutipan orasi verbatim terhadap transkrip sumber; rujukan transkrip dicatat di header naskah (mis. transkrip CC di `scout/out/evidence_*.json` seperti pada `docs/naskah-orasi.md`). Transkrip baru dibuat lewat workspace `scout/` (di luar repo edu3d): `python -I scout.py --url ... --skip-verify` menghasilkan `out/evidence_<vid>.json` — lihat `scout/README.md` di root workspace.
- Figur selalu anonim: tanpa wajah orang nyata, tanpa logo institusi nyata (syarat SceneBrief pada tabel beat).

## Verifikasi sebelum selesai

Urutan gate dan kriteria selesainya ada di `AGENTS.md` (typecheck → stills → render). Catatan cara menjalankan masing-masing:

- Repo merender **tanpa audio**: tidak ada `<Audio>` di `src/` dan tidak ada gate audio. SceneBrief yang menyebut "sinkron dengan audio" (seperti pada `docs/naskah-orasi.md`) menggambarkan beat terhadap sumber orasi, bukan elemen render — video baru jangan menjanjikan sinkronisasi audio sebelum pipeline audio dibangun.
- Gate stills bermakna hanya jika PNG-nya dibaca: periksa teks di dalam safe area, objek tidak terpotong tepi, palet konsisten antar beat.
- Probe piksel opsional: `powershell -File out/_selfcheck/check.ps1 out/stills/hook.png` melaporkan piksel terang di zona 140 px atas, persentase piksel hijau-dominan, dan piksel terang yang menyentuh tepi kiri/kanan. Helper ini lokal dan untracked (`out/` di-gitignore) — buat ulang bila hilang.
