<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $members = [
            // Members for eschool_id 1 (XII IPA 1 - SMA Negeri 1 Jakarta)
            [
                'eschool_id' => 1,
                'name' => 'Ahmad Rizki',
                'student_id' => '2024001',
                'phone' => '081234567890',
                'address' => 'Jl. Kebon Jeruk No. 12, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 1,
                'name' => 'Siti Nurhaliza',
                'student_id' => '2024002',
                'phone' => '081234567891',
                'address' => 'Jl. Cempaka Putih No. 34, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 1,
                'name' => 'Budi Santoso',
                'student_id' => '2024003',
                'phone' => '081234567892',
                'address' => 'Jl. Menteng Raya No. 56, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 1,
                'name' => 'Dewi Lestari',
                'student_id' => '2024004',
                'phone' => '081234567893',
                'address' => 'Jl. Sudirman No. 78, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 1,
                'name' => 'Eko Prasetyo',
                'student_id' => '2024005',
                'phone' => '081234567894',
                'address' => 'Jl. Thamrin No. 90, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Members for eschool_id 2 (XII IPA 2 - SMA Negeri 1 Jakarta)
            [
                'eschool_id' => 2,
                'name' => 'Farah Diba',
                'student_id' => '2024006',
                'phone' => '081234567895',
                'address' => 'Jl. Kemang No. 11, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 2,
                'name' => 'Gilang Ramadhan',
                'student_id' => '2024007',
                'phone' => '081234567896',
                'address' => 'Jl. Pondok Indah No. 22, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 2,
                'name' => 'Hana Pertiwi',
                'student_id' => '2024008',
                'phone' => '081234567897',
                'address' => 'Jl. Senayan No. 33, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Members for eschool_id 3 (XII IPS 1 - SMA Negeri 1 Jakarta)
            [
                'eschool_id' => 3,
                'name' => 'Indra Gunawan',
                'student_id' => '2024009',
                'phone' => '081234567898',
                'address' => 'Jl. Kuningan No. 44, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 3,
                'name' => 'Jihan Aulia',
                'student_id' => '2024010',
                'phone' => '081234567899',
                'address' => 'Jl. Blok M No. 55, Jakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Members for other eschools
            [
                'eschool_id' => 4,
                'name' => 'Krisna Wijaya',
                'student_id' => '2024011',
                'phone' => '082234567890',
                'address' => 'Jl. Dago No. 66, Bandung',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 4,
                'name' => 'Laila Sari',
                'student_id' => '2024012',
                'phone' => '082234567891',
                'address' => 'Jl. Braga No. 77, Bandung',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 5,
                'name' => 'Muhammad Fadli',
                'student_id' => '2024013',
                'phone' => '082234567892',
                'address' => 'Jl. Asia Afrika No. 88, Bandung',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 6,
                'name' => 'Nadia Putri',
                'student_id' => '2024014',
                'phone' => '083234567890',
                'address' => 'Jl. Gubeng No. 99, Surabaya',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 7,
                'name' => 'Omar Hakim',
                'student_id' => '2024015',
                'phone' => '084234567890',
                'address' => 'Jl. Malioboro No. 101, Yogyakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eschool_id' => 8,
                'name' => 'Putri Maharani',
                'student_id' => '2024016',
                'phone' => '085234567890',
                'address' => 'Jl. Medan Merdeka No. 111, Medan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('members')->insert($members);
    }
}