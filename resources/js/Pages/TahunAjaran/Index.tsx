import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { PaginatedData, TahunAjaran } from '@/types';
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
import { Plus, Search, Edit2, Trash2, CalendarDays, CheckCircle2 } from 'lucide-react';

interface Props {
    tahunAjaran: PaginatedData<TahunAjaran>;
    filters: {
        search?: string;
        semester?: string;
        is_aktif?: string;
    };
}

export default function TahunAjaranIndex({ tahunAjaran, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [semesterFilter, setSemesterFilter] = useState(filters.semester || 'all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TahunAjaran | null>(null);
    const [deletingItem, setDeletingItem] = useState<TahunAjaran | null>(null);

    const isInitialSearch = useRef(true);

    useEffect(() => {
        if (isInitialSearch.current) {
            isInitialSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('tahun-ajaran.index'),
                {
                    search: search || undefined,
                    semester: semesterFilter !== 'all' ? semesterFilter : undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
        semester: 'ganjil' as TahunAjaran['semester'],
        tanggal_mulai: '',
        tanggal_selesai: '',
        is_aktif: false,
    });

    const handleSemesterChange = (val: string) => {
        setSemesterFilter(val);
        router.get(
            route('tahun-ajaran.index'),
            {
                search: search || undefined,
                semester: val !== 'all' ? val : undefined,
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

    const openEditModal = (item: TahunAjaran) => {
        setEditingItem(item);
        clearErrors();
        setData({
            kode: item.kode,
            nama: item.nama,
            semester: item.semester,
            tanggal_mulai: item.tanggal_mulai ? item.tanggal_mulai.substring(0, 10) : '',
            tanggal_selesai: item.tanggal_selesai ? item.tanggal_selesai.substring(0, 10) : '',
            is_aktif: item.is_aktif,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('tahun-ajaran.update', editingItem.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('tahun-ajaran.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('tahun-ajaran.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Master Data Tahun Ajaran
                    </h2>
                </div>
            }
        >
            <Head title="Master Data Tahun Ajaran" />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Periode Kalender Akademik
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Mengatur siklus semester dan periode tahun akademik seluruh unit yayasan
                            </p>
                        </div>
                        <Button onClick={openCreateModal} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Tambah Tahun Ajaran
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode atau nama tahun ajaran..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <Select value={semesterFilter} onValueChange={handleSemesterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Semester</SelectItem>
                                        <SelectItem value="ganjil">Ganjil</SelectItem>
                                        <SelectItem value="genap">Genap</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-40">Kode</TableHead>
                                        <TableHead>Nama Periode</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Rentang Tanggal</TableHead>
                                        <TableHead className="text-center">Jumlah Kelas</TableHead>
                                        <TableHead>Status Aktif</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tahunAjaran.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Tidak ada data tahun ajaran ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tahunAjaran.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono font-medium text-xs">
                                                    {item.kode}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.nama}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    <Badge variant="outline">{item.semester}</Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {item.tanggal_mulai} s/d {item.tanggal_selesai}
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {item.kelas_count ?? 0}
                                                </TableCell>
                                                <TableCell>
                                                    {item.is_aktif ? (
                                                        <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-white">
                                                            <CheckCircle2 className="h-3 w-3" /> Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Tidak Aktif</Badge>
                                                    )}
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
                            links={tahunAjaran.links}
                            from={tahunAjaran.from}
                            to={tahunAjaran.to}
                            total={tahunAjaran.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Form */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Ubah Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Tahun ajaran aktif hanya boleh satu periode pada satu waktu.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="kode">Kode Tahun Ajaran *</Label>
                            <Input
                                id="kode"
                                placeholder="Contoh: TA-2025/2026-GANJIL"
                                value={data.kode}
                                onChange={(e) => setData('kode', e.target.value.toUpperCase())}
                            />
                            {errors.kode && <p className="text-xs text-destructive">{errors.kode}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nama">Nama Tahun Ajaran *</Label>
                            <Input
                                id="nama"
                                placeholder="Contoh: Tahun Ajaran 2025/2026 Semester Ganjil"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                            />
                            {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="semester">Semester *</Label>
                                <Select
                                    value={data.semester}
                                    onValueChange={(val: TahunAjaran['semester']) => setData('semester', val)}
                                >
                                    <SelectTrigger id="semester">
                                        <SelectValue placeholder="Pilih Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ganjil">Ganjil</SelectItem>
                                        <SelectItem value="genap">Genap</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="is_aktif">Status Aktif</Label>
                                <Select
                                    value={data.is_aktif ? '1' : '0'}
                                    onValueChange={(val) => setData('is_aktif', val === '1')}
                                >
                                    <SelectTrigger id="is_aktif">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Aktif (Utama)</SelectItem>
                                        <SelectItem value="0">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="tanggal_mulai">Tanggal Mulai *</Label>
                                <Input
                                    id="tanggal_mulai"
                                    type="date"
                                    value={data.tanggal_mulai}
                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                />
                                {errors.tanggal_mulai && (
                                    <p className="text-xs text-destructive">{errors.tanggal_mulai}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="tanggal_selesai">Tanggal Selesai *</Label>
                                <Input
                                    id="tanggal_selesai"
                                    type="date"
                                    value={data.tanggal_selesai}
                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                />
                                {errors.tanggal_selesai && (
                                    <p className="text-xs text-destructive">{errors.tanggal_selesai}</p>
                                )}
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
                        <AlertDialogTitle>Hapus Tahun Ajaran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus periode{' '}
                            <span className="font-semibold text-foreground">
                                {deletingItem?.nama}
                            </span>
                            . Pastikan tidak ada data kelas yang sedang aktif bergantung pada tahun ajaran ini.
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
