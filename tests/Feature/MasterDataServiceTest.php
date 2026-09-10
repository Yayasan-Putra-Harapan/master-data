<?php

use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\Unit;
use App\Models\User;

test('authenticated user can view master data dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
});

test('authenticated user can view units web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/units');

    $response->assertStatus(200);
});

test('authenticated user can view orang-tua web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/orang-tua');

    $response->assertStatus(200);
});

test('authenticated user can view karyawan web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/karyawan');

    $response->assertStatus(200);
});

test('authenticated user can view siswa web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/siswa');

    $response->assertStatus(200);
});

test('authenticated user can view data quality audit page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/data-quality');

    $response->assertStatus(200);
});

test('api can fetch units listing', function () {
    $response = $this->getJson('/api/v1/units');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'kode_unit', 'nama_unit', 'jenjang', 'is_aktif']
            ]
        ]);
});

test('api can fetch data quality audit metrics', function () {
    $response = $this->getJson('/api/v1/data-quality');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'data' => [
                'completeness',
                'uniqueness',
                'consistency',
                'validity',
                'accuracy',
                'summary'
            ],
            'timestamp'
        ]);
});

test('siswa validation enforces validity: rejects non-10 digit nisn', function () {
    $user = User::factory()->create();
    $unit = Unit::first() ?? Unit::factory()->create();

    $response = $this->actingAs($user)->post('/siswa', [
        'nisn' => '12345', // Invalid: only 5 digits
        'nama_lengkap' => 'Budi Santoso',
        'jenis_kelamin' => 'L',
        'tempat_lahir' => 'Purwokerto',
        'tanggal_lahir' => '2015-05-10',
        'unit_id' => $unit->id,
        'alamat' => 'Jl. Merdeka No. 1',
        'angkatan' => 2024,
        'status' => 'aktif',
    ]);

    $response->assertSessionHasErrors('nisn');
});

test('siswa validation enforces accuracy: rejects illogical age for PG', function () {
    $user = User::factory()->create();
    $pgUnit = Unit::where('jenjang', 'PG')->first();

    if ($pgUnit) {
        $response = $this->actingAs($user)->post('/siswa', [
            'nisn' => '9999888877',
            'nama_lengkap' => 'Dewasa Masuk PG',
            'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Purwokerto',
            'tanggal_lahir' => '2005-01-01', // 21 years old for Playgroup!
            'unit_id' => $pgUnit->id,
            'alamat' => 'Jl. Sudirman',
            'angkatan' => 2024,
            'status' => 'aktif',
        ]);

        $response->assertSessionHasErrors('tanggal_lahir');
    }
});

// Increment 2 Tests
test('authenticated user can view tahun ajaran web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/tahun-ajaran');

    $response->assertStatus(200);
});

test('authenticated user can view kelas web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/kelas');

    $response->assertStatus(200);
});

test('authenticated user can view bangunan web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/bangunan');

    $response->assertStatus(200);
});

test('authenticated user can view ruang web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/ruang');

    $response->assertStatus(200);
});

test('authenticated user can view mata pelajaran web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/mata-pelajaran');

    $response->assertStatus(200);
});

test('authenticated user can view vendor web page via inertia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/vendor');

    $response->assertStatus(200);
});

test('api can fetch all increment 2 endpoints listing', function () {
    $this->getJson('/api/v1/tahun-ajaran')->assertStatus(200)->assertJsonStructure(['data']);
    $this->getJson('/api/v1/kelas')->assertStatus(200)->assertJsonStructure(['data']);
    $this->getJson('/api/v1/bangunan')->assertStatus(200)->assertJsonStructure(['data']);
    $this->getJson('/api/v1/ruang')->assertStatus(200)->assertJsonStructure(['data']);
    $this->getJson('/api/v1/mata-pelajaran')->assertStatus(200)->assertJsonStructure(['data']);
    $this->getJson('/api/v1/vendor')->assertStatus(200)->assertJsonStructure(['data']);
});
