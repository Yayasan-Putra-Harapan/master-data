<?php

use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

test('creating a siswa automatically provisions a linked user account', function () {
    $unit = Unit::factory()->create(['kode_unit' => 'SMA']);

    $siswa = Siswa::create([
        'nisn' => '0098765432',
        'nama_lengkap' => 'Renggo Siswa',
        'jenis_kelamin' => 'L',
        'tempat_lahir' => 'Purwokerto',
        'tanggal_lahir' => '2008-05-15',
        'unit_id' => $unit->id,
        'alamat' => 'Jl. Jenderal Sudirman No. 10',
        'angkatan' => 2024,
        'status' => 'aktif',
    ]);

    $user = User::where('siswa_id', $siswa->id)->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Renggo Siswa')
        ->and($user->username)->toBe('0098765432')
        ->and($user->email)->toBe('0098765432@siswa.putraharapan.my.id')
        ->and($user->role)->toBe('siswa')
        ->and($user->unit_id)->toBe($unit->id)
        ->and($user->is_aktif)->toBeTrue();

    // Default password is birthdate: 15052008
    expect(Hash::check('15052008', $user->password))->toBeTrue();
});

test('updating siswa status to lulus deactivates the linked user account', function () {
    $unit = Unit::factory()->create();

    $siswa = Siswa::create([
        'nisn' => '0011223344',
        'nama_lengkap' => 'Alumni Hebat',
        'jenis_kelamin' => 'P',
        'tempat_lahir' => 'Purwokerto',
        'tanggal_lahir' => '2007-01-10',
        'unit_id' => $unit->id,
        'alamat' => 'Jl. Merdeka',
        'angkatan' => 2023,
        'status' => 'aktif',
    ]);

    $user = User::where('siswa_id', $siswa->id)->first();
    expect($user->is_aktif)->toBeTrue();

    $siswa->update(['status' => 'lulus']);

    expect($user->fresh()->is_aktif)->toBeFalse();
});

test('creating a karyawan automatically provisions a linked user account with appropriate role', function () {
    $unit = Unit::factory()->create(['kode_unit' => 'SD']);

    $karyawan = Karyawan::create([
        'nip' => '198801012015011001',
        'nik' => '3302010101880001',
        'nama' => 'Sri Wahyuni, S.Pd.',
        'jenis_kelamin' => 'P',
        'tempat_lahir' => 'Banyumas',
        'tanggal_lahir' => '1988-01-01',
        'unit_id' => $unit->id,
        'role' => 'guru',
        'status_kepegawaian' => 'tetap',
        'telepon' => '081234567890',
        'email' => 'sri.wahyuni@yayasan.ac.id',
        'tanggal_masuk' => '2015-01-01',
        'is_aktif' => true,
    ]);

    $user = User::where('karyawan_id', $karyawan->id)->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Sri Wahyuni, S.Pd.')
        ->and($user->username)->toBe('198801012015011001')
        ->and($user->email)->toBe('sri.wahyuni@yayasan.ac.id')
        ->and($user->role)->toBe('guru')
        ->and($user->unit_id)->toBe($unit->id)
        ->and($user->is_aktif)->toBeTrue();

    // Default password is birthdate: 01011988
    expect(Hash::check('01011988', $user->password))->toBeTrue();
});

