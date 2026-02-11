"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/dashboard" className="logo">
            <Image
              src="/QRaft.png"
              alt="QRaft"
              width={32}
              height={32}
              className="rounded-lg"
            />
            QRaft
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#525252] hidden sm:block">
              {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn btn-secondary btn-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
