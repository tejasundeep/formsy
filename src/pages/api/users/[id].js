import dbConnect from "@/utils/db";

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const [rows] = await dbConnect.query('SELECT * FROM users WHERE id = ?', [id]);
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
            const [existingUser] = await dbConnect.query('SELECT user_info FROM users WHERE id = ?', [id]);
            if (existingUser.length === 0) return res.status(404).json({ message: 'User not found' });

            const currentUserInfo = JSON.parse(existingUser[0].user_info);

            const updatedUserInfo = {
                ...currentUserInfo,
                ...updatedInfo
            };

            await dbConnect.query('UPDATE users SET user_info = ? WHERE id = ?', [JSON.stringify(updatedUserInfo), id]);
            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Database error', error: error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const [result] = await dbConnect.query('DELETE FROM users WHERE id = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Database error', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
