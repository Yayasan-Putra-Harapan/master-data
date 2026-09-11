export interface User {
    id: number;
    name: string;
    email: string;
    role: 'superadmin' | 'operator';
    unit_id?: number | null;
    unit?: Unit | null;
    email_verified_at?: string;
}

export interface Unit {
    id: number;
    kode_unit: string;
    nama_unit: string;
    jenjang: 'PG' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'BOARDING';
    alamat?: string;
    telepon?: string;
    email?: string;
    kepala_sekolah?: string;
    is_aktif: boolean;
    siswa_count?: number;
    karyawan_count?: number;
}

export interface OrangTua {
    id: number;
    no_kk?: string;
    nik_ayah?: string;
    nama_ayah?: string;
    pekerjaan_ayah?: string;
    penghasilan_ayah?: string;
    nik_ibu?: string;
    nama_ibu?: string;
    pekerjaan_ibu?: string;
    penghasilan_ibu?: string;
    nama_wali?: string;
    nik_wali?: string;
    hubungan_wali?: string;
    telepon: string;
    email?: string;
    alamat: string;
    siswa_count?: number;
}

export interface Karyawan {
    id: number;
    nip?: string;
    nuptk?: string;
    nik: string;
    nama: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir?: string;
    tanggal_lahir: string;
    unit_id: number;
    unit?: Unit;
    role: 'guru' | 'staf' | 'kepala_sekolah' | 'keuangan' | 'administrasi';
    status_kepegawaian: 'tetap' | 'kontrak' | 'honorer';
    telepon: string;
    email: string;
    alamat?: string;
    pendidikan_terakhir?: string;
    tanggal_masuk: string;
    is_aktif: boolean;
}

export interface Siswa {
    id: number;
    nisn: string;
    nis?: string;
    nik?: string;
    nama_lengkap: string;
    nama_panggilan?: string;
    jenis_kelamin: 'L' | 'P';
    tempat_lahir: string;
    tanggal_lahir: string;
    agama?: string;
    unit_id: number;
    unit?: Unit;
    orang_tua_id?: number;
    orang_tua?: OrangTua;
    alamat: string;
    angkatan: number;
    status: 'aktif' | 'lulus' | 'mutasi' | 'keluar';
}

export interface TahunAjaran {
    id: number;
    kode: string;
    nama: string;
    semester: 'ganjil' | 'genap';
    tanggal_mulai: string;
    tanggal_selesai: string;
    is_aktif: boolean;
    kelas_count?: number;
}

export interface Kelas {
    id: number;
    kode_kelas: string;
    nama_kelas: string;
    tingkat: number;
    unit_id: number;
    unit?: Unit;
    tahun_ajaran_id: number;
    tahun_ajaran?: TahunAjaran;
    wali_kelas_id?: number;
    wali_kelas?: Karyawan;
    kapasitas: number;
}

export interface Bangunan {
    id: number;
    kode_bangunan: string;
    nama_bangunan: string;
    unit_id: number;
    unit?: Unit;
    jumlah_lantai: number;
    luas?: number;
    kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat';
    keterangan?: string;
    ruang_count?: number;
}

export interface Ruang {
    id: number;
    kode_ruang: string;
    nama_ruang: string;
    bangunan_id: number;
    bangunan?: Bangunan;
    lantai: number;
    fungsi: 'kelas' | 'laboratorium' | 'perpustakaan' | 'kantor' | 'aula' | 'ibadah' | 'lainnya';
    kapasitas: number;
    kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat';
    keterangan?: string;
}

export interface MataPelajaran {
    id: number;
    kode_mapel: string;
    nama_mapel: string;
    unit_id: number;
    unit?: Unit;
    kelompok: 'wajib' | 'peminatan' | 'muatan_lokal' | 'ekstrakurikuler';
    beban_jam: number;
    keterangan?: string;
}

export interface Vendor {
    id: number;
    kode_vendor: string;
    nama_vendor: string;
    kategori: 'sarana_prasarana' | 'buku_pelajaran' | 'katering' | 'seragam' | 'teknologi' | 'kebersihan' | 'lainnya';
    nama_kontak?: string;
    telepon: string;
    email?: string;
    alamat?: string;
    status: 'aktif' | 'non_aktif';
}

export interface AnggotaKelas {
    id: number;
    siswa_id: number;
    siswa?: Siswa;
    kelas_id: number;
    kelas?: Kelas;
    tahun_ajaran_id: number;
    tahun_ajaran?: TahunAjaran;
    tanggal_masuk: string;
    status: 'aktif' | 'pindah' | 'keluar';
    keterangan?: string;
}

export interface ApiToken {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        plainTextToken?: string | null;
    };
};
