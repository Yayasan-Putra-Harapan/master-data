import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
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

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi" />

            <Card className="shadow-xs">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        Kata Sandi Baru
                    </CardTitle>
                    <CardDescription>
                        Tentukan kata sandi baru untuk akun Anda
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi Baru</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={data.password}
                                autoComplete="new-password"
                                autoFocus
                                onChange={(e) => setData('password', e.target.value)}
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
                                type="password"
                                name="password_confirmation"
                                placeholder="••••••••"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.password_confirmation && (
                                <p className="text-xs font-medium text-destructive">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Atur Ulang Kata Sandi'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
