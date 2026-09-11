import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { PageProps, PaginatedData, Unit, User } from '@/types';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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
    UserCog,
    Plus,
    Search,
    Edit2,
    Trash2,
    Shield,
    UserCheck,
    School,
    Mail,
    Lock,
} from 'lucide-react';

interface Props {
    users: PaginatedData<User>;
    units: Unit[];
    filters: {
        search?: string;
        role?: string;
        unit_id?: string;
    };
}

export default function UsersIndex({ users, units, filters }: Props) {
    const { auth } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [unitFilter, setUnitFilter] = useState(filters.unit_id || 'all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

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
        name: '',
        email: '',
        password: '',
        role: 'operator' as 'superadmin' | 'operator',
        unit_id: units[0]?.id?.toString() || '',
    });

    const applyFilter = (params: Record<string, string | undefined>) => {
        router.get(
            route('users.index'),
            {
                search: search || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                unit_id: unitFilter !== 'all' ? unitFilter : undefined,
                ...params,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setData({
            name: '',
            email: '',
            password: '',
            role: 'operator',
            unit_id: units[0]?.id?.toString() || '',
        });
        setIsFormOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            unit_id: user.unit_id ? user.unit_id.toString() : (units[0]?.id?.toString() || ''),
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(route('users.destroy', deletingUser.id), {
            onSuccess: () => setDeletingUser(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Manajemen Pengguna & Hak Akses (RBAC)
                    </h2>
                </div>
            }
        >
            <Head title="Manajemen Pengguna" />

            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Role Description Card */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="shadow-xs border-primary/20 bg-primary/5">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                            <div className="rounded-md bg-primary p-2 text-primary-foreground">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">Superadmin Yayasan</CardTitle>
                                <CardDescription className="text-xs">Otoritas Penuh</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
                            Memiliki hak akses global lintas seluruh unit pendidikan (PG hingga Boarding), mengelola unit, data master, API token, dan akun pengguna.
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-border bg-card">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                            <div className="rounded-md bg-secondary p-2 text-secondary-foreground">
                                <UserCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">Operator Unit</CardTitle>
                                <CardDescription className="text-xs">Otoritas Terbatas</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
                            Hanya dapat melihat, menambah, mengubah, dan mengekspor data master khusus satuan pendidikan penempatan masing-masing.
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table Card */}
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Akun Pengguna
                            </CardTitle>
                            <CardDescription>
                                Kelola staf administrator dan operator satuan pendidikan yayasan
                            </CardDescription>
                        </div>
                        <Button onClick={openCreateModal} size="sm" className="gap-2 cursor-pointer">
                            <Plus className="h-4 w-4" /> Tambah Pengguna
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau email pengguna..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-44">
                                <Select
                                    value={roleFilter}
                                    onValueChange={(val) => {
                                        setRoleFilter(val);
                                        applyFilter({ role: val !== 'all' ? val : undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Peran</SelectItem>
                                        <SelectItem value="superadmin">Superadmin</SelectItem>
                                        <SelectItem value="operator">Operator Unit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-52">
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
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Pengguna</TableHead>
                                        <TableHead>Alamat Email</TableHead>
                                        <TableHead>Peran / Role</TableHead>
                                        <TableHead>Satuan Unit Wewenang</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                Tidak ada akun pengguna yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((item) => {
                                            const isSelf = auth.user.id === item.id;
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                            <span>{item.name}</span>
                                                            {isSelf && (
                                                                <Badge variant="outline" className="text-[10px] py-0">
                                                                    Akun Anda
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                                        {item.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.role === 'superadmin' ? (
                                                            <Badge className="bg-primary text-primary-foreground gap-1">
                                                                <Shield className="h-3 w-3" /> Superadmin
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="gap-1">
                                                                <UserCheck className="h-3 w-3" /> Operator
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.role === 'superadmin' ? (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                Lintas Seluruh Unit (Global)
                                                            </span>
                                                        ) : item.unit ? (
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                                <School className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span>{item.unit.nama_unit} ({item.unit.kode_unit})</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-destructive italic">
                                                                Belum Ditugaskan
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Ubah Pengguna"
                                                                onClick={() => openEditModal(item)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={isSelf}
                                                                className="h-8 w-8 text-destructive hover:text-destructive disabled:opacity-30"
                                                                title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
                                                                onClick={() => setDeletingUser(item)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
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
                            links={users.links}
                            from={users.from}
                            to={users.to}
                            total={users.total}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Form Dialog Create / Edit */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Ubah Akun Pengguna' : 'Tambah Pengguna Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan identitas, peran hak akses, dan satuan unit penugasan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="user-name">Nama Lengkap *</Label>
                            <Input
                                id="user-name"
                                placeholder="Contoh: Budi Prasetyo, S.Kom."
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="user-email">Alamat Email *</Label>
                            <Input
                                id="user-email"
                                type="email"
                                placeholder="nama@yayasan.ac.id"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="user-password">
                                    {editingUser ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Akun *'}
                                </Label>
                                {editingUser && (
                                    <span className="text-[11px] text-muted-foreground">Kosongkan jika tidak diubah</span>
                                )}
                            </div>
                            <Input
                                id="user-password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="user-role">Peran / Hak Akses *</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(val: 'superadmin' | 'operator') => setData('role', val)}
                                >
                                    <SelectTrigger id="user-role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operator">Operator Unit</SelectItem>
                                        <SelectItem value="superadmin">Superadmin Yayasan</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                            </div>

                            {data.role === 'operator' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="user-unit">Satuan Unit *</Label>
                                    <Select
                                        value={data.unit_id}
                                        onValueChange={(val) => setData('unit_id', val)}
                                    >
                                        <SelectTrigger id="user-unit">
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
                                {processing ? 'Menyimpan...' : 'Simpan Akun'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Akun Pengguna?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus akun <strong className="text-foreground">"{deletingUser?.name}"</strong> ({deletingUser?.email}). Pengguna tersebut tidak akan dapat masuk kembali ke sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus Akun
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
