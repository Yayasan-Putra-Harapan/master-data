import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AnggotaKelas, Kelas, PaginatedData, Siswa } from '@/types';
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
import { Checkbox } from '@/Components/ui/checkbox';
import {
    ArrowLeft,
    UserPlus,
    Users,
    Search,
    ArrowRightLeft,
    Trash2,
    GraduationCap,
    CheckCircle2,
    Calendar,
    Phone,
    Printer,
} from 'lucide-react';

interface Props {
    kelas: Kelas & {
        unit: { id: number; kode_unit: string; nama_unit: string; jenjang: string };
        tahun_ajaran: { id: number; kode: string; nama: string; is_aktif: boolean };
        wali_kelas?: { id: number; nama: string; telepon: string };
    };
    anggota: PaginatedData<AnggotaKelas>;
    availableSiswa: Siswa[];
    targetKelasList: {
        id: number;
        kode_kelas: string;
        nama_kelas: string;
        tingkat: number;
        kapasitas: number;
        anggota_kelas_count: number;
    }[];
    activeCount: number;
    filters: {
        search?: string;
        status?: string;
        per_page?: string;
    };
}

export default function KelasAnggota({
    kelas,
    anggota,
    availableSiswa,
    targetKelasList,
    activeCount,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'aktif');
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    // Plot modal state
    const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
    const [plotSearch, setPlotSearch] = useState('');
    const [plotSelectedIds, setPlotSelectedIds] = useState<number[]>([]);

    // Transfer modal state
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // Delete single student state
    const [deletingStudent, setDeletingStudent] = useState<AnggotaKelas | null>(null);

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

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('kelas.anggota.index', kelas.id),
            {
                search: search || undefined,
                status: statusFilter !== 'aktif' ? statusFilter : undefined,
                ...params,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Plot form
    const plotForm = useForm({
        siswa_ids: [] as number[],
        tanggal_masuk: new Date().toISOString().split('T')[0],
        keterangan: '',
    });

    // Transfer form
    const transferForm = useForm({
        target_kelas_id: targetKelasList[0]?.id?.toString() || '',
        siswa_ids: [] as number[],
        keterangan: '',
    });

    const handleSelectAllOnPage = (checked: boolean) => {
        if (checked) {
            const pageIds = anggota.data.map((a) => a.siswa_id);
            setSelectedStudentIds(Array.from(new Set([...selectedStudentIds, ...pageIds])));
        } else {
            const pageIds = new Set(anggota.data.map((a) => a.siswa_id));
            setSelectedStudentIds(selectedStudentIds.filter((id) => !pageIds.has(id)));
        }
    };

    const handleToggleStudentSelection = (siswaId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds([...selectedStudentIds, siswaId]);
        } else {
            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== siswaId));
        }
    };

    const isAllPageSelected =
        anggota.data.length > 0 &&
        anggota.data.every((a) => selectedStudentIds.includes(a.siswa_id));

    // Filter available students inside plot modal
    const filteredAvailable = availableSiswa.filter((s) => {
        if (!plotSearch) return true;
        const q = plotSearch.toLowerCase();
        return (
            s.nama_lengkap.toLowerCase().includes(q) ||
            s.nisn.toLowerCase().includes(q) ||
            (s.nis && s.nis.toLowerCase().includes(q))
        );
    });

    const handleTogglePlotStudent = (siswaId: number, checked: boolean) => {
        if (checked) {
            setPlotSelectedIds([...plotSelectedIds, siswaId]);
        } else {
            setPlotSelectedIds(plotSelectedIds.filter((id) => id !== siswaId));
        }
    };

    const handlePlotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        plotForm.setData('siswa_ids', plotSelectedIds);

        plotForm.post(route('kelas.anggota.store', kelas.id), {
            onSuccess: () => {
                setIsPlotModalOpen(false);
                setPlotSelectedIds([]);
                plotForm.reset();
            },
        });
    };

    const handleOpenTransferModal = () => {
        if (selectedStudentIds.length === 0) return;
        transferForm.setData('siswa_ids', selectedStudentIds);
        setIsTransferModalOpen(true);
    };

    const handleTransferSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transferForm.post(route('kelas.anggota.transfer', kelas.id), {
            onSuccess: () => {
                setIsTransferModalOpen(false);
                setSelectedStudentIds([]);
                transferForm.reset();
            },
        });
    };

    const handleDeleteStudent = () => {
        if (!deletingStudent) return;
        router.delete(route('kelas.anggota.destroy', [kelas.id, deletingStudent.siswa_id]), {
            onSuccess: () => setDeletingStudent(null),
        });
    };

    const sisaKapasitas = kelas.kapasitas - activeCount;
    const isFull = sisaKapasitas <= 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('kelas.index')}>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                    {kelas.nama_kelas}
                                </h2>
                                <Badge variant="outline">{kelas.unit.kode_unit}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tahun Ajaran: {kelas.tahun_ajaran.nama} • Wali Kelas:{' '}
                                <span className="text-foreground font-medium">
                                    {kelas.wali_kelas?.nama || 'Belum Ditentukan'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={route('kelas.cetak', kelas.id)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                                <Printer className="h-4 w-4" /> Cetak Daftar Rombel
                            </Button>
                        </a>
                        <Badge
                            className={
                                isFull
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }
                        >
                            {activeCount} / {kelas.kapasitas} Kursi Terisi
                        </Badge>
                    </div>
                </div>
            }
        >
            <Head title={`Rombel ${kelas.nama_kelas}`} />

            <div className="space-y-6">
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Siswa Anggota Rombel
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Penempatan siswa aktif pada rombongan belajar periode akademik ini
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {selectedStudentIds.length > 0 && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleOpenTransferModal}
                                    className="gap-2"
                                >
                                    <ArrowRightLeft className="h-4 w-4" /> Pindahkan ({selectedStudentIds.length}) Siswa
                                </Button>
                            )}

                            <Button
                                size="sm"
                                onClick={() => {
                                    setPlotSelectedIds([]);
                                    setPlotSearch('');
                                    setIsPlotModalOpen(true);
                                }}
                                disabled={isFull}
                                className="gap-2"
                            >
                                <UserPlus className="h-4 w-4" /> Plot Siswa Baru
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari NISN, NIS, atau nama siswa di kelas ini..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-44">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        applyFilter({ status: val !== 'aktif' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status Keanggotaan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif di Kelas</SelectItem>
                                        <SelectItem value="pindah">Riwayat Pindah</SelectItem>
                                        <SelectItem value="keluar">Dikeluarkan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-center">
                                            <Checkbox
                                                checked={isAllPageSelected}
                                                onCheckedChange={handleSelectAllOnPage}
                                                aria-label="Pilih semua di halaman ini"
                                            />
                                        </TableHead>
                                        <TableHead className="w-16 text-center">No</TableHead>
                                        <TableHead>Identitas Siswa</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Tgl Masuk Rombel</TableHead>
                                        <TableHead>Orang Tua / Kontak Wali</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {anggota.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                Belum ada siswa yang ditempatkan di kelas ini.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        anggota.data.map((item, index) => {
                                            const isSelected = selectedStudentIds.includes(item.siswa_id);
                                            return (
                                                <TableRow key={item.id} className={isSelected ? 'bg-muted/40' : ''}>
                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) =>
                                                                handleToggleStudentSelection(item.siswa_id, checked === true)
                                                            }
                                                            aria-label={`Pilih ${item.siswa?.nama_lengkap}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs text-muted-foreground">
                                                        {anggota.from + index}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">
                                                            {item.siswa?.nama_lengkap}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground font-mono">
                                                            NISN: {item.siswa?.nisn} {item.siswa?.nis ? `• NIS: ${item.siswa.nis}` : ''}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {item.siswa?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {item.tanggal_masuk || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        <div>
                                                            {item.siswa?.orang_tua?.nama_ayah ||
                                                             item.siswa?.orang_tua?.nama_ibu ||
                                                             item.siswa?.orang_tua?.nama_wali ||
                                                             '-'}
                                                        </div>
                                                        {item.siswa?.orang_tua?.telepon && (
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                <Phone className="h-3 w-3" /> {item.siswa.orang_tua.telepon}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.status === 'aktif' ? (
                                                            <Badge className="bg-emerald-600 text-white">Aktif</Badge>
                                                        ) : item.status === 'pindah' ? (
                                                            <Badge variant="outline" className="border-amber-500 text-amber-600">
                                                                Pindah
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive">Keluar</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {item.status === 'aktif' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                title="Keluarkan dari kelas"
                                                                onClick={() => setDeletingStudent(item)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            links={anggota.links}
                            from={anggota.from}
                            to={anggota.to}
                            total={anggota.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Plotting Modal Dialog */}
            <Dialog open={isPlotModalOpen} onOpenChange={setIsPlotModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Plot Siswa ke Rombel {kelas.nama_kelas}</DialogTitle>
                        <DialogDescription>
                            Pilih siswa dari unit {kelas.unit.nama_unit} yang belum terdaftar di kelas aktif mana pun.
                            Sisa kuota: <span className="font-semibold text-foreground">{sisaKapasitas} kursi</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handlePlotSubmit} className="space-y-4 flex-1 flex flex-col min-h-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama siswa atau NISN..."
                                value={plotSearch}
                                onChange={(e) => setPlotSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* List of Available Students */}
                        <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-1 max-h-60">
                            {filteredAvailable.length === 0 ? (
                                <div className="text-center py-6 text-xs text-muted-foreground">
                                    Tidak ada siswa yang belum memiliki kelas di unit ini.
                                </div>
                            ) : (
                                filteredAvailable.map((s) => {
                                    const isChecked = plotSelectedIds.includes(s.id);
                                    return (
                                        <label
                                            key={s.id}
                                            className={`flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer text-xs ${
                                                isChecked ? 'bg-muted' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) =>
                                                        handleTogglePlotStudent(s.id, checked === true)
                                                    }
                                                />
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {s.nama_lengkap} ({s.jenis_kelamin})
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground font-mono">
                                                        NISN: {s.nisn} • Angkatan: {s.angkatan}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{s.status}</Badge>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                            <span>
                                Terpilih:{' '}
                                <strong className="text-foreground">{plotSelectedIds.length}</strong> siswa
                            </span>
                            {plotSelectedIds.length > sisaKapasitas && (
                                <span className="text-destructive font-semibold">
                                    Melebihi sisa kapasitas ({sisaKapasitas})!
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="space-y-1">
                                <Label htmlFor="plot_tgl">Tanggal Masuk Rombel</Label>
                                <Input
                                    id="plot_tgl"
                                    type="date"
                                    value={plotForm.data.tanggal_masuk}
                                    onChange={(e) => plotForm.setData('tanggal_masuk', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="plot_ket">Catatan Tambahan</Label>
                                <Input
                                    id="plot_ket"
                                    placeholder="Contoh: Pembagian rombel ajaran baru"
                                    value={plotForm.data.keterangan}
                                    onChange={(e) => plotForm.setData('keterangan', e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPlotModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    plotSelectedIds.length === 0 ||
                                    plotSelectedIds.length > sisaKapasitas ||
                                    plotForm.processing
                                }
                            >
                                {plotForm.processing
                                    ? 'Menyimpan...'
                                    : `Masukkan (${plotSelectedIds.length}) Siswa`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Transfer Modal Dialog */}
            <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pindahkan Siswa ke Kelas Lain</DialogTitle>
                        <DialogDescription>
                            Memindahkan <span className="font-semibold text-foreground">{selectedStudentIds.length} siswa</span> terpilih ke rombel lain dalam unit yang sama.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleTransferSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="target_kelas">Pilih Kelas Tujuan *</Label>
                            <Select
                                value={transferForm.data.target_kelas_id}
                                onValueChange={(val) => transferForm.setData('target_kelas_id', val)}
                            >
                                <SelectTrigger id="target_kelas">
                                    <SelectValue placeholder="Pilih Kelas Tujuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {targetKelasList.map((t) => {
                                        const sisa = t.kapasitas - t.anggota_kelas_count;
                                        return (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.nama_kelas} (Tingkat {t.tingkat} • Sisa {sisa} Kursi)
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {transferForm.errors.target_kelas_id && (
                                <p className="text-xs text-destructive">
                                    {transferForm.errors.target_kelas_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="alasan_pindah">Alasan / Keterangan Pemindahan</Label>
                            <Input
                                id="alasan_pindah"
                                placeholder="Contoh: Penyesuaian peminatan / paralel"
                                value={transferForm.data.keterangan}
                                onChange={(e) => transferForm.setData('keterangan', e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsTransferModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !transferForm.data.target_kelas_id || transferForm.processing
                                }
                            >
                                {transferForm.processing ? 'Memindahkan...' : 'Konfirmasi Pindah'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Remove Student Confirmation Alert Dialog */}
            <AlertDialog open={!!deletingStudent} onOpenChange={() => setDeletingStudent(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Keluarkan Siswa dari Rombel?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Siswa{' '}
                            <span className="font-semibold text-foreground">
                                {deletingStudent?.siswa?.nama_lengkap} (NISN: {deletingStudent?.siswa?.nisn})
                            </span>{' '}
                            akan dikeluarkan dari rombel {kelas.nama_kelas}. Status keanggotaan kelas akan diubah menjadi keluar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStudent}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Keluarkan Siswa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
