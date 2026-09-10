import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { MataPelajaran, PaginatedData } from '@/types';
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
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';

interface Props {
    mataPelajaran: PaginatedData<MataPelajaran>;
    units: { id: number; kode_unit: string; nama_unit: string }[];
    filters: {
        search?: string;
        unit_id?: string;
        kelompok?: string;
    };
}

export default function MataPelajaranIndex({ mataPelajaran, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitFilter, setUnitFilter] = useState(filters.unit_id || 'all');
    const [kelompokFilter, setKelompokFilter] = useState(filters.kelompok || 'all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MataPelajaran | null>(null);
    const [deletingItem, setDeletingItem] = useState<MataPelajaran | null>(null);

    const isInitialSearch = useRef(true);

    useEffect(() => {
        if (isInitialSearch.current) {
            isInitialSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('mata-pelajaran.index'),
                {
                    search: search || undefined,
                    unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                    kelompok: kelompokFilter !== 'all' ? kelompokFilter : undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode_mapel: '',
        nama_mapel: '',
        unit_id: units[0]?.id?.toString() || '',
        kelompok: 'wajib' as MataPelajaran['kelompok'],
        beban_jam: 2,
        keterangan: '',
    });

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('mata-pelajaran.index'),
            {
                search: search || undefined,
                unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                kelompok: kelompokFilter !== 'all' ? kelompokFilter : undefined,
                ...params,
            },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (item: MataPelajaran) => {
        setEditingItem(item);
        clearErrors();
        setData({
            kode_mapel: item.kode_mapel,
            nama_mapel: item.nama_mapel,
            unit_id: item.unit_id.toString(),
            kelompok: item.kelompok,
            beban_jam: item.beban_jam,
            keterangan: item.keterangan || '',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('mata-pelajaran.update', editingItem.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('mata-pelajaran.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('mata-pelajaran.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    const getKelompokBadge = (kelompok: MataPelajaran['kelompok']) => {
        switch (kelompok) {
            case 'wajib':
                return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Wajib</Badge>;
            case 'peminatan':
                return <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Peminatan</Badge>;
            case 'muatan_lokal':
                return <Badge variant="outline">Muatan Lokal</Badge>;
            case 'ekstrakurikuler':
                return <Badge variant="secondary">Ekstrakurikuler</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Master Data Mata Pelajaran (Kurikulum)
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Mata Pelajaran" />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Mata Pelajaran & Kurikulum
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Standar kurikulum mata pelajaran per jenjang satuan pendidikan yayasan
                            </p>
                        </div>
                        <Button onClick={openCreateModal} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Mata Pelajaran
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode atau nama mata pelajaran..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

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

                            <div className="w-full sm:w-44">
                                <Select
                                    value={kelompokFilter}
                                    onValueChange={(val) => {
                                        setKelompokFilter(val);
                                        applyFilter({ kelompok: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kelompok Mapel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kelompok</SelectItem>
                                        <SelectItem value="wajib">Wajib</SelectItem>
                                        <SelectItem value="peminatan">Peminatan</SelectItem>
                                        <SelectItem value="muatan_lokal">Muatan Lokal</SelectItem>
                                        <SelectItem value="ekstrakurikuler">Ekstrakurikuler</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-32">Kode</TableHead>
                                        <TableHead>Nama Mata Pelajaran</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Kelompok</TableHead>
                                        <TableHead className="text-center">Beban Jam</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mataPelajaran.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Tidak ada data mata pelajaran ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        mataPelajaran.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono font-medium text-xs">
                                                    {item.kode_mapel}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.nama_mapel}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {item.unit?.kode_unit}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getKelompokBadge(item.kelompok)}</TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {item.beban_jam} JP / Minggu
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {item.keterangan || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => openEditModal(item)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => setDeletingItem(item)}
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
                            links={mataPelajaran.links}
                            from={mataPelajaran.from}
                            to={mataPelajaran.to}
                            total={mataPelajaran.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Form */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan kode kurikulum dan beban jam pelajaran per minggu.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kode_mapel">Kode Mapel *</Label>
                                <Input
                                    id="kode_mapel"
                                    placeholder="Contoh: MAT-SD"
                                    value={data.kode_mapel}
                                    onChange={(e) => setData('kode_mapel', e.target.value.toUpperCase())}
                                />
                                {errors.kode_mapel && (
                                    <p className="text-xs text-destructive">{errors.kode_mapel}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="unit_id">Unit Pendidikan *</Label>
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
                                {errors.unit_id && <p className="text-xs text-destructive">{errors.unit_id}</p>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nama_mapel">Nama Mata Pelajaran *</Label>
                            <Input
                                id="nama_mapel"
                                placeholder="Contoh: Matematika Dasar"
                                value={data.nama_mapel}
                                onChange={(e) => setData('nama_mapel', e.target.value)}
                            />
                            {errors.nama_mapel && (
                                <p className="text-xs text-destructive">{errors.nama_mapel}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kelompok">Kelompok Mapel *</Label>
                                <Select
                                    value={data.kelompok}
                                    onValueChange={(val: MataPelajaran['kelompok']) => setData('kelompok', val)}
                                >
                                    <SelectTrigger id="kelompok">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wajib">Wajib</SelectItem>
                                        <SelectItem value="peminatan">Peminatan</SelectItem>
                                        <SelectItem value="muatan_lokal">Muatan Lokal</SelectItem>
                                        <SelectItem value="ekstrakurikuler">Ekstrakurikuler</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="beban_jam">Beban Jam (JP) *</Label>
                                <Input
                                    id="beban_jam"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.beban_jam}
                                    onChange={(e) => setData('beban_jam', parseInt(e.target.value) || 2)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="keterangan">Keterangan / Silabus</Label>
                            <Input
                                id="keterangan"
                                placeholder="Contoh: Kurikulum Merdeka"
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
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
            <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Mata Pelajaran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus mata pelajaran{' '}
                            <span className="font-semibold text-foreground">
                                {deletingItem?.nama_mapel}
                            </span>
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
