import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Karyawan, PaginatedData, Unit } from '@/types';
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
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';

interface Props {
    karyawan: PaginatedData<Karyawan>;
    units: { id: number; kode_unit: string; nama_unit: string }[];
    filters: {
        search?: string;
        unit_id?: string;
        role?: string;
        is_aktif?: string;
    };
}

export default function KaryawanIndex({ karyawan, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitFilter, setUnitFilter] = useState(filters.unit_id || 'all');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null);
    const [deletingKaryawan, setDeletingKaryawan] = useState<Karyawan | null>(null);

    const isInitialSearch = useRef(true);

    useEffect(() => {
        if (isInitialSearch.current) {
            isInitialSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('karyawan.index'),
                {
                    search: search || undefined,
                    unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                    role: roleFilter !== 'all' ? roleFilter : undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nip: '',
        nuptk: '',
        nik: '',
        nama: '',
        jenis_kelamin: 'L' as 'L' | 'P',
        tempat_lahir: '',
        tanggal_lahir: '',
        unit_id: units[0]?.id?.toString() || '',
        role: 'guru' as Karyawan['role'],
        status_kepegawaian: 'tetap' as Karyawan['status_kepegawaian'],
        telepon: '',
        email: '',
        alamat: '',
        pendidikan_terakhir: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        is_aktif: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('karyawan.index'),
            {
                search: search || undefined,
                unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                ...params,
            },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingKaryawan(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (item: Karyawan) => {
        setEditingKaryawan(item);
        clearErrors();
        setData({
            nip: item.nip || '',
            nuptk: item.nuptk || '',
            nik: item.nik,
            nama: item.nama,
            jenis_kelamin: item.jenis_kelamin,
            tempat_lahir: item.tempat_lahir || '',
            tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.substring(0, 10) : '',
            unit_id: item.unit_id.toString(),
            role: item.role,
            status_kepegawaian: item.status_kepegawaian,
            telepon: item.telepon,
            email: item.email,
            alamat: item.alamat || '',
            pendidikan_terakhir: item.pendidikan_terakhir || '',
            tanggal_masuk: item.tanggal_masuk ? item.tanggal_masuk.substring(0, 10) : '',
            is_aktif: item.is_aktif,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingKaryawan) {
            put(route('karyawan.update', editingKaryawan.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('karyawan.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingKaryawan) return;
        router.delete(route('karyawan.destroy', deletingKaryawan.id), {
            onSuccess: () => setDeletingKaryawan(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Master Data Karyawan & Guru
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Karyawan" />

            <div className="space-y-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Direktori Tenaga Pendidik & Kependidikan
                            </CardTitle>
                            <p className="text-xs text-neutral-500">
                                Data guru, kepala sekolah, dan staf operasional seluruh unit yayasan
                            </p>
                        </div>
                        <Button onClick={openCreateModal} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Karyawan
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Cari NIK, NIP, nama, atau email..."
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

                            <div className="w-full sm:w-40">
                                <Select
                                    value={roleFilter}
                                    onValueChange={(val) => {
                                        setRoleFilter(val);
                                        applyFilter({ role: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Peran</SelectItem>
                                        <SelectItem value="guru">Guru</SelectItem>
                                        <SelectItem value="kepala_sekolah">Kepala Sekolah</SelectItem>
                                        <SelectItem value="staf">Staf</SelectItem>
                                        <SelectItem value="keuangan">Keuangan</SelectItem>
                                        <SelectItem value="administrasi">Administrasi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama & Identitas</TableHead>
                                        <TableHead>Unit Satuan</TableHead>
                                        <TableHead>Peran / Jabatan</TableHead>
                                        <TableHead>Status Kerja</TableHead>
                                        <TableHead>Kontak</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {karyawan.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-neutral-500">
                                                Tidak ada data karyawan ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        karyawan.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        {item.nama} ({item.jenis_kelamin})
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500 font-mono">
                                                        NIK: {item.nik} {item.nip ? `• NIP: ${item.nip}` : ''}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {item.unit?.kode_unit || `Unit #${item.unit_id}`}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">
                                                        {item.role.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="capitalize text-xs text-neutral-600 dark:text-neutral-400">
                                                    {item.status_kepegawaian}
                                                </TableCell>
                                                <TableCell className="text-xs text-neutral-500">
                                                    <div>{item.telepon}</div>
                                                    <div className="text-[11px] text-neutral-400">{item.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.is_aktif ? 'default' : 'secondary'}>
                                                        {item.is_aktif ? 'Aktif' : 'Non-aktif'}
                                                    </Badge>
                                                </TableCell>
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
                                                            onClick={() => setDeletingKaryawan(item)}
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
                            links={karyawan.links}
                            from={karyawan.from}
                            to={karyawan.to}
                            total={karyawan.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingKaryawan ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Pastikan NIK valid 16 digit dan unit sekolah penempatan telah dipilih dengan benar.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="nik">NIK KTP (16 Digit) *</Label>
                                <Input
                                    id="nik"
                                    maxLength={16}
                                    placeholder="3302xxxxxxxxxxxx"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                />
                                {errors.nik && <p className="text-xs text-red-500">{errors.nik}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="nip">NIP Yayasan</Label>
                                <Input
                                    id="nip"
                                    placeholder="NIP Pegawai (opsional)"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                />
                                {errors.nip && <p className="text-xs text-red-500">{errors.nip}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1">
                                <Label htmlFor="nama">Nama Lengkap & Gelar *</Label>
                                <Input
                                    id="nama"
                                    placeholder="Contoh: Budi Santoso, S.Pd."
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                />
                                {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
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
                                <Label htmlFor="unit_id">Unit Penempatan *</Label>
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
                                                {u.kode_unit} - {u.nama_unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && (
                                    <p className="text-xs text-red-500">{errors.unit_id}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="role">Peran / Posisi *</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(val: Karyawan['role']) => setData('role', val)}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="guru">Guru</SelectItem>
                                        <SelectItem value="kepala_sekolah">Kepala Sekolah</SelectItem>
                                        <SelectItem value="staf">Staf</SelectItem>
                                        <SelectItem value="keuangan">Keuangan</SelectItem>
                                        <SelectItem value="administrasi">Administrasi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
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
                            <div className="space-y-1">
                                <Label htmlFor="status_kepegawaian">Status Kepegawaian *</Label>
                                <Select
                                    value={data.status_kepegawaian}
                                    onValueChange={(val: Karyawan['status_kepegawaian']) =>
                                        setData('status_kepegawaian', val)
                                    }
                                >
                                    <SelectTrigger id="status_kepegawaian">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tetap">Tetap</SelectItem>
                                        <SelectItem value="kontrak">Kontrak</SelectItem>
                                        <SelectItem value="honorer">Honorer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="email">Alamat Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@yayasan.ac.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="telepon">Nomor Telepon / WA *</Label>
                                <Input
                                    id="telepon"
                                    placeholder="08xxxxxxxxxx"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                />
                                {errors.telepon && (
                                    <p className="text-xs text-red-500">{errors.telepon}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="alamat">Alamat Domisili</Label>
                            <Input
                                id="alamat"
                                placeholder="Alamat rumah tinggal"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                            />
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
            <AlertDialog open={!!deletingKaryawan} onOpenChange={() => setDeletingKaryawan(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Karyawan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus data karyawan{' '}
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {deletingKaryawan?.nama}
                            </span>
                            .
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
