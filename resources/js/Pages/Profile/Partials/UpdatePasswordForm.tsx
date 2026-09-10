import { FormEventHandler, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <Card className="shadow-xs">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">Perbarui Kata Sandi</CardTitle>
                <CardDescription>
                    Pastikan akun Anda menggunakan kata sandi yang aman dan tidak mudah ditebak
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={updatePassword} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Kata Sandi Saat Ini</Label>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            className={errors.current_password ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.current_password && (
                            <p className="text-xs font-medium text-destructive">{errors.current_password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Kata Sandi Baru</Label>
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.password && (
                            <p className="text-xs font-medium text-destructive">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi Baru</Label>
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            className={errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.password_confirmation && (
                            <p className="text-xs font-medium text-destructive">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <Button type="submit" disabled={processing} className="cursor-pointer">
                            {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                        </Button>

                        {recentlySuccessful && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in-0 duration-300">
                                Kata sandi berhasil diperbarui.
                            </p>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
