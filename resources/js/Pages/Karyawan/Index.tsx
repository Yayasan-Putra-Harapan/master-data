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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';
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
    Users,
    Download,
    Upload,
    Eye,
    FileSpreadsheet,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    School,
    Calendar,
    Printer,
} from 'lucide-react';

interface Props {
    karyawan: PaginatedData<Karyawan>;
    units: { id: number; kode_unit: string; nama_unit: string }[];
    filters: {
        search?: string;
        unit_id?: string;
        role?: string;
        is_aktif?: string;
        per_page?: string;
    };
}

export default function KaryawanIndex({ karyawan, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitFilter, setUnitFilter] = useState(filters.unit_id || 'all');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null);
    const [deletingKaryawan, setDeletingKaryawan] = useState<Karyawan | null>(null);
    const [viewingKaryawan, setViewingKaryawan] = useState<Karyawan | null>(null);

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

    const importForm = useForm({
        file: null as File | null,
    });

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('karyawan.index'),
            {
                search: search || undefined,
                unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                per_page: perPage !== '10' ? perPage : undefined,
                ...params,
            },
            { preserveState: true, preserveScroll: true, replace: true }
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

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.file) return;

        importForm.post(route('karyawan.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                importForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingKaryawan) return;
        router.delete(route('karyawan.destroy', deletingKaryawan.id), {
            onSuccess: () => setDeletingKaryawan(null),
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (unitFilter !== 'all') queryParams.append('unit_id', unitFilter);
        if (roleFilter !== 'all') queryParams.append('role', roleFilter);

        window.location.href = `${route('karyawan.export')}?${queryParams.toString()}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Master Data Karyawan & Guru
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Karyawan" />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Direktori Tenaga Pendidik & Kependidikan
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Data guru, kepala sekolah, dan staf operasional seluruh unit yayasan
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
                                <Plus className="h-4 w-4" /> Tambah Karyawan
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari NIK, NIP, nama, atau email..."
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
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Tidak ada data karyawan ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        karyawan.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">
                                                        {item.nama} ({item.jenis_kelamin})
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground font-mono">
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
                                                <TableCell className="capitalize text-xs text-muted-foreground">
                                                    {item.status_kepegawaian}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <div>{item.telepon}</div>
                                                    <div className="text-[11px] text-muted-foreground/80">{item.email}</div>
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
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            title="Lihat Detail Profil"
                                                            onClick={() => setViewingKaryawan(item)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <a
                                                            href={route('karyawan.cetak', item.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Cetak Biodata Pegawai"
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

            {/* Detail Sheet */}
            <Sheet open={!!viewingKaryawan} onOpenChange={() => setViewingKaryawan(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-base">{viewingKaryawan?.nama}</SheetTitle>
                                <SheetDescription className="text-xs">
                                    NIK: {viewingKaryawan?.nik} {viewingKaryawan?.nip ? `• NIP: ${viewingKaryawan.nip}` : ''}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {viewingKaryawan && (
                        <div className="space-y-4 py-4 text-sm">
                            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                <div>
                                    <div className="text-xs text-muted-foreground">Peran / Jabatan</div>
                                    <div className="font-semibold text-foreground capitalize mt-0.5">
                                        {viewingKaryawan.role.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">Status Kepegawaian</div>
                                    <Badge variant="secondary" className="capitalize mt-0.5">
                                        {viewingKaryawan.status_kepegawaian}
                                    </Badge>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3 space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <School className="h-3.5 w-3.5" /> Unit Penempatan
                                </div>
                                <div className="text-foreground font-medium">
                                    {viewingKaryawan.unit?.nama_unit} ({viewingKaryawan.unit?.jenjang})
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Kode Unit: {viewingKaryawan.unit?.kode_unit}
                                </div>
                            </div>

                            <div className="rounded-lg border p-3 space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Briefcase className="h-3.5 w-3.5" /> Informasi Kepegawaian
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">NUPTK:</span>
                                        <div className="font-mono font-medium text-foreground">{viewingKaryawan.nuptk || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Pendidikan Terakhir:</span>
                                        <div className="font-medium text-foreground">{viewingKaryawan.pendidikan_terakhir || '-'}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Tanggal Mulai Bertugas:</span>
                                        <div className="font-medium text-foreground">
                                            {viewingKaryawan.tanggal_masuk ? viewingKaryawan.tanggal_masuk.substring(0, 10) : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3 space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Calendar className="h-3.5 w-3.5" /> Biodata Pribadi
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Gender:</span>
                                        <div className="font-medium text-foreground">
                                            {viewingKaryawan.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tanggal Lahir:</span>
                                        <div className="font-medium text-foreground">
                                            {viewingKaryawan.tanggal_lahir ? viewingKaryawan.tanggal_lahir.substring(0, 10) : '-'}
                                        </div>
                                    </div>
                                    {viewingKaryawan.tempat_lahir && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Tempat Lahir:</span>
                                            <div className="font-medium text-foreground">{viewingKaryawan.tempat_lahir}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border p-3 space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Phone className="h-3.5 w-3.5" /> Kontak & Alamat
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{viewingKaryawan.telepon}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{viewingKaryawan.email}</span>
                                    </div>
                                    {viewingKaryawan.alamat && (
                                        <div className="flex items-start gap-2 text-foreground pt-1">
                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                            <span>{viewingKaryawan.alamat}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <a
                                    href={route('karyawan.cetak', viewingKaryawan.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                >
                                    <Button variant="outline" className="w-full gap-2 cursor-pointer">
                                        <Printer className="h-4 w-4" /> Cetak Biodata Pegawai (PDF)
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Impor Data Karyawan & Guru</DialogTitle>
                        <DialogDescription>
                            Unggah berkas CSV data pendidik/tenaga kependidikan yayasan.
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
                                href={route('karyawan.template')}
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

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingKaryawan ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Isi identitas pendidik atau tenaga kependidikan yayasan.
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
                                {errors.nik && <p className="text-xs text-destructive">{errors.nik}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="nip">NIP Yayasan</Label>
                                <Input
                                    id="nip"
                                    placeholder="NIP Pegawai (opsional)"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                />
                                {errors.nip && <p className="text-xs text-destructive">{errors.nip}</p>}
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
                                {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
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
                                    <p className="text-xs text-destructive">{errors.unit_id}</p>
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
                                    <p className="text-xs text-destructive">{errors.tanggal_lahir}</p>
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
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
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
                                    <p className="text-xs text-destructive">{errors.telepon}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="pendidikan_terakhir">Pendidikan Terakhir</Label>
                                <Input
                                    id="pendidikan_terakhir"
                                    placeholder="Contoh: S1 Pendidikan Matematika"
                                    value={data.pendidikan_terakhir}
                                    onChange={(e) => setData('pendidikan_terakhir', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tanggal_masuk">Tanggal Masuk *</Label>
                                <Input
                                    id="tanggal_masuk"
                                    type="date"
                                    value={data.tanggal_masuk}
                                    onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                />
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
                            <span className="font-semibold text-foreground">
                                {deletingKaryawan?.nama}
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
