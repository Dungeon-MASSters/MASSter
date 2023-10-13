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
        enabled: false
    });
    const authYandexQuery = useQuery(
        ["auth-with-yandex"],
        () => authWithYandex(),
        {
            enabled: false
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
                        onClick={() =>
                            authVKQuery
                                .refetch()
                                .then(() => {
                                    if (authVKQuery.data) {
                                        onSuccess(authVKQuery.data);
                                    }
                                })
                                .catch((err) => onError(err))
                        }
                        className="flex gap-1 w-full"
                        disabled={authVKQuery.isFetching}
                    >
                        <span>Войти через</span>
                        {authVKQuery.isFetching ? (
                            <IconLoader3
                                strokeWidth="1.5"
                                className="animate-spin"
                            />
                        ) : (
                            <IconBrandVk strokeWidth="1.5" />
                        )}
                    </Button>
                    <Button
                        onClick={() =>
                            authYandexQuery
                                .refetch()
                                .then(() => {
                                    if (authYandexQuery.data) {
                                        onSuccess(authYandexQuery.data);
                                    }
                                })
                                .catch((err) => onError(err))
                        }
                        className="flex gap-1 w-full"
                        disabled={authYandexQuery.isFetching}
                    >
                        <span>Войти через</span>
                        {authYandexQuery.isFetching ? (
                            <IconLoader3
                                strokeWidth="1.5"
                                className="animate-spin"
                            />
                        ) : (
                            <IconBrandYandex strokeWidth="1.5" />
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
