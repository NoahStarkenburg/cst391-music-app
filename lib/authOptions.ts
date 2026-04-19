import { type NextAuthOptions, type Session, type Account, type Profile } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, account, profile }: { token: JWT; account?: Account | null; profile?: Profile | null }): Promise<JWT> {
            if (account && profile && typeof profile.email === "string") {
                token.email = profile.email;
            }
            const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
            token.role = admins.includes(token.email ?? "") ? "admin" : "user";
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
            if (session.user) {
                session.user.role = token.role as "admin" | "user" | undefined;
            }
            return session;
        },
    },
};
