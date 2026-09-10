import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { OrangTua, PaginatedData } from '@/types';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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
import { Plus, Search, Edit2, Trash2, UserCheck, Phone, MapPin } from 'lucide-react';

interface Props {
    orangTua: PaginatedData<OrangTua>;
    filters: {
        search?: string;
    };
}

export default function OrangTuaIndex({ orangTua, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOrtu, setEditingOrtu] = useState<OrangTua | null>(null);
    const [deletingOrtu, setDeletingOrtu] = useState<OrangTua | null>(null);

    const isInitialSearch = useRef(true);

    useEffect(() => {
        if (isInitialSearch.current) {
            isInitialSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('orang-tua.index'),
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        no_kk: '',
        nik_ayah: '',
        nama_ayah: '',
        pekerjaan_ayah: '',
        penghasilan_ayah: '',
        nik_ibu: '',
        nama_ibu: '',
        pekerjaan_ibu: '',
        penghasilan_ibu: '',
        nama_wali: '',
        nik_wali: '',
        hubungan_wali: '',
        telepon: '',
        email: '',
        alamat: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('orang-tua.index'),
            { search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingOrtu(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (item: OrangTua) => {
        setEditingOrtu(item);
        clearErrors();
        setData({
            no_kk: item.no_kk || '',
            nik_ayah: item.nik_ayah || '',
            nama_ayah: item.nama_ayah || '',
            pekerjaan_ayah: item.pekerjaan_ayah || '',
            penghasilan_ayah: item.penghasilan_ayah || '',
            nik_ibu: item.nik_ibu || '',
            nama_ibu: item.nama_ibu || '',
            pekerjaan_ibu: item.pekerjaan_ibu || '',
            penghasilan_ibu: item.penghasilan_ibu || '',
            nama_wali: item.nama_wali || '',
            nik_wali: item.nik_wali || '',
            hubungan_wali: item.hubungan_wali || '',
            telepon: item.telepon || '',
            email: item.email || '',
            alamat: item.alamat || '',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOrtu) {
            put(route('orang-tua.update', editingOrtu.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('orang-tua.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingOrtu) return;
        router.delete(route('orang-tua.destroy', deletingOrtu.id), {
            onSuccess: () => setDeletingOrtu(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Master Data Orang Tua / Wali
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Orang Tua / Wali" />

            <div className="space-y-6">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Orang Tua & Wali Siswa
                            </CardTitle>
                            <p className="text-xs text-neutral-500">
                                Kontak wali dan data keluarga untuk keperluan administrasi kesiswaan
                            </p>
                        </div>
                        <Button onClick={openCreateModal} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Orang Tua / Wali
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Cari nama orang tua, no KK, telepon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </form>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Ayah</TableHead>
                                        <TableHead>Nama Ibu</TableHead>
                                        <TableHead>No. KK</TableHead>
                                        <TableHead>Kontak Telepon</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead className="text-center">Siswa</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orangTua.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-neutral-500">
                                                Tidak ada data orang tua ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orangTua.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div>{item.nama_ayah || '-'}</div>
                                                    {item.nik_ayah && (
                                                        <div className="text-[11px] text-neutral-400 font-mono">
                                                            NIK: {item.nik_ayah}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div>{item.nama_ibu || '-'}</div>
                                                    {item.nik_ibu && (
                                                        <div className="text-[11px] text-neutral-400 font-mono">
                                                            NIK: {item.nik_ibu}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {item.no_kk || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                                        <span>{item.telepon}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[220px] truncate text-xs text-neutral-600 dark:text-neutral-400">
                                                    <div className="flex items-center gap-1 truncate">
                                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                                        <span className="truncate">{item.alamat}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">
                                                    {item.siswa_count ?? 0}
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
                                                            onClick={() => setDeletingOrtu(item)}
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
                            links={orangTua.links}
                            from={orangTua.from}
                            to={orangTua.to}
                            total={orangTua.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOrtu ? 'Ubah Data Orang Tua / Wali' : 'Tambah Orang Tua / Wali'}
                        </DialogTitle>
                        <DialogDescription>
                            Validitas NIK dan Nomor KK diperiksa dengan format 16 digit angka.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="no_kk">Nomor Kartu Keluarga (KK)</Label>
                            <Input
                                id="no_kk"
                                placeholder="16 digit nomor KK"
                                maxLength={16}
                                value={data.no_kk}
                                onChange={(e) => setData('no_kk', e.target.value)}
                            />
                            {errors.no_kk && <p className="text-xs text-red-500">{errors.no_kk}</p>}
                        </div>

                        <div className="rounded-lg border p-3 space-y-3">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Data Ayah
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="nama_ayah">Nama Ayah</Label>
                                    <Input
                                        id="nama_ayah"
                                        placeholder="Nama lengkap ayah"
                                        value={data.nama_ayah}
                                        onChange={(e) => setData('nama_ayah', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="nik_ayah">NIK Ayah</Label>
                                    <Input
                                        id="nik_ayah"
                                        placeholder="16 digit NIK"
                                        maxLength={16}
                                        value={data.nik_ayah}
                                        onChange={(e) => setData('nik_ayah', e.target.value)}
                                    />
                                    {errors.nik_ayah && (
                                        <p className="text-xs text-red-500">{errors.nik_ayah}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="pekerjaan_ayah">Pekerjaan</Label>
                                    <Input
                                        id="pekerjaan_ayah"
                                        placeholder="Contoh: PNS, Wiraswasta"
                                        value={data.pekerjaan_ayah}
                                        onChange={(e) => setData('pekerjaan_ayah', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="penghasilan_ayah">Penghasilan</Label>
                                    <Input
                                        id="penghasilan_ayah"
                                        placeholder="Contoh: Rp 5.000.000"
                                        value={data.penghasilan_ayah}
                                        onChange={(e) => setData('penghasilan_ayah', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border p-3 space-y-3">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Data Ibu
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="nama_ibu">Nama Ibu</Label>
                                    <Input
                                        id="nama_ibu"
                                        placeholder="Nama lengkap ibu"
                                        value={data.nama_ibu}
                                        onChange={(e) => setData('nama_ibu', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="nik_ibu">NIK Ibu</Label>
                                    <Input
                                        id="nik_ibu"
                                        placeholder="16 digit NIK"
                                        maxLength={16}
                                        value={data.nik_ibu}
                                        onChange={(e) => setData('nik_ibu', e.target.value)}
                                    />
                                    {errors.nik_ibu && (
                                        <p className="text-xs text-red-500">{errors.nik_ibu}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="pekerjaan_ibu">Pekerjaan</Label>
                                    <Input
                                        id="pekerjaan_ibu"
                                        placeholder="Contoh: Ibu Rumah Tangga"
                                        value={data.pekerjaan_ibu}
                                        onChange={(e) => setData('pekerjaan_ibu', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="penghasilan_ibu">Penghasilan</Label>
                                    <Input
                                        id="penghasilan_ibu"
                                        placeholder="Contoh: Rp 3.000.000"
                                        value={data.penghasilan_ibu}
                                        onChange={(e) => setData('penghasilan_ibu', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="telepon">No. Telepon / WhatsApp *</Label>
                                <Input
                                    id="telepon"
                                    placeholder="Contoh: 081234567890"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                />
                                {errors.telepon && (
                                    <p className="text-xs text-red-500">{errors.telepon}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ortu@email.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="alamat">Alamat Tinggal *</Label>
                            <Input
                                id="alamat"
                                placeholder="Alamat domisili lengkap"
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
            <AlertDialog open={!!deletingOrtu} onOpenChange={() => setDeletingOrtu(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Orang Tua?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus data keluarga{' '}
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {deletingOrtu?.nama_ayah || deletingOrtu?.nama_ibu || deletingOrtu?.nama_wali}
                            </span>
                            . Hubungan dengan siswa terkait akan dilepas.
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
