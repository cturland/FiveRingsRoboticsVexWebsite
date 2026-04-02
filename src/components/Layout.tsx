import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#050816] via-[#0b1120] to-[#111827] text-white">
      <Navbar />
      <main className="flex-1 w-full"> 
        <div className="container py-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
