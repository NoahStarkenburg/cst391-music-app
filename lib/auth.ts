import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export const getSession = () => getServerSession(authOptions);

export async function requireUser(): Promise<ReturnType<typeof getSession> | NextResponse> {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return session;
}

export async function requireAdmin(): Promise<ReturnType<typeof getSession> | NextResponse> {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return session;
}
