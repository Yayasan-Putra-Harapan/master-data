import { Head } from '@inertiajs/react';
import KopSurat from '@/Components/KopSurat';
import { Karyawan } from '@/types';

interface Props {
    karyawan: Karyawan & {
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
    };
}

export default function KaryawanCetak({ karyawan }: Props) {
    const todayFormatted = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8 text-neutral-900 font-sans print:p-0">
            <Head title={`Biodata Pegawai - ${karyawan.nama}`} />

            <div className="mx-auto max-w-4xl border border-neutral-200 p-6 sm:p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
                <KopSurat
                    unitName={karyawan.unit?.nama_unit}
                    unitJenjang={karyawan.unit?.jenjang}
                    alamat={karyawan.unit?.alamat}
                    telepon={karyawan.unit?.telepon}
                    email={karyawan.unit?.email}
                    judulDokumen="LEMBAR BIODATA TENAGA PENDIDIK & KEPENDIDIKAN"
                    nomorDokumen={`PEG-${karyawan.unit?.kode_unit || 'YAYASAN'}/${karyawan.id}/${karyawan.nik.substring(0, 8)}`}
                    backUrl={route('karyawan.index')}
                />

                <div className="space-y-4 text-xs sm:text-sm">
                    <div>
                        <h4 className="font-bold uppercase tracking-wider text-xs border-b border-neutral-300 pb-1 mb-2">
                            A. Identitas Pribadi Pegawai
                        </h4>
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-neutral-100">
                                    <td className="w-48 py-1.5 text-neutral-600">1. Nama Lengkap & Gelar</td>
                                    <td className="w-4 py-1.5">:</td>
                                    <td className="py-1.5 font-semibold">{karyawan.nama}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">2. NIK (Nomor Induk Kependudukan)</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-mono">{karyawan.nik}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">3. NIP Yayasan</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-mono">{karyawan.nip || '-'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">4. NUPTK Kemendikbud</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-mono">{karyawan.nuptk || '-'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">5. Jenis Kelamin</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{karyawan.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">6. Tempat, Tanggal Lahir</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">
                                        {karyawan.tempat_lahir || '-'}, {karyawan.tanggal_lahir ? String(karyawan.tanggal_lahir).substring(0, 10) : '-'}
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">7. Alamat Domisili</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{karyawan.alamat || '-'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">8. Nomor Kontak Telepon / WhatsApp</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-mono">{karyawan.telepon}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">9. Alamat Email Resmi</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-mono">{karyawan.email}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="pt-2">
                        <h4 className="font-bold uppercase tracking-wider text-xs border-b border-neutral-300 pb-1 mb-2">
                            B. Keterangan Jabatan & Kepegawaian
                        </h4>
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-neutral-100">
                                    <td className="w-48 py-1.5 text-neutral-600">1. Unit Sekolah Penempatan</td>
                                    <td className="w-4 py-1.5">:</td>
                                    <td className="py-1.5 font-medium">{karyawan.unit?.nama_unit} ({karyawan.unit?.jenjang})</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">2. Peran / Jabatan</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 uppercase font-semibold">{karyawan.role.replace('_', ' ')}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">3. Status Kepegawaian</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 uppercase font-medium">{karyawan.status_kepegawaian}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">4. Pendidikan Terakhir</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5">{karyawan.pendidikan_terakhir || '-'}</td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">5. Tanggal Mulai Bertugas</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-medium">
                                        {karyawan.tanggal_masuk ? String(karyawan.tanggal_masuk).substring(0, 10) : '-'}
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-100">
                                    <td className="py-1.5 text-neutral-600">6. Status Keaktifan</td>
                                    <td className="py-1.5">:</td>
                                    <td className="py-1.5 font-semibold text-emerald-700">
                                        {karyawan.is_aktif ? 'AKTIF BEKERJA' : 'NON-AKTIF'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Signatures & Photo Box */}
                <div className="mt-10 pt-4 flex items-end justify-between text-xs sm:text-sm">
                    {/* 3x4 Photo Box */}
                    <div className="h-32 w-24 border-2 border-dashed border-neutral-400 flex flex-col items-center justify-center text-center text-[10px] text-neutral-400">
                        <span>Pas Foto</span>
                        <span>3 x 4 cm</span>
                    </div>

                    {/* Signature 1: Employee */}
                    <div className="text-center w-48">
                        <p className="text-xs text-neutral-500">Pegawai Yang Bersangkutan,</p>
                        <div className="h-20" />
                        <p className="border-t border-neutral-400 pt-1 font-medium underline">
                            {karyawan.nama}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">NIK. {karyawan.nik}</p>
                    </div>

                    {/* Signature 2: Foundation / Principal */}
                    <div className="text-center w-56">
                        <p className="text-xs text-neutral-500">Purwokerto, {todayFormatted}</p>
                        <p className="font-semibold text-neutral-800">Ketua Pengurus Yayasan</p>
                        <div className="h-20" />
                        <p className="border-t border-neutral-400 pt-1 font-bold underline">
                            H. Sudirman, M.Pd.
                        </p>
                        <p className="text-[11px] text-neutral-500">NIPY. 197001011995011001</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
