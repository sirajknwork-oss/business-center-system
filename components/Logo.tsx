import Image from "next/image";

export function Logo({ size = 96, className = "" }: { size?: number, className?: string }) {
  return (
    <div 
      className={`flex items-center justify-center rounded-3xl bg-white p-2 shadow-lg shadow-[#b0881a]/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png"
        alt="Noor Al Huda Logo"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
