import { Link, Redirect, Route, Router, Switch } from "wouter";
import { pb } from "./lib/pb-client";
import { AuthPage } from "./pages/auth";
import { invalidateUser, logoutUser, useUser } from "./lib/use-user";
import { Button } from "./components/ui/button";
import { useQueryClient } from "react-query";
import { IconLoader } from "@tabler/icons-react";
import { FullscreenLoader } from "./components/loaders";
import { MainPage } from "./pages/main";
import { GridPage } from "./pages/grid";
import { AddPromptPage } from "./pages/add-prompt";

function App() {
    const {
        isSuccess: isAuthed,
        refetch: refetchUser,
        isLoading
    } = useUser(false);
    const qc = useQueryClient();

    if (isLoading) {
        return <FullscreenLoader title="Загрузка..." />;
    }

    if (!isAuthed) {
        return (
            <AuthPage
                onSuccess={(user) => {
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
            {/* TODO: nav menu from shadcn */}
            <div className="flex gap-2 items-center">
                <Link
                    href="some page"
                    className="bg-primary p-2 rounded text-input"
                >
                    Some page
                </Link>
                <Link
                    href="/grid"
                    className="bg-primary p-2 rounded text-input"
                >
                    Grid
                </Link>
                <Link
                    href="/generate"
                    className="bg-primary p-2 rounded text-input"
                >
                    Add
                </Link>
                <Button
                    onClick={() => {
                        console.log("logout");
                        logoutUser();
                        invalidateUser(qc).then(() => refetchUser());
                    }}
                >
                    Logout
                </Button>
            </div>

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
