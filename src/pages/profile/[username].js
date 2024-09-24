import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            {user ? (
                <div>
                    <h1>{user.name}</h1>
                    <p>ID: {user.username}</p>
                    <p>Email: {user.email}</p>
                    <p>Created at: {new Date(user.created_at).toLocaleDateString()}</p>
                    {/* Render other user details as needed */}
                </div>
            ) : (
                <p>User not found</p>
            )}
        </div>
    );
};

export default UserProfile;
