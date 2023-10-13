import { QueryClient, useQuery } from "react-query";
import { pb } from "./pb-client";

export function useUser(refresh: boolean) {
    return useQuery(
        ["use-user"],
        () => {
            return pb.collection("users").authRefresh();
        },
        {
            retry: false,
            refetchInterval: refresh ? 10000 : false
        }
    );
}

export function invalidateUser(qc: QueryClient) {
    return qc.invalidateQueries(["use-user"]);
}

export function logoutUser() {
    pb.authStore.clear();
}
