import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ApiToken, PageProps } from '@/types';
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
    KeyRound,
    Plus,
    Trash2,
    Copy,
    Check,
    ShieldAlert,
    Code2,
    ExternalLink,
    Terminal,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    tokens: ApiToken[];
}

export default function ApiTokensIndex({ tokens }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [freshToken, setFreshToken] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [deletingToken, setDeletingToken] = useState<ApiToken | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    // Capture newly created token from flash
    useEffect(() => {
        if (flash?.plainTextToken) {
            setFreshToken(flash.plainTextToken);
        }
    }, [flash?.plainTextToken]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('api-tokens.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleCopyToken = () => {
        if (!freshToken) return;
        navigator.clipboard.writeText(freshToken);
        setIsCopied(true);
        toast.success('Token berhasil disalin ke clipboard');
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDeleteToken = () => {
        if (!deletingToken) return;
        router.delete(route('api-tokens.destroy', deletingToken.id), {
            onSuccess: () => setDeletingToken(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Manajemen Akses & API Token (Sanctum)
                    </h2>
                </div>
            }
        >
            <Head title="Manajemen API Token" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Notice & Docs banner */}
                <Card className="shadow-xs border-primary/20 bg-primary/5">
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                                <Code2 className="h-5 w-5 text-primary" />
                                <span>Akses REST API Terproteksi</span>
                            </div>
                            <a
                                href="/docs/api"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                                Buka Dokumentasi Interaktif (Swagger UI) <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 text-xs text-muted-foreground leading-relaxed space-y-2">
                        <p>
                            Semua endpoint <code className="font-mono text-foreground font-semibold">/api/v1/*</code> wajib menyertakan header{' '}
                            <code className="font-mono text-foreground font-semibold">Authorization: Bearer sk-yayasan-ph-...</code>.
                            Terbitkan secret key untuk setiap rekan tim Anda di bawah ini dan bagikan secara aman.
                        </p>
                    </CardContent>
                </Card>

                {/* Freshly Generated Token Modal Dialog */}
                <Dialog open={!!freshToken} onOpenChange={(open) => !open && setFreshToken(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-2 text-emerald-600">
                                <KeyRound className="h-5 w-5" />
                                <DialogTitle>API Token Berhasil Diterbitkan</DialogTitle>
                            </div>
                            <DialogDescription>
                                Salin token ini sekarang. Demi alasan keamanan, token ini{' '}
                                <strong className="text-foreground">tidak akan pernah ditampilkan kembali</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="token-text">Bearer Token Rekan Anda</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="token-text"
                                        readOnly
                                        value={freshToken || ''}
                                        className="font-mono text-xs bg-muted select-all"
                                    />
                                    <Button
                                        type="button"
                                        variant={isCopied ? 'default' : 'outline'}
                                        onClick={handleCopyToken}
                                        className="gap-1.5 shrink-0"
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="h-4 w-4" /> Tersalin
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" /> Salin
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-lg bg-muted p-3 space-y-1.5 text-xs text-muted-foreground font-mono">
                                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                                    <Terminal className="h-3.5 w-3.5" /> Contoh Penggunaan (cURL):
                                </div>
                                <div className="overflow-x-auto p-2 bg-background rounded border text-[11px]">
                                    curl -H "Authorization: Bearer {freshToken}" \<br />
                                    &nbsp;&nbsp;https://gevano.my.id/api/v1/units
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={() => setFreshToken(null)}>
                                Selesai & Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Tokens Table Card */}
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Token Aktif
                            </CardTitle>
                            <CardDescription>
                                Token yang memiliki izin mengakses seluruh REST API data master yayasan
                            </CardDescription>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setIsCreateOpen(true)}
                            className="gap-2 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> Terbitkan Token Baru
                        </Button>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama / Keterangan Rekan</TableHead>
                                        <TableHead>Terakhir Digunakan</TableHead>
                                        <TableHead>Tanggal Dibuat</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tokens.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                                                Belum ada API token yang diterbitkan. Klik tombol "Terbitkan Token Baru" di atas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tokens.map((token) => (
                                            <TableRow key={token.id}>
                                                <TableCell className="font-medium text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                                                        <span>{token.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {token.last_used_at ? (
                                                        <span className="text-foreground">{token.last_used_at}</span>
                                                    ) : (
                                                        <span className="italic">Belum pernah</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {token.created_at || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-emerald-600 border-emerald-500">
                                                        Aktif
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeletingToken(token)}
                                                        className="text-destructive hover:text-destructive gap-1.5 h-8 px-2.5"
                                                        title="Cabut akses token ini"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span>Cabut Akses</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Token Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Terbitkan API Token Baru</DialogTitle>
                        <DialogDescription>
                            Beri nama deskriptif untuk mengidentifikasi siapa rekan yang menggunakan token ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="token-name">Nama Token / Keterangan Rekan *</Label>
                            <Input
                                id="token-name"
                                placeholder="Contoh: Frontend Tim - Budi / Postman Mahasiswa X"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing || !data.name.trim()}>
                                {processing ? 'Menerbitkan...' : 'Buat Token'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Revoke Token Alert Dialog */}
            <AlertDialog open={!!deletingToken} onOpenChange={() => setDeletingToken(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5 w-5" />
                            <AlertDialogTitle>Cabut Akses Token?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Akses untuk token <strong className="text-foreground">"{deletingToken?.name}"</strong> akan dihapus secara permanen. Rekan Anda tidak akan dapat lagi mengirim permintaan ke API dengan token ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteToken}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Cabut Akses
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
