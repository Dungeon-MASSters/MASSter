import { IconLoader3 } from "@tabler/icons-react";

export function FullscreenLoader({ title }: { title?: string }) {
    return (
        <div className="w-full h-full flex gap-1 items-center justify-center text-slate-500 p-8">
            <IconLoader3 className="animate-spin" />
            {title && <span>{title}</span>}
        </div>
    );
}
