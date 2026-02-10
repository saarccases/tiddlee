'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                router.push('/admin/dashboard');
            } else {
                const data = await response.json();
                setError(data.message || 'Invalid username or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 font-display">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 transition-all duration-300">
                <div className="bg-primary p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center size-16 bg-white rounded-2xl shadow-lg mb-4 text-primary">
                            <span className="material-icons text-4xl">child_care</span>
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Tiddlee Admin</h1>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Management Portal</p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 animate-shake">
                            <span className="material-icons text-red-500">error_outline</span>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Username</label>
                            <div className="relative">
                                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">person</span>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold dark:text-white"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
                            <div className="relative">
                                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">lock</span>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold dark:text-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-lime-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="material-icons animate-spin">sync</span>
                            ) : (
                                <>
                                    <span>LOGIN TO DASHBOARD</span>
                                    <span className="material-icons">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Authorized Access Only
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
}
