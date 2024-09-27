import { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { religionOptions, religionToCastMap } from '@/components/groups';

export default function RegisterPage() {
    const router = useRouter();

    const initialFormState = {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        religion: '',
        cast: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // State for success message
    const [castOptions, setCastOptions] = useState([]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccess('Registration successful! Please log in.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000); // Redirect after 2 seconds
            } else {
                const result = await response.json();
                setError(result.message || 'Registration failed');
            }
        } catch (error) {
            setError('Error during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes and update cast options when religion is selected
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'religion') {
            setCastOptions(religionToCastMap[value] || []);
            setFormData({ ...formData, cast: '' });
        }
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h2 className="my-4">Register</h2>

                    {success && (
                        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                            {success}
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        {/* First Name and Last Name */}
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="first_name"
                                        placeholder="Enter first name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="last_name"
                                        placeholder="Enter last name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Username and Email */}
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        placeholder="Enter username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Password and Religion */}
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Religion</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="religion"
                                        value={formData.religion}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Religion</option>
                                        {religionOptions.map((religion, index) => (
                                            <option key={index} value={religion}>
                                                {religion}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Cast */}
                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cast</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="cast"
                                        value={formData.cast}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Cast</option>
                                        {castOptions.map((cast, index) => (
                                            <option key={index} value={cast}>
                                                {cast}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
