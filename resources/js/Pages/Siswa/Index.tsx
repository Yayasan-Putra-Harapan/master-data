import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { PaginatedData, Siswa, Unit } from '@/types';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Plus, Search, Edit2, Trash2, GraduationCap } from 'lucide-react';

interface Props {
    siswa: PaginatedData<Siswa>;
    units: { id: number; kode_unit: string; nama_unit: string; jenjang: string }[];
    orangTuaList: { id: number; nama_ayah?: string; nama_ibu?: string; nama_wali?: string; telepon: string }[];
    filters: {
        search?: string;
        unit_id?: string;
        status?: string;
        angkatan?: string;
    };
}

export default function SiswaIndex({ siswa, units, orangTuaList, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitFilter, setUnitFilter] = useState(filters.unit_id || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
    const [deletingSiswa, setDeletingSiswa] = useState<Siswa | null>(null);

    const isInitialSearch = useRef(true);

    useEffect(() => {
        if (isInitialSearch.current) {
            isInitialSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('siswa.index'),
                {
                    search: search || undefined,
                    unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const currentYear = new Date().getFullYear();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nisn: '',
        nis: '',
        nik: '',
        nama_lengkap: '',
        nama_panggilan: '',
        jenis_kelamin: 'L' as 'L' | 'P',
        tempat_lahir: 'Purwokerto',
        tanggal_lahir: '',
        agama: 'Islam',
        unit_id: units[0]?.id?.toString() || '',
        orang_tua_id: '',
        alamat: '',
        angkatan: currentYear,
        status: 'aktif' as Siswa['status'],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('siswa.index'),
            {
                search: search || undefined,
                unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                ...params,
            },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingSiswa(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (item: Siswa) => {
        setEditingSiswa(item);
        clearErrors();
        setData({
            nisn: item.nisn,
            nis: item.nis || '',
            nik: item.nik || '',
            nama_lengkap: item.nama_lengkap,
            nama_panggilan: item.nama_panggilan || '',
            jenis_kelamin: item.jenis_kelamin,
            tempat_lahir: item.tempat_lahir,
            tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.substring(0, 10) : '',
            agama: item.agama || 'Islam',
            unit_id: item.unit_id.toString(),
            orang_tua_id: item.orang_tua_id ? item.orang_tua_id.toString() : '',
            alamat: item.alamat,
            angkatan: item.angkatan,
            status: item.status,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSiswa) {
            put(route('siswa.update', editingSiswa.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('siswa.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingSiswa) return;
        router.delete(route('siswa.destroy', deletingSiswa.id), {
            onSuccess: () => setDeletingSiswa(null),
        });
    };

    const getStatusBadge = (status: Siswa['status']) => {
        switch (status) {
            case 'aktif':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Aktif</Badge>;
            case 'lulus':
                return <Badge variant="secondary">Lulus</Badge>;
            case 'mutasi':
                return <Badge variant="outline" className="border-amber-500 text-amber-600">Mutasi</Badge>;
            case 'keluar':
                return <Badge variant="destructive">Keluar</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Master Data Siswa
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Siswa" />

            <div className="space-y-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Buku Induk Siswa Terpusat
                            </CardTitle>
                            <p className="text-xs text-neutral-500">
                                Single Source of Truth data siswa lintas jenjang PG, TK, SD, SMP, SMA, dan Boarding
                            </p>
                        </div>
                        <Button onClick={openCreateModal} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Registrasi Siswa
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Cari NISN, NIK, NIS, nama siswa..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </form>

                            <div className="w-full sm:w-44">
                                <Select
                                    value={unitFilter}
                                    onValueChange={(val) => {
                                        setUnitFilter(val);
                                        applyFilter({ unit_id: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Unit</SelectItem>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.kode_unit} - {u.nama_unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-36">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        applyFilter({ status: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="lulus">Lulus</SelectItem>
                                        <SelectItem value="mutasi">Mutasi</SelectItem>
                                        <SelectItem value="keluar">Keluar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Identitas Siswa</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Angkatan</TableHead>
                                        <TableHead>Tgl Lahir</TableHead>
                                        <TableHead>Orang Tua / Wali</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {siswa.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-neutral-500">
                                                Tidak ada data siswa ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        siswa.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        {item.nama_lengkap} ({item.jenis_kelamin})
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500 font-mono">
                                                        NISN: {item.nisn} {item.nis ? `• NIS: ${item.nis}` : ''}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {item.unit?.kode_unit || `Unit #${item.unit_id}`}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-xs">
                                                    {item.angkatan}
                                                </TableCell>
                                                <TableCell className="text-xs text-neutral-600 dark:text-neutral-400">
                                                    {item.tanggal_lahir ? item.tanggal_lahir.substring(0, 10) : '-'}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div>
                                                        {item.orang_tua?.nama_ayah ||
                                                         item.orang_tua?.nama_ibu ||
                                                         item.orang_tua?.nama_wali ||
                                                         '-'}
                                                    </div>
                                                    {item.orang_tua?.telepon && (
                                                        <div className="text-[11px] text-neutral-400">
                                                            {item.orang_tua.telepon}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-neutral-600 hover:text-neutral-900"
                                                            onClick={() => openEditModal(item)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700"
                                                            onClick={() => setDeletingSiswa(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            links={siswa.links}
                            from={siswa.from}
                            to={siswa.to}
                            total={siswa.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSiswa ? 'Ubah Data Siswa' : 'Registrasi Siswa Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Validasi otomatis 5 dimensi kualitas data: NISN 10 digit, keabsahan usia logis terhadap jenjang sekolah.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="nisn">NISN (10 Digit) *</Label>
                                <Input
                                    id="nisn"
                                    maxLength={10}
                                    placeholder="Contoh: 0081234567"
                                    value={data.nisn}
                                    onChange={(e) => setData('nisn', e.target.value)}
                                />
                                {errors.nisn && <p className="text-xs text-red-500">{errors.nisn}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="nis">NIS Sekolah</Label>
                                <Input
                                    id="nis"
                                    placeholder="Nomor induk lokal"
                                    value={data.nis}
                                    onChange={(e) => setData('nis', e.target.value)}
                                />
                                {errors.nis && <p className="text-xs text-red-500">{errors.nis}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1">
                                <Label htmlFor="nama_lengkap">Nama Lengkap Siswa *</Label>
                                <Input
                                    id="nama_lengkap"
                                    placeholder="Nama lengkap sesuai akta"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                />
                                {errors.nama_lengkap && (
                                    <p className="text-xs text-red-500">{errors.nama_lengkap}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="jenis_kelamin">Gender *</Label>
                                <Select
                                    value={data.jenis_kelamin}
                                    onValueChange={(val: 'L' | 'P') => setData('jenis_kelamin', val)}
                                >
                                    <SelectTrigger id="jenis_kelamin">
                                        <SelectValue placeholder="Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="L">Laki-laki</SelectItem>
                                        <SelectItem value="P">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="unit_id">Unit Satuan Pendidikan *</Label>
                                <Select
                                    value={data.unit_id}
                                    onValueChange={(val) => setData('unit_id', val)}
                                >
                                    <SelectTrigger id="unit_id">
                                        <SelectValue placeholder="Pilih Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.kode_unit} - {u.nama_unit} ({u.jenjang})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && (
                                    <p className="text-xs text-red-500">{errors.unit_id}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="angkatan">Tahun Angkatan *</Label>
                                <Input
                                    id="angkatan"
                                    type="number"
                                    value={data.angkatan}
                                    onChange={(e) => setData('angkatan', parseInt(e.target.value) || currentYear)}
                                />
                                {errors.angkatan && (
                                    <p className="text-xs text-red-500">{errors.angkatan}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="tempat_lahir">Tempat Lahir *</Label>
                                <Input
                                    id="tempat_lahir"
                                    placeholder="Kota kelahiran"
                                    value={data.tempat_lahir}
                                    onChange={(e) => setData('tempat_lahir', e.target.value)}
                                />
                                {errors.tempat_lahir && (
                                    <p className="text-xs text-red-500">{errors.tempat_lahir}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tanggal_lahir">Tanggal Lahir *</Label>
                                <Input
                                    id="tanggal_lahir"
                                    type="date"
                                    value={data.tanggal_lahir}
                                    onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                />
                                {errors.tanggal_lahir && (
                                    <p className="text-xs text-red-500">{errors.tanggal_lahir}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="orang_tua_id">Orang Tua / Wali</Label>
                                <Select
                                    value={data.orang_tua_id || 'none'}
                                    onValueChange={(val) => setData('orang_tua_id', val === 'none' ? '' : val)}
                                >
                                    <SelectTrigger id="orang_tua_id">
                                        <SelectValue placeholder="Pilih Orang Tua/Wali" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Belum Ditautkan</SelectItem>
                                        {orangTuaList.map((ortu) => (
                                            <SelectItem key={ortu.id} value={ortu.id.toString()}>
                                                {ortu.nama_ayah || ortu.nama_ibu || ortu.nama_wali} ({ortu.telepon})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.orang_tua_id && (
                                    <p className="text-xs text-red-500">{errors.orang_tua_id}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="status">Status Kesiswaan *</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val: Siswa['status']) => setData('status', val)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="lulus">Lulus</SelectItem>
                                        <SelectItem value="mutasi">Mutasi</SelectItem>
                                        <SelectItem value="keluar">Keluar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="alamat">Alamat Tempat Tinggal *</Label>
                            <Input
                                id="alamat"
                                placeholder="Alamat domisili lengkap siswa"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                            />
                            {errors.alamat && (
                                <p className="text-xs text-red-500">{errors.alamat}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={!!deletingSiswa} onOpenChange={() => setDeletingSiswa(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Siswa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus data siswa{' '}
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {deletingSiswa?.nama_lengkap} (NISN: {deletingSiswa?.nisn})
                            </span>
                            . Data riwayat akademik yang terhubung akan terhapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
