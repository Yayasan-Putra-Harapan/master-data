import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, FileText, Check, Database } from 'lucide-react';

interface Props {
    evaluation: {
        completeness: {
            score: number;
            total_records: number;
            complete_records: number;
            siswa_percentage: number;
            karyawan_percentage: number;
        };
        uniqueness: {
            score: number;
            duplicates_found: number;
            duplicate_nisn: number;
            duplicate_nik: number;
        };
        consistency: {
            score: number;
            orphaned_records: number;
            orphaned_unit_siswa: number;
            orphaned_ortu_siswa: number;
            orphaned_unit_karyawan: number;
        };
        validity: {
            score: number;
            valid_records: number;
            invalid_records: number;
        };
        accuracy: {
            score: number;
            accurate_records: number;
            inaccurate_records: number;
        };
        summary: number;
    };
}

export default function DataQualityIndex({ evaluation }: Props) {
    const handleReaudit = () => {
        router.reload({ only: ['evaluation'] });
    };

    const dimensions = [
        {
            key: 'completeness',
            title: '1. Kelengkapan (Completeness)',
            desc: 'Mengukur persentase field wajib yang terisi tanpa nilai null atau kosong.',
            score: evaluation.completeness.score,
            details: [
                { label: 'Total Rekaman Diuji', value: evaluation.completeness.total_records },
                { label: 'Rekaman Lengkap 100%', value: evaluation.completeness.complete_records },
                { label: 'Kelengkapan Siswa', value: `${evaluation.completeness.siswa_percentage}%` },
                { label: 'Kelengkapan Karyawan', value: `${evaluation.completeness.karyawan_percentage}%` },
            ],
            formula: 'Completeness = (Field Terisi / Total Field Wajib) × 100%',
        },
        {
            key: 'uniqueness',
            title: '2. Keunikan (Uniqueness)',
            desc: 'Memastikan tidak ada duplikasi data pada field kunci identitas unik.',
            score: evaluation.uniqueness.score,
            details: [
                { label: 'Total Duplikasi Terdeteksi', value: evaluation.uniqueness.duplicates_found },
                { label: 'Duplikat NISN Siswa', value: evaluation.uniqueness.duplicate_nisn },
                { label: 'Duplikat NIK Karyawan', value: evaluation.uniqueness.duplicate_nik },
            ],
            formula: 'Uniqueness = ((Total Rekaman - Duplikat) / Total Rekaman) × 100%',
        },
        {
            key: 'consistency',
            title: '3. Konsistensi (Consistency)',
            desc: 'Integritas relasional lintas entitas tanpa rekaman yatim (orphaned foreign key).',
            score: evaluation.consistency.score,
            details: [
                { label: 'Total Rekaman Yatim (Orphan)', value: evaluation.consistency.orphaned_records },
                { label: 'Siswa Tanpa Unit Valid', value: evaluation.consistency.orphaned_unit_siswa },
                { label: 'Siswa Tanpa Wali Valid', value: evaluation.consistency.orphaned_ortu_siswa },
                { label: 'Karyawan Tanpa Unit Valid', value: evaluation.consistency.orphaned_unit_karyawan },
            ],
            formula: 'Consistency = ((Total - Orphaned FK) / Total) × 100%',
        },
        {
            key: 'validity',
            title: '4. Keabsahan (Validity)',
            desc: 'Kesesuaian format standar: NISN 10 digit, NIK 16 digit, format email & telepon.',
            score: evaluation.validity.score,
            details: [
                { label: 'Rekaman Format Valid', value: evaluation.validity.valid_records },
                { label: 'Rekaman Format Cacat', value: evaluation.validity.invalid_records },
            ],
            formula: 'Validity = (Rekaman Format Sesuai Regex / Total Rekaman) × 100%',
        },
        {
            key: 'accuracy',
            title: '5. Akurasi (Accuracy)',
            desc: 'Kewajaran kontekstual dan batas logis (kesesuaian usia terhadap jenjang sekolah).',
            score: evaluation.accuracy.score,
            details: [
                { label: 'Rekaman Logis Valid', value: evaluation.accuracy.accurate_records },
                { label: 'Anomali Rentang Usia/Jenjang', value: evaluation.accuracy.inaccurate_records },
            ],
            formula: 'Accuracy = (Rekaman Lolos Uji Konteks / Total Rekaman) × 100%',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Audit Kualitas Data Master (5 Dimensi)
                    </h2>
                </div>
            }
        >
            <Head title="Audit Kualitas Data" />

            <div className="space-y-6">
                {/* Header Banner */}
                <Card className="shadow-sm border-emerald-200/50 bg-gradient-to-r from-emerald-50/50 via-white to-white dark:border-emerald-950 dark:from-emerald-950/20 dark:via-neutral-900 dark:to-neutral-900">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-600 hover:bg-emerald-700">
                                    Instrumen BAB 3
                                </Badge>
                                <span className="text-xs text-neutral-500 font-mono">
                                    Framework: Schmuck (2024) / Prasetyo et al. (2025)
                                </span>
                            </div>
                            <CardTitle className="text-xl font-bold mt-1">
                                Evaluasi Kualitas Data Terpadu
                            </CardTitle>
                            <CardDescription>
                                Pengukuran berkala untuk membuktikan efektivitas mekanisme validasi sistem Master Data Management.
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    {evaluation.summary}%
                                </div>
                                <div className="text-xs text-neutral-500">Skor Keseluruhan</div>
                            </div>
                            <Button onClick={handleReaudit} variant="outline" size="sm" className="gap-2">
                                <RefreshCw className="h-4 w-4" /> Audit Ulang
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* 5 Dimensions Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dimensions.map((dim) => (
                        <Card key={dim.key} className="shadow-sm flex flex-col justify-between">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant={dim.score >= 80 ? 'default' : 'secondary'}>
                                        Skor: {dim.score}%
                                    </Badge>
                                    {dim.score >= 80 ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    )}
                                </div>
                                <CardTitle className="text-sm font-semibold pt-2">
                                    {dim.title}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {dim.desc}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3 pt-0">
                                <div className="space-y-1.5 rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-800/60">
                                    {dim.details.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span className="text-neutral-500">{item.label}</span>
                                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-[11px] text-neutral-400 font-mono border-t border-neutral-100 pt-2 dark:border-neutral-800">
                                    {dim.formula}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
