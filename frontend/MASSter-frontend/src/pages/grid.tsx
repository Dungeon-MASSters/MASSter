import { FullscreenLoader } from "@/components/loaders";
import { pb } from "@/lib/pb-client";
import { useQuery } from "react-query";

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

    console.log(listQuery.data?.items)

    // pb.files.getUrl(/*item instance*/, "filename")

    return <div>grid</div>;
}
