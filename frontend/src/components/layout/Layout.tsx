import type { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const CONTAINER = "mx-auto w-full max-w-[1400px] px-8";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(248,247,255,0.94)_38%,_rgba(238,242,255,0.92)_100%)] text-[#1E1B4B]">
      <Navbar containerClass={CONTAINER} />
      <main className={`${CONTAINER} flex-1 py-10`}>{children}</main>
      <Footer containerClass={CONTAINER} />
    </div>
  );
}
