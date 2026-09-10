import { Head } from '@inertiajs/react';
import KopSurat from '@/Components/KopSurat';
import { AnggotaKelas, Kelas } from '@/types';

interface Props {
    kelas: Kelas & {
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
        tahun_ajaran?: {
            id: number;
            kode: string;
            nama: string;
            semester: string;
        };
        wali_kelas?: {
            id: number;
            nama: string;
            nip?: string;
            telepon: string;
        };
        anggota_kelas?: AnggotaKelas[];
    };
}

export default function KelasCetak({ kelas }: Props) {
    const todayFormatted = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const anggotaList = kelas.anggota_kelas || [];
    const countL = anggotaList.filter((a) => a.siswa?.jenis_kelamin === 'L').length;
    const countP = anggotaList.filter((a) => a.siswa?.jenis_kelamin === 'P').length;

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8 text-neutral-900 font-sans print:p-0">
            <Head title={`Daftar Siswa - ${kelas.nama_kelas}`} />

            <div className="mx-auto max-w-5xl border border-neutral-200 p-6 sm:p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
                <KopSurat
                    unitName={kelas.unit?.nama_unit}
                    unitJenjang={kelas.unit?.jenjang}
                    alamat={kelas.unit?.alamat}
                    telepon={kelas.unit?.telepon}
                    email={kelas.unit?.email}
                    judulDokumen="DAFTAR PESERTA DIDIK ROMBONGAN BELAJAR"
                    nomorDokumen={`ROMBEL-${kelas.unit?.kode_unit || 'KLS'}/${kelas.kode_kelas}/${new Date().getFullYear()}`}
                    backUrl={route('kelas.anggota.index', kelas.id)}
                />

                {/* Class Meta Box */}
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border rounded-md p-3 bg-neutral-50/50">
                    <div>
                        <span className="text-neutral-500">Nama Kelas:</span>
                        <div className="font-bold text-neutral-900 text-sm">{kelas.nama_kelas}</div>
                    </div>
                    <div>
                        <span className="text-neutral-500">Tingkat / Semester:</span>
                        <div className="font-medium text-neutral-800">
                            Tingkat {kelas.tingkat} ({kelas.tahun_ajaran?.semester?.toUpperCase() || '-'})
                        </div>
                    </div>
                    <div>
                        <span className="text-neutral-500">Tahun Ajaran:</span>
                        <div className="font-medium text-neutral-800">{kelas.tahun_ajaran?.nama || '-'}</div>
                    </div>
                    <div>
                        <span className="text-neutral-500">Wali Kelas:</span>
                        <div className="font-semibold text-neutral-800">{kelas.wali_kelas?.nama || '-'}</div>
                    </div>
                    <div className="col-span-2 sm:col-span-4 flex items-center justify-between border-t border-neutral-200 pt-2 mt-1">
                        <div>
                            <span className="text-neutral-500">Kapasitas Maksimal: </span>
                            <span className="font-semibold text-neutral-800">{kelas.kapasitas} Kursi</span>
                        </div>
                        <div>
                            <span className="text-neutral-500">Jumlah Siswa Terdaftar: </span>
                            <span className="font-bold text-neutral-900">
                                {anggotaList.length} Orang (L: {countL}, P: {countP})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table of Students */}
                <div className="overflow-hidden border border-neutral-300 rounded-sm">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700">
                                <th className="p-2 text-center w-8 border-r border-neutral-300">No</th>
                                <th className="p-2 border-r border-neutral-300 w-28">NISN / NIS</th>
                                <th className="p-2 border-r border-neutral-300">Nama Lengkap Siswa</th>
                                <th className="p-2 text-center w-12 border-r border-neutral-300">L/P</th>
                                <th className="p-2 border-r border-neutral-300">Tempat, Tanggal Lahir</th>
                                <th className="p-2 border-r border-neutral-300">Nama Orang Tua / Wali</th>
                                <th className="p-2 border-r border-neutral-300">No. Kontak</th>
                                <th className="p-2 text-center w-24">Paraf / Ket</th>
                            </tr>
                        </thead>
                        <tbody>
                            {anggotaList.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-4 text-center text-neutral-500 italic">
                                        Belum ada siswa yang ditempatkan di kelas ini.
                                    </td>
                                </tr>
                            ) : (
                                anggotaList.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-neutral-200 hover:bg-neutral-50/50"
                                    >
                                        <td className="p-2 text-center border-r border-neutral-200 font-mono">
                                            {idx + 1}
                                        </td>
                                        <td className="p-2 border-r border-neutral-200 font-mono">
                                            <div>{item.siswa?.nisn}</div>
                                            {item.siswa?.nis && (
                                                <div className="text-[10px] text-neutral-500">{item.siswa.nis}</div>
                                            )}
                                        </td>
                                        <td className="p-2 border-r border-neutral-200 font-semibold text-neutral-900">
                                            {item.siswa?.nama_lengkap}
                                        </td>
                                        <td className="p-2 text-center border-r border-neutral-200 font-medium">
                                            {item.siswa?.jenis_kelamin}
                                        </td>
                                        <td className="p-2 border-r border-neutral-200">
                                            {item.siswa?.tempat_lahir}, {item.siswa?.tanggal_lahir ? String(item.siswa.tanggal_lahir).substring(0, 10) : '-'}
                                        </td>
                                        <td className="p-2 border-r border-neutral-200">
                                            {item.siswa?.orang_tua?.nama_ayah ||
                                             item.siswa?.orang_tua?.nama_ibu ||
                                             item.siswa?.orang_tua?.nama_wali ||
                                             '-'}
                                        </td>
                                        <td className="p-2 border-r border-neutral-200 font-mono text-[11px]">
                                            {item.siswa?.orang_tua?.telepon || '-'}
                                        </td>
                                        <td className="p-2 text-center text-[10px] text-neutral-400">
                                            {idx + 1}. .........
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Signatures */}
                <div className="mt-8 pt-4 flex items-end justify-between text-xs sm:text-sm">
                    {/* Signature 1: Homeroom Teacher */}
                    <div className="text-center w-56">
                        <p className="text-xs text-neutral-500">Mengetahui,</p>
                        <p className="font-semibold text-neutral-800">Wali Kelas</p>
                        <div className="h-20" />
                        <p className="border-t border-neutral-400 pt-1 font-bold underline">
                            {kelas.wali_kelas?.nama || '................................................'}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                            {kelas.wali_kelas?.nip ? `NIP. ${kelas.wali_kelas.nip}` : 'NIP. ........................................'}
                        </p>
                    </div>

                    {/* Signature 2: Principal */}
                    <div className="text-center w-56">
                        <p className="text-xs text-neutral-500">Purwokerto, {todayFormatted}</p>
                        <p className="font-semibold text-neutral-800">Kepala Sekolah</p>
                        <div className="h-20" />
                        <p className="border-t border-neutral-400 pt-1 font-bold underline">
                            {kelas.unit?.kepala_sekolah || 'Kepala Satuan Pendidikan'}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">NIP. ........................................</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
