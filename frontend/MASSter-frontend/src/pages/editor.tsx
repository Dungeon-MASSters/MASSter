import { FullscreenLoader } from "@/components/loaders";
import { pb } from "@/lib/pb-client";
import { useUser } from "@/lib/use-user";
import { IconBug } from "@tabler/icons-react";
import { useState } from "react";
import FilerobotImageEditor, {
    TABS,
    TOOLS
} from "react-filerobot-image-editor";
import { useLocation } from "wouter";

export function EditorPage({ fileUrlB64 }: { fileUrlB64: string }) {
    const [_, navigate] = useLocation();
    const user = useUser(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isError, setIsError] = useState(false);

    const fileUrl = atob(fileUrlB64);

    if (user.isLoading || user.data === undefined) {
        return <FullscreenLoader title={"Загрузка..."} />;
    }

    if (isSaving) {
        return <FullscreenLoader title="Сохранение..." />;
    }

    return (
        <div className="mx-auto w-fit h-[500px]">
            <h1 className="font-bold text-xl">Создать обложку</h1>

            {isError && (
                <div className="flex gap-1 text-red-500">
                    <IconBug />
                    <span>Не получилось сохранить изображение</span>
                </div>
            )}

            <FilerobotImageEditor
                source={fileUrl}
                savingPixelRatio={4}
                previewPixelRatio={window.devicePixelRatio}
                onBeforeSave={() => {
                    return false;
                }}
                onSave={(editedImageObject, _) => {
                    setIsSaving(true);

                    editedImageObject.imageCanvas?.toBlob((blob) => {
                        if (blob === null) {
                            setIsError(true);
                            return;
                        }

                        const formData = new FormData();
                        formData.append("created_by", user.data.record.id);
                        formData.append(
                            "result",
                            blob,
                            editedImageObject.fullName ?? "cover.png"
                        );

                        pb.collection("edited_covers")
                            .create(formData)
                            .then(() => {
                                console.log("saved");
                                navigate("/gallery");
                            })
                            .catch(() => setIsError(true));
                    });
                }}
                onClose={() => {}}
                annotationsCommon={{
                    fill: "#ffffff"
                }}
                Text={{
                    text: "Обложкер",
                    fontSize: 32,
                    fontStyle: "bold",
                    align: "center"
                }}
                Rotate={{ angle: 90, componentType: "slider" }}
                Crop={{
                    presetsItems: [
                        {
                            titleKey: "classicTv",
                            descriptionKey: "4:3",
                            ratio: 4 / 3
                            // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
                        },
                        {
                            titleKey: "cinemascope",
                            descriptionKey: "21:9",
                            ratio: 21 / 9
                            // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
                        }
                    ],
                    presetsFolders: [
                        {
                            titleKey: "socialMedia", // will be translated into Social Media as backend contains this translation key
                            // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
                            groups: [
                                {
                                    titleKey: "facebook",
                                    items: [
                                        {
                                            titleKey: "profile",
                                            width: 180,
                                            height: 180,
                                            descriptionKey: "fbProfileSize"
                                        },
                                        {
                                            titleKey: "coverPhoto",
                                            width: 820,
                                            height: 312,
                                            descriptionKey: "fbCoverPhotoSize"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }}
                tabsIds={[TABS.ADJUST, TABS.ANNOTATE]} // or {['Adjust', 'Annotate', 'Watermark']}
                defaultTabId={TABS.ANNOTATE} // or 'Annotate'
                defaultToolId={TOOLS.TEXT} // or 'Text'
            />
        </div>
    );
}
