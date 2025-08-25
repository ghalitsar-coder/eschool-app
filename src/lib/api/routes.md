# Laravel API Routes untuk Kas Management

Berdasarkan KasController.php, berikut adalah routes yang perlu didefinisikan di Laravel:

## Routes yang perlu ditambahkan di `routes/api.php`:

```php
<?php

use App\Http\Controllers\KasController;

Route::middleware('auth:sanctum')->group(function () {
    // Kas Management Routes
    Route::prefix('kas')->group(function () {
        Route::get('/members', [KasController::class, 'getMembers']);
        Route::post('/income', [KasController::class, 'storeIncome']);
        Route::post('/expense', [KasController::class, 'storeExpense']);
        Route::get('/records', [KasController::class, 'getKasRecords']);
        Route::get('/summary', [KasController::class, 'getSummary']);
        Route::get('/export', [KasController::class, 'exportRecords']); // jika ada
    });
});
```

## Middleware yang diperlukan:

1. **auth:sanctum** - untuk authentication
2. **cors** - untuk cross-origin requests dari frontend

## Headers yang diperlukan dari frontend:

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

## Testing endpoints:

1. **GET** `/api/kas/members` - Test basic connection
2. **GET** `/api/kas/summary` - Test summary data
3. **POST** `/api/kas/expense` - Test simple expense creation

## CORS Configuration:

Pastikan `config/cors.php` mengizinkan:

- Origin: `http://localhost:3000` (Next.js dev server)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type, Accept, X-Requested-With
