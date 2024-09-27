import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { religionOptions, religionToCastMap } from '@/components/groups';
import Script from 'next/script'; // Import Razorpay script

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
    const [success, setSuccess] = useState('');
    const [castOptions, setCastOptions] = useState([]);

    // Create Razorpay payment order on the server
    const createOrder = async () => {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 500, // The amount is set to 500 INR
                currency: 'INR',
                receipt: `receipt_${formData.username}`,
            }),
        });

        if (!response.ok) throw new Error('Failed to create payment order');
        return response.json();
    };

    // Handle payment success and complete user registration
    const handlePaymentSuccess = async (paymentResponse) => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    payment_id: paymentResponse.razorpay_payment_id,
                }),
            });

            if (response.ok) {
                setSuccess('Registration successful! Please log in.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
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

    // Handle Razorpay payment window
    const handlePayment = async (order) => {
        const options = {
            key: process.env.RAZORPAY_KEY_ID, // Razorpay key ID from environment
            amount: order.amount,
            currency: order.currency,
            name: 'My Website',
            description: 'Registration Fee',
            order_id: order.id,
            handler: handlePaymentSuccess,
            prefill: {
                name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
            },
            theme: {
                color: '#3399cc',
            },
            modal: {
                ondismiss: () => {
                    setError('Payment cancelled. Please try again.');
                    setLoading(false);
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const order = await createOrder();
            await handlePayment(order);
        } catch (error) {
            setError('Payment failed. Please try again.');
            setLoading(false);
        }
    };

    // Handle input change and update cast options when religion is selected
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'religion') {
            setCastOptions(religionToCastMap[value] || []);
            setFormData({ ...formData, [name]: value, cast: '' }); // Reset cast when religion changes
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    return (
        <Container>
            {/* Razorpay Script */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

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
