import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { PaginatedData, Ruang } from '@/types';
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
    DoorOpen,
    Download,
    Upload,
    FileSpreadsheet,
} from 'lucide-react';

interface Props {
    ruang: PaginatedData<Ruang>;
    bangunanList: { id: number; kode_bangunan: string; nama_bangunan: string; unit?: { kode_unit: string } }[];
    filters: {
        search?: string;
        bangunan_id?: string;
        fungsi?: string;
        kondisi?: string;
        per_page?: string;
    };
}

export default function RuangIndex({ ruang, bangunanList, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [bangunanFilter, setBangunanFilter] = useState(filters.bangunan_id || 'all');
    const [fungsiFilter, setFungsiFilter] = useState(filters.fungsi || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Ruang | null>(null);
    const [deletingItem, setDeletingItem] = useState<Ruang | null>(null);

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
        kode_ruang: '',
        nama_ruang: '',
        bangunan_id: bangunanList[0]?.id?.toString() || '',
        lantai: 1,
        fungsi: 'kelas' as Ruang['fungsi'],
        kapasitas: 30,
        kondisi: 'baik' as Ruang['kondisi'],
        keterangan: '',
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('ruang.index'),
            {
                search: search || undefined,
                bangunan_id: bangunanFilter !== 'all' ? bangunanFilter : undefined,
                fungsi: fungsiFilter !== 'all' ? fungsiFilter : undefined,
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

    const openEditModal = (item: Ruang) => {
        setEditingItem(item);
        clearErrors();
        setData({
            kode_ruang: item.kode_ruang,
            nama_ruang: item.nama_ruang,
            bangunan_id: item.bangunan_id.toString(),
            lantai: item.lantai,
            fungsi: item.fungsi,
            kapasitas: item.kapasitas,
            kondisi: item.kondisi,
            keterangan: item.keterangan || '',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('ruang.update', editingItem.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('ruang.store'), {
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

        importForm.post(route('ruang.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                importForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('ruang.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (bangunanFilter !== 'all') queryParams.append('bangunan_id', bangunanFilter);
        if (fungsiFilter !== 'all') queryParams.append('fungsi', fungsiFilter);

        window.location.href = `${route('ruang.export')}?${queryParams.toString()}`;
    };

    const getFungsiBadge = (fungsi: Ruang['fungsi']) => {
        return <Badge variant="secondary" className="capitalize">{fungsi}</Badge>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <DoorOpen className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Master Data Ruangan & Fasilitas
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Ruangan" />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Inventaris Ruangan Belajar & Operasional
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Mengelola ruang kelas, laboratorium, kantor, dan fasilitas tiap bangunan
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
                                <Plus className="h-4 w-4" /> Tambah Ruangan
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode atau nama ruangan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-52">
                                <Select
                                    value={bangunanFilter}
                                    onValueChange={(val) => {
                                        setBangunanFilter(val);
                                        applyFilter({ bangunan_id: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Gedung" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Gedung</SelectItem>
                                        {bangunanList.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                {b.kode_bangunan} - {b.nama_bangunan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-40">
                                <Select
                                    value={fungsiFilter}
                                    onValueChange={(val) => {
                                        setFungsiFilter(val);
                                        applyFilter({ fungsi: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Fungsi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Fungsi</SelectItem>
                                        <SelectItem value="kelas">Kelas</SelectItem>
                                        <SelectItem value="laboratorium">Laboratorium</SelectItem>
                                        <SelectItem value="perpustakaan">Perpustakaan</SelectItem>
                                        <SelectItem value="kantor">Kantor</SelectItem>
                                        <SelectItem value="aula">Aula</SelectItem>
                                        <SelectItem value="ibadah">Ibadah</SelectItem>
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
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
                                        <TableHead className="w-28">Kode</TableHead>
                                        <TableHead>Nama Ruang</TableHead>
                                        <TableHead>Gedung & Unit</TableHead>
                                        <TableHead className="text-center">Lantai</TableHead>
                                        <TableHead>Fungsi</TableHead>
                                        <TableHead className="text-center">Kapasitas</TableHead>
                                        <TableHead>Kondisi</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ruang.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                Tidak ada data ruangan ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ruang.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono font-medium text-xs">
                                                    {item.kode_ruang}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div>{item.nama_ruang}</div>
                                                    {item.keterangan && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.keterangan}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div>{item.bangunan?.nama_bangunan}</div>
                                                    {item.bangunan?.unit && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Unit {item.bangunan.unit.kode_unit}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    Lantai {item.lantai}
                                                </TableCell>
                                                <TableCell>{getFungsiBadge(item.fungsi)}</TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {item.kapasitas} Orang
                                                </TableCell>
                                                <TableCell className="capitalize text-xs">
                                                    <Badge variant={item.kondisi === 'baik' ? 'outline' : 'secondary'}>
                                                        {item.kondisi.replace('_', ' ')}
                                                    </Badge>
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
                            links={ruang.links}
                            from={ruang.from}
                            to={ruang.to}
                            total={ruang.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Impor Data Ruangan (Masal)</DialogTitle>
                        <DialogDescription>
                            Unggah berkas CSV inventaris ruangan sesuai template.
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
                                href={route('ruang.template')}
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
                            {editingItem ? 'Ubah Data Ruangan' : 'Tambah Ruangan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Pilih gedung dan fungsi spesifik ruangan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kode_ruang">Kode Ruang *</Label>
                                <Input
                                    id="kode_ruang"
                                    placeholder="Contoh: R-SD-101"
                                    value={data.kode_ruang}
                                    onChange={(e) => setData('kode_ruang', e.target.value.toUpperCase())}
                                />
                                {errors.kode_ruang && (
                                    <p className="text-xs text-destructive">{errors.kode_ruang}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="bangunan_id">Gedung / Bangunan *</Label>
                                <Select
                                    value={data.bangunan_id}
                                    onValueChange={(val) => setData('bangunan_id', val)}
                                >
                                    <SelectTrigger id="bangunan_id">
                                        <SelectValue placeholder="Pilih Gedung" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bangunanList.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                {b.kode_bangunan} - {b.nama_bangunan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.bangunan_id && (
                                    <p className="text-xs text-destructive">{errors.bangunan_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nama_ruang">Nama Ruangan *</Label>
                            <Input
                                id="nama_ruang"
                                placeholder="Contoh: Ruang Lab Komputer 1"
                                value={data.nama_ruang}
                                onChange={(e) => setData('nama_ruang', e.target.value)}
                            />
                            {errors.nama_ruang && (
                                <p className="text-xs text-destructive">{errors.nama_ruang}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="lantai">Lantai *</Label>
                                <Input
                                    id="lantai"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.lantai}
                                    onChange={(e) => setData('lantai', parseInt(e.target.value) || 1)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="fungsi">Fungsi *</Label>
                                <Select
                                    value={data.fungsi}
                                    onValueChange={(val: Ruang['fungsi']) => setData('fungsi', val)}
                                >
                                    <SelectTrigger id="fungsi">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kelas">Kelas</SelectItem>
                                        <SelectItem value="laboratorium">Laboratorium</SelectItem>
                                        <SelectItem value="perpustakaan">Perpustakaan</SelectItem>
                                        <SelectItem value="kantor">Kantor</SelectItem>
                                        <SelectItem value="aula">Aula</SelectItem>
                                        <SelectItem value="ibadah">Ibadah</SelectItem>
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="kapasitas">Kapasitas</Label>
                                <Input
                                    id="kapasitas"
                                    type="number"
                                    min={1}
                                    max={500}
                                    value={data.kapasitas}
                                    onChange={(e) => setData('kapasitas', parseInt(e.target.value) || 30)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kondisi">Kondisi</Label>
                                <Select
                                    value={data.kondisi}
                                    onValueChange={(val: Ruang['kondisi']) => setData('kondisi', val)}
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

                            <div className="space-y-1">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Input
                                    id="keterangan"
                                    placeholder="AC, Proyektor, dll"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                />
                            </div>
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
                        <AlertDialogTitle>Hapus Data Ruangan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus ruangan{' '}
                            <span className="font-semibold text-foreground">
                                {deletingItem?.nama_ruang}
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
