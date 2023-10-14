import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { pb } from "@/lib/pb-client";
import { useUser } from "@/lib/use-user";
import { useState } from "react";
import { IconBug, IconLoader3 } from "@tabler/icons-react";
import { useLocation } from "wouter";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    VideoCoverAdvancedPromptForm,
    VideoCoverSimplePromptForm
} from "@/components/video-cover-prompt";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ACCEPTED_VIDEO_TYPES = ["video/mp4"];
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg"];

const STYLES = ["Киберпанк", "Фэнтези", "Ретро", "Вестерн"];

export function AddAdvancedPromptCard() {
    const [_, navigate] = useLocation();

    const [isSubmited, setIsSubmited] = useState(false);
    const [isError, setIsError] = useState(false);

    const user = useUser(false);

    const FormSchema = z.object({
        prompt: z.string().min(3).max(500), // TODO: limits?
        negativePrompt: z.string().max(500).optional(),
        style: z.string(),
        inputImage: z
            .custom<FileList>((v) => v instanceof FileList, {
                message: "Нужно загрузить картинки для референса"
            })
            .refine((files) => {
                for (let i = 0; i < files.length; i++) {
                    if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) {
                        return false;
                    }
                }
                return true;
            }, "Пока мы поддерживаем только .png и .jpg изображения")
            .optional(),
        video: z
            .custom<File>((v) => v instanceof File, {
                message: "Нужно загрузить видеоролик"
            })
            .refine(
                (files) => ACCEPTED_VIDEO_TYPES.includes(files.type),
                "Пока мы поддерживаем только .mp4 видеоролики :("
            )
            .optional(),
        numImages: z.coerce.number().min(1).max(10)
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    });
    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = (data) => {
        console.log("submit", data);
        const formData = new FormData();
        formData.append("created_by", user.data?.record.id ?? "");
        formData.append("prompt", data.prompt);
        if (data.negativePrompt) {
            formData.append("negative_prompt", data.negativePrompt);
        }
        formData.append("style", data.style);
        for (let file in data.inputImage) {
            formData.append("input_image", file);
        }
        if (data.video) {
            formData.append("video", data.video);
        }
        formData.append("status", "open");
        formData.append("num_images", `${data.numImages}`);
        pb.collection("text_generation_mvp")
            .create(formData)
            .then(() => {
                navigate("/grid");
            })
            .catch((err) => {
                console.error(err);
                setIsError(true);
                setIsSubmited(false);
            });
        setIsSubmited(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Продвинутая генерация</CardTitle>
                <CardDescription>
                    Генерация на основе видеоролика с указанием дополнительных
                    параметров
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-2 flex-col flex">
                {isSubmited ? (
                    <IconLoader3 className="text-primary animate-spin mx-auto" />
                ) : (
                    <>
                        {isError && (
                            <div className="flex gap-1 text-red-500">
                                <IconBug />
                                <span>не получилось запустить генерацию</span>
                            </div>
                        )}
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col gap-2"
                            >
                                <FormField
                                    control={form.control}
                                    name="prompt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Промт (TODO: описание)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Промт"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Что должно быть на обложке
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="negativePrompt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Промт</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Негативный промт"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Чего НЕ ДОЛЖНО быть на обложке*
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="style"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Стиль</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выбрать стиль" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {STYLES.map((style) => (
                                                        <SelectItem
                                                            value={style}
                                                        >
                                                            {style}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Стиль для генерации обложки
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="numImages"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Количество вариантов
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Количество"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Сколько вариантов оформления
                                                сгенерировать
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="inputImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Референсы</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    multiple={true}
                                                    onBlur={field.onBlur}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.files
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Изображения похожие на желаемый
                                                результат
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="video"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Видеоролик</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    placeholder="shadcn"
                                                    accept="video/mp4"
                                                    onBlur={field.onBlur}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.files?.[0]
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Видеоролик, на основе которого
                                                будет сгенирована обложка
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit">Сгенерировать</Button>
                            </form>
                        </Form>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

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
                    {advancedMode ? "Продвинутый режим" : "Прстой режим"}
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
                    {advancedMode ? undefined : undefined}
                </TabsContent>
                <TabsContent value="avatar">
                    {advancedMode ? undefined : undefined}
                </TabsContent>
            </Tabs>
        </div>
    );
}
