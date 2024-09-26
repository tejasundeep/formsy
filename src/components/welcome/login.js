import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Alert, Button, Form, Row, Col } from "react-bootstrap";

function Login() {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const { email, password } = credentials;

        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            router.push(result.url || "/");
        }
    }, [credentials, router]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    }, []);

    return (
        <>
            <h1>Login</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6} className="my-2">
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="text"
                                name="email"
                                value={credentials.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                autoComplete="off"
                            />
                        </Form.Group>
                    </Col>
                    
                    <Col md={6} className="my-2">
                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleInputChange}
                                placeholder="Password"
                                autoComplete="off"
                            />
                        </Form.Group>
                        </Col>
                </Row>

                <Button variant="primary" type="submit">
                    Log in
                </Button>
            </Form>
        </>
    );
}

export default Login;
