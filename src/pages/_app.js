import { SessionProvider } from "next-auth/react";
import { LayoutProvider } from "@/contexts/layoutContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}) {
    return (
        <SessionProvider session={session}>
            <LayoutProvider>
                <Component {...pageProps} />
            </LayoutProvider>
        </SessionProvider>
    );
}
