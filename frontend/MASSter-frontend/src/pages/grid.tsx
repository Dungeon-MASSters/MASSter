import { FullscreenLoader } from "@/components/loaders";
import { Card, CardTitle, CardFooter, CardDescription, CardContent } from "@/components/ui/card";
import { pb } from "@/lib/pb-client";
import { RecordModel } from "pocketbase";
import { useQuery } from "react-query";
import imgPlaceholder from "/src/assets/img/img-placeholder.webp";
import { IconLoader3 } from "@tabler/icons-react";

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

    console.log(listQuery.data?.items);

    if (listQuery.data) {
        if (listQuery.data.items.length != 0) {
            const gridItems = [];
            for (const item of listQuery.data?.items ?? []) {
                gridItems.push(
                    <GridCard item={item} key={item.id}></GridCard>
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

    let elem = <IconLoader3 className="animate-spin"></IconLoader3>;
    if (fileQuery.isSuccess) {
        elem = <img className="rounded-lg h-52 w-full object-cover"
            src={fileQuery.data.length == 0 ? imgPlaceholder : fileQuery.data}></img>
    };

    return (
        <Card className="w-full relative">
            <CardContent className="p-0">{elem}</CardContent>
            <CardFooter className="rounded-lg flex w-full justify-between
                absolute bottom-0 bg-gradient-to-b from-transparent to-black pt-8">
                <CardTitle className="text-white">Image</CardTitle>
                <CardDescription className="text-gray-300">{item.created}</CardDescription>
            </CardFooter>
        </Card>
    );
}
