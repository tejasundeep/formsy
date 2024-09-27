import AdminCP from "@/components/admin";
import Login from "@/components/welcome/login";
import { Container } from "react-bootstrap";
import { useLayoutContext } from '@/contexts/layoutContext';
import RegisterPage from "@/components/welcome/register";

const Home = () => {
    const { user: sessionUser, loggedinStatus } = useLayoutContext();
    return (

        <Container>
            {loggedinStatus === 'authenticated' ? (
                <AdminCP sessionUser={sessionUser} />
            ) : (
                <>
                    <Login />
                    <RegisterPage />                
                </>

            )}
        </Container>
    )
}

export default Home;