import {
    ACCEPTED_IMAGE_TYPES,
    STYLES
} from "@/lib/consts";
import { pb } from "@/lib/pb-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecordAuthResponse, RecordModel } from "pocketbase";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card";
import { IconBug, IconLoader3 } from "@tabler/icons-react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useQuery } from "react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select";

export function BannerSimplePromptForm({
    user,
    onSuccess = () => {},
    onError = () => {}
}: {
    user: RecordAuthResponse<RecordModel>;
    onSuccess: (res: RecordModel) => void;
    onError: (err: any) => void;
}) {
    const FormSchema = z.object({
        prompt: z.string().min(3).max(500)
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    });

    const getFormData = () => {
        const formData = new FormData();
        formData.append("created_by", user.record.id);
        formData.append("status", "open");
        formData.append("type", "banner");
        formData.append("num_images", "1");
        formData.append("prompt", form.getValues().prompt);
        return formData;
    };

    const submitQuery = useQuery(
        ["add-video-cover-simple-prompt"],
        () => pb.collection("text_generation_mvp").create(getFormData()),
        {
            enabled: false,
            onSuccess: onSuccess,
            onError: onError
        }
    );

    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = (data) => {
        console.log("submit", data);
        submitQuery.refetch();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Генерация баннера</CardTitle>
                <CardDescription>
                    Простой режим генерации баннера, в качестве входных данных
                    используется только текстовое описание
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-2 flex-col flex">
                {submitQuery.isFetching ? (
                    <IconLoader3 className="text-primary animate-spin mx-auto" />
                ) : (
                    <>
                        {submitQuery.isError && (
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
                                            <FormLabel>Описание</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Описание"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Текстовое описание того, что
                                                должно быть на баннере
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

export function BannerAdvancedPromptForm({
    user,
    onSuccess = () => {},
    onError = () => {}
}: {
    user: RecordAuthResponse<RecordModel>;
    onSuccess: (res: RecordModel) => void;
    onError: (err: any) => void;
}) {
    const FormSchema = z.object({
        prompt: z.string().min(3).max(500),
        negativePrompt: z.string().max(500).optional(),
        style: z.string().default("Нет"),
        inputImage: z
            .custom<FileList>((v) => v instanceof FileList, {
                message: "Нужно загрузить картинки для референса"
            })
            .refine((files) => {
                for (let file of files) {
                    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                        return false;
                    }
                }
                return true;
            }, "Пока мы поддерживаем только .png и .jpg изображения")
            .optional(),
        // video: z
        //     .custom<File>((v) => v instanceof File, {
        //         message: "Нужно загрузить видеоролик"
        //     })
        //     .refine(
        //         (v) => ACCEPTED_VIDEO_TYPES.includes(v.type),
        //         "Пока мы поддерживаем только .mp4 видеоролики :("
        //     )
        //     .optional(),
        numImages: z.coerce.number().min(1).max(3).default(1)
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    });

    const getFormData = () => {
        const data = form.getValues();
        const formData = new FormData();
        formData.append("created_by", user.record.id);
        formData.append("prompt", data.prompt);
        if (data.negativePrompt) {
            formData.append("negative_prompt", data.negativePrompt);
        }
        formData.append("style", data.style);
        formData.append("status", "open");
        formData.append("type", "banner");
        formData.append("num_images", `${data.numImages}`);

        if (data.inputImage) {
            for (let file of data.inputImage) {
                formData.append("input_image", file);
            }
        }
        // if (data.video) {
        //     formData.append("video", data.video);
        // }
        return formData;
    };

    const submitQuery = useQuery(
        ["add-video-cover-simple-prompt"],
        () => pb.collection("text_generation_mvp").create(getFormData()),
        {
            enabled: false,
            onSuccess: onSuccess,
            onError: onError
        }
    );

    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = (data) => {
        console.log("submit", data);
        submitQuery.refetch();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Генерация баннера</CardTitle>
                <CardDescription>
                    Продвинутый режим генерации баннера для канала, в качестве
                    входных данных можно использовать описание желаемого
                    результата, выбор стиля и другие параметры
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-2 flex-col flex">
                {submitQuery.isFetching ? (
                    <IconLoader3 className="text-primary animate-spin mx-auto" />
                ) : (
                    <>
                        {submitQuery.isError && (
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
                                            <FormLabel>Описание</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Описание"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Текстовое описание того, что
                                                должно быть на баннере
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
                                            <FormLabel>Запреты</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Описание"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Чего не должно быть на баннере
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
                                                defaultValue={STYLES[0]}
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
                                                Стиль для генерации баннера
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

                                <Button type="submit">Сгенерировать</Button>
                            </form>
                        </Form>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
