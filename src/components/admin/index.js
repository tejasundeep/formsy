import Logout from '@/components/logout';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { Table, Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEye, FaSpinner } from 'react-icons/fa';
import { FaPencil } from "react-icons/fa6";
import { religionOptions, religionToCastMap } from '@/components/groups';
import styles from "@/styles/Home.module.css";

export default function AdminCP({ sessionUser }) {
    const initialFormState = {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        role: sessionUser?.role === 'super-admin' ? 'admin' : 'user',
        password: '',
        religion: '',
        cast: ''
    };

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [selectedUser, setSelectedUser] = useState(null);
    const [extraFields, setExtraFields] = useState([]);
    const [previousPassword, setPreviousPassword] = useState('');

    const roles = [
        { label: 'User', value: 'user' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Administrator', value: 'admin' },
        { label: 'Super Admin', value: 'super-admin' },
    ];

    const castOptions = religionToCastMap[formData.religion] || [];

    const filterUsersByRole = useCallback((data, admin) => {
        if (sessionUser?.role === 'super-admin') {
            setUsers(data.filter(user => user.role === 'admin'));
        } else if (sessionUser?.role === 'admin') {
            setUsers(data.filter(user =>
                (user.role === 'moderator' || user.role === 'user') && user.religion === admin.religion && user.cast === admin.cast
            ));
        } else if (sessionUser?.role === 'moderator') {
            setUsers(data.filter(user =>
                user.role === 'user' && user.religion === admin.religion && user.cast === admin.cast
            ));
        } else {
            setUsers([]);
        }
    }, [sessionUser?.role]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            const admin = data.find(user => user.role === 'admin' && user.id === sessionUser?.id);
            const superadmin = data.find(user => user.role === 'super-admin' && user.id === sessionUser?.id);

            if (superadmin) {
                filterUsersByRole(data, admin);
            } else if (admin) {
                filterUsersByRole(data, admin);
            } else {
                console.error('Admin details not found');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [sessionUser?.id, filterUsersByRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'religion') {
            setFormData(prev => ({
                ...prev,
                religion: value,
                cast: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddOrEditUser = (user = null) => {
        setSelectedUser(user);
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
                role: user.role,
                password: '',
                religion: user.religion || '',
                cast: user.cast || ''
            });
            setPreviousPassword(user.password);
            setExtraFields(extractExtraFields(user));
        } else {
            setFormData(initialFormState);
            setPreviousPassword('');
            setExtraFields([]);
        }
        setShowModal(true);
    };

    const extractExtraFields = (user) => (
        Object.keys(user)
            .filter(key => !['first_name', 'last_name', 'username', 'email', 'role', 'password', 'id', 'religion', 'cast', 'created_at'].includes(key))
            .map(key => ({ label: key, value: user[key] }))
    );

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.first_name || !formData.email || !formData.role) {
            alert("Please fill in all required fields.");
            return;
        }

        if (extraFields.some(field => !field.label || !field.value)) {
            alert("Please fill in both label and value for all extra fields.");
            return;
        }

        const finalData = { ...formData };
        extraFields.forEach(field => {
            finalData[field.label.toLowerCase()] = field.value;
        });

        if (!finalData.password && selectedUser) {
            finalData.password = previousPassword;
        }

        try {
            const method = selectedUser ? 'PUT' : 'POST';
            const url = selectedUser ? `/api/users/${selectedUser.id}` : `/api/users`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            closeModal();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleFieldChange = (index, key, value) => {
        setExtraFields(extraFields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
    };

    const getAvailableRoles = () => {
        if (!sessionUser) return [];
        if (sessionUser.role === 'super-admin') {
            return roles.filter(role => role.value === 'admin' || role.value === 'moderator');
        }
        if (sessionUser.role === 'admin') {
            return roles.filter(role => role.value === 'user' || role.value === 'moderator');
        }
        if (sessionUser.role === 'moderator') {
            return roles.filter(role => role.value === 'user');
        }
        return [];
    };

    const closeModal = () => {
        setFormData(initialFormState);
        setExtraFields([]);
        setShowModal(false);
    };

    const renderFormFields = () => (
        <>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.first_name}
                            placeholder="Enter First Name"
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.last_name}
                            placeholder="Enter Last Name"
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.username}
                            placeholder="Enter Username"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={formData.email}
                            placeholder="Enter Email"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
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
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Cast</Form.Label>
                        <Form.Control
                            as="select"
                            name="cast"
                            value={formData.cast}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.religion}
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
            <Form.Group className="mb-3 ">
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
                <div key={index} className="d-flex align-items-center mb-3">
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
                    <Button variant="danger" onClick={() => setExtraFields(extraFields.filter((_, i) => i !== index))}><FaTrash /></Button>
                </div>
            ))}
            <Button variant="success" onClick={() => setExtraFields([...extraFields, { label: '', value: '' }])}>
                <FaPlus className="me-2" /> Add Field
            </Button>
        </>
    );

    if (loading) return <LoadingScreen />;

    return (
        <Container>
            <Header />
            <Row>
                <Col className={styles.actBtns}>
                    <Button className="mb-3" onClick={() => handleAddOrEditUser()}>
                        <FaPlus className="me-2" /> Add User
                    </Button>
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

const LoadingScreen = () => (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <FaSpinner className="spinner-grow" role="status" />
        <span className="visually-hidden">Loading...</span>
    </Container>
);

const Header = () => (
    <Row className={`${styles.actBtns} my-4`}>
        <Col><h1>Users List</h1></Col>
        <Col className="text-end"><Logout /></Col>
    </Row>
);

const UsersTable = ({ users, roles, onEdit, onDelete }) => (
    <Table striped bordered hover responsive>
        <thead className="table-dark">
            <tr>
                <th className="align-middle">First Name</th>
                <th className="align-middle">Last Name</th>
                <th className="align-middle">Username</th>
                <th className="align-middle">Email</th>
                <th className="align-middle">Role</th>
                <th className="align-middle">Actions</th>
            </tr>
        </thead>
        <tbody>
            {users.map(user => (
                <tr key={user.id}>
                    <td className="align-middle">{user.first_name}</td>
                    <td className="align-middle">{user.last_name}</td>
                    <td className="align-middle">{user.username}</td>
                    <td className="align-middle">{user.email}</td>
                    <td className="align-middle">{roles.find(r => r.value === user.role)?.label || user.role}</td>
                    <td className={`align-middle ${styles.actBtnsTable}`}>
                        <Link href={`/profile/${user.username}`} className='btn btn-secondary mx-1' target='_blank' title='View'>
                            <FaEye className="me-1" />
                        </Link>
                        <Button variant="primary" className='mx-1' onClick={() => onEdit(user)} title='Edit'>
                            <FaPencil className="me-1" />
                        </Button>
                        <Button variant="danger" className='mx-1' onClick={() => onDelete(user.id)} title='Delete'>
                            <FaTrash className="me-1" />
                        </Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
);

const UserModal = ({ showModal, setShowModal, selectedUser, renderFormFields, handleSubmit }) => (
    <Modal show={showModal} onHide={() => setShowModal(false)} className={styles.actBtns}>
        <Modal.Header className='border-0'>
            <Modal.Title>{selectedUser ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body><Form>{renderFormFields()}</Form></Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
        </Modal.Footer>
    </Modal>
);
