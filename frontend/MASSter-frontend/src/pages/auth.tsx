import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/lib/pb-client";
import { IconBrandVk, IconBrandYandex } from "@tabler/icons-react";
import { RecordAuthResponse, RecordModel } from "pocketbase";
import { useQuery } from "react-query";

async function authWithVK() {
    return await pb.collection("users").authWithOAuth2({ provider: "vk" });
}

async function authWithYandex() {
    return await pb.collection("users").authWithOAuth2({ provider: "yandex" });
}

type authPageProps = {
    onSuccess: (userData: RecordAuthResponse<RecordModel>) => void;
    onError: (error: any) => void;
};

export function AuthPage({ onSuccess, onError }: authPageProps) {
    const authVKQuery = useQuery(["auth-with-vk"], () => authWithVK(), {
        enabled: false
    });

    return (
        <div className="flex justify-center p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Войти или зарегистрироваться</CardTitle>
                </CardHeader>

                <CardContent className="gap-2 flex-col flex">
                    <Button
                        onClick={() => {
                            authWithVK()
                                .then((userData) => {
                                    onSuccess(userData);
                                })
                                .catch((err) => {
                                    onError(err);
                                });
                        }}
                        className="flex gap-1 w-full"
                    >
                        <span>Войти через</span>
                        <IconBrandVk strokeWidth="1.5" className="text-input" />
                    </Button>
                    <Button
                        onClick={() => {
                            alert("TODO");
                        }}
                        className="flex gap-1 w-full"
                    >
                        <span>Войти через</span>
                        <IconBrandYandex
                            strokeWidth="1.5"
                            className="text-input"
                        />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
