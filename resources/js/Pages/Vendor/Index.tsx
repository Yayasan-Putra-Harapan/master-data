import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { PaginatedData, Vendor } from '@/types';
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
    Truck,
    Phone,
    Mail,
    MapPin,
    Download,
    Upload,
    FileSpreadsheet,
} from 'lucide-react';

interface Props {
    vendors: PaginatedData<Vendor>;
    filters: {
        search?: string;
        kategori?: string;
        status?: string;
        per_page?: string;
    };
}

export default function VendorIndex({ vendors, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Vendor | null>(null);
    const [deletingItem, setDeletingItem] = useState<Vendor | null>(null);

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
        kode_vendor: '',
        nama_vendor: '',
        kategori: 'sarana_prasarana' as Vendor['kategori'],
        nama_kontak: '',
        telepon: '',
        email: '',
        alamat: '',
        status: 'aktif' as Vendor['status'],
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('vendor.index'),
            {
                search: search || undefined,
                kategori: kategoriFilter !== 'all' ? kategoriFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
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

    const openEditModal = (item: Vendor) => {
        setEditingItem(item);
        clearErrors();
        setData({
            kode_vendor: item.kode_vendor,
            nama_vendor: item.nama_vendor,
            kategori: item.kategori,
            nama_kontak: item.nama_kontak || '',
            telepon: item.telepon,
            email: item.email || '',
            alamat: item.alamat || '',
            status: item.status,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('vendor.update', editingItem.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('vendor.store'), {
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

        importForm.post(route('vendor.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                importForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('vendor.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (kategoriFilter !== 'all') queryParams.append('kategori', kategoriFilter);
        if (statusFilter !== 'all') queryParams.append('status', statusFilter);

        window.location.href = `${route('vendor.export')}?${queryParams.toString()}`;
    };

    const getKategoriBadge = (kategori: Vendor['kategori']) => {
        const labels: Record<string, string> = {
            sarana_prasarana: 'Sarana & Prasarana',
            buku_pelajaran: 'Buku Pelajaran',
            katering: 'Katering Makanan',
            seragam: 'Konveksi Seragam',
            teknologi: 'Teknologi & IT',
            kebersihan: 'Kebersihan',
            lainnya: 'Lainnya',
        };
        return <Badge variant="outline">{labels[kategori] || kategori}</Badge>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Master Data Rekanan & Vendor
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Vendor" />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Direktori Rekanan & Pemasok
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Data pemasok buku, seragam, konsumsi, dan sarana logistik operasional yayasan
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
                                <Plus className="h-4 w-4" /> Tambah Vendor
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode vendor, nama perusahaan, atau PIC..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-52">
                                <Select
                                    value={kategoriFilter}
                                    onValueChange={(val) => {
                                        setKategoriFilter(val);
                                        applyFilter({ kategori: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        <SelectItem value="sarana_prasarana">Sarana & Prasarana</SelectItem>
                                        <SelectItem value="buku_pelajaran">Buku Pelajaran</SelectItem>
                                        <SelectItem value="katering">Katering</SelectItem>
                                        <SelectItem value="seragam">Seragam</SelectItem>
                                        <SelectItem value="teknologi">Teknologi & IT</SelectItem>
                                        <SelectItem value="kebersihan">Kebersihan</SelectItem>
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-40">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        applyFilter({ status: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="non_aktif">Non-Aktif</SelectItem>
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
                                        <TableHead>Nama Perusahaan / Rekanan</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Kontak PIC</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendors.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Tidak ada data vendor ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vendors.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono font-medium text-xs">
                                                    {item.kode_vendor}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div>{item.nama_vendor}</div>
                                                    {item.nama_kontak && (
                                                        <div className="text-xs text-muted-foreground">
                                                            PIC: {item.nama_kontak}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getKategoriBadge(item.kategori)}</TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                        <span>{item.telepon}</span>
                                                    </div>
                                                    {item.email && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{item.email}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1 truncate">
                                                        <MapPin className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">{item.alamat || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={item.status === 'aktif' ? 'default' : 'secondary'}
                                                    >
                                                        {item.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
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
                            links={vendors.links}
                            from={vendors.from}
                            to={vendors.to}
                            total={vendors.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Impor Data Vendor (Masal)</DialogTitle>
                        <DialogDescription>
                            Unggah berkas CSV mitra rekanan sesuai format template.
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
                                href={route('vendor.template')}
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
                            {editingItem ? 'Ubah Data Vendor' : 'Tambah Vendor Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Data mitra rekanan pemasok kebutuhan operasional yayasan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kode_vendor">Kode Vendor *</Label>
                                <Input
                                    id="kode_vendor"
                                    placeholder="Contoh: VND-001"
                                    value={data.kode_vendor}
                                    onChange={(e) => setData('kode_vendor', e.target.value.toUpperCase())}
                                />
                                {errors.kode_vendor && (
                                    <p className="text-xs text-destructive">{errors.kode_vendor}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="kategori">Kategori Mitra *</Label>
                                <Select
                                    value={data.kategori}
                                    onValueChange={(val: Vendor['kategori']) => setData('kategori', val)}
                                >
                                    <SelectTrigger id="kategori">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sarana_prasarana">Sarana & Prasarana</SelectItem>
                                        <SelectItem value="buku_pelajaran">Buku Pelajaran</SelectItem>
                                        <SelectItem value="katering">Katering</SelectItem>
                                        <SelectItem value="seragam">Seragam</SelectItem>
                                        <SelectItem value="teknologi">Teknologi & IT</SelectItem>
                                        <SelectItem value="kebersihan">Kebersihan</SelectItem>
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nama_vendor">Nama Perusahaan / Vendor *</Label>
                            <Input
                                id="nama_vendor"
                                placeholder="Contoh: PT Erlangga Mahameru Pratama"
                                value={data.nama_vendor}
                                onChange={(e) => setData('nama_vendor', e.target.value)}
                            />
                            {errors.nama_vendor && (
                                <p className="text-xs text-destructive">{errors.nama_vendor}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="nama_kontak">Nama Kontak PIC</Label>
                                <Input
                                    id="nama_kontak"
                                    placeholder="Nama perwakilan"
                                    value={data.nama_kontak}
                                    onChange={(e) => setData('nama_kontak', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val: Vendor['status']) => setData('status', val)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="non_aktif">Non-Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="telepon">No. Telepon / WA *</Label>
                                <Input
                                    id="telepon"
                                    placeholder="08123456789"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                />
                                {errors.telepon && (
                                    <p className="text-xs text-destructive">{errors.telepon}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="sales@vendor.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="alamat">Alamat Kantor</Label>
                            <Input
                                id="alamat"
                                placeholder="Alamat lengkap vendor"
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
            <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Vendor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus rekanan{' '}
                            <span className="font-semibold text-foreground">
                                {deletingItem?.nama_vendor}
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
