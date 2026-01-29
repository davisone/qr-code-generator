import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
}

// In-memory store for MVP (persists during server runtime)
const users: StoredUser[] = [];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        name: { label: "Nom", type: "text" },
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const { email, password, name, action } = credentials;

        if (action === "register") {
          const existingUser = users.find((u) => u.email === email);
          if (existingUser) {
            throw new Error("Cet email est déjà utilisé");
          }
          if (!name) {
            throw new Error("Le nom est requis");
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser: StoredUser = {
            id: crypto.randomUUID(),
            email,
            name,
            password: hashedPassword,
          };
          users.push(newUser);
          return { id: newUser.id, email: newUser.email, name: newUser.name };
        }

        // Login
        const user = users.find((u) => u.email === email);
        if (!user) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "qr-code-generator-secret-key-dev",
};
