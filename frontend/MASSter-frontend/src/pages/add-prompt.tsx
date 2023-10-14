import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/use-user";
import { useState } from "react";
import { IconLoader3 } from "@tabler/icons-react";
import { useLocation } from "wouter";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    VideoCoverAdvancedPromptForm,
    VideoCoverSimplePromptForm
} from "@/components/video-cover-prompt";
import {
    BannerAdvancedPromptForm,
    BannerSimplePromptForm
} from "@/components/banner-prompt";
import {
    AvatarAdvancedPromptForm,
    AvatarSimplePromptForm
} from "@/components/avatar-prompt";

export function AddPromptPage() {
    const { data: user, isLoading } = useUser(false);
    const [advancedMode, setAdvancedMode] = useState(false);
    const [_, navigate] = useLocation();

    if (isLoading || user === undefined) {
        return <IconLoader3 className="text-primary animate-spin mx-auto" />;
    }

    return (
        <div className="py-4 w-fit mx-auto flex flex-col gap-4">
            <h1 className="font-bold text-xl">
                Создать дизайн при помощи нейросети!
            </h1>

            <div className="flex items-center space-x-2">
                <Switch
                    id="enable-advanced"
                    checked={advancedMode}
                    onCheckedChange={setAdvancedMode}
                />
                <Label htmlFor="enable-advanced">
                    {advancedMode ? "Продвинутый режим" : "Простой режим"}
                </Label>
            </div>

            <Tabs defaultValue="video-cover" className="w-[600px]">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="video-cover">Обложка видео</TabsTrigger>
                    <TabsTrigger value="banner">Баннер канала</TabsTrigger>
                    <TabsTrigger value="avatar">Автарка канала</TabsTrigger>
                </TabsList>
                <TabsContent value="video-cover">
                    {advancedMode ? (
                        <VideoCoverAdvancedPromptForm
                            user={user}
                            onSuccess={() => {
                                navigate("/grid");
                            }}
                            onError={() => {}}
                        />
                    ) : (
                        <VideoCoverSimplePromptForm
                            user={user}
                            onSuccess={() => {
                                navigate("/grid");
                            }}
                            onError={() => {}}
                        />
                    )}
                </TabsContent>
                <TabsContent value="banner">
                    {advancedMode ? (
                        <BannerAdvancedPromptForm
                            user={user}
                            onSuccess={() => {
                                navigate("/grid");
                            }}
                            onError={() => {}}
                        />
                    ) : (
                        <BannerSimplePromptForm
                            user={user}
                            onSuccess={() => {
                                navigate("/grid");
                            }}
                            onError={() => {}}
                        />
                    )}
                </TabsContent>
                <TabsContent value="avatar">
                    {advancedMode ? (
                        <AvatarAdvancedPromptForm
                            user={user}
                            onSuccess={() => {
                                navigate("/grid");
                            }}
                            onError={() => {}}
                        />
                    ) : (
                        <AvatarSimplePromptForm
                            user={user}
                            onSuccess={() => {
                                navigate("/grid");
                            }}
                            onError={() => {}}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
