"use client";

export default function AppHeader() {
  return (
    <header className="mb-6 border-b border-slate-200 pb-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[48px] font-black leading-none tracking-[-0.04em] text-slate-950 md:text-[56px]">
            <span className="text-slate-950">Meta</span>
            <span className="text-blue-600">M</span>
          </h1>
          <p className="mt-2 text-base font-medium text-slate-400">
            Hacktool Monitoring
          </p>
        </div>
      </div>
    </header>
  );
}