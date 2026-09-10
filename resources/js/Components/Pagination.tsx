import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from?: number;
    to?: number;
    total?: number;
}

export default function Pagination({ links, from, to, total }: PaginationProps) {
    if (!links || links.length <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-xs text-neutral-500">
                {from && to && total ? (
                    <span>
                        Menampilkan <span className="font-semibold text-neutral-800 dark:text-neutral-200">{from}</span> - <span className="font-semibold text-neutral-800 dark:text-neutral-200">{to}</span> dari <span className="font-semibold text-neutral-800 dark:text-neutral-200">{total}</span> data
                    </span>
                ) : null}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
                {links.map((link, i) => {
                    const label = link.label
                        .replace('&laquo; Previous', 'Sebelumnya')
                        .replace('Next &raquo;', 'Selanjutnya');

                    if (!link.url) {
                        return (
                            <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                disabled
                                className="h-8 px-3 text-xs opacity-50"
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    }

                    return (
                        <Link key={i} href={link.url} preserveScroll preserveState>
                            <Button
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 px-3 text-xs"
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
