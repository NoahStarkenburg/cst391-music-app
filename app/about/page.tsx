// app/about/page.tsx
// SSR Component — no "use client" directive.
// This component renders entirely on the server and sends plain HTML to the browser.
// No hooks, no browser events, no interactivity — just static server-rendered markup.
// Citation: Bootstrap card component — https://getbootstrap.com/docs/5.3/components/card/

import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="container mt-5">
            <div className="card text-center shadow">
                <div className="card-header bg-dark text-white">
                    <h3>About This App</h3>
                </div>
                <div className="card-body">
                    <h5 className="card-title">CST-391 Music App</h5>
                    <p className="card-text">
                        A full-stack music catalog application built with Next.js and TypeScript.
                        Browse, search, create, and edit albums — all in one unified Next.js project
                        deployed on Vercel.
                    </p>
                    <hr />
                    <h6 className="text-muted">The Boss</h6>
                    <h4 className="fw-bold">Noah Starkenburg</h4>
                    <p className="text-muted">Developer &amp; Student, CST-391</p>
                    <Link href="/" className="btn btn-primary mt-2">
                        Home
                    </Link>
                </div>
                <div className="card-footer text-muted">
                    Built with Next.js · Bootstrap · PostgreSQL · Vercel
                </div>
            </div>
        </main>
    );
}
