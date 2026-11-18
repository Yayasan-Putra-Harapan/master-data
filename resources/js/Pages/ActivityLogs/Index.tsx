import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ActivityLog, PaginatedData } from '@/types';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
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
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    History,
    Search,
    Eye,
    PlusCircle,
    Edit3,
    Trash2,
    ArrowRightLeft,
    Upload,
    User,
    Shield,
    Globe,
    Clock,
} from 'lucide-react';

interface Props {
    logs: PaginatedData<ActivityLog>;
    filters: {
        search?: string;
        action?: string;
        subject_type?: string;
        per_page?: string;
    };
    actions: string[];
    subjectTypes: string[];
}

export default function ActivityLogsIndex({ logs, filters, actions, subjectTypes }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || 'all');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject_type || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '25');

    const [viewingLog, setViewingLog] = useState<ActivityLog | null>(null);

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
            route('activity-logs.index'),
            {
                search: search || undefined,
                action: actionFilter !== 'all' ? actionFilter : undefined,
                subject_type: subjectFilter !== 'all' ? subjectFilter : undefined,
                per_page: perPage !== '25' ? perPage : undefined,
                ...params,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const getActionBadge = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
                return (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                        <PlusCircle className="h-3 w-3" /> Tambah
                    </Badge>
                );
            case 'update':
                return (
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white gap-1">
                        <Edit3 className="h-3 w-3" /> Ubah
                    </Badge>
                );
            case 'delete':
                return (
                    <Badge variant="destructive" className="gap-1">
                        <Trash2 className="h-3 w-3" /> Hapus
                    </Badge>
                );
            case 'plot':
            case 'transfer':
                return (
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white gap-1">
                        <ArrowRightLeft className="h-3 w-3" /> {action === 'plot' ? 'Plotting' : 'Mutasi'}
                    </Badge>
                );
            case 'import':
                return (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                        <Upload className="h-3 w-3" /> Impor Masal
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{action}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Audit Trail & Log Riwayat Aktivitas Data
                    </h2>
                </div>
            }
        >
            <Head title="Audit Trail & Log Aktivitas" />

            <div className="space-y-6 max-w-6xl mx-auto">
                <Card className="shadow-xs border-primary/20 bg-primary/5">
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Shield className="h-5 w-5 text-primary" />
                            <span>Tata Kelola & Keamanan Data (Data Governance)</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 text-xs text-muted-foreground leading-relaxed">
                        Merekam secara permanen setiap aktivitas penambahan, pembaruan, penghapusan, plotting rombel, dan impor data master oleh superadmin maupun operator unit untuk menjamin akuntabilitas <em>Single Source of Truth</em>.
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Riwayat Log Aktivitas
                            </CardTitle>
                            <CardDescription>
                                Total {logs.total} aktivitas tercatat dalam sistem
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari deskripsi, operator, atau alamat IP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-44">
                                <Select
                                    value={actionFilter}
                                    onValueChange={(val) => {
                                        setActionFilter(val);
                                        applyFilter({ action: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Aksi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Aksi</SelectItem>
                                        <SelectItem value="create">Tambah (Create)</SelectItem>
                                        <SelectItem value="update">Ubah (Update)</SelectItem>
                                        <SelectItem value="delete">Hapus (Delete)</SelectItem>
                                        <SelectItem value="plot">Plotting Rombel</SelectItem>
                                        <SelectItem value="transfer">Mutasi Rombel</SelectItem>
                                        <SelectItem value="import">Impor Masal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-48">
                                <Select
                                    value={subjectFilter}
                                    onValueChange={(val) => {
                                        setSubjectFilter(val);
                                        applyFilter({ subject_type: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Entitas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Entitas</SelectItem>
                                        {subjectTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
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
                                        applyFilter({ per_page: val !== '25' ? val : undefined });
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
                                        <TableHead className="w-40">Waktu Aktivitas</TableHead>
                                        <TableHead className="w-48">Pengguna / Operator</TableHead>
                                        <TableHead className="w-32">Aksi</TableHead>
                                        <TableHead className="w-28">Entitas</TableHead>
                                        <TableHead>Deskripsi Aktivitas</TableHead>
                                        <TableHead className="w-32">Alamat IP</TableHead>
                                        <TableHead className="w-16 text-right">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Belum ada rekaman log aktivitas yang sesuai.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{log.user_name || 'Sistem'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getActionBadge(log.action)}
                                                </TableCell>
                                                <TableCell>
                                                    {log.subject_type ? (
                                                        <Badge variant="outline">{log.subject_type}</Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-foreground font-medium max-w-md">
                                                    {log.description}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground font-mono">
                                                    {log.ip_address || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setViewingLog(log)}
                                                        title="Lihat Detail Log"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            links={logs.links}
                            from={logs.from}
                            to={logs.to}
                            total={logs.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Log Detail Dialog */}
            <Dialog open={!!viewingLog} onOpenChange={() => setViewingLog(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            <DialogTitle>Detail Rekaman Aktivitas #{viewingLog?.id}</DialogTitle>
                        </div>
                        <DialogDescription>
                            Rincian jejak audit forensik perubahan data master.
                        </DialogDescription>
                    </DialogHeader>

                    {viewingLog && (
                        <div className="space-y-4 py-2 text-xs">
                            <div className="rounded-lg bg-muted p-3 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" /> Waktu Lengkap:
                                    </span>
                                    <span className="font-mono text-foreground">
                                        {new Date(viewingLog.created_at).toLocaleString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" /> Pelaku:
                                    </span>
                                    <span className="font-semibold text-foreground">{viewingLog.user_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Globe className="h-3.5 w-3.5" /> Alamat IP:
                                    </span>
                                    <span className="font-mono text-foreground">{viewingLog.ip_address || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tipe Operasi:</span>
                                    <div>{getActionBadge(viewingLog.action)}</div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="font-semibold text-foreground">Deskripsi Transaksi:</span>
                                <div className="rounded-md border p-2.5 bg-background font-medium text-foreground leading-relaxed">
                                    {viewingLog.description}
                                </div>
                            </div>

                            {viewingLog.properties && Object.keys(viewingLog.properties).length > 0 && (
                                <div className="space-y-1">
                                    <span className="font-semibold text-foreground">Metadata Perubahan (Payload):</span>
                                    <pre className="rounded-md border p-2.5 bg-muted font-mono text-[11px] overflow-x-auto max-h-48 text-foreground">
                                        {JSON.stringify(viewingLog.properties, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {viewingLog.user_agent && (
                                <div className="text-[11px] text-muted-foreground truncate border-t pt-2">
                                    Browser/Client: <span className="font-mono">{viewingLog.user_agent}</span>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
