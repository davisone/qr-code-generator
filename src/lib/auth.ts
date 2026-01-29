import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

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
          const existingUser = await prisma.user.findUnique({ where: { email } });
          if (existingUser) {
            throw new Error("Cet email est déjà utilisé");
          }
          if (!name) {
            throw new Error("Le nom est requis");
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await prisma.user.create({
            data: { email, name, password: hashedPassword },
          });
          return { id: newUser.id, email: newUser.email, name: newUser.name };
        }

        // Login
        const user = await prisma.user.findUnique({ where: { email } });
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
