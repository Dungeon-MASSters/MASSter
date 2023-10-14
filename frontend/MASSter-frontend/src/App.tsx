import { Link, Redirect, Route, Switch } from "wouter";
import { AuthPage } from "./pages/auth";
import { invalidateUser, logoutUser, useUser } from "./lib/use-user";
import { useQueryClient } from "react-query";
import { FullscreenLoader } from "./components/loaders";
import { GridPage } from "./pages/grid";
import { AddPromptPage } from "./pages/add-prompt";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "./components/ui/navigation-menu";
import {
    IconBrush,
    IconLogout,
    IconPhoto,
    IconPhotoStar,
    IconUser
} from "@tabler/icons-react";
import clsx from "clsx";
import { EditorPage } from "./pages/editor";
import { EditedCoversPage } from "./pages/edited";

function App() {
    const {
        isSuccess: isAuthed,
        refetch: refetchUser,
        isLoading,
        data: user
    } = useUser(false);
    const qc = useQueryClient();

    if (isLoading) {
        return <FullscreenLoader title="Загрузка..." />;
    }

    if (!isAuthed) {
        return (
            <AuthPage
                onSuccess={() => {
                    console.log("user is authed");
                    invalidateUser(qc).then(() => refetchUser());
                }}
                onError={(error) => {
                    console.error("user is not authed", error);
                    refetchUser();
                }}
            />
        );
    }

    return (
        <div className="container">
            <NavigationMenu className="mx-auto my-2 border-b-2 border-gray-200">
                <NavigationMenuList className="flex flex-col sm:flex-row">
                    <NavigationMenuItem
                        className={clsx(navigationMenuTriggerStyle())}
                    >
                        <Link href="/grid">
                            <NavigationMenuLink className="flex gap-1">
                                <IconPhoto />
                                <span>результаты генерации</span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem
                        className={clsx(navigationMenuTriggerStyle())}
                    >
                        <Link href="/gallery">
                            <NavigationMenuLink className="flex gap-1">
                                <IconPhotoStar />
                                <span>галерея</span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem
                        className={clsx(navigationMenuTriggerStyle())}
                    >
                        <Link href="/generate">
                            <NavigationMenuLink className="flex gap-1">
                                <IconBrush />
                                <span>создать дизайн</span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    {/* <NavigationMenuItem
                        className={clsx(navigationMenuTriggerStyle())}
                    >
                        <Link href="/editor">
                            <NavigationMenuLink className="flex gap-1">
                                <IconFrame />
                                <span>редактор</span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem> */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="flex gap-1">
                            <IconUser />
                            <span>{user.record["username"]}</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="p-2 font-bold">
                                Вы вошли как {user.record["username"]}
                            </div>

                            <NavigationMenuLink
                                className="flex gap-1 w-[300px] p-2 hover:bg-secondary hover:text-secondary-foreground"
                                onClick={() => {
                                    console.log("logout");
                                    logoutUser();
                                    invalidateUser(qc).then(() =>
                                        refetchUser()
                                    );
                                }}
                            >
                                <IconLogout />
                                <span>выйти</span>
                            </NavigationMenuLink>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

            <Switch>
                <Route path="/grid" component={GridPage} />
                <Route path="/gallery" component={EditedCoversPage} />
                <Route path="/generate">
                    <AddPromptPage />
                </Route>

                <Route path="/editor/:file_url">
                    {(params) => <EditorPage fileUrlB64={params.file_url} />}
                </Route>
                <Route>
                    <Redirect to="/generate" />
                </Route>
            </Switch>
        </div>
    );
}

export default App;
