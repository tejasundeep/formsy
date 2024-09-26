import { getConnection } from "@/utils/db";
import bcrypt from 'bcryptjs'; // Import bcryptjs

export default async function handler(req, res) {
    const { id } = req.query;

    // First, establish a connection with the database
    const connection = await getConnection();

    if (req.method === 'GET') {
        try {
            const [rows] = await connection.query(
                `SELECT * FROM users WHERE id = ? OR JSON_UNQUOTE(JSON_EXTRACT(user_info, '$.username')) = ?`, 
                [id, id]
            );
            if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

            const user = {
                id: rows[0].id,
                ...JSON.parse(rows[0].user_info),
                created_at: rows[0].created_at,
            };

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Database error', error: error.message });
        }
    } else if (req.method === 'PUT') {
        const updatedInfo = req.body;

        try {
            const [existingUser] = await connection.query(
                'SELECT user_info FROM users WHERE id = ?', 
                [id]
            );
            if (existingUser.length === 0) return res.status(404).json({ message: 'User not found' });

            const currentUserInfo = JSON.parse(existingUser[0].user_info);

            // Check if password needs to be hashed
            if (updatedInfo.password) {
                const salt = await bcrypt.genSalt(10); // Generate a salt
                updatedInfo.password = await bcrypt.hash(updatedInfo.password, salt); // Hash the password
            }

            // Remove keys from the current info that are not in the updated info
            for (const key in currentUserInfo) {
                if (!(key in updatedInfo)) {
                    delete currentUserInfo[key];
                }
            }

            const updatedUserInfo = {
                ...currentUserInfo,
                ...updatedInfo
            };

            await connection.query(
                'UPDATE users SET user_info = ? WHERE id = ?', 
                [JSON.stringify(updatedUserInfo), id]
            );
            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Database error', error: error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const [result] = await connection.query(
                'DELETE FROM users WHERE id = ?', 
                [id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Database error', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
