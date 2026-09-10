import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun" />

            <Card className="shadow-xs">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        Registrasi Pengguna
                    </CardTitle>
                    <CardDescription>
                        Buat akun baru untuk staf atau administrator yayasan
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Nama lengkap Anda"
                                value={data.name}
                                autoComplete="name"
                                autoFocus
                                required
                                onChange={(e) => setData('name', e.target.value)}
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
                                name="email"
                                placeholder="nama@yayasan.ac.id"
                                value={data.email}
                                autoComplete="username"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={data.password}
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                                className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                placeholder="••••••••"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.password_confirmation && (
                                <p className="text-xs font-medium text-destructive">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3 pt-2">
                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={processing}
                        >
                            {processing ? 'Mendaftarkan...' : 'Daftar Akun'}
                        </Button>

                        <div className="text-center text-xs text-muted-foreground">
                            Sudah punya akun?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Masuk ke akun
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
