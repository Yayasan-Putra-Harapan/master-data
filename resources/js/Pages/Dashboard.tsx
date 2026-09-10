import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { School, GraduationCap, Users, UserCheck, ArrowRight } from 'lucide-react';

interface Props {
    metrics: {
        total_units: number;
        total_siswa: number;
        total_karyawan: number;
        total_orang_tua: number;
    };
    unitsSummary: {
        id: number;
        kode_unit: string;
        nama_unit: string;
        jenjang: string;
        siswa_count: number;
        karyawan_count: number;
    }[];
}

export default function Dashboard({ metrics, unitsSummary }: Props) {
    const stats = [
        {
            title: 'Total Satuan Unit',
            value: metrics.total_units,
            desc: 'Jenjang PG hingga Boarding',
            icon: School,
            href: route('units.index'),
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
        },
        {
            title: 'Total Siswa Aktif',
            value: metrics.total_siswa,
            desc: 'Lintas seluruh unit sekolah',
            icon: GraduationCap,
            href: route('siswa.index'),
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
            title: 'Karyawan & Guru',
            value: metrics.total_karyawan,
            desc: 'Pendidik & staf operasional',
            icon: Users,
            href: route('karyawan.index'),
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/40',
        },
        {
            title: 'Orang Tua / Wali',
            value: metrics.total_orang_tua,
            desc: 'Kontak terhubung dengan siswa',
            icon: UserCheck,
            href: route('orang-tua.index'),
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Dashboard Ikhtisar MDM
                    </h2>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.title} className="shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-medium text-neutral-500">
                                        {item.title}
                                    </CardTitle>
                                    <div className={`rounded-md p-2 ${item.bg} ${item.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{item.value}</div>
                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-xs text-neutral-500">{item.desc}</p>
                                        <Link
                                            href={item.href}
                                            className="inline-flex items-center text-xs font-medium text-neutral-900 hover:underline dark:text-neutral-100"
                                        >
                                            Kelola <ArrowRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Units Summary Table */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Distribusi Data per Satuan Unit
                            </CardTitle>
                            <CardDescription>
                                Rekapitulasi entitas siswa dan tenaga pendidik per unit
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
                                        <TableHead className="text-right">Jumlah Siswa</TableHead>
                                        <TableHead className="text-right">Jumlah Karyawan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unitsSummary.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell className="font-mono font-medium">
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
