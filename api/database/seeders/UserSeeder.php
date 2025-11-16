<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
    
        $defualtName = env('USER_DEFAULT_NAME');
        $defualtEmail = env('USER_DEFAULT_EMAIL');
        $defualtPass = env('USER_DEFAULT_PASS');

        DB::table('users')->insert([
            'name' => $defualtName,
            'email' => $defualtEmail,
            'password' => Hash::make($defualtPass),
        ]);
    }
}