import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// Build providers array conditionally so missing Google env vars don't break auth routes
const providers: NextAuthOptions['providers'] = [];

if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']) {
  providers.push(
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    })
  );
}

providers.push(
  CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        // Demo account check
        if (credentials.email === 'demo@mystyledwardrobe.com' && credentials.password === 'demo123') {
          console.log('✅ Demo user authenticated');
          return {
            id: 'demo-user-1',
            email: credentials.email,
            name: 'Demo User',
            image: null,
          };
        }

        console.log('❌ Invalid credentials for:', credentials.email);
        return null;
      }
    })
);

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env['NEXTAUTH_SECRET'] || 'fallback-secret-for-build',
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('📝 JWT callback - trigger:', trigger, 'user:', user?.email, 'token:', token?.email);
      if (user) {
        token['id'] = user.id;
        token['email'] = user.email || null;
        token['name'] = user.name || null;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔄 Session callback - token:', token?.email, 'session:', session?.user?.email);
      if (token && session.user) {
        (session.user as any).id = token['id'] as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
};
