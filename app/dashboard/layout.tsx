// app/dashboard/layout.tsx
'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase'; // Adjust path
import { User } from '@supabase/supabase-js';
import { FaTachometerAlt, FaEnvelopeOpenText, FaEdit, FaSignOutAlt, FaBars, FaTimes, FaSpinner } from 'react-icons/fa';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login'); // If no user, redirect to login
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        router.replace('/login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle redirecting to /login
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-background">
        <FaSpinner className="animate-spin text-accent text-4xl" />
      </div>
    );
  }

  if (!user) {
    // This should ideally not be reached if redirect works, but as a fallback.
    return null; // Or a redirect component if preferred before router.replace completes
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Messages', href: '/dashboard/messages', icon: <FaEnvelopeOpenText /> },
    { name: 'Blog Posts', href: '/dashboard/posts', icon: <FaEdit /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-700">
        <Link href="/dashboard" className="text-2xl font-serif font-semibold text-accent">
          Joana&#39;s Dashboard
        </Link>
      </div>
      <nav className="mt-6 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsSidebarOpenMobile(false)}
            className={`flex items-center px-6 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
              ${pathname === item.href
                ? 'bg-accent/10 text-accent'
                : 'text-primary-text/70 hover:bg-gray-700/50 hover:text-primary-text'
              }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-6 mt-auto border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center cursor-pointer px-6 py-3 text-sm font-medium rounded-md text-primary-text/70 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-150 ease-in-out"
        >
          <FaSignOutAlt className="mr-3 text-lg" />
          Logout
        </button>
         <p className="text-xs text-gray-500 mt-4 text-center">Logged in as: {user.email}</p>
      </div>
    </>
  );


  return (
    <div className="min-h-screen flex bg-primary-background text-primary-text">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-secondary-background border-r border-gray-700 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          className="p-2 rounded-md bg-secondary-background/80 text-primary-text hover:text-accent focus:outline-none ring-2 ring-inset ring-transparent focus:ring-accent"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpenMobile ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar (Overlay) */}
      {isSidebarOpenMobile && (
         <div className="md:hidden fixed inset-0 z-40 flex">
            <aside className="w-64 bg-secondary-background border-r border-gray-700 flex flex-col flex-shrink-0">
               <SidebarContent />
            </aside>
            <div className="flex-grow bg-black/50" onClick={() => setIsSidebarOpenMobile(false)}></div> {/* Overlay to close */}
         </div>
      )}


      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <div className={`transition-opacity duration-300 ${isSidebarOpenMobile && 'opacity-30 md:opacity-100'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}