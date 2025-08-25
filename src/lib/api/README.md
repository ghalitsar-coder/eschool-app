# Kas Management API Documentation

## Overview

API endpoints untuk manajemen kas berdasarkan Laravel backend controller.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Semua endpoint memerlukan authentication token dalam header:

```
Authorization: Bearer {token}
```

## Endpoints

### 1. Get Members

**GET** `/kas/members`

Mengambil daftar member untuk eschool dari treasurer yang login.

**Response:**

```json
{
  "eschool": {
    "id": 1,
    "name": "Basketball Club",
    "monthly_kas_amount": 50000
  },
  "members": [
    {
      "id": 1,
      "student_id": "12345",
      "name": "Ahmad Rizki",
      "email": "ahmad@example.com",
      "phone": "081234567890"
    }
  ]
}
```

### 2. Add Income

**POST** `/kas/income`

Menambah pemasukan kas dengan detail pembayaran per member.

**Request Body:**

```json
{
  "description": "Monthly dues - January 2024",
  "date": "2024-01-15",
  "payments": [
    {
      "member_id": 1,
      "amount": 50000,
      "month": 1,
      "year": 2024
    },
    {
      "member_id": 2,
      "amount": 50000,
      "month": 1,
      "year": 2024
    }
  ]
}
```

**Response:**

```json
{
  "message": "Pemasukan berhasil dicatat",
  "kas_record_id": 123
}
```

### 3. Add Expense

**POST** `/kas/expense`

Menambah pengeluaran kas.

**Request Body:**

```json
{
  "amount": 75000,
  "description": "Basketball equipment purchase",
  "date": "2024-01-20"
}
```

**Response:**

```json
{
  "message": "Pengeluaran berhasil dicatat",
  "kas_record_id": 124
}
```

### 4. Get Kas Records

**GET** `/kas/records`

Mengambil riwayat transaksi kas dengan pagination.

**Query Parameters:**

- `type` (optional): "income" atau "expense"
- `month` (optional): 1-12
- `year` (optional): tahun
- `page` (optional): halaman (default: 1)

**Response:**

```json
{
  "data": [
    {
      "id": 123,
      "type": "income",
      "amount": 100000,
      "description": "Monthly dues - January 2024",
      "date": "2024-01-15",
      "created_at": "2024-01-15 10:00:00",
      "payments": [
        {
          "member_name": "Ahmad Rizki",
          "amount": 50000,
          "month": 1,
          "year": 2024
        },
        {
          "member_name": "Siti Nurhaliza",
          "amount": 50000,
          "month": 1,
          "year": 2024
        }
      ]
    },
    {
      "id": 124,
      "type": "expense",
      "amount": 75000,
      "description": "Basketball equipment purchase",
      "date": "2024-01-20",
      "created_at": "2024-01-20 14:00:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

### 5. Get Summary

**GET** `/kas/summary`

Mengambil ringkasan kas untuk dashboard.

**Response:**

```json
{
  "eschool": {
    "name": "Basketball Club",
    "monthly_kas_amount": 50000
  },
  "summary": {
    "total_income": 500000,
    "total_expense": 200000,
    "balance": 300000,
    "total_members": 25
  },
  "current_month": {
    "month": 1,
    "year": 2024,
    "paid_count": 20,
    "unpaid_count": 5,
    "payment_percentage": 80.0
  }
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "message": "User tidak terautentikasi"
}
```

### 404 Not Found

```json
{
  "message": "Eschool tidak ditemukan untuk user ini"
}
```

### 422 Validation Error

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "description": ["The description field is required."],
    "amount": ["The amount must be at least 1."]
  }
}
```

### 500 Server Error

```json
{
  "message": "Error occurred",
  "error": "Detailed error message"
}
```

## Notes

1. **Role-based Access**: Hanya user dengan role "bendahara" yang dapat mengakses endpoint kas
2. **Eschool Context**: Semua data kas terikat dengan eschool yang dikelola oleh treasurer yang login
3. **Validation**: Semua input divalidasi sesuai dengan aturan bisnis
4. **Transactions**: Operasi income menggunakan database transaction untuk konsistensi data
5. **Pagination**: Endpoint records menggunakan pagination dengan default 20 items per page
