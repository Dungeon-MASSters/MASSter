import { FullscreenLoader } from "@/components/loaders";
import { Card, CardTitle, CardFooter, CardDescription, CardContent } from "@/components/ui/card";
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

    if (listQuery.data) {
        if (listQuery.data.items.length != 0) {
            const gridItems = [];
            for (const item of listQuery.data?.items ?? []) {
                gridItems.push(
                    <Dialog key={item.id}>
                        <DialogTrigger disabled={item.status != "generated"}>
                            <GridCard item={item}></GridCard>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <ModalResultWindow item={item}></ModalResultWindow>
                        </DialogContent>
                    </Dialog>
                )
            }
            return <div className="grid grid-cols-4 gap-2">{gridItems}</div>;
        } else {
            return <div>No items!</div>
        }
    } else {
        return <div>Error</div>
    }
}

function GridCard({item}: {item: RecordModel}) {
    const fileQuery = useQuery(
        [`get-file-${item.id}`],
        () => {
            return pb.files.getUrl(item, item.output_image[0]);
        }
    );

    let coverMsg = undefined;
    if (item.status != "generated") {
        coverMsg = <div className="rounded-lg absolute h-full w-full bg-black
        bg-opacity-30 flex items-center justify-center text-white">Обработка</div>
    }

    let elem = <IconLoader3 className="animate-spin"></IconLoader3>;
    if (fileQuery.isSuccess && item.status == "generated") {
        elem = <img className="rounded-lg h-full w-full object-cover"
            src={fileQuery.data.length == 0 ? imgPlaceholder : fileQuery.data}></img>
    };

    return (
        <Card className="w-full relative h-52">
            {coverMsg}
            <CardContent className="p-0 h-full">{elem}</CardContent>
            <CardFooter className="rounded-lg flex w-full justify-between
                absolute bottom-0 bg-gradient-to-b from-transparent to-black pt-8">
                <CardTitle className="text-white">Image</CardTitle>
                <CardDescription className="text-gray-300">{item.created}</CardDescription>
            </CardFooter>
        </Card>
    );
}

function ModalResultWindow({item}: {item: RecordModel}) {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    const fileQuery = useQuery(
        [`get-file-${item.id}-${currentFileIndex}`],
        () => {
            return pb.files.getUrl(item, item.output_image[currentFileIndex]);
        }
    );

    let elem = <IconLoader3 className="animate-spin"></IconLoader3>;
    if (fileQuery.isSuccess && fileQuery.data.length != 0) {
        elem =  <img className="h-full w-full object-contain"
            src={fileQuery.data}></img>
    };

    return (
        <Card className="w-full">
            <CardContent className="h-full">{elem}</CardContent>
            <CardFooter>
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
            </CardFooter>
        </Card>
    );
}