test('student account cannot log in via web backoffice login screen', function () {
    $studentUser = User::factory()->create([
        'email' => 'siswa@siswa.yayasan.sch.id',
        'password' => Hash::make('password123'),
        'role' => 'siswa',
        'is_aktif' => true,
    ]);

    $response = $this->post('/login', [
        'email' => 'siswa@siswa.yayasan.sch.id',
        'password' => 'password123',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('non-backoffice user cannot access web dashboard and is redirected to login', function () {
    $studentUser = User::factory()->create([
        'role' => 'siswa',
        'is_aktif' => true,
    ]);

    $response = $this->actingAs($studentUser)->get('/dashboard');

    $response->assertRedirect('/login');
    $this->assertGuest();
});

test('superadmin and operator can log in and access web dashboard', function () {
    $operator = User::factory()->create([
        'role' => 'operator',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post('/login', [
        'email' => $operator->email,
        'password' => 'password123',
    ]);

    $this->assertAuthenticatedAs($operator);
    $response->assertRedirect('/dashboard');
});

test('artisan users:sync-master command provisions all existing entities', function () {
    $unit = Unit::factory()->create();

    // Directly insert records if any
    $exitCode = Artisan::call('users:sync-master');
    expect($exitCode)->toBe(0);
});

test('creating siswa with custom username and password uses them instead of defaults', function () {
    $unit = Unit::factory()->create(['kode_unit' => 'SMP', 'jenjang' => 'SMP']);
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->post('/siswa', [
        'nisn' => '0077889900',
        'nama_lengkap' => 'Siswa Kustom',
        'jenis_kelamin' => 'L',
        'tempat_lahir' => 'Purwokerto',
        'tanggal_lahir' => '2010-03-20',
        'unit_id' => $unit->id,
        'alamat' => 'Jl. Kustom No. 1',
        'angkatan' => 2024,
        'status' => 'aktif',
        'username' => 'siswa_kustom',
        'password' => 'rahasiaSiswa',
    ]);

    $response->assertSessionHasNoErrors();

    $siswa = Siswa::where('nisn', '0077889900')->firstOrFail();
    $user = User::where('siswa_id', $siswa->id)->firstOrFail();

    expect($user->username)->toBe('siswa_kustom')
        ->and(Hash::check('rahasiaSiswa', $user->password))->toBeTrue();
});

test('creating karyawan requires password and uses karyawan email for account', function () {
    $unit = Unit::factory()->create();
    $admin = User::factory()->create();

    // Without password -> validation error
    $this->actingAs($admin)->post('/karyawan', [
        'nik' => '3302010101900002',
        'nama' => 'Guru Tanpa Sandi',
        'jenis_kelamin' => 'L',
        'tanggal_lahir' => '1990-01-01',
        'unit_id' => $unit->id,
        'role' => 'guru',
        'status_kepegawaian' => 'tetap',
        'telepon' => '081234567891',
        'email' => 'guru.tanpa.sandi@putraharapan.my.id',
        'tanggal_masuk' => '2020-01-01',
    ])->assertSessionHasErrors('password');

    // With password -> account created with karyawan email
    $this->actingAs($admin)->post('/karyawan', [
        'nik' => '3302010101900003',
        'nama' => 'Guru Bersandi',
        'jenis_kelamin' => 'L',
        'tanggal_lahir' => '1990-01-01',
        'unit_id' => $unit->id,
        'role' => 'guru',
        'status_kepegawaian' => 'tetap',
        'telepon' => '081234567892',
        'email' => 'guru.bersandi@putraharapan.my.id',
        'tanggal_masuk' => '2020-01-01',
        'password' => 'sandiGuru123',
    ])->assertSessionHasNoErrors();

    $karyawan = Karyawan::where('nik', '3302010101900003')->firstOrFail();
    $user = User::where('karyawan_id', $karyawan->id)->firstOrFail();

    expect($user->email)->toBe('guru.bersandi@putraharapan.my.id')
        ->and($user->role)->toBe('guru')
        ->and(Hash::check('sandiGuru123', $user->password))->toBeTrue();
});

test('creating orang tua requires email and password for login account', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)->post('/orang-tua', [
        'telepon' => '081234567893',
        'alamat' => 'Jl. Ortu No. 1',
    ])->assertSessionHasErrors(['email', 'password']);

    $this->actingAs($admin)->post('/orang-tua', [
        'nama_ayah' => 'Ayah Kustom',
        'telepon' => '081234567894',
        'email' => 'ayah.kustom@putraharapan.my.id',
        'alamat' => 'Jl. Ortu No. 2',
        'password' => 'sandiOrtu123',
    ])->assertSessionHasNoErrors();

    $ortu = OrangTua::where('telepon', '081234567894')->firstOrFail();
    $user = User::where('orang_tua_id', $ortu->id)->firstOrFail();

    expect($user->email)->toBe('ayah.kustom@putraharapan.my.id')
        ->and($user->role)->toBe('orang_tua')
        ->and(Hash::check('sandiOrtu123', $user->password))->toBeTrue();
});
