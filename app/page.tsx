"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentUserInfo } from "@/modules/auth/authClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    getCurrentUserInfo().then(info => {
      if (info && info.role) {
        router.replace("/dashboard");
      }
    }).catch(() => {
      // Not logged in
    });
  }, [router]);
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-6 py-12 relative"
      style={{ backgroundImage: "url('/bg-abudhabi.png')" }}
    >
      {/* Light airy overlay to ensure readability while keeping it bright */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Logo centered above the rectangular card */}
        <div className="mb-8 transform transition-transform hover:scale-105 duration-300">
          <Logo size={160} className="shadow-2xl shadow-[#7b5f19]/30" />
        </div>

        {/* Rectangular Card */}
        <div className="w-full rounded-[2.5rem] border border-white/50 bg-white/95 backdrop-blur-md p-10 sm:p-12 shadow-[0_40px_80px_-20px_rgba(123,95,25,0.15)] text-center transition-all duration-300 hover:shadow-[0_40px_80px_-20px_rgba(123,95,25,0.25)]">
          <div className="space-y-8">
            
            {/* Close and attractive title lines */}
            <div className="flex flex-col items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Noor al Huda
              </h1>
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-[#7b5f19] to-transparent rounded-full opacity-50"></div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#7b5f19]">
                Typing & Photocopying Services L.L.C
              </p>
            </div>

            <p className="text-base leading-relaxed text-slate-600 max-w-md mx-auto">
              Welcome to the Noor al Huda company portal. Accounts are created and managed by the company administrator.
            </p>

            <div className="flex flex-col items-center gap-5 pt-8 border-t border-slate-100/80">
              <Link
                className="w-full sm:w-2/3 inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-bold tracking-wide text-white transition-all hover:bg-[#7b5f19] hover:shadow-lg hover:-translate-y-0.5"
                href="/login"
              >
                Sign In to Portal
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Need creator access? <Link href="/login" className="font-bold text-[#7b5f19] hover:text-[#5a4511] transition-colors underline decoration-[#7b5f19]/30 underline-offset-4">Use creator login</Link>.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
