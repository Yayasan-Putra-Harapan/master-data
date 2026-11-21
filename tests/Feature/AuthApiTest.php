<?php

use App\Models\Karyawan;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user can login via api with email and receive token', function () {
    $user = User::factory()->create([
        'email' => 'guru@yayasan.ac.id',
        'password' => Hash::make('password123'),
        'role' => 'guru',
        'is_aktif' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => 'guru@yayasan.ac.id',
        'password' => 'password123',
        'device_name' => 'SIAKAD Mobile App',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'message',
            'data' => [
                'token',
                'token_type',
                'user' => [
                    'id',
                    'name',
                    'username',
                    'email',
                    'role',
                    'is_aktif',
                ],
            ],
        ])
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.user.email', 'guru@yayasan.ac.id')
        ->assertJsonPath('data.user.role', 'guru');

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
});

test('user can login via api with username and receive token', function () {
    $user = User::factory()->create([
        'username' => 'guru_budi',
        'email' => 'budi@yayasan.ac.id',
        'password' => Hash::make('rahasia123'),
        'is_aktif' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => 'guru_budi',
        'password' => 'rahasia123',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.user.username', 'guru_budi');
});

test('login fails with wrong password', function () {
    $user = User::factory()->create([
        'email' => 'staf@yayasan.ac.id',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => 'staf@yayasan.ac.id',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('message', 'Kredensial yang diberikan tidak cocok dengan data kami.');
});

test('login fails for non-existent user', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'login' => 'notfound@yayasan.ac.id',
        'password' => 'password123',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('status', 'error');
});

test('inactive user is rejected from login with 403', function () {
    $user = User::factory()->create([
        'email' => 'nonaktif@yayasan.ac.id',
        'password' => Hash::make('password123'),
        'is_aktif' => false,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => 'nonaktif@yayasan.ac.id',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('message', 'Akun pengguna ini berstatus non-aktif. Silakan hubungi administrator.');
});

test('authenticated user can fetch own profile via /api/v1/auth/me', function () {
    $unit = Unit::factory()->create();
    $user = User::factory()->create([
        'unit_id' => $unit->id,
        'role' => 'operator',
    ]);
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me');

    $response->assertStatus(200)
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.unit_id', $unit->id);
});

test('unauthenticated request to /api/v1/auth/me returns 401', function () {
    $response = $this->getJson('/api/v1/auth/me');

    $response->assertStatus(401);
});

test('authenticated user can logout and revoke token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-device')->plainTextToken;

    expect($user->tokens()->count())->toBe(1);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/auth/logout');

    $response->assertStatus(200)
        ->assertJsonPath('status', 'success');

    expect($user->fresh()->tokens()->count())->toBe(0);
});

test('satellite systems can fetch users master list with filters via api', function () {
    $admin = User::factory()->create();
    $unitA = Unit::factory()->create();
    $unitB = Unit::factory()->create();

    User::factory()->create(['name' => 'Ahmad Guru', 'role' => 'guru', 'unit_id' => $unitA->id, 'is_aktif' => true]);
    User::factory()->create(['name' => 'Budi Siswa', 'role' => 'siswa', 'unit_id' => $unitB->id, 'is_aktif' => true]);
    User::factory()->create(['name' => 'Citra Staf', 'role' => 'staf', 'unit_id' => $unitA->id, 'is_aktif' => false]);

    $token = $admin->createToken('sync-token')->plainTextToken;

    // Filter by role
    $responseRole = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/users?role=guru');
    $responseRole->assertStatus(200);
    expect(collect($responseRole->json('data'))->pluck('name'))->toContain('Ahmad Guru');

    // Filter by search
    $responseSearch = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/users?search=Ahmad');
    $responseSearch->assertStatus(200);
    expect($responseSearch->json('data'))->toHaveCount(1);
    expect($responseSearch->json('data.0.name'))->toBe('Ahmad Guru');

    // Filter by is_aktif
    $responseAktif = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/users?is_aktif=0');
    $responseAktif->assertStatus(200);
    expect(collect($responseAktif->json('data'))->pluck('name'))->toContain('Citra Staf');
});

test('satellite systems can fetch single user detail via api', function () {
    $admin = User::factory()->create();
    $target = User::factory()->create([
        'name' => 'Target User',
        'email' => 'target@yayasan.ac.id',
    ]);

    $token = $admin->createToken('detail-token')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson("/api/v1/users/{$target->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.id', $target->id)
        ->assertJsonPath('data.email', 'target@yayasan.ac.id');
});
