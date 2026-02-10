'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdmissionsManagement() {
    const searchParams = useSearchParams();
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAdmissions();
    }, [filter]);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedId(parseInt(id));
        }
    }, [searchParams]);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/admissions?status=${filter}`);
            if (response.ok) {
                const data = await response.json();
                setAdmissions(data);
                if (data.length > 0 && !selectedId && !searchParams.get('id')) {
                    setSelectedId(data[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const response = await fetch('/api/admin/admissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (response.ok) {
                setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const selectedApp = admissions.find(a => a.id === selectedId);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    return (
        <div className="h-full flex gap-10 overflow-hidden">
            {/* Sidebar: Applications List */}
            <aside className="w-[420px] flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
                <div className="p-8 border-b border-slate-50 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Applications</h2>
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest leading-none">
                            {admissions.length} Total
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${filter === f
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-primary hover:bg-slate-100'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <span className="material-icons animate-spin text-primary">sync</span>
                        </div>
                    ) : (
                        admissions.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedId(app.id)}
                                className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 group border-2 ${selectedId === app.id
                                        ? 'bg-white dark:bg-zinc-800 border-primary shadow-xl shadow-primary/5 ring-4 ring-primary/5'
                                        : 'bg-slate-50/50 dark:bg-zinc-800/30 border-transparent hover:border-slate-200 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                                        {app.child_name.charAt(0)}
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                            app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                'bg-amber-50 text-amber-600'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1">{app.child_name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    Submitted: {formatDate(app.created_at)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Detail Pane */}
            <section className="flex-1 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col">
                {selectedApp ? (
                    <>
                        <div className="p-10 border-b border-slate-50 dark:border-zinc-800 flex justify-between items-center bg-slate-50/30 dark:bg-zinc-800/30 backdrop-blur-sm">
                            <div className="flex items-center gap-8">
                                <div className="size-24 bg-white dark:bg-zinc-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-2">
                                    {selectedApp.child_photo ? (
                                        <img src={selectedApp.child_photo} className="w-full h-full object-cover rounded-[1.5rem]" alt="Child" />
                                    ) : (
                                        <span className="material-icons text-5xl text-slate-200">face</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedApp.child_name}</h2>
                                        <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] border ${selectedApp.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                selectedApp.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {selectedApp.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            <span className="material-icons text-base">cake</span>
                                            Born {formatDate(selectedApp.child_dob)}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="material-icons text-base">tag</span>
                                            ID: {selectedApp.unique_id || 'NOT SET'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="size-14 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 transition-all">
                                    <span className="material-icons">print</span>
                                </button>
                                <button className="size-14 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 transition-all">
                                    <span className="material-icons">file_download</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-16">
                            {/* Program Choices */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-10 h-0.5 bg-primary"></span>
                                    PROGRAM SELECTION
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {selectedApp.programs_selected?.map((prog: string) => (
                                        <div key={prog} className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
                                            <span className="material-icons text-primary text-xl">verified</span>
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{prog}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Family Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <span className="w-10 h-0.5 bg-blue-500"></span>
                                        MOTHER / GUARDIAN 1
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                            <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedApp.mother_name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedApp.mother_cell_phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedApp.mother_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <span className="w-10 h-0.5 bg-indigo-500"></span>
                                        FATHER / GUARDIAN 2
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                            <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedApp.father_name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedApp.father_cell_phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedApp.father_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Box */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-10 h-0.5 bg-red-500"></span>
                                    MEDICAL & ALLERGIES
                                </h3>
                                <div className="bg-red-50/50 dark:bg-red-900/10 p-10 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                                <span className="material-icons">report_problem</span>
                                                <span className="text-xs font-black uppercase tracking-widest">Food Allergies</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-relaxed">
                                                {selectedApp.food_allergies || 'NONE REPORTED'}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                                <span className="material-icons">health_and_safety</span>
                                                <span className="text-xs font-black uppercase tracking-widest">Major Illnesses</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-relaxed">
                                                {selectedApp.past_illnesses || 'NONE REPORTED'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-20"></div> {/* Bottom Spacer */}
                        </div>

                        {/* Sticky Action Bar */}
                        <div className="p-8 border-t border-slate-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex justify-between items-center px-12 z-20">
                            <button
                                onClick={() => updateStatus(selectedApp.id, 'rejected')}
                                className="px-10 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
                            >
                                Reject Application
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => updateStatus(selectedApp.id, 'pending')}
                                    className="px-8 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:bg-slate-200"
                                >
                                    Set to Pending
                                </button>
                                <button
                                    onClick={() => updateStatus(selectedApp.id, 'approved')}
                                    className="px-12 py-4 bg-primary hover:bg-lime-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                                >
                                    <span className="material-icons text-xl">check_circle</span>
                                    Approve Admission
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20">
                        <div className="size-40 bg-slate-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-10 transition-transform hover:rotate-12 duration-500">
                            <span className="material-icons text-[100px]">assignment</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-400">Select an application to review</h3>
                        <p className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Detailed records will appear here</p>
                    </div>
                )}
            </section>
        </div>
    );
}
