export interface User {
    id: number;
    name: string;
    email: string;
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
    };
};
