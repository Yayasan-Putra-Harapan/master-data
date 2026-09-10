import { Button } from '@/Components/ui/button';
import { Building2, Printer, ArrowLeft } from 'lucide-react';

interface KopSuratProps {
    unitName?: string;
    unitJenjang?: string;
    telepon?: string;
    email?: string;
    alamat?: string;
    judulDokumen?: string;
    nomorDokumen?: string;
    backUrl?: string;
    onBack?: () => void;
}

export default function KopSurat({
    unitName,
    telepon = '0281-635111',
    email = 'sekretariat@putraharapan.sch.id',
    alamat = 'Jl. Kompol Sumarto No. 100, Purwokerto, Jawa Tengah',
    judulDokumen,
    nomorDokumen,
    backUrl,
    onBack,
}: KopSuratProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }

        // If page has history in the same origin, go back
        if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
            window.history.back();
            return;
        }

        // If opened in new tab/window without history, try closing tab
        if (window.opener || window.history.length <= 1) {
            window.close();
        }

        // Fallback navigation if window.close was blocked by browser or if backUrl specified
        if (backUrl) {
            window.location.href = backUrl;
        } else {
            window.history.back();
        }
    };

    return (
        <div>
            {/* Action Bar (Hidden when printing) */}
            <div className="print:hidden mb-6 flex items-center justify-between bg-muted/60 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Button>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                        Gunakan tombol cetak untuk menyimpan sebagai PDF atau mencetak ke printer.
                    </span>
                </div>

                <Button size="sm" onClick={handlePrint} className="gap-2 cursor-pointer">
                    <Printer className="h-4 w-4" /> Cetak Dokumen / PDF
                </Button>
            </div>

            {/* Official Letterhead (Kop Surat) */}
            <div className="text-center relative pb-3 border-b-2 border-neutral-900 dark:border-neutral-100">
                <div className="flex items-center justify-center gap-4">
                    <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        <Building2 className="h-8 w-8" />
                    </div>

                    <div>
                        <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                            Yayasan Pendidikan Putra Harapan
                        </h1>
                        {unitName ? (
                            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-neutral-800 dark:text-neutral-200">
                                {unitName}
                            </h2>
                        ) : (
                            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                                Layanan Pengelolaan Data Induk Yayasan
                            </h2>
                        )}
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {alamat} • Telp: {telepon} • Email: {email}
                        </p>
                    </div>
                </div>

                {/* Double bottom line of Indonesian Kop */}
                <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-neutral-900 dark:bg-neutral-100" />
            </div>

            {/* Document Title */}
            {judulDokumen && (
                <div className="text-center my-5">
                    <h3 className="text-sm sm:text-base font-bold uppercase underline tracking-wider text-neutral-900 dark:text-neutral-100">
                        {judulDokumen}
                    </h3>
                    {nomorDokumen && (
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">
                            Nomor: {nomorDokumen}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
