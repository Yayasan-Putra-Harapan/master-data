import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6 lg:p-8">
            <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
                <ThemeToggle />
            </div>

            <div className="mb-6 flex flex-col items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-base font-semibold leading-tight text-foreground">
                            Yayasan MDM
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Putra Harapan
                        </div>
                    </div>
                </Link>
            </div>

            <div className="w-full sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
