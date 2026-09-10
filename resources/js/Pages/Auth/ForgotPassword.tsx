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

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <Card className="shadow-xs">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        Reset Kata Sandi
                    </CardTitle>
                    <CardDescription>
                        Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi
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
                                autoFocus
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive">{errors.email}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3 pt-2">
                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={processing}
                        >
                            {processing ? 'Mengirim Tautan...' : 'Kirim Tautan Reset'}
                        </Button>

                        <div className="text-center text-xs text-muted-foreground">
                            Kembali ke{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Halaman Masuk
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
