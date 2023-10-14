import { ACCEPTED_VIDEO_TYPES } from "@/lib/consts";
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

export function VideoCoverSimplePromptForm({
    user,
    onSuccess = () => {},
    onError = () => {}
}: {
    user: RecordAuthResponse<RecordModel>;
    onSuccess: (res: RecordModel) => void;
    onError: (err: any) => void;
}) {
    const FormSchema = z.object({
        video: z
            .custom<File>((v) => v instanceof File, {
                message: "Нужно загрузить видеоролик"
            })
            .refine(
                (v) => ACCEPTED_VIDEO_TYPES.includes(v.type),
                "Пока мы поддерживаем только .mp4 видеоролики :("
            )
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    });

    const getFormData = () => {
        const formData = new FormData();
        formData.append("created_by", user.record.id);
        formData.append("status", "open");
        formData.append("type", "video");
        formData.append("num_images", "3");
        formData.append("video", form.getValues().video);
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
                <CardTitle>Генерация обложки видео</CardTitle>
                <CardDescription>
                    Простой режим генерации обложки для видео, в качестве
                    входных данных используется только видеофайл
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
                                    name="video"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Видеоролик</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
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
