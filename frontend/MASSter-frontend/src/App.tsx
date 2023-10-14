import { Link, Redirect, Route, Switch } from "wouter";
import { AuthPage } from "./pages/auth";
import { invalidateUser, logoutUser, useUser } from "./lib/use-user";
import { useQueryClient } from "react-query";
import { FullscreenLoader } from "./components/loaders";
import { MainPage } from "./pages/main";
import { GridPage } from "./pages/grid";
import { AddPromptPage } from "./pages/add-prompt";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from "./components/ui/navigation-menu";
import {
    IconBrush,
    IconLogout,
    IconPhoto,
    IconUser
} from "@tabler/icons-react";
import clsx from "clsx";

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
            <NavigationMenu className="mx-auto mb-4 border-b-2 border-gray-200">
                <NavigationMenuList className="justify-between flex">
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
                        <Link href="/generate">
                            <NavigationMenuLink className="flex gap-1">
                                <IconBrush />
                                <span>создать дизайн</span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem
                        className={clsx(navigationMenuTriggerStyle())}
                    >
                        <NavigationMenuLink className="flex gap-1">
                            <IconUser />
                            <span>{user.record["username"]}</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem
                        className={clsx(navigationMenuTriggerStyle())}
                    >
                        <NavigationMenuLink
                            className="flex gap-1"
                            onClick={() => {
                                console.log("logout");
                                logoutUser();
                                invalidateUser(qc).then(() => refetchUser());
                            }}
                        >
                            <IconLogout />
                            <span>выйти</span>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

            <Switch>
                <Route path="/" component={MainPage} />
                <Route path="/grid" component={GridPage} />
                <Route path="/generate">
                    <AddPromptPage />
                </Route>
                <Route>
                    <Redirect to="/" />
                </Route>
            </Switch>
        </div>
    );
}

export default App;
