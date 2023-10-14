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

    const [open, setOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<RecordModel>();

    if (listQuery.isLoading) {
        return <FullscreenLoader />;
    }

    if (listQuery.data) {
        if (listQuery.data.items.length != 0) {
            const gridItems = [];
            for (const item of listQuery.data.items ?? []) {
                gridItems.push(
                    <DialogTrigger
                        key={item.id}
                        disabled={item.status != "generated"}
                        onClick={() => {
                            setCurrentItem(item);
                            setOpen(true);
                        }}
                    >
                        <GridCard item={item}></GridCard>
                    </DialogTrigger>
                );
            }
            return (
                <Dialog open={open} onOpenChange={setOpen}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {gridItems}
                    </div>
                    <DialogContent className="w-3/4 h-3/4">
                        <ModalResultWindow
                            item={currentItem ?? listQuery.data.items[0]}
                            openChange={setOpen}
                        ></ModalResultWindow>
                    </DialogContent>
                </Dialog>
            );
        } else {
            return <div>No items!</div>;
        }
    } else {
        return <div>Error</div>;
    }
}

function GridCard({ item }: { item: RecordModel }) {
    const fileQuery = useQuery([`get-file-${item.id}`], () => {
        return pb.files.getUrl(item, item.output_image[0]);
    });

    let coverMsg = undefined;
    if (item.status != "generated") {
        coverMsg = (
            <div
                className="rounded-lg absolute h-full w-full bg-black
        bg-opacity-30 flex items-center justify-center text-white"
            >
                Обработка
            </div>
        );
    }

    let elem = <IconLoader3 className="animate-spin"></IconLoader3>;
    if (fileQuery.isSuccess && item.status == "generated") {
        elem = (
            <img
                className="rounded-lg h-full w-full object-cover"
                src={
                    fileQuery.data.length == 0 ? imgPlaceholder : fileQuery.data
                }
            ></img>
        );
    }

    return (
        <Card className="w-full relative h-52">
            {coverMsg}
            <CardContent className="p-0 h-full">{elem}</CardContent>
            <CardFooter
                className="rounded-lg flex w-full justify-between
                absolute bottom-0 bg-gradient-to-b from-transparent to-black pt-8"
            >
                <CardTitle className="text-white">Image</CardTitle>
                <CardDescription className="text-gray-300">
                    {item.created}
                </CardDescription>
            </CardFooter>
        </Card>
    );
}

type ModalResWindowProps = {
    item: RecordModel;
    openChange: React.Dispatch<React.SetStateAction<boolean>>;
};

function ModalResultWindow({ item, openChange }: ModalResWindowProps) {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    const fileQuery = useQuery(
        [`get-file-${item.id}-${currentFileIndex}`],
        () => {
            return pb.files.getUrl(item, item.output_image[currentFileIndex]);
        }
    );

    let elem = <IconLoader3 className="animate-spin"></IconLoader3>;
    if (fileQuery.isSuccess && fileQuery.data.length != 0) {
        elem = <img className="flex-grow object-contain h-0 w-full"
            src={fileQuery.data}></img>
    };

    return (
        <div className="flex h-full w-full">
            <div className="flex-grow w-0 pe-6">
                <div className="flex flex-col w-full h-full justify-between">
                    {elem}
                    <div className="flex justify-between mt-6">
                        <Button
                            disabled={currentFileIndex == 0}
                            onClick={() => { setCurrentFileIndex(currentFileIndex - 1) }}>
                            Previous
                        </Button>
                        <Button
                            disabled={currentFileIndex == item.num_images - 1 }
                            onClick={() => { setCurrentFileIndex(currentFileIndex + 1) }}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
            <div className="w-1/3 h-full p-6 border-l-2 border-gray-200">
                <div className="text-2xl mb-4">Image</div>
                <div className="flex h-full flex-col align-middle">
                    <Button
                        onClick={() => {
                            pb.collection("text_generation_mvp")
                                .update(item.id, { status: "open" })
                                .then(_ => openChange(false));
                        }}>Перегенерировать</Button>
                </div>
            </div>
        </div>
    );
}
