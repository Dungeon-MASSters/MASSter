import { FullscreenLoader } from "@/components/loaders";
import {
    Card,
    CardTitle,
    CardFooter,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { pb } from "@/lib/pb-client";
import { RecordModel } from "pocketbase";
import { useQuery } from "react-query";
import imgPlaceholder from "/src/assets/img/img-placeholder.webp";
import { IconLoader3 } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GridPage() {
    const listQuery = useQuery(
        ["get-gen-list"],
        () => {
            return pb.collection("text_generation_mvp").getList();
        },
        {
            refetchInterval: 10000 // обновлять каждые 10 сек
        }
    );

    if (listQuery.isLoading) {
        return <FullscreenLoader />;
    }

    if (listQuery.data?.items.length === 0) {
        return <div className="text-center">Пока тут очень пусто...</div>;
    }

    return (
        <div>
            <h1 className="text-xl font-bold">Мой дизайн</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {listQuery.data?.items.map((item) => (
                    <Dialog key={item.id}>
                        <DialogTrigger disabled={item.status != "generated"}>
                            <GridCard item={item}></GridCard>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <ModalResultWindow item={item}></ModalResultWindow>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
}

function GridCard({ item }: { item: RecordModel }) {
    const fileQuery = useQuery([`get-file-${item.id}`], () => {
        return pb.files.getUrl(item, item.output_image[0]);
    });

    return (
        <Card className="w-full relative h-52">
            {item.status != "generated" && (
                <div className="rounded-lg absolute h-full w-full bg-black bg-opacity-30 flex items-center justify-center text-white">
                    Обработка
                </div>
            )}

            <CardContent className="p-0 h-full">
                {fileQuery.isSuccess && item.status == "generated" && (
                    <img
                        className="rounded-lg h-full w-full object-cover"
                        src={
                            fileQuery.data.length == 0
                                ? imgPlaceholder
                                : fileQuery.data
                        }
                    ></img>
                )}
            </CardContent>
            <CardFooter className="rounded-lg flex w-full justify-between absolute bottom-0 bg-gradient-to-b from-transparent to-black pt-8">
                <CardTitle className="text-white">Image</CardTitle>
                <CardDescription className="text-gray-300">
                    {item.created}
                </CardDescription>
            </CardFooter>
        </Card>
    );
}

function ModalResultWindow({ item }: { item: RecordModel }) {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    const fileQuery = useQuery(
        [`get-file-${item.id}-${currentFileIndex}`],
        () => {
            return pb.files.getUrl(item, item.output_image[currentFileIndex]);
        }
    );

    return (
        <Card className="w-full">
            <CardContent className="h-full flex items-center justify-center">
                {fileQuery.isSuccess && fileQuery.data.length != 0 ? (
                    <img
                        className="h-full w-full object-contain"
                        src={fileQuery.data}
                    ></img>
                ) : (
                    <IconLoader3 className="animate-spin"></IconLoader3>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    disabled={currentFileIndex == 0}
                    onClick={() => {
                        setCurrentFileIndex(currentFileIndex - 1);
                    }}
                >
                    Previous
                </Button>
                <Button
                    disabled={currentFileIndex == item.num_images - 1}
                    onClick={() => {
                        setCurrentFileIndex(currentFileIndex + 1);
                    }}
                >
                    Next
                </Button>
            </CardFooter>
        </Card>
    );
}
