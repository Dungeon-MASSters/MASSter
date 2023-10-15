import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/lib/pb-client";
import { IconBrandVk, IconBrandYandex, IconLoader3 } from "@tabler/icons-react";
import { RecordAuthResponse, RecordModel } from "pocketbase";
import { useQuery } from "react-query";
import samPic from "../assets/img/maxresdefault.jpg";
import { isMobile } from "react-device-detect";

function authWithVK() {
    return pb.collection("users").authWithOAuth2({
        provider: "vk",
        urlCallback: (url) => {
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, "_blank", "");
            }
        }
    });
}

function authWithYandex() {
    return pb.collection("users").authWithOAuth2({
        provider: "yandex",
        urlCallback: (url) => {
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, "_blank", "");
            }
        }
    });
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
        <div className="flex flex-col items-center md:flex-row absolute top-0 left-0 h-[100vh] w-[100vw] bg-black">
            <div className="h-1/2 md:flex-grow w-full md:h-full md:w-0 relative">
                <img src={samPic} className="h-full w-full object-cover"></img>
                <div className="absolute top-0 left-0 h-full w-full bg-black opacity-40"></div>
                <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-b md:bg-gradient-to-r to-black from-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-full p-10">
                    <div className="h-full w-full flex justify-center items-center flex-col">
                        <div className="text-white text-6xl text-center font-bold mb-5">
                            Обложкер
                        </div>
                        <div className="text-gray-200 text-2xl text-center">
                            Генерируйте арты к своим видео
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow md:max-w-lg min-w-fit px-16 lg:pe-20 h-0 md:h-full md:flex-grow-0 md:w-1/3 md:min-w-min">
                <div className="flex justify-center h-full px-4 items-center">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">
                                Войти или зарегистрироваться
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="gap-2 flex-col flex">
                            <Button
                                onClick={() => authVKQuery.refetch()}
                                className="flex gap-1 w-full"
                                disabled={
                                    authVKQuery.isFetching ||
                                    authYandexQuery.isFetching
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
                                    authVKQuery.isFetching ||
                                    authYandexQuery.isFetching
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
