import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getConnection } from "@/utils/db";

const authenticateUser = async (credentials) => {
    const { email, password } = credentials;
    console.log(email);

    if (!email) throw new Error("Email cannot be empty");
    if (!password) throw new Error("Password cannot be empty");

    const database = await getConnection();

    try {
        const [users] = await database.query(
            "SELECT * FROM users WHERE JSON_UNQUOTE(JSON_EXTRACT(user_info, '$.email')) = ?",
            [email]
        );

        if (users.length > 0) {
            const user = users[0];
            
            // Extract the password from the JSON object
            const storedPassword = JSON.parse(user.user_info).password;
            
            // Check if the provided password matches the stored hashed password
            const isPasswordValid = await bcrypt.compare(credentials.password, storedPassword);

            if (!isPasswordValid) {
                throw new Error("Invalid email or password");
            }

            if (isPasswordValid) {
                // Return user object on successful login
                return user;
            }
        } else {
            throw new Error("Invalid email or password");
        }
    } catch (error) {
        console.error("Error during authentication:", error.message);
        throw new Error("Authentication failed");
    } finally {
        await database.release();
    }
};

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: authenticateUser,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = JSON.parse(user.user_info).role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = session.user || {};
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
