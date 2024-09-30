import { getConnection } from "@/utils/db";
import bcrypt from 'bcryptjs'; // Import bcryptjs
import multer from 'multer'; // Import multer for file handling
import path from 'path';
import fs from 'fs';

// Multer setup for file storage
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage });

// Middleware for handling multipart/form-data
export const config = {
    api: {
        bodyParser: false, // We will handle file parsing using multer
    },
};

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
    } 
    else if (req.method === 'POST' || req.method === 'PUT') {
        // Handle file and form data via multer
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: 'File upload error', error: err.message });
            }

            const { body, file } = req;
            const updatedInfo = body;

            try {
                let existingUser = [];
                if (req.method === 'PUT') {
                    [existingUser] = await connection.query(
                        'SELECT user_info FROM users WHERE id = ?', 
                        [id]
                    );
                    if (existingUser.length === 0) return res.status(404).json({ message: 'User not found' });
                }

                const currentUserInfo = existingUser.length > 0 ? JSON.parse(existingUser[0].user_info) : {};

                // Handle password hashing if password is provided
                if (updatedInfo.password) {
                    const salt = await bcrypt.genSalt(10);
                    updatedInfo.password = await bcrypt.hash(updatedInfo.password, salt);
                }

                // If a new image was uploaded, update the image path
                if (file) {
                    updatedInfo.image = `/uploads/${file.filename}`;

                    // If it's a PUT request and the user had a previous image, remove it
                    if (req.method === 'PUT' && currentUserInfo.image) {
                        const oldImagePath = path.join(process.cwd(), 'public', currentUserInfo.image);
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath); // Remove the old image
                        }
                    }
                }

                // Combine the updated information with the existing user data
                const updatedUserInfo = {
                    ...currentUserInfo,
                    ...updatedInfo,
                };

                if (req.method === 'POST') {
                    // Insert new user
                    await connection.query(
                        'INSERT INTO users (user_info) VALUES (?)', 
                        [JSON.stringify(updatedUserInfo)]
                    );
                    res.status(201).json({ message: 'User created successfully' });
                } else {
                    // Update existing user
                    await connection.query(
                        'UPDATE users SET user_info = ? WHERE id = ?', 
                        [JSON.stringify(updatedUserInfo), id]
                    );
                    res.status(200).json({ message: 'User updated successfully' });
                }
            } catch (error) {
                res.status(500).json({ message: 'Database error', error: error.message });
            }
        });
    } 
    else if (req.method === 'DELETE') {
        try {
            const [existingUser] = await connection.query(
                'SELECT user_info FROM users WHERE id = ?', 
                [id]
            );

            if (existingUser.length === 0) return res.status(404).json({ message: 'User not found' });

            const userInfo = JSON.parse(existingUser[0].user_info);

            // If the user has an image, delete it from the file system
            if (userInfo.image) {
                const imagePath = path.join(process.cwd(), 'public', userInfo.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Delete the image file
                }
            }

            // Delete the user from the database
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
