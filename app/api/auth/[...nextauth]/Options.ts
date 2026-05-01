import bcrypt from 'bcrypt';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import Prisma from '@/lib/prisma';

interface UserWithRole {
  id: string;
  email: string;
  image: string | null;
  name: string;
  status: string;
  role: string;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
        email: { label: 'email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required.');
        }
        // biome-ignore lint: error
        let user;
        // Check if the input is an email or a phone number
        if (/\S+@\S+\.\S+/.test(credentials.email)) {
          // If it's an email, search by email
          user = await Prisma.user.findFirst({
            where: { email: credentials.email },
          });
        } else if (/^01[0-9]{9}$/.test(credentials.email)) {
          // If it's a phone number, search by phone number directly

          user = await Prisma.user.findFirst({
            where: { phoneNumber: credentials.email },
          });
        } else {
          throw new Error('Invalid email or phone number format.');
        }

        if (!user) {
          throw new Error('User not found.');
        }

        if (
          /\S+@\S+\.\S+/.test(credentials.email) &&
          user.emailVerified === null
        ) {
          throw new Error("User's email is not verified.");
        }

        if (user.password) {
          const passwordMatch = bcrypt.compareSync(
            credentials.password,
            user.password,
          );
          if (!passwordMatch) {
            throw new Error('Incorrect password.');
          }
        }

        return user;
      },
    }),

    GoogleProvider({
      // biome-ignore lint: error
      clientId: process.env.GOOGLE_CLIENT_ID!,
      // biome-ignore lint: error
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      // biome-ignore lint: error
      user: any;
      // biome-ignore lint: error
      account: any;
      // biome-ignore lint: error
      profile: any;
    }) {
      if (account.provider === 'google') {
        const existingUser = await Prisma.user.findFirst({
          where: { email: user.email },
        });

        if (existingUser) {
          if (!existingUser.googleId) {
            await Prisma.user.update({
              where: { id: existingUser.id },
              data: { googleId: profile.id },
            });
          }
          user.id = existingUser.id;
          user.status = existingUser.status; // Ensure role/status is available for existing user
        } else {
          const newUser = await Prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image || null,
              googleId: profile.id,
              password: null,
              status: 'USER', // Default role for new users
              emailVerified: new Date(),
            },
          });
          user.id = newUser.id;
          user.status = newUser.status; // Ensure role/status is set for new user
        }
      }
      return true;
    },

    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: UserWithRole;
      // biome-ignore lint: error
      trigger?: any;
      session?: Session;
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.status; // Ensure role/status is set in the token
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role, // Set role in the session from token
        },
      };
    },
    // biome-ignore lint: error
  } as any,

  session: {
    strategy: 'jwt' as 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
