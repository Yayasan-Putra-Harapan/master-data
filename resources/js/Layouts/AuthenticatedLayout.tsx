import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Toaster } from '@/Components/ui/sonner';
import { toast } from 'sonner';
import ThemeToggle from '@/Components/ThemeToggle';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    LayoutDashboard,
    School,
    GraduationCap,
    Users,
    UserCheck,
    Building2,
    User as UserIcon,
    ChevronDown,
    LogOut,
} from 'lucide-react';

let lastHandledSuccess: string | null = null;
let lastHandledError: string | null = null;

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success && flash.success !== lastHandledSuccess) {
            toast.success(flash.success);
            lastHandledSuccess = flash.success;
        } else if (!flash?.success) {
            lastHandledSuccess = null;
        }

        if (flash?.error && flash.error !== lastHandledError) {
            toast.error(flash.error);
            lastHandledError = flash.error;
        } else if (!flash?.error) {
            lastHandledError = null;
        }
    }, [flash]);

    const navigation = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            current: route().current('dashboard'),
        },
        {
            name: 'Unit Pendidikan',
            href: route('units.index'),
            icon: School,
            current: route().current('units.*'),
        },
        {
            name: 'Data Siswa',
            href: route('siswa.index'),
            icon: GraduationCap,
            current: route().current('siswa.*'),
        },
        {
            name: 'Karyawan & Guru',
            href: route('karyawan.index'),
            icon: Users,
            current: route().current('karyawan.*'),
        },
        {
            name: 'Orang Tua / Wali',
            href: route('orang-tua.index'),
            icon: UserCheck,
            current: route().current('orang-tua.*'),
        },
    ];

    return (
        <div className="flex min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:flex">
                <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-6 dark:border-neutral-800">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Yayasan MDM
                        </h1>
                        <p className="text-xs text-neutral-500">Putra Harapan</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Master Data
                    </div>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    item.current
                                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                                }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
                    <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500 dark:bg-neutral-800/50">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                            Master Data Service
                        </p>
                        <p>Yayasan Pendidikan Putra Harapan</p>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex flex-1 flex-col md:pl-64">
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-6 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
                    <div>
                        {header ? (
                            header
                        ) : (
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                                Sistem Informasi Master Data Yayasan
                            </h2>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <ThemeToggle />

                        {/* Official shadcn User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    <span>{auth.user.name}</span>
                                    <ChevronDown className="h-3 w-3 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-xs text-muted-foreground">Signed in as</p>
                                        <p className="text-xs font-semibold leading-none truncate">{auth.user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')} className="flex w-full items-center cursor-pointer">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Profile Akun</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.post(route('logout'))}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    );
}
