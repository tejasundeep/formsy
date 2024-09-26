import Logout from '@/components/logout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Button, Modal, Form, Spinner } from 'react-bootstrap';

export default function Home() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', username: '', email: '', role: 'user', password: '' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [extraFields, setExtraFields] = useState([]);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrEditUser = (user = null) => {
        setSelectedUser(user);
        if (user) {
            setFormData({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email, role: user.role, password: '' });
            setExtraFields(Object.keys(user).filter(key => !['first_name', 'last_name', 'username', 'email', 'role', 'password', 'id', 'created_at'].includes(key))
                .map(key => ({ label: key, value: user[key] })));
        } else {
            setFormData({ first_name: '', last_name: '', username: '', email: '', role: 'user', password: '' });
            setExtraFields([]);
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSubmit = async () => {
        let finalData = { ...formData };
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

    const handleAddField = () => setExtraFields([...extraFields, { label: '', value: '' }]);
    const handleRemoveField = (index) => setExtraFields(extraFields.filter((_, i) => i !== index));
    const handleFieldChange = (index, key, value) => setExtraFields(extraFields.map((field, i) => i === index ? { ...field, [key]: value } : field));

    const roles = [
        { label: 'User', value: 'user' },
        { label: 'Administrator', value: 'admin' },
        { label: 'Super Admin', value: 'super-admin' },
    ];

    function capitalizeText(name) {
        return name.replace('_', ' ').replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    const renderFormFields = () => (
        <>
            {['first_name', 'last_name', 'username', 'email'].map((field, index) => (
                <Form.Group className="mb-3" key={index}>
                    <Form.Label>{capitalizeText(field)}</Form.Label>
                    <Form.Control type={field === 'email' ? 'email' : 'text'} value={formData[field] || ''} placeholder={`Enter ${capitalizeText(field)}`} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} />
                </Form.Group>
            ))}
            <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control as="select" value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    {roles.map((role, index) => <option key={index} value={role.value}>{role.label}</option>)}
                </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Password {selectedUser && "(leave blank to keep existing)"}</Form.Label>
                <Form.Control type="password" placeholder={selectedUser ? "Enter new password if changing" : "Enter password"} value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </Form.Group>

            {/* Dynamic Fields */}
            {extraFields.map((field, index) => (
                <div key={index} className="d-flex mb-3">
                    <Form.Control type="text" placeholder="Label" className="me-2" value={field.label} onChange={(e) => handleFieldChange(index, 'label', e.target.value)} />
                    <Form.Control type="text" placeholder="Value" className="me-2" value={field.value} onChange={(e) => handleFieldChange(index, 'value', e.target.value)} />
                    <Button variant="danger" onClick={() => handleRemoveField(index)}>-</Button>
                </div>
            ))}
            <Button variant="success" onClick={handleAddField}>+ Add Field</Button>
        </>
    );

    if (loading) return <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner></Container>;

    return (
        <Container>
            <Row className="my-4">
                <Col><h1 className="text-center">Users List</h1></Col>
                <Col><Logout /></Col>
            </Row>
            <Row>
                <Col>
                    <Button className="mb-3" onClick={() => handleAddOrEditUser()}>Add User</Button>
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
                                        <Button variant="primary" onClick={() => handleAddOrEditUser(user)}>Edit</Button>{' '}
                                        <Button variant="danger" onClick={() => handleDelete(user.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>{selectedUser ? 'Edit User' : 'Add User'}</Modal.Title></Modal.Header>
                <Modal.Body><Form>{renderFormFields()}</Form></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
