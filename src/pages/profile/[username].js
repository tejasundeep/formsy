import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, Spinner, Alert, Image, Button } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import styles from '@/styles/UserProfile.module.css';

const UserProfile = () => {
    const router = useRouter();
    const { username } = router.query;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (username) {
            const fetchUser = async () => {
                try {
                    const res = await fetch(`/api/users/${username}`);
                    if (!res.ok) {
                        throw new Error(`Error: ${res.status}`);
                    }
                    const data = await res.json();
                    setUser(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchUser();
        }
    }, [username]);

    // Handle PDF generation with higher resolution
    const handleExportToPDF = () => {
        const card = document.getElementById('id-card');

        // Use a higher DPI for better quality
        const scale = 3; // 3x the current resolution
        html2canvas(card, {
            scale: scale,
            useCORS: true,
            allowTaint: true,
            logging: true,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4', // Set the page format to A4
            });

            // Add image to PDF, and scale it according to DPI and canvas resolution
            const imgWidth = 595.28; // A4 width in points
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${user.first_name}_IDCard.pdf`);
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mt-5">
                {error}
            </Alert>
        );
    }

    const capitalizeText = (text) =>
        text.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const renderFields = () => {
        const excludedFields = ['password', 'role', 'created_at', 'id'];
        return Object.keys(user)
            .filter((key) => !excludedFields.includes(key))
            .map((key) => {
                if (key === 'image') return null;
                return (
                    <div key={key} className={styles.field}>
                        <strong>{capitalizeText(key.replace('_', ' '))}</strong>: {user[key]}
                    </div>
                );
            });
    };

    return (
        <div className={styles.container}>
            {user ? (
                <>
                    <Card id="id-card" className={`${styles.card} shadow-sm`}>
                        <Card.Body>
                            {user.image && (
                                <Image
                                    src={user.image}
                                    alt={`${user.name}'s Profile Picture`}
                                    roundedCircle
                                    fluid
                                    className={styles.profileImage}
                                />
                            )}
                            <Card.Title className={styles.cardTitle}>User Profile</Card.Title>
                            {renderFields()}
                        </Card.Body>
                    </Card>

                    {/* Export Button */}
                    <Button
                        variant="success"
                        className={`${styles.exportButton} mt-3 rounded-5`}
                        onClick={handleExportToPDF}
                    >
                        Export ID Card as PDF
                    </Button>
                </>
            ) : (
                <Alert variant="warning" className="mt-5">
                    User not found
                </Alert>
            )}
        </div>
    );
};

export default UserProfile;
