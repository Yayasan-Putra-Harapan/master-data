import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Kelas, PaginatedData } from '@/types';
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
    Layers,
    Users,
    Download,
    Upload,
    FileSpreadsheet,
    Printer,
} from 'lucide-react';

interface Props {
    kelas: PaginatedData<Kelas>;
    units: { id: number; kode_unit: string; nama_unit: string; jenjang: string }[];
    tahunAjaranList: { id: number; kode: string; nama: string; is_aktif: boolean }[];
    guruList: { id: number; nama: string; nip?: string; unit_id: number }[];
    filters: {
        search?: string;
        unit_id?: string;
        tahun_ajaran_id?: string;
        tingkat?: string;
        per_page?: string;
    };
}

export default function KelasIndex({ kelas, units, tahunAjaranList, guruList, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitFilter, setUnitFilter] = useState(filters.unit_id || 'all');
    const [taFilter, setTaFilter] = useState(filters.tahun_ajaran_id || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Kelas | null>(null);
    const [deletingItem, setDeletingItem] = useState<Kelas | null>(null);

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

    const activeTa = tahunAjaranList.find((t) => t.is_aktif) ?? tahunAjaranList[0];

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode_kelas: '',
        nama_kelas: '',
        tingkat: 1,
        unit_id: units[0]?.id?.toString() || '',
        tahun_ajaran_id: activeTa?.id?.toString() || '',
        wali_kelas_id: '',
        kapasitas: 30,
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('kelas.index'),
            {
                search: search || undefined,
                unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                tahun_ajaran_id: taFilter !== 'all' ? taFilter : undefined,
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

    const openEditModal = (item: Kelas) => {
        setEditingItem(item);
        clearErrors();
        setData({
            kode_kelas: item.kode_kelas,
            nama_kelas: item.nama_kelas,
            tingkat: item.tingkat,
            unit_id: item.unit_id.toString(),
            tahun_ajaran_id: item.tahun_ajaran_id.toString(),
            wali_kelas_id: item.wali_kelas_id ? item.wali_kelas_id.toString() : '',
            kapasitas: item.kapasitas,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('kelas.update', editingItem.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('kelas.store'), {
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

        importForm.post(route('kelas.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                importForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('kelas.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (unitFilter !== 'all') queryParams.append('unit_id', unitFilter);
        if (taFilter !== 'all') queryParams.append('tahun_ajaran_id', taFilter);

        window.location.href = `${route('kelas.export')}?${queryParams.toString()}`;
    };

    const filteredWali = guruList.filter((g) => g.unit_id.toString() === data.unit_id);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Master Data Rombongan Belajar (Kelas)
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Kelas" />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Rombongan Belajar (Rombel)
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Pengorganisasian kelas, wali kelas, dan tingkat per unit pendidikan
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
                                <Plus className="h-4 w-4" /> Tambah Kelas
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode kelas atau nama rombel..."
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

                            <div className="w-full sm:w-48">
                                <Select
                                    value={taFilter}
                                    onValueChange={(val) => {
                                        setTaFilter(val);
                                        applyFilter({ tahun_ajaran_id: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tahun Ajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                                        {tahunAjaranList.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.kode} {t.is_aktif ? '(Aktif)' : ''}
                                            </SelectItem>
                                        ))}
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
                                        <TableHead>Nama Kelas</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead className="text-center">Tingkat</TableHead>
                                        <TableHead>Wali Kelas</TableHead>
                                        <TableHead className="text-center">Kapasitas</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kelas.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Tidak ada data kelas ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        kelas.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono font-medium text-xs">
                                                    {item.kode_kelas}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.nama_kelas}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {item.unit?.kode_unit}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    Tingkat {item.tingkat}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {item.wali_kelas?.nama || (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Belum ditentukan
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {item.kapasitas} Kursi
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={route('kelas.anggota.index', item.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Kelola Siswa / Anggota Rombel"
                                                            >
                                                                <Users className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <a
                                                            href={route('kelas.cetak', item.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Cetak Presensi / Rombel"
                                                            >
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        </a>
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
                            links={kelas.links}
                            from={kelas.from}
                            to={kelas.to}
                            total={kelas.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Impor Data Kelas (Masal)</DialogTitle>
                        <DialogDescription>
                            Unggah berkas CSV data rombongan belajar sesuai template.
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
                                href={route('kelas.template')}
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
                            {editingItem ? 'Ubah Rombel / Kelas' : 'Tambah Rombel / Kelas Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Tautkan kelas ke unit pendidikan dan wali kelas yang bersangkutan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="kode_kelas">Kode Kelas *</Label>
                                <Input
                                    id="kode_kelas"
                                    placeholder="Contoh: KLS-SD-1A"
                                    value={data.kode_kelas}
                                    onChange={(e) => setData('kode_kelas', e.target.value.toUpperCase())}
                                />
                                {errors.kode_kelas && <p className="text-xs text-destructive">{errors.kode_kelas}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="tingkat">Tingkat *</Label>
                                <Input
                                    id="tingkat"
                                    type="number"
                                    min={1}
                                    max={12}
                                    value={data.tingkat}
                                    onChange={(e) => setData('tingkat', parseInt(e.target.value) || 1)}
                                />
                                {errors.tingkat && <p className="text-xs text-destructive">{errors.tingkat}</p>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nama_kelas">Nama Lengkap Kelas *</Label>
                            <Input
                                id="nama_kelas"
                                placeholder="Contoh: Kelas 1A Ibnu Sina"
                                value={data.nama_kelas}
                                onChange={(e) => setData('nama_kelas', e.target.value)}
                            />
                            {errors.nama_kelas && <p className="text-xs text-destructive">{errors.nama_kelas}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="unit_id">Unit Pendidikan *</Label>
                                <Select
                                    value={data.unit_id}
                                    onValueChange={(val) => {
                                        setData((prev) => ({ ...prev, unit_id: val, wali_kelas_id: '' }));
                                    }}
                                >
                                    <SelectTrigger id="unit_id">
                                        <SelectValue placeholder="Pilih Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.kode_unit} ({u.jenjang})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="text-xs text-destructive">{errors.unit_id}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="tahun_ajaran_id">Tahun Ajaran *</Label>
                                <Select
                                    value={data.tahun_ajaran_id}
                                    onValueChange={(val) => setData('tahun_ajaran_id', val)}
                                >
                                    <SelectTrigger id="tahun_ajaran_id">
                                        <SelectValue placeholder="Pilih Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tahunAjaranList.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.kode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tahun_ajaran_id && (
                                    <p className="text-xs text-destructive">{errors.tahun_ajaran_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="wali_kelas_id">Wali Kelas</Label>
                                <Select
                                    value={data.wali_kelas_id || 'none'}
                                    onValueChange={(val) => setData('wali_kelas_id', val === 'none' ? '' : val)}
                                >
                                    <SelectTrigger id="wali_kelas_id">
                                        <SelectValue placeholder="Pilih Guru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Belum Ditentukan</SelectItem>
                                        {filteredWali.map((g) => (
                                            <SelectItem key={g.id} value={g.id.toString()}>
                                                {g.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="kapasitas">Kapasitas Kursi *</Label>
                                <Input
                                    id="kapasitas"
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={data.kapasitas}
                                    onChange={(e) => setData('kapasitas', parseInt(e.target.value) || 30)}
                                />
                                {errors.kapasitas && <p className="text-xs text-destructive">{errors.kapasitas}</p>}
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
                        <AlertDialogTitle>Hapus Rombel / Kelas?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus rombongan belajar{' '}
                            <span className="font-semibold text-foreground">
                                {deletingItem?.nama_kelas}
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
