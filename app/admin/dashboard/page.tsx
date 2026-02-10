'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.ok) {
                    const json = await response.json();
                    setData(json);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    const { stats, recentAdmissions } = data || {};

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Dashboard Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                        <span className="inline-block w-4 h-[2px] bg-primary"></span>
                        Key Management Metrics
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                        <span className="material-icons text-primary text-xl">calendar_today</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Total Students */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="size-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 transform -rotate-3">
                            <span className="material-icons text-3xl">school</span>
                        </div>
                        <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1 rounded-full">+4.2%</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.totalStudents || 0}</h3>
                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Actively Enrolled</p>
                    </div>
                </div>

                {/* Pending Admissions */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transform rotate-3">
                            <span className="material-icons text-3xl">assignment_ind</span>
                        </div>
                        <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-3 py-1 rounded-full">ACTION REQUIRED</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">New Applications</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.pendingAdmissions || 0}</h3>
                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Waiting for Review</p>
                    </div>
                </div>

                {/* Staff Count */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="size-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 transform -rotate-3">
                            <span className="material-icons text-3xl">badge</span>
                        </div>
                        <span className="text-xs font-black text-slate-400 bg-slate-50 dark:bg-zinc-800 px-3 py-1 rounded-full">STABLE</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Staff</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.staffCount || 18}</h3>
                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Full Capacity</p>
                    </div>
                </div>

                {/* Today's Submissions */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="size-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 transform rotate-3">
                            <span className="material-icons text-3xl">add_task</span>
                        </div>
                        <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">TODAY</span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">New Submissions</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.newToday || 0}</h3>
                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Last 24 Hours</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Admissions Table */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Recent Admissions</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Latest application submissions</p>
                        </div>
                        <Link href="/admin/admissions" className="text-[10px] font-black text-primary hover:text-lime-600 uppercase tracking-widest border-b-2 border-primary/20 pb-1 transition-all">
                            View All Admissions
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Child Name</th>
                                    <th className="px-8 py-5">Programs</th>
                                    <th className="px-8 py-5">Submission</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                                {recentAdmissions?.map((app: any) => (
                                    <tr key={app.id} className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-400 font-black">
                                                    {app.child_name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{app.child_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {app.programs_selected?.slice(0, 2).map((p: string) => (
                                                    <span key={p} className="text-[9px] font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md uppercase tracking-widest">{p}</span>
                                                ))}
                                                {app.programs_selected?.length > 2 && <span className="text-[9px] font-black text-slate-400">+{app.programs_selected.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500">{formatDate(app.created_at)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                    app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link href={`/admin/admissions?id=${app.id}`} className="size-10 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                <span className="material-icons text-lg">visibility</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">Staff Availability</h3>
                        <div className="space-y-6">
                            {[
                                { name: 'Sarah Wilson', role: 'Lead Educator', status: 'Active' },
                                { name: 'Michael Chen', role: 'Support Staff', status: 'Active' },
                                { name: 'Emily Davis', role: 'Preschool Nurse', status: 'On Leave' },
                            ].map((staff) => (
                                <div key={staff.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                                            {staff.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 dark:text-white leading-none uppercase tracking-tight">{staff.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{staff.role}</p>
                                        </div>
                                    </div>
                                    <span className={`size-2.5 rounded-full ${staff.status === 'Active' ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-slate-300'}`}></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/40 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/20 rounded-full blur-3xl transition-transform group-hover:scale-125"></div>
                        <div className="relative z-10">
                            <div className="size-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 mx-auto transform rotate-6 scale-110 shadow-xl shadow-black/10">
                                <span className="material-icons text-4xl">insights</span>
                            </div>
                            <h4 className="text-2xl font-black text-white tracking-tighter leading-tight mb-2">Generate Reports</h4>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6">Create custom performance and enrollment reports</p>
                            <button className="w-full py-4 bg-white text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-black/10 hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:scale-95">
                                Export Data (PDF/CSV)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
