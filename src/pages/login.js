import Head from "next/head";
import Login from "@/components/welcome/login";
import Logout from "@/components/logout";
import { Container } from "react-bootstrap";
import { useLayoutContext } from "@/contexts/layoutContext";

function MainComponent() {
    const { user, loggedinStatus } = useLayoutContext();
    console.log(user);
    return (
        <>
            <Head>
                <title>AdminCP - US Relocation</title>
                <meta name="description" content="Generated by US Relocation" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Container>
                {loggedinStatus === 'authenticated' ? (
                    <>
                        <Logout />
                    </>
                ) : (
                    <>
                        <Login />
                    </>
                )}
            </Container>
        </>
    );
}

export default MainComponent;
