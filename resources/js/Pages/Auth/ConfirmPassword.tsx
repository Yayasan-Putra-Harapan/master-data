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

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            <Card className="shadow-xs">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        Area Terproteksi
                    </CardTitle>
                    <CardDescription>
                        Konfirmasikan kata sandi Anda untuk melanjutkan ke bagian ini
                    </CardDescription>
                </CardHeader>

                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={data.password}
                                autoFocus
                                required
                                onChange={(e) => setData('password', e.target.value)}
                                className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive">{errors.password}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={processing}
                        >
                            {processing ? 'Memverifikasi...' : 'Konfirmasi Kata Sandi'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </GuestLayout>
    );
}
