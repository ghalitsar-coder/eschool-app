# Payment Statistics Implementation

## Overview

Implementasi fitur statistik persentase pembayaran untuk sistem kas management eschool.

## Features

### 1. Backend API

- **PaymentStatisticsController**: Controller untuk menghandle API endpoints
- **Routes**:
  - `GET /api/eschools/{eschoolId}/payment-statistics` - Statistik semua member
  - `GET /api/members/{memberId}/payment-details` - Detail pembayaran member
  - `GET /api/members/{memberId}/payments/{month}/{year}` - Pembayaran periode tertentu

### 2. Frontend Components

#### PaymentStatisticsTable

- Menampilkan tabel statistik pembayaran semua member
- Progress bar untuk visualisasi persentase
- Summary cards untuk overview
- Detail button untuk setiap member

#### PaymentStatusModal

- Modal yang menampilkan detail pembayaran member
- Grid layout untuk semua periode pembayaran
- Click periode untuk melihat detail transaksi
- Menggunakan template dari PaymentStatusTemplate.html

### 3. Hooks & Services

- **usePaymentStatistics**: Hook utama untuk statistik eschool
- **useMemberPaymentDetails**: Hook untuk detail member
- **useMemberPeriodPayments**: Hook untuk pembayaran periode tertentu
- **paymentStatisticsApi**: API service functions

## Usage

```tsx
import PaymentStatisticsTable from "./components/PaymentStatisticsTable";

// Di halaman kas
<PaymentStatisticsTable eschoolId={eschoolId} />;
```

## Data Flow

1. **Backend**: Kalkulasi persentase berdasarkan `monthly_fee_amount` dan total pembayaran
2. **Frontend**: Fetch data via hooks, tampilkan dalam tabel dan modal
3. **User Interaction**: Click detail → modal → click periode → detail transaksi

## Business Logic

### Konsep Pembayaran per Bulan

- **monthly_fee_amount**: Iuran per member per bulan (bukan total)
- **Persentase per bulan**: (Dibayar bulan ini / Iuran bulan ini) × 100%
- **Status per bulan**:
  - Lunas (100%): Sudah bayar penuh untuk bulan tersebut
  - Sebagian (1-99%): Sudah bayar sebagian, masih kurang
  - Belum Bayar (0%): Belum ada pembayaran untuk bulan tersebut

### Tampilan yang Diperbaiki

- **Tabel**: Disederhanakan, fokus ke modal detail
- **Modal**: Menampilkan status pembayaran per bulan dengan jelas
- **Summary**: Menampilkan info yang representatif (Total Member, Aktif Bayar, Iuran per Bulan)

### Contoh Skenario

```
Eschool A: Iuran 50.000 per member per bulan

Member A:
- September 2025: Bayar 25.000 → 50% (kurang 25.000)
- Oktober 2025: Belum bayar → 0% (kurang 50.000)
- November 2025: Bayar 50.000 → 100% (lunas)
```
