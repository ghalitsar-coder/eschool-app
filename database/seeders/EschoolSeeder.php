<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EschoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $eschools = [
            [
                'school_id' => 1,
                'class_name' => 'XII IPA 1',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'class_name' => 'XII IPA 2',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'class_name' => 'XII IPS 1',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 2,
                'class_name' => 'XII IPA 1',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 2,
                'class_name' => 'XII IPS 1',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 3,
                'class_name' => 'XII IPA 1',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 4,
                'class_name' => 'XII IPA 1',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 5,
                'class_name' => 'XII IPA 1',
                'academic_year' => '2024/2025',
                'semester' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('eschools')->insert($eschools);
    }
}