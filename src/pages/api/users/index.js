import dbConnect from "@/utils/db";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const [rows] = await dbConnect.query('SELECT * FROM users');
            const users = rows.map((row) => ({
                id: row.id,
                ...JSON.parse(row.user_info),
                created_at: row.created_at,
            }));
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Database error', error: error.message });
        }
    } else if (req.method === 'POST') {
        const userInfo = req.body;

        if (!userInfo || Object.keys(userInfo).length === 0) {
            return res.status(400).json({ message: 'Request body is empty or invalid' });
        }

        try {
            await dbConnect.query(
                'INSERT INTO users (user_info) VALUES (?)',
                [JSON.stringify(userInfo)]
            );
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Database error', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
