import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { PaginatedData, Unit } from '@/types';
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
import { Plus, Search, Edit2, Trash2, School } from 'lucide-react';

interface Props {
    units: PaginatedData<Unit>;
    filters: {
        search?: string;
        jenjang?: string;
        is_aktif?: string;
    };
}

export default function UnitsIndex({ units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [jenjangFilter, setJenjangFilter] = useState(filters.jenjang || 'all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

    const isInitialSearch = useRef(true);

    useEffect(() => {
        if (isInitialSearch.current) {
            isInitialSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('units.index'),
                {
                    search: search || undefined,
                    jenjang: jenjangFilter !== 'all' ? jenjangFilter : undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode_unit: '',
        nama_unit: '',
        jenjang: 'SD' as Unit['jenjang'],
        alamat: '',
        telepon: '',
        email: '',
        kepala_sekolah: '',
        is_aktif: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('units.index'),
            {
                search: search || undefined,
                jenjang: jenjangFilter !== 'all' ? jenjangFilter : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleJenjangChange = (val: string) => {
        setJenjangFilter(val);
        router.get(
            route('units.index'),
            {
                search: search || undefined,
                jenjang: val !== 'all' ? val : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingUnit(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (unit: Unit) => {
        setEditingUnit(unit);
        clearErrors();
        setData({
            kode_unit: unit.kode_unit,
            nama_unit: unit.nama_unit,
            jenjang: unit.jenjang,
            alamat: unit.alamat || '',
            telepon: unit.telepon || '',
            email: unit.email || '',
            kepala_sekolah: unit.kepala_sekolah || '',
            is_aktif: unit.is_aktif,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUnit) {
            put(route('units.update', editingUnit.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('units.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingUnit) return;
        router.delete(route('units.destroy', deletingUnit.id), {
            onSuccess: () => setDeletingUnit(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <School className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Master Data Unit Pendidikan
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Unit" />

            <div className="space-y-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Satuan Pendidikan
                            </CardTitle>
                            <p className="text-xs text-neutral-500">
                                Mengelola seluruh unit sekolah di bawah naungan Yayasan Pendidikan Putra Harapan
                            </p>
                        </div>
                        <Button onClick={openCreateModal} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Unit
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filter & Search */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Cari kode unit, nama, atau kepala sekolah..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </form>
                            <div className="w-full sm:w-48">
                                <Select value={jenjangFilter} onValueChange={handleJenjangChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Jenjang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenjang</SelectItem>
                                        <SelectItem value="PG">Playgroup (PG)</SelectItem>
                                        <SelectItem value="TK">TK</SelectItem>
                                        <SelectItem value="SD">SD</SelectItem>
                                        <SelectItem value="SMP">SMP</SelectItem>
                                        <SelectItem value="SMA">SMA</SelectItem>
                                        <SelectItem value="BOARDING">Boarding School</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">Kode</TableHead>
                                        <TableHead>Nama Unit</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                        <TableHead>Kepala Sekolah</TableHead>
                                        <TableHead>Kontak</TableHead>
                                        <TableHead className="text-center">Siswa</TableHead>
                                        <TableHead className="text-center">Karyawan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {units.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center text-neutral-500">
                                                Tidak ada data unit ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        units.data.map((unit) => (
                                            <TableRow key={unit.id}>
                                                <TableCell className="font-mono font-medium">
                                                    {unit.kode_unit}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {unit.nama_unit}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{unit.jenjang}</Badge>
                                                </TableCell>
                                                <TableCell className="text-neutral-600 dark:text-neutral-400">
                                                    {unit.kepala_sekolah || '-'}
                                                </TableCell>
                                                <TableCell className="text-xs text-neutral-500">
                                                    <div>{unit.telepon || '-'}</div>
                                                    <div>{unit.email || ''}</div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {unit.siswa_count ?? 0}
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {unit.karyawan_count ?? 0}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={unit.is_aktif ? 'default' : 'secondary'}
                                                    >
                                                        {unit.is_aktif ? 'Aktif' : 'Non-aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-neutral-600 hover:text-neutral-900"
                                                            onClick={() => openEditModal(unit)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700"
                                                            onClick={() => setDeletingUnit(unit)}
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
                            links={units.links}
                            from={units.from}
                            to={units.to}
                            total={units.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUnit ? 'Ubah Data Unit' : 'Tambah Unit Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Pastikan kode unit dan jenjang pendidikan sesuai dengan standar yayasan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kode_unit">Kode Unit *</Label>
                                <Input
                                    id="kode_unit"
                                    placeholder="Contoh: SD, SMP"
                                    value={data.kode_unit}
                                    onChange={(e) => setData('kode_unit', e.target.value.toUpperCase())}
                                />
                                {errors.kode_unit && (
                                    <p className="text-xs text-red-500">{errors.kode_unit}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="jenjang">Jenjang *</Label>
                                <Select
                                    value={data.jenjang}
                                    onValueChange={(val: Unit['jenjang']) => setData('jenjang', val)}
                                >
                                    <SelectTrigger id="jenjang">
                                        <SelectValue placeholder="Pilih Jenjang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PG">Playgroup (PG)</SelectItem>
                                        <SelectItem value="TK">TK</SelectItem>
                                        <SelectItem value="SD">SD</SelectItem>
                                        <SelectItem value="SMP">SMP</SelectItem>
                                        <SelectItem value="SMA">SMA</SelectItem>
                                        <SelectItem value="BOARDING">Boarding School</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.jenjang && (
                                    <p className="text-xs text-red-500">{errors.jenjang}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nama_unit">Nama Lengkap Unit *</Label>
                            <Input
                                id="nama_unit"
                                placeholder="Contoh: SD Putra Harapan"
                                value={data.nama_unit}
                                onChange={(e) => setData('nama_unit', e.target.value)}
                            />
                            {errors.nama_unit && (
                                <p className="text-xs text-red-500">{errors.nama_unit}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="kepala_sekolah">Kepala Sekolah</Label>
                            <Input
                                id="kepala_sekolah"
                                placeholder="Nama & gelar kepala sekolah"
                                value={data.kepala_sekolah}
                                onChange={(e) => setData('kepala_sekolah', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="telepon">Telepon</Label>
                                <Input
                                    id="telepon"
                                    placeholder="0281-xxxxxx"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="unit@putraharapan.sch.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="alamat">Alamat Lengkap</Label>
                            <Input
                                id="alamat"
                                placeholder="Alamat kampus/gedung unit"
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

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={!!deletingUnit} onOpenChange={() => setDeletingUnit(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Unit Pendidikan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus unit{' '}
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {deletingUnit?.nama_unit}
                            </span>
                            . Data siswa dan karyawan yang terikat pada unit ini tidak dapat diakses sebelum dipindahkan.
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
