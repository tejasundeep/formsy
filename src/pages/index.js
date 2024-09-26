import Logout from '@/components/logout';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { Table, Container, Row, Col, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useLayoutContext } from '@/contexts/layoutContext';

export default function Home() {
    const { user: sessionUser } = useLayoutContext();

    // Initial form state
    const initialFormState = {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        role: sessionUser?.role === 'super-admin' ? 'admin' : 'user',
        password: ''
    };

    // State variables
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [selectedUser, setSelectedUser] = useState(null);
    const [extraFields, setExtraFields] = useState([]);

    const roles = [
        { label: 'User', value: 'user' },
        { label: 'Administrator', value: 'admin' },
        { label: 'Super Admin', value: 'super-admin' },
    ];

    // Filter users based on role
    const filterUsersByRole = useCallback((data) => {
        if (sessionUser?.role === 'super-admin') {
            setUsers(data.filter(user => user.role === 'admin'));
        } else if (sessionUser?.role === 'admin') {
            setUsers(data.filter(user => user.role === 'user'));
        } else {
            setUsers([]);
        }
    }, [sessionUser?.role]);

    // Fetch users based on the logged-in user's role
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            filterUsersByRole(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [filterUsersByRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Open modal for adding or editing a user
    const handleAddOrEditUser = (user = null) => {
        setSelectedUser(user);
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
                role: user.role,
                password: ''
            });
            setExtraFields(extractExtraFields(user));
        } else {
            setFormData(initialFormState);
            setExtraFields([]);
        }
        setShowModal(true);
    };

    const extractExtraFields = (user) => (
        Object.keys(user)
            .filter(key => !['first_name', 'last_name', 'username', 'email', 'role', 'password', 'id', 'created_at'].includes(key))
            .map(key => ({ label: key, value: user[key] }))
    );

    // Handle user deletion
    const handleDelete = async (id) => {
        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Handle user form submission (add or update)
    const handleSubmit = async () => {
        const finalData = { ...formData };
        extraFields.forEach(field => { finalData[field.label.toLowerCase()] = field.value; });
        if (!finalData.password) delete finalData.password;

        try {
            const method = selectedUser ? 'PUT' : 'POST';
            const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    // Handle changes to dynamic fields
    const handleFieldChange = (index, key, value) => {
        setExtraFields(extraFields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
    };

    const getAvailableRoles = () => {
        if (sessionUser?.role === 'super-admin') return roles.filter(role => role.value === 'admin');
        if (sessionUser?.role === 'admin') return roles.filter(role => role.value === 'user');
        return [];
    };

    const capitalizeText = (text) =>
        text.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    // Render form fields dynamically
    const renderFormFields = () => (
        <>
            {['first_name', 'last_name', 'username', 'email'].map((field, index) => (
                <Form.Group className="mb-3" key={index}>
                    <Form.Label>{capitalizeText(field)}</Form.Label>
                    <Form.Control
                        type={field === 'email' ? 'email' : 'text'}
                        value={formData[field]}
                        placeholder={`Enter ${capitalizeText(field)}`}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    />
                </Form.Group>
            ))}
            <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                    as="select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    {getAvailableRoles().map((role, index) => (
                        <option key={index} value={role.value}>{role.label}</option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Password {selectedUser && "(leave blank to keep existing)"}</Form.Label>
                <Form.Control
                    type="password"
                    placeholder={selectedUser ? "Enter new password if changing" : "Enter password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </Form.Group>
            {extraFields.map((field, index) => (
                <div key={index} className="d-flex mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Label"
                        className="me-2"
                        value={field.label}
                        onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    />
                    <Form.Control
                        type="text"
                        placeholder="Value"
                        className="me-2"
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                    />
                    <Button variant="danger" onClick={() => setExtraFields(extraFields.filter((_, i) => i !== index))}>-</Button>
                </div>
            ))}
            <Button variant="success" onClick={() => setExtraFields([...extraFields, { label: '', value: '' }])}>+ Add Field</Button>
        </>
    );

    if (loading) return <LoadingScreen />;

    return (
        <Container>
            <Header />
            <Row>
                <Col>
                    <Button className="mb-3" onClick={() => handleAddOrEditUser()}>Add User</Button>
                    <UsersTable users={users} roles={roles} onEdit={handleAddOrEditUser} onDelete={handleDelete} />
                </Col>
            </Row>

            <UserModal
                showModal={showModal}
                setShowModal={setShowModal}
                selectedUser={selectedUser}
                renderFormFields={renderFormFields}
                handleSubmit={handleSubmit}
            />
        </Container>
    );
}

// Loading screen component
const LoadingScreen = () => (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </Container>
);

// Header component with the title and logout button
const Header = () => (
    <Row className="my-4">
        <Col><h1 className="text-center">Users List</h1></Col>
        <Col><Logout /></Col>
    </Row>
);

// Users table component that displays users and action buttons
const UsersTable = ({ users, roles, onEdit, onDelete }) => (
    <Table striped bordered hover responsive>
        <thead className="table-dark">
            <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {users.map(user => (
                <tr key={user.id}>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{roles.find(r => r.value === user.role)?.label || user.role}</td>
                    <td>
                        <Link href={`/profile/${user.username}`} className='btn btn-secondary mx-1'>View</Link>
                        <Button variant="primary" onClick={() => onEdit(user)}>Edit</Button>{' '}
                        <Button variant="danger" onClick={() => onDelete(user.id)}>Delete</Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
);

// Modal component to handle user addition and editing
const UserModal = ({ showModal, setShowModal, selectedUser, renderFormFields, handleSubmit }) => (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>{selectedUser ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body><Form>{renderFormFields()}</Form></Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
        </Modal.Footer>
    </Modal>
);
