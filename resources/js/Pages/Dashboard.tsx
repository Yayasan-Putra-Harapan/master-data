import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import {
    School,
    GraduationCap,
    Users,
    UserCheck,
    CalendarDays,
    Layers,
    Building,
    DoorOpen,
    BookOpen,
    Truck,
    ArrowRight,
} from 'lucide-react';

interface Props {
    metrics: {
        total_units: number;
        total_siswa: number;
        total_karyawan: number;
        total_orang_tua: number;
        total_tahun_ajaran: number;
        total_kelas: number;
        total_bangunan: number;
        total_ruang: number;
        total_mata_pelajaran: number;
        total_vendor: number;
    };
    unitsSummary: {
        id: number;
        kode_unit: string;
        nama_unit: string;
        jenjang: string;
        siswa_count: number;
        karyawan_count: number;
        kelas_count: number;
        bangunan_count: number;
        mapel_count: number;
    }[];
}

export default function Dashboard({ metrics, unitsSummary }: Props) {
    const coreStats = [
        {
            title: 'Satuan Unit',
            value: metrics.total_units,
            desc: 'Jenjang PG hingga Boarding',
            icon: School,
            href: route('units.index'),
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
        },
        {
            title: 'Siswa Aktif',
            value: metrics.total_siswa,
            desc: 'Buku induk terpusat',
            icon: GraduationCap,
            href: route('siswa.index'),
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
            title: 'Karyawan & Guru',
            value: metrics.total_karyawan,
            desc: 'Tenaga pendidik & staf',
            icon: Users,
            href: route('karyawan.index'),
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/40',
        },
        {
            title: 'Orang Tua / Wali',
            value: metrics.total_orang_tua,
            desc: 'Data kontak keluarga',
            icon: UserCheck,
            href: route('orang-tua.index'),
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
        },
    ];

    const extensionStats = [
        {
            title: 'Tahun Ajaran',
            value: metrics.total_tahun_ajaran,
            icon: CalendarDays,
            href: route('tahun-ajaran.index'),
        },
        {
            title: 'Rombel / Kelas',
            value: metrics.total_kelas,
            icon: Layers,
            href: route('kelas.index'),
        },
        {
            title: 'Gedung Bangunan',
            value: metrics.total_bangunan,
            icon: Building,
            href: route('bangunan.index'),
        },
        {
            title: 'Ruangan Fasilitas',
            value: metrics.total_ruang,
            icon: DoorOpen,
            href: route('ruang.index'),
        },
        {
            title: 'Mata Pelajaran',
            value: metrics.total_mata_pelajaran,
            icon: BookOpen,
            href: route('mata-pelajaran.index'),
        },
        {
            title: 'Mitra & Vendor',
            value: metrics.total_vendor,
            icon: Truck,
            href: route('vendor.index'),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Dashboard Ikhtisar MDM (10 Entitas)
                    </h2>
                </div>
            }
        >
            <Head title="Dashboard Master Data" />

            <div className="space-y-6">
                {/* Core Metric Cards */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Entitas Utama (Core)
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {coreStats.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Card key={item.title} className="shadow-xs">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-xs font-medium text-muted-foreground">
                                            {item.title}
                                        </CardTitle>
                                        <div className={`rounded-md p-2 ${item.bg} ${item.color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{item.value}</div>
                                        <div className="flex items-center justify-between pt-2">
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                            <Link
                                                href={item.href}
                                                className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                                            >
                                                Kelola <ArrowRight className="ml-1 h-3 w-3" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Extension Metric Cards */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Akademik, Fasilitas & Logistik
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        {extensionStats.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.title} href={item.href}>
                                    <Card className="shadow-xs hover:border-primary/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="p-4 flex flex-col justify-between h-full">
                                            <div className="flex items-center justify-between text-muted-foreground mb-2">
                                                <span className="text-xs font-medium">{item.title}</span>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="text-xl font-bold text-foreground">
                                                {item.value}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Units Summary Table */}
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Distribusi Data per Satuan Unit Pendidikan
                            </CardTitle>
                            <CardDescription>
                                Rekapitulasi entitas siswa, karyawan, rombel kelas, gedung, dan kurikulum per unit
                            </CardDescription>
                        </div>
                        <Link href={route('units.index')}>
                            <Button variant="outline" size="sm">
                                Kelola Unit
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Kode</TableHead>
                                        <TableHead>Nama Unit Pendidikan</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                        <TableHead className="text-right">Siswa</TableHead>
                                        <TableHead className="text-right">Karyawan</TableHead>
                                        <TableHead className="text-right">Rombel</TableHead>
                                        <TableHead className="text-right">Gedung</TableHead>
                                        <TableHead className="text-right">Mapel</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unitsSummary.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell className="font-mono font-medium text-xs">
                                                {unit.kode_unit}
                                            </TableCell>
                                            <TableCell className="font-medium">{unit.nama_unit}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{unit.jenjang}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {unit.siswa_count}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {unit.karyawan_count}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {unit.kelas_count}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {unit.bangunan_count}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {unit.mapel_count}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
