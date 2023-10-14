import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/lib/pb-client";
import { IconBrandVk, IconBrandYandex, IconLoader3 } from "@tabler/icons-react";
import { RecordAuthResponse, RecordModel } from "pocketbase";
import { useQuery } from "react-query";
import samPic from '../assets/img/maxresdefault.jpg';

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
        <div className="flex absolute top-0 left-0 h-[100vh] w-[100vw] bg-black">
            <div className="flex-grow relative h-full w-0">
                <img src={samPic} className="h-full w-full object-cover"></img>
                <div className="absolute top-0 left-0 h-full w-full bg-black opacity-40"></div>
                <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-r to-black from-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-full p-10">
                    <div className="h-full w-full flex max-w-2xl justify-center items-center flex-col">
                        <div className="text-white text-6xl text-center font-bold mb-5">Обложкер</div>
                        <div className="text-gray-200 text-2xl text-center">Генерируйте арты к своим видео</div>
                    </div>
                </div>
            </div>
            <div className="max-w-lg px-20 h-full">
                <div className="flex justify-center h-full p-4 items-center">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">Войти или зарегистрироваться</CardTitle>
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
            </div>
        </div>
    );
}
