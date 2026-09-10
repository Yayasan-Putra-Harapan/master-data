import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Bangunan, PaginatedData } from '@/types';
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
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Building,
    Download,
    Upload,
    FileSpreadsheet,
} from 'lucide-react';

interface Props {
    bangunan: PaginatedData<Bangunan>;
    units: { id: number; kode_unit: string; nama_unit: string }[];
    filters: {
        search?: string;
        unit_id?: string;
        kondisi?: string;
        per_page?: string;
    };
}

export default function BangunanIndex({ bangunan, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitFilter, setUnitFilter] = useState(filters.unit_id || 'all');
    const [kondisiFilter, setKondisiFilter] = useState(filters.kondisi || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Bangunan | null>(null);
    const [deletingItem, setDeletingItem] = useState<Bangunan | null>(null);

    const isInitialSearch = useRef(true);

    useEffect(() => {
        if (isInitialSearch.current) {
            isInitialSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            applyFilter({ search: search || undefined });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode_bangunan: '',
        nama_bangunan: '',
        unit_id: units[0]?.id?.toString() || '',
        jumlah_lantai: 1,
        luas: '' as string | number,
        kondisi: 'baik' as Bangunan['kondisi'],
        keterangan: '',
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('bangunan.index'),
            {
                search: search || undefined,
                unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                kondisi: kondisiFilter !== 'all' ? kondisiFilter : undefined,
                per_page: perPage !== '10' ? perPage : undefined,
                ...params,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (item: Bangunan) => {
        setEditingItem(item);
        clearErrors();
        setData({
            kode_bangunan: item.kode_bangunan,
            nama_bangunan: item.nama_bangunan,
            unit_id: item.unit_id.toString(),
            jumlah_lantai: item.jumlah_lantai,
            luas: item.luas || '',
            kondisi: item.kondisi,
            keterangan: item.keterangan || '',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('bangunan.update', editingItem.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('bangunan.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.file) return;

        importForm.post(route('bangunan.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                importForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('bangunan.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (unitFilter !== 'all') queryParams.append('unit_id', unitFilter);
        if (kondisiFilter !== 'all') queryParams.append('kondisi', kondisiFilter);

        window.location.href = `${route('bangunan.export')}?${queryParams.toString()}`;
    };

    const getKondisiBadge = (kondisi: Bangunan['kondisi']) => {
        switch (kondisi) {
            case 'baik':
                return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Baik</Badge>;
            case 'rusak_ringan':
                return <Badge variant="outline" className="border-amber-500 text-amber-600">Rusak Ringan</Badge>;
            case 'rusak_berat':
                return <Badge variant="destructive">Rusak Berat</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Master Data Bangunan & Sarana Fisik
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Bangunan" />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Inventaris Gedung & Infrastruktur
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Data sarana gedung per unit satuan pendidikan yayasan
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" /> Ekspor CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsImportOpen(true)}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" /> Impor Masal
                            </Button>
                            <Button onClick={openCreateModal} size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Tambah Bangunan
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode atau nama gedung..."
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

                            <div className="w-full sm:w-40">
                                <Select
                                    value={kondisiFilter}
                                    onValueChange={(val) => {
                                        setKondisiFilter(val);
                                        applyFilter({ kondisi: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kondisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kondisi</SelectItem>
                                        <SelectItem value="baik">Baik</SelectItem>
                                        <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                                        <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-32">
                                <Select
                                    value={perPage}
                                    onValueChange={(val) => {
                                        setPerPage(val);
                                        applyFilter({ per_page: val !== '10' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tampilkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 Baris</SelectItem>
                                        <SelectItem value="25">25 Baris</SelectItem>
                                        <SelectItem value="50">50 Baris</SelectItem>
                                        <SelectItem value="100">100 Baris</SelectItem>
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
                                        <TableHead>Nama Gedung / Bangunan</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead className="text-center">Lantai</TableHead>
                                        <TableHead>Luas Bangunan</TableHead>
                                        <TableHead className="text-center">Ruangan</TableHead>
                                        <TableHead>Kondisi</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bangunan.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                Tidak ada data bangunan ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bangunan.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono font-medium text-xs">
                                                    {item.kode_bangunan}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div>{item.nama_bangunan}</div>
                                                    {item.keterangan && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.keterangan}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {item.unit?.kode_unit}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {item.jumlah_lantai} Lantai
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {item.luas ? `${item.luas} m²` : '-'}
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {item.ruang_count ?? 0} Ruang
                                                </TableCell>
                                                <TableCell>{getKondisiBadge(item.kondisi)}</TableCell>
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
                            links={bangunan.links}
                            from={bangunan.from}
                            to={bangunan.to}
                            total={bangunan.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Impor Data Bangunan (Masal)</DialogTitle>
                        <DialogDescription>
                            Unggah berkas CSV inventaris bangunan/gedung sesuai template.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleImportSubmit} className="space-y-4">
                        <div className="rounded-lg border border-dashed p-4 text-center space-y-2">
                            <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">
                                Format berkas harus berupa <span className="font-semibold text-foreground">.CSV</span>
                            </div>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) => importForm.setData('file', e.target.files?.[0] || null)}
                                className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                            />
                            {importForm.errors.file && (
                                <p className="text-xs text-destructive">{importForm.errors.file}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-muted-foreground">Belum punya format?</span>
                            <a
                                href={route('bangunan.template')}
                                download
                                className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                            >
                                <Download className="h-3.5 w-3.5" /> Unduh Template CSV
                            </a>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsImportOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!importForm.data.file || importForm.processing}
                            >
                                {importForm.processing ? 'Mengimpor...' : 'Mulai Impor'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Form */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Ubah Data Bangunan' : 'Tambah Bangunan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Inventarisasi gedung dan fasilitas penunjang operasional sekolah.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kode_bangunan">Kode Bangunan *</Label>
                                <Input
                                    id="kode_bangunan"
                                    placeholder="Contoh: GDG-SD-A"
                                    value={data.kode_bangunan}
                                    onChange={(e) => setData('kode_bangunan', e.target.value.toUpperCase())}
                                />
                                {errors.kode_bangunan && (
                                    <p className="text-xs text-destructive">{errors.kode_bangunan}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="unit_id">Unit Sekolah *</Label>
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
                            <Label htmlFor="nama_bangunan">Nama Bangunan / Gedung *</Label>
                            <Input
                                id="nama_bangunan"
                                placeholder="Contoh: Gedung Aisyah (Utama SD)"
                                value={data.nama_bangunan}
                                onChange={(e) => setData('nama_bangunan', e.target.value)}
                            />
                            {errors.nama_bangunan && (
                                <p className="text-xs text-destructive">{errors.nama_bangunan}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="jumlah_lantai">Lantai *</Label>
                                <Input
                                    id="jumlah_lantai"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.jumlah_lantai}
                                    onChange={(e) => setData('jumlah_lantai', parseInt(e.target.value) || 1)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="luas">Luas (m²)</Label>
                                <Input
                                    id="luas"
                                    type="number"
                                    step="0.01"
                                    placeholder="Contoh: 1200"
                                    value={data.luas}
                                    onChange={(e) => setData('luas', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="kondisi">Kondisi *</Label>
                                <Select
                                    value={data.kondisi}
                                    onValueChange={(val: Bangunan['kondisi']) => setData('kondisi', val)}
                                >
                                    <SelectTrigger id="kondisi">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baik">Baik</SelectItem>
                                        <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                                        <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="keterangan">Keterangan Tambahan</Label>
                            <Input
                                id="keterangan"
                                placeholder="Catatan fasilitas/keperluan renovasi"
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
                        <AlertDialogTitle>Hapus Data Bangunan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus bangunan{' '}
                            <span className="font-semibold text-foreground">
                                {deletingItem?.nama_bangunan}
                            </span>
                            . Seluruh data ruangan yang ada di dalam bangunan ini tidak dapat diakses sebelum dipindahkan.
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
