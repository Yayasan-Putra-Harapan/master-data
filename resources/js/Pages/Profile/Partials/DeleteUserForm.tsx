import { FormEventHandler, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <Card className="border-destructive/30 shadow-xs">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold text-destructive">Hapus Akun</CardTitle>
                <CardDescription>
                    Setelah akun Anda dihapus, semua sumber daya dan data yang terkait akan dihapus secara permanen.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Button
                    variant="destructive"
                    onClick={confirmUserDeletion}
                    className="cursor-pointer"
                >
                    Hapus Akun Ini
                </Button>

                <Dialog open={confirmingUserDeletion} onOpenChange={setConfirmingUserDeletion}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Penghapusan Akun</DialogTitle>
                            <DialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Masukkan kata sandi akun Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun ini secara permanen.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={deleteUser} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="password">Kata Sandi Anda</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    placeholder="Kata sandi saat ini"
                                    autoFocus
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                {errors.password && (
                                    <p className="text-xs font-medium text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                    className="cursor-pointer"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    className="cursor-pointer"
                                >
                                    {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
