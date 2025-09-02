# eSchool Management

Direktori ini berisi komponen-komponen untuk manajemen eschool dalam aplikasi eSchool.

## Struktur Direktori

```
eschool/
├── components/
│   ├── DialogCreateEschool.tsx
│   ├── DialogDeleteEschool.tsx
│   ├── DialogUpdateEschool.tsx
│   ├── ErrorEschoolAlert.tsx
│   ├── EschoolForm.tsx
│   ├── EschoolList.tsx
│   └── HeaderEschool.tsx
├── page.tsx
└── ...
```

## Komponen Utama

### DialogCreateEschool.tsx
Dialog untuk membuat eschool baru. Menyertakan form untuk:
- Informasi eschool
- Informasi koordinator (nama, email, dan field tambahan)
- Informasi bendahara (dari daftar yang ada atau membuat baru dengan field tambahan)

### DialogUpdateEschool.tsx
Dialog untuk memperbarui eschool yang sudah ada. Menyertakan form untuk:
- Informasi eschool
- Mengganti bendahara dengan yang baru (dengan field tambahan)

### DialogDeleteEschool.tsx
Dialog konfirmasi untuk menghapus eschool.

### EschoolList.tsx
Daftar eschool dengan kemampuan pencarian dan pagination.

### HeaderEschool.tsx
Header halaman manajemen eschool dengan tombol tambah dan pencarian.

## Field Tambahan untuk Koordinator dan Bendahara

PR terbaru menambahkan field-field identitas tambahan untuk koordinator dan bendahara:

### Untuk Koordinator:
- NIP/NIS
- Tanggal lahir
- Jenis kelamin
- Alamat
- Nomor telepon

### Untuk Bendahara:
- NIP/NIS
- Tanggal lahir
- Jenis kelamin
- Alamat
- Nomor telepon

## Dokumentasi

- [CHANGELOG.md](CHANGELOG.md) - Ringkasan perubahan
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Panduan untuk developer
- [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md) - Template untuk pull request
- [EXECUTION_SUMMARY.md](EXECUTION_SUMMARY.md) - Ringkasan eksekusi perintah

## API Documentation

Dokumentasi API yang diperbarui tersedia di:
- [KAS_API_DOCUMENTATION_UPDATED.md](../../../laravel-backend/KAS_API_DOCUMENTATION_UPDATED.md)

## Pengujian

Script pengujian sederhana tersedia di:
- [test-eschool-api.sh](../../../laravel-backend/test-eschool-api.sh)