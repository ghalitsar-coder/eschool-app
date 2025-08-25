<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SchoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schools = [
            [
                'name' => 'SMA Negeri 1 Jakarta',
                'address' => 'Jl. Budi Kemuliaan No. 6, Jakarta Pusat',
                'phone' => '021-3456789',
                'email' => 'info@sman1jakarta.sch.id',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SMA Negeri 2 Bandung',
                'address' => 'Jl. Cihampelas No. 123, Bandung',
                'phone' => '022-2345678',
                'email' => 'info@sman2bandung.sch.id',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SMA Negeri 3 Surabaya',
                'address' => 'Jl. Pemuda No. 45, Surabaya',
                'phone' => '031-3456789',
                'email' => 'info@sman3surabaya.sch.id',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SMA Negeri 1 Yogyakarta',
                'address' => 'Jl. Malioboro No. 78, Yogyakarta',
                'phone' => '0274-567890',
                'email' => 'info@sman1yogya.sch.id',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SMA Negeri 2 Medan',
                'address' => 'Jl. Sisingamangaraja No. 90, Medan',
                'phone' => '061-4567890',
                'email' => 'info@sman2medan.sch.id',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('schools')->insert($schools);
    }
}