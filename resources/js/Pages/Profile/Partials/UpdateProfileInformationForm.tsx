import { FormEventHandler } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <Card className="shadow-xs">
            <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">Informasi Profil</CardTitle>
                <CardDescription>
                    Perbarui informasi akun dan alamat email yang Anda gunakan
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={submit} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.name && (
                            <p className="text-xs font-medium text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.email && (
                            <p className="text-xs font-medium text-destructive">{errors.email}</p>
                        )}
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Alamat email Anda belum terverifikasi.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    Kirim ulang email verifikasi.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    Tautan verifikasi baru telah dikirimkan ke alamat email Anda.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                        <Button type="submit" disabled={processing} className="cursor-pointer">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>

                        {recentlySuccessful && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in-0 duration-300">
                                Berhasil disimpan.
                            </p>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
