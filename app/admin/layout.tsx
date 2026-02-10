'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<any>(null);

    // Skip layout for login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const navItems = [
        { label: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
        { label: 'Admissions', icon: 'app_registration', href: '/admin/admissions' },
        { label: 'Students', icon: 'groups', href: '/admin/students' },
        { label: 'Staff', icon: 'badge', href: '#' },
        { label: 'Reports', icon: 'bar_chart', href: '#' },
    ];

    const handleLogout = async () => {
        // In a real app, clear cookie via API
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/admin/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 font-quicksand overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col z-30 transition-all duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transform rotate-3">
                            <span className="material-icons text-3xl font-bold">child_care</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">TIDDLEE</h1>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary mt-1">Admin Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02] font-black'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-primary'
                                    }`}
                            >
                                <span className={`material-icons ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm uppercase tracking-widest leading-none">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6">
                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-3xl border border-slate-100 dark:border-zinc-800 flex items-center gap-4 group">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate text-slate-800 dark:text-white leading-tight">Admin Sarah</p>
                            <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-bold mt-0.5">Administrator</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                        >
                            <span className="material-icons text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-10 z-20">
                    <div className="flex items-center gap-6 flex-1 max-w-2xl">
                        <div className="relative w-full">
                            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input
                                className="w-full bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 font-medium transition-all"
                                placeholder="Search students, admissions, or records..."
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="size-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-primary transition-all relative">
                            <span className="material-icons">notifications</span>
                            <span className="absolute top-3 right-3 size-2.5 bg-red-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse"></span>
                        </button>

                        <div className="h-10 w-px bg-slate-200 dark:bg-zinc-800"></div>

                        <Link
                            href="/"
                            target="_blank"
                            className="bg-primary hover:bg-lime-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                        >
                            <span className="material-icons text-sm">open_in_new</span>
                            Visitor Site
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-slate-50 dark:bg-zinc-950">
                    {children}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
            `}</style>
        </div>
    );
}
