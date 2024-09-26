import { signOut, useSession } from 'next-auth/react';
import { Button } from 'react-bootstrap';

export default function Logout() {
    const { data: session, status } = useSession();

    // Only show the logout button if the user is logged in
    if (status === 'authenticated') {
        return (
            <Button onClick={() => signOut({ callbackUrl: '/' })}>
                Sign out
            </Button>
        );
    }

    // Return nothing if the user is not logged in
    return null;
}
