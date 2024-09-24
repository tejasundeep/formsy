import { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Button, Modal, Form, Spinner } from 'react-bootstrap';

export default function Home() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // Flag to determine if editing or adding
    const [headers, setHeaders] = useState([]);
    const [extraFields, setExtraFields] = useState([]); // Store additional dynamic fields

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();

            // Collect all unique keys from all users
            const allKeys = new Set();
            data.forEach(user => {
                Object.keys(user).forEach(key => allKeys.add(key));
            });

            setHeaders([...allKeys]); // Convert the Set back to an array
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setIsEditing(true);
        setSelectedUser(user);
        setFormData(user);
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
        // Create a copy of formData
        let finalData = { ...formData };

        // Map extra fields into the formData object directly
        extraFields.forEach(field => {
            finalData[field.label.toLowerCase()] = field.value;
        });

        try {
            if (isEditing && selectedUser) {
                await fetch(`/api/users/${selectedUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData),
                });
            } else {
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData),
                });
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleAddUser = () => {
        setIsEditing(false);
        setFormData({ first_name: '', last_name: '', email: '', role: 'user' });
        setSelectedUser(null);
        setExtraFields([]); // Reset dynamic fields on adding new user
        setShowModal(true);
    };

    const handleAddField = () => {
        setExtraFields([...extraFields, { label: '', value: '' }]);
    };

    const handleRemoveField = (index) => {
        const updatedFields = [...extraFields];
        updatedFields.splice(index, 1);
        setExtraFields(updatedFields);
    };

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...extraFields];
        updatedFields[index][key] = value;
        setExtraFields(updatedFields);
    };

    const roles = [
        { label: 'User', value: 'user' },
        { label: 'Administrator', value: 'admin' },
        { label: 'Super Admin', value: 'super-admin' },
    ];

    const getRoleLabel = (roleValue) => {
        const role = roles.find(r => r.value === roleValue);
        return role ? role.label : roleValue;
    };

    const renderEditFormFields = () => {
        return headers.map((header, index) => {
            if (header === 'id' || header === 'created_at') {
                return null; // Skip read-only fields like 'id' and 'created_at'
            }
            if (header === 'role') {
                return (
                    <Form.Group className="mb-3" key={index}>
                        <Form.Label>{header.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={formData[header] || ''}
                            onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                        >
                            {roles.map((role, index) => (
                                <option key={index} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                );
            }
            return (
                <Form.Group className="mb-3" key={index}>
                    <Form.Label>{header.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Form.Label>
                    <Form.Control
                        type={header === 'email' ? 'email' : 'text'}
                        value={formData[header] || ''}
                        onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                    />
                </Form.Group>
            );
        });
    };

    const renderAddFormFields = () => (
        <>
            <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                    as="select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    {roles.map((role, index) => (
                        <option key={index} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            {/* Dynamic Extra Fields */}
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
                    <Button variant="danger" onClick={() => handleRemoveField(index)}>-</Button>
                </div>
            ))}

            <Button variant="success" onClick={handleAddField}>+ Add Field</Button>
        </>
    );

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Users List</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button className="mb-3" onClick={handleAddUser}>Add User</Button>
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="align-middle">
                                        {header.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                    </th>
                                ))}
                                <th className="align-middle">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    {headers.map((header, index) => (
                                        <td key={index} className="align-middle">
                                            {header === 'role'
                                                ? getRoleLabel(user[header])
                                                : header === 'created_at'
                                                    ? new Date(user[header]).toLocaleDateString()
                                                    : user[header]}
                                        </td>
                                    ))}
                                    <td className="align-middle">
                                        <Button variant="primary" onClick={() => handleEdit(user)}>Edit</Button>{' '}
                                        <Button variant="danger" onClick={() => handleDelete(user.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            {/* Modal for Add/Edit User */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit User' : 'Add User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {isEditing ? renderEditFormFields() : renderAddFormFields()}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
