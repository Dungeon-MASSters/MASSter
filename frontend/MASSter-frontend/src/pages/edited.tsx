import { pb } from "@/lib/pb-client";
import { IconDownload, IconLoader3 } from "@tabler/icons-react";
import { useQuery } from "react-query";

export function EditedCoversPage() {
    const { data, isLoading } = useQuery(["get-gallery"], () =>
        pb.collection("edited_covers").getFullList()
    );

    return (
        <div>
            <div className="text-xl font-bold mb-4">Созданные обложки</div>
            {isLoading ? (
                <div className="flex gap-1 text-primary">
                    <IconLoader3 className="animate-spin" />
                    <span>загрузка...</span>
                </div>
            ) : data && data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {data?.map((cover) => (
                        <ImageCard
                            key={cover.id}
                            fileURL={pb.files.getUrl(cover, cover.result)}
                        />
                    ))}
                </div>
            ) : (
                <div>Вы ещё не сохранили ни одной обложки :(</div>
            )}
        </div>
    );
}

function ImageCard({ fileURL }: { fileURL: string }) {
    return (
        <div className="h-52 relative">
            <img
                className=" w-full h-full object-cover rounded-lg"
                src={fileURL}
            />

            <a
                href={fileURL}
                className="absolute bottom-0 flex gap-1 p-2 text-primary-foreground bg-primary rounded-bl-lg rounded-tr-lg hover:text-secondary-foreground hover:bg-secondary"
                download
            >
                <IconDownload />
                <span>Скачать</span>
            </a>
        </div>
    );
}
