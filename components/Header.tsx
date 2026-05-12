import Link from "next/link";
import { Logo } from "./Logo";

export function Header({ showBackButton = false, backUrl = "/dashboard" }: { showBackButton?: boolean; backUrl?: string }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <Logo size={48} />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Noor al Huda</h1>
          <p className="text-sm text-[#7b5f19]">Typing & Photocopying Services L.L.C</p>
        </div>
      </div>
      
      {showBackButton && (
        <Link 
          href={backUrl}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      )}
    </div>
  );
}
