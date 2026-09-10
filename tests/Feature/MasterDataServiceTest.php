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

// Master Data Bulk Import & Export Tests
test('authenticated user can export siswa to csv', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/siswa/export');

    $response->assertStatus(200)
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('authenticated user can download siswa import template', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/siswa/template');

    $response->assertStatus(200)
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('authenticated user can export karyawan to csv', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/karyawan/export');

    $response->assertStatus(200)
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('authenticated user can download karyawan import template', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/karyawan/template');

    $response->assertStatus(200)
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('authenticated user can export orang tua to csv', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/orang-tua/export');

    $response->assertStatus(200)
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('authenticated user can import siswa from valid csv', function () {
    $user = User::factory()->create();
    $unit = Unit::first() ?? Unit::factory()->create(['kode_unit' => 'SD']);

    $csvContent = "nisn,nis,nik,nama_lengkap,nama_panggilan,jenis_kelamin,tempat_lahir,tanggal_lahir,agama,kode_unit,alamat,angkatan,status\n";
    $csvContent .= "0011223344,20251111,3302010101159999,Siswa Impor Uji,Uji,L,Purwokerto,2015-01-01,Islam,{$unit->kode_unit},Jl. Raya No. 1,2025,aktif\n";

    $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('siswa_test.csv', $csvContent);

    $response = $this->actingAs($user)->post('/siswa/import', [
        'file' => $file,
    ]);

    $response->assertRedirect('/siswa');
    $this->assertDatabaseHas('siswa', [
        'nisn' => '0011223344',
        'nama_lengkap' => 'Siswa Impor Uji',
    ]);
});

test('authenticated user can export and import kelas', function () {
    $user = User::factory()->create();
    $unit = Unit::first() ?? Unit::factory()->create(['kode_unit' => 'SD']);
    $ta = \App\Models\TahunAjaran::first() ?? \App\Models\TahunAjaran::factory()->create();

    $this->actingAs($user)->get('/kelas/export')->assertStatus(200)->assertHeader('content-type', 'text/csv; charset=UTF-8');
    $this->actingAs($user)->get('/kelas/template')->assertStatus(200)->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $csv = "kode_kelas,nama_kelas,tingkat,kode_unit,kode_tahun_ajaran,nip_wali_kelas,kapasitas\n";
    $csv .= "KLS-TEST-1X,Kelas 1X Test,1,{$unit->kode_unit},{$ta->kode},,30\n";
    $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('kelas_test.csv', $csv);

    $this->actingAs($user)->post('/kelas/import', ['file' => $file])->assertRedirect('/kelas');
    $this->assertDatabaseHas('kelas', ['kode_kelas' => 'KLS-TEST-1X']);
});

test('authenticated user can export and import mata pelajaran', function () {
    $user = User::factory()->create();
    $unit = Unit::first() ?? Unit::factory()->create(['kode_unit' => 'SD']);

    $this->actingAs($user)->get('/mata-pelajaran/export')->assertStatus(200);
    $this->actingAs($user)->get('/mata-pelajaran/template')->assertStatus(200);

    $csv = "kode_mapel,nama_mapel,kode_unit,kelompok,beban_jam,keterangan\n";
    $csv .= "MAPEL-TEST,Mapel Test Impor,{$unit->kode_unit},wajib,2,Kurikulum Test\n";
    $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('mapel_test.csv', $csv);

    $this->actingAs($user)->post('/mata-pelajaran/import', ['file' => $file])->assertRedirect('/mata-pelajaran');
    $this->assertDatabaseHas('mata_pelajaran', ['kode_mapel' => 'MAPEL-TEST']);
});

test('authenticated user can export and import bangunan', function () {
    $user = User::factory()->create();
    $unit = Unit::first() ?? Unit::factory()->create(['kode_unit' => 'SD']);

    $this->actingAs($user)->get('/bangunan/export')->assertStatus(200);
    $this->actingAs($user)->get('/bangunan/template')->assertStatus(200);

    $csv = "kode_bangunan,nama_bangunan,kode_unit,jumlah_lantai,luas,kondisi,keterangan\n";
    $csv .= "GDG-TEST-1,Gedung Uji Impor,{$unit->kode_unit},2,500,baik,Catatan Uji\n";
    $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('bangunan_test.csv', $csv);

    $this->actingAs($user)->post('/bangunan/import', ['file' => $file])->assertRedirect('/bangunan');
    $this->assertDatabaseHas('bangunan', ['kode_bangunan' => 'GDG-TEST-1']);
});

test('authenticated user can export and import ruang', function () {
    $user = User::factory()->create();
    $bangunan = \App\Models\Bangunan::first() ?? \App\Models\Bangunan::factory()->create();

    $this->actingAs($user)->get('/ruang/export')->assertStatus(200);
    $this->actingAs($user)->get('/ruang/template')->assertStatus(200);

    $csv = "kode_ruang,nama_ruang,kode_bangunan,lantai,fungsi,kapasitas,kondisi,keterangan\n";
    $csv .= "R-TEST-99,Ruang Uji Impor,{$bangunan->kode_bangunan},1,kelas,30,baik,Uji Fasilitas\n";
    $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('ruang_test.csv', $csv);

    $this->actingAs($user)->post('/ruang/import', ['file' => $file])->assertRedirect('/ruang');
    $this->assertDatabaseHas('ruang', ['kode_ruang' => 'R-TEST-99']);
});

test('authenticated user can export and import vendor', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/vendor/export')->assertStatus(200);
    $this->actingAs($user)->get('/vendor/template')->assertStatus(200);

    $csv = "kode_vendor,nama_vendor,kategori,nama_kontak,telepon,email,alamat,status\n";
    $csv .= "VND-TEST-9,Vendor Test Impor,teknologi,Agus,081234567890,agus@test.com,Jl. Uji,aktif\n";
    $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('vendor_test.csv', $csv);

    $this->actingAs($user)->post('/vendor/import', ['file' => $file])->assertRedirect('/vendor');
    $this->assertDatabaseHas('vendor', ['kode_vendor' => 'VND-TEST-9']);
});

// Anggota Rombel / Penempatan Kelas Tests
test('authenticated user can view kelas anggota web page via inertia', function () {
    $user = User::factory()->create();
    $kelas = \App\Models\Kelas::first() ?? \App\Models\Kelas::factory()->create();

    $response = $this->actingAs($user)->get("/kelas/{$kelas->id}/anggota");

    $response->assertStatus(200);
});

test('authenticated user can plot students into a class', function () {
    $user = User::factory()->create();
    $kelas = \App\Models\Kelas::first() ?? \App\Models\Kelas::factory()->create();
    $siswa = \App\Models\Siswa::factory()->create(['unit_id' => $kelas->unit_id]);

    $response = $this->actingAs($user)->post("/kelas/{$kelas->id}/anggota", [
        'siswa_ids' => [$siswa->id],
        'tanggal_masuk' => now()->format('Y-m-d'),
        'keterangan' => 'Uji coba plotting',
    ]);

    $response->assertRedirect("/kelas/{$kelas->id}/anggota");
    $this->assertDatabaseHas('anggota_kelas', [
        'kelas_id' => $kelas->id,
        'siswa_id' => $siswa->id,
        'status' => 'aktif',
    ]);
});

test('api can fetch students enrolled in a class', function () {
    $kelas = \App\Models\Kelas::first() ?? \App\Models\Kelas::factory()->create();

    $response = $this->getJson("/api/v1/kelas/{$kelas->id}/siswa");

    $response->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('api can enroll student to a class and remove them', function () {
    $kelas = \App\Models\Kelas::first() ?? \App\Models\Kelas::factory()->create();
    $siswa = \App\Models\Siswa::factory()->create(['unit_id' => $kelas->unit_id]);

    // Enroll
    $enrollResponse = $this->postJson("/api/v1/kelas/{$kelas->id}/siswa", [
        'siswa_ids' => [$siswa->id],
    ]);
    $enrollResponse->assertStatus(201);

    // Remove
    $removeResponse = $this->deleteJson("/api/v1/kelas/{$kelas->id}/siswa/{$siswa->id}");
    $removeResponse->assertStatus(200);
});

// REST API Documentation (OpenAPI / Swagger via Scramble) Tests
test('openapi json specification endpoint is accessible and valid', function () {
    $response = $this->get('/docs/api.json');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'openapi',
            'info' => ['title', 'version'],
            'paths',
        ]);
});

test('interactive api documentation ui endpoint is accessible', function () {
    $response = $this->get('/docs/api');

    $response->assertStatus(200);
});

// Print / PDF Official Documents Tests
test('authenticated user can view cetak buku induk siswa document', function () {
    $user = User::factory()->create();
    $siswa = \App\Models\Siswa::first() ?? \App\Models\Siswa::factory()->create();

    $response = $this->actingAs($user)->get("/siswa/{$siswa->id}/cetak");

    $response->assertStatus(200);
});

test('authenticated user can view cetak biodata karyawan document', function () {
    $user = User::factory()->create();
    $karyawan = \App\Models\Karyawan::first() ?? \App\Models\Karyawan::factory()->create();

    $response = $this->actingAs($user)->get("/karyawan/{$karyawan->id}/cetak");

    $response->assertStatus(200);
});

test('authenticated user can view cetak presensi rombel kelas document', function () {
    $user = User::factory()->create();
    $kelas = \App\Models\Kelas::first() ?? \App\Models\Kelas::factory()->create();

    $response = $this->actingAs($user)->get("/kelas/{$kelas->id}/cetak");

    $response->assertStatus(200);
});
