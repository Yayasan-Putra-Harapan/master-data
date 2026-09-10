import { Head } from '@inertiajs/react';
import KopSurat from '@/Components/KopSurat';
import { Siswa } from '@/types';

interface Props {
    siswa: Siswa & {
        unit?: {
            id: number;
            kode_unit: string;
            nama_unit: string;
            jenjang: string;
            alamat?: string;
            telepon?: string;
            email?: string;
            kepala_sekolah?: string;
        };
        orang_tua?: {
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
            telepon: string;
            email?: string;
            alamat: string;
        };
        anggota_kelas?: {
            id: number;
            tanggal_masuk: string;
            status: string;
            kelas?: {
                kode_kelas: string;
                nama_kelas: string;
                tingkat: number;
            };
            tahun_ajaran?: {
                nama: string;
                semester: string;
            };
        }[];
    };
}

export default function SiswaCetak({ siswa }: Props) {
    const todayFormatted = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const activeEnrollment = siswa.anggota_kelas?.[0];

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8 text-neutral-900 font-sans print:p-0">
            <Head title={`Buku Induk - ${siswa.nama_lengkap}`} />

            <div className="mx-auto max-w-4xl border border-neutral-200 p-6 sm:p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
                <KopSurat
                    unitName={siswa.unit?.nama_unit}
                    unitJenjang={siswa.unit?.jenjang}
                    alamat={siswa.unit?.alamat}
                    telepon={siswa.unit?.telepon}
                    email={siswa.unit?.email}
                    judulDokumen="LEMBAR BUKU INDUK PESERTA DIDIK"
                    nomorDokumen={`BI-${siswa.unit?.kode_unit || 'YAYASAN'}/${siswa.angkatan}/${siswa.nisn}`}
                    backUrl={route('siswa.index')}
                />

                {/* Section A: Data Peserta Didik */}
                <div className="space-y-4 text-xs sm:text-sm">
                    <div>
                        <h4 className="font-bold uppercase tracking-wider text-xs border-b border-neutral-300 pb-1 mb-2">
                            A. Keterangan Peserta Didik
                        </h4>
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-neutral-100">
                                    <td className="w-48 py-1.5 text-neutral-600">1. Nama Lengkap</td>
                                    <td className="w-4 py-1.5">:</td>
                                    <td className="py-1.5 font-semibold">{siswa.nama_lengkap}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">2. Nama Panggilan</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{siswa.nama_panggilan || '-'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">3. NISN / NIS</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-mono font-medium">
                                        {siswa.nisn} {siswa.nis ? `/ ${siswa.nis}` : ''}
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">4. NIK / No. KTP Anak</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-mono">{siswa.nik || '-'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">5. Jenis Kelamin</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">6. Tempat, Tanggal Lahir</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">
                                        {siswa.tempat_lahir}, {siswa.tanggal_lahir ? String(siswa.tanggal_lahir).substring(0, 10) : '-'}
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">7. Agama</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{siswa.agama || 'Islam'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">8. Alamat Lengkap</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{siswa.alamat}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">9. Satuan Unit Pendidikan</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-medium">{siswa.unit?.nama_unit} ({siswa.unit?.jenjang})</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">10. Tahun Angkatan Masuk</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{siswa.angkatan}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">11. Status Keaktifan</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 uppercase font-semibold">{siswa.status}</td>
                                </tr>
                                {activeEnrollment && (
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">12. Rombongan Belajar Saat Ini</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5 font-medium">
                                            {activeEnrollment.kelas?.nama_kelas} ({activeEnrollment.tahun_ajaran?.nama})
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Section B: Data Orang Tua / Wali */}
                    <div className="pt-2">
                        <h4 className="font-bold uppercase tracking-wider text-xs border-b border-neutral-300 pb-1 mb-2">
                            B. Keterangan Orang Tua / Wali
                        </h4>
                        {siswa.orang_tua ? (
                            <table className="w-full">
                                <tbody>
                                    <tr className="border-b border-neutral-100">
                                        <td className="w-48 py-1.5 text-neutral-600">1. Nomor Kartu Keluarga (KK)</td>
                                        <td className="w-4 py-1.5">:</td>
                                        <td className="py-1.5 font-mono">{siswa.orang_tua.no_kk || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">2. Nama Lengkap Ayah</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5 font-medium">{siswa.orang_tua.nama_ayah || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">3. NIK Ayah</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5 font-mono">{siswa.orang_tua.nik_ayah || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">4. Pekerjaan & Penghasilan Ayah</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5">
                                            {siswa.orang_tua.pekerjaan_ayah || '-'}
                                            {siswa.orang_tua.penghasilan_ayah ? ` (${siswa.orang_tua.penghasilan_ayah})` : ''}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">5. Nama Lengkap Ibu</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5 font-medium">{siswa.orang_tua.nama_ibu || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">6. NIK Ibu</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5 font-mono">{siswa.orang_tua.nik_ibu || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">7. Pekerjaan & Penghasilan Ibu</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5">
                                            {siswa.orang_tua.pekerjaan_ibu || '-'}
                                            {siswa.orang_tua.penghasilan_ibu ? ` (${siswa.orang_tua.penghasilan_ibu})` : ''}
                                        </td>
                                    </tr>
                                    {siswa.orang_tua.nama_wali && (
                                        <tr className="border-b border-neutral-100">
                                            <td className="py-1.5 text-neutral-600">8. Nama Wali</td>
                                            <td className="py-1.5">:</td>
                                            <td className="py-1.5 font-medium">{siswa.orang_tua.nama_wali}</td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">9. Nomor Telepon / WhatsApp</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5 font-mono font-medium">{siswa.orang_tua.telepon}</td>
                                    </tr>
                                    <tr className="border-b border-neutral-100">
                                        <td className="py-1.5 text-neutral-600">10. Alamat Orang Tua</td>
                                        <td className="py-1.5">:</td>
                                        <td className="py-1.5">{siswa.orang_tua.alamat}</td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-xs text-neutral-500 italic">
                                Belum ada data orang tua / wali yang terhubung dalam sistem.
                            </p>
                        )}
                    </div>
                </div>

                {/* Signatures & Photo Box */}
                <div className="mt-10 pt-4 flex items-end justify-between text-xs sm:text-sm">
                    {/* 3x4 Photo Box */}
                    <div className="h-32 w-24 border-2 border-dashed border-neutral-400 flex flex-col items-center justify-center text-center text-[10px] text-neutral-400">
                        <span>Pas Foto</span>
                        <span>3 x 4 cm</span>
                    </div>

                    {/* Signature 1: Parent */}
                    <div className="text-center w-48">
                        <p className="text-xs text-neutral-500">Mengetahui,</p>
                        <p className="font-semibold text-neutral-800">Orang Tua / Wali Siswa</p>
                        <div className="h-20" />
                        <p className="border-t border-neutral-400 pt-1 font-medium">
                            {siswa.orang_tua?.nama_ayah || siswa.orang_tua?.nama_ibu || siswa.orang_tua?.nama_wali || '................................'}
                        </p>
                    </div>

                    {/* Signature 2: Principal */}
                    <div className="text-center w-56">
                        <p className="text-xs text-neutral-500">Purwokerto, {todayFormatted}</p>
                        <p className="font-semibold text-neutral-800">Kepala Sekolah</p>
                        <div className="h-20" />
                        <p className="border-t border-neutral-400 pt-1 font-bold underline">
                            {siswa.unit?.kepala_sekolah || 'Kepala Satuan Pendidikan'}
                        </p>
                        <p className="text-[11px] text-neutral-500">NIP. ........................................</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
