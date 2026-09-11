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
    CalendarDays,
    Layers,
    Building,
    DoorOpen,
    BookOpen,
    Truck,
    Code2,
    ExternalLink,
    KeyRound,
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

    const coreNavigation = [
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

    const extensionNavigation = [
        {
            name: 'Tahun Ajaran',
            href: route('tahun-ajaran.index'),
            icon: CalendarDays,
            current: route().current('tahun-ajaran.*'),
        },
        {
            name: 'Rombel / Kelas',
            href: route('kelas.index'),
            icon: Layers,
            current: route().current('kelas.*'),
        },
        {
            name: 'Bangunan Gedung',
            href: route('bangunan.index'),
            icon: Building,
            current: route().current('bangunan.*'),
        },
        {
            name: 'Ruangan Fasilitas',
            href: route('ruang.index'),
            icon: DoorOpen,
            current: route().current('ruang.*'),
        },
        {
            name: 'Mata Pelajaran',
            href: route('mata-pelajaran.index'),
            icon: BookOpen,
            current: route().current('mata-pelajaran.*'),
        },
        {
            name: 'Rekanan & Vendor',
            href: route('vendor.index'),
            icon: Truck,
            current: route().current('vendor.*'),
        },
    ];

    const apiNavigation = [
        {
            name: 'Akses API Token',
            href: route('api-tokens.index'),
            icon: KeyRound,
            current: route().current('api-tokens.*'),
        },
    ];

    return (
        <div className="flex min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:flex">
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 px-6 dark:border-neutral-800">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight text-foreground">
                            Yayasan MDM
                        </h1>
                        <p className="text-xs text-muted-foreground">Putra Harapan</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-4 overflow-y-auto p-4">
                    <div className="space-y-1">
                        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Entitas Inti (Core)
                        </div>
                        {coreNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        item.current
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="space-y-1 pt-1">
                        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Akademik & Logistik
                        </div>
                        {extensionNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        item.current
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="space-y-1 pt-1">
                        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Pengembang & API
                        </div>
                        {apiNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        item.current
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 space-y-2">
                    <a
                        href="/docs/api"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-md border border-neutral-200 bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors dark:border-neutral-800"
                    >
                        <div className="flex items-center gap-2">
                            <Code2 className="h-3.5 w-3.5 text-primary" />
                            <span>REST API Docs</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>

                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">
                            Master Data Service
                        </p>
                        <p>10 Entitas Terintegrasi</p>
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
                                <DropdownMenuItem asChild>
                                    <Link href={route('api-tokens.index')} className="flex w-full items-center cursor-pointer">
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        <span>Akses API Token</span>
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
