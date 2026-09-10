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
import { Button } from '@/Components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <Card className="shadow-xs">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        Verifikasi Alamat Email
                    </CardTitle>
                    <CardDescription>
                        Terima kasih telah mendaftar! Sebelum memulai, silakan klik tautan verifikasi yang kami kirimkan ke email Anda.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        {status === 'verification-link-sent' && (
                            <div className="rounded-md bg-emerald-500/15 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Tautan verifikasi baru telah dikirimkan ke alamat email yang Anda gunakan saat registrasi.
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex items-center justify-between pt-2">
                        <Button
                            type="submit"
                            className="cursor-pointer"
                            disabled={processing}
                        >
                            {processing ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                        </Button>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline cursor-pointer"
                        >
                            Log Out
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
