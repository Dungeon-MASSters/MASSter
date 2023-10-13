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

const ACCEPTED_IMAGE_TYPES = ["video/mp4"];

export function AddSimplePromptCard() {
    const [isSubmited, setIsSubmited] = useState(false);
    const [isError, setIsError] = useState(false);

    const user = useUser(false);

    const FormSchema = z.object({
        video: z
            .custom<File>((v) => v instanceof File, {
                message: "Нужно загрузить видеоролик"
            })
            .refine(
                (files) => ACCEPTED_IMAGE_TYPES.includes(files.type),
                "Пока мы поддерживаем только .mp4 видеоролики :("
            )
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    });
    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = (data) => {
        console.log("submit", data);
        const formData = new FormData();
        formData.append("video", data.video);
        formData.append("created_by", user.data?.record.id ?? "");
        formData.append("num_images", "3");
        formData.append("status", "open");
        pb.collection("text_generation_mvp")
            .create(formData)
            .then((res) => {
                // redirect to list
                console.log(res);
            })
            .catch((err) => {
                // show fuck message
                console.error(err);
                setIsError(true);
                setIsSubmited(false);
            });
        setIsSubmited(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Простая генерация</CardTitle>
                <CardDescription>
                    Генерация только на основе видеоролика
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

export function AddAdvancedPromptCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Продвинутая генерация</CardTitle>
                <CardDescription>
                    Генерация на основе видеоролика с указанием дополнительных
                    параметров
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-2 flex-col flex"></CardContent>
        </Card>
    );
}

export function AddPromptPage() {
    return (
        <div className="py-4 w-full flex justify-center">
            <Tabs defaultValue="simple" className="w-[600px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simple">Простой</TabsTrigger>
                    <TabsTrigger value="advanced">Продвинутый</TabsTrigger>
                </TabsList>
                <TabsContent value="simple">
                    <AddSimplePromptCard />
                </TabsContent>
                <TabsContent value="advanced">
                    <AddAdvancedPromptCard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
