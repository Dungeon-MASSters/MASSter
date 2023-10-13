import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/lib/pb-client";
import { IconBrandVk, IconBrandYandex, IconLoader3 } from "@tabler/icons-react";
import { RecordAuthResponse, RecordModel } from "pocketbase";
import { useQuery } from "react-query";

function authWithVK() {
    return pb.collection("users").authWithOAuth2({ provider: "vk" });
}

function authWithYandex() {
    return pb.collection("users").authWithOAuth2({ provider: "yandex" });
}

type authPageProps = {
    onSuccess: (userData: RecordAuthResponse<RecordModel>) => void;
    onError: (error: any) => void;
};

export function AuthPage({ onSuccess, onError }: authPageProps) {
    const authVKQuery = useQuery(["auth-with-vk"], () => authWithVK(), {
        enabled: false,
        onSuccess: onSuccess,
        onError: onError
    });
    const authYandexQuery = useQuery(
        ["auth-with-yandex"],
        () => authWithYandex(),
        {
            enabled: false,
            onSuccess: onSuccess,
            onError: onError
        }
    );

    return (
        <div className="flex justify-center p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Войти или зарегистрироваться</CardTitle>
                </CardHeader>

                <CardContent className="gap-2 flex-col flex">
                    <Button
                        onClick={() => authVKQuery.refetch()}
                        className="flex gap-1 w-full"
                        disabled={
                            authVKQuery.isFetching || authYandexQuery.isFetching
                        }
                    >
                        <span>Войти через</span>
                        <IconBrandVk strokeWidth="1.5" />
                        {authVKQuery.isFetching && (
                            <IconLoader3
                                strokeWidth="1.5"
                                className="animate-spin"
                            />
                        )}
                    </Button>
                    <Button
                        onClick={() => authYandexQuery.refetch()}
                        className="flex gap-1 w-full"
                        disabled={
                            authVKQuery.isFetching || authYandexQuery.isFetching
                        }
                    >
                        <span>Войти через</span>
                        <IconBrandYandex strokeWidth="1.5" />
                        {authYandexQuery.isFetching && (
                            <IconLoader3
                                strokeWidth="1.5"
                                className="animate-spin"
                            />
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
