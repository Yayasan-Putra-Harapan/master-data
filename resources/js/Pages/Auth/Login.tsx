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
import { Checkbox } from '@/Components/ui/checkbox';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk ke Sistem" />

            <Card className="shadow-xs">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        Masuk ke Akun
                    </CardTitle>
                    <CardDescription>
                        Masukkan email dan kata sandi Anda untuk mengakses Master Data Management
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        {status && (
                            <div className="rounded-md bg-emerald-500/15 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {status}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="nama@yayasan.ac.id"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Kata Sandi</Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', checked === true)
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="text-xs font-normal text-muted-foreground cursor-pointer"
                            >
                                Ingat saya di perangkat ini
                            </Label>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3 pt-2">
                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Masuk Sekarang'}
                        </Button>

                        <div className="text-center text-xs text-muted-foreground">
                            Demo Admin:{' '}
                            <span className="font-medium text-foreground">admin@yayasan.ac.id</span> /{' '}
                            <span className="font-medium text-foreground">password</span>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
