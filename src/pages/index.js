import AdminCP from "@/components/admin";
import Login from "@/components/welcome/login";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useState } from 'react';
import { useLayoutContext } from '@/contexts/layoutContext';
import Register from "@/components/welcome/register";
import Image from "next/legacy/image";
import styles from "@/styles/Home.module.css";

const Home = () => {
    const { user: sessionUser, loggedinStatus } = useLayoutContext();
    const [isLogin, setIsLogin] = useState(true); // Initialize the state for form toggle

    return (
        <>
            {loggedinStatus === 'authenticated' ? (
                <AdminCP sessionUser={sessionUser} />
            ) : (
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <Container className="py-3">
                        <Row className="align-items-center">
                            <Col xs={12} md={6} className="mb-4 mb-md-0"> {/* Full width on small screens, half width on medium */}
                                <Image
                                    src="/wallpaper.jpg"
                                    className={styles.wallpaper}
                                    alt="Wallpaper"
                                    width={636}
                                    height={636}
                                    quality={100}
                                    layout="responsive"
                                    priority
                                />
                            </Col>
                            <Col xs={12} md={6}> {/* Full width on small screens, half width on medium */}
                                {/* Toggle between Login and Register */}
                                {isLogin ? <Login /> : <Register />}

                                {/* Button to switch between Login and Register */}
                                <div className="mt-3 text-center">
                                    <p>OR</p>
                                    <hr />
                                    {isLogin ? (
                                        <>
                                            <p>Dont have an account? <br /><Button className="mt-2" variant="success" onClick={() => setIsLogin(false)}>Register</Button></p>
                                        </>
                                    ) : (
                                        <>
                                            <p>Already have an account? <br /><Button className="mt-2" variant="success" onClick={() => setIsLogin(true)}>Login</Button></p>
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            )}
        </>
    );
};

export default Home;
