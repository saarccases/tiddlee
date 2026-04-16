'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdmissionsManagement() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
        }>
            <AdmissionsContent />
        </Suspense>
    );
}

function AdmissionsContent() {
    const searchParams = useSearchParams();
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchAdmissions();
    }, [filter]);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedId(parseInt(id));
            setShowDetail(true);
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

                if (newStatus === 'approved') {
                    const student = admissions.find(a => a.id === id);
                    if (student?.programs_selected?.length) {
                        await fetch('/api/admin/fees', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'assign',
                                admission_id: id,
                                programs: student.programs_selected,
                            }),
                        });
                    }
                }
            }
        } catch (err) {
        }
    };

    const handleSelectApp = (id: number) => {
        setSelectedId(id);
        setShowDetail(true);
    };

    const selectedApp = admissions.find(a => a.id === selectedId);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB');
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 lg:gap-10 overflow-hidden">
            {/* Sidebar: Applications List */}
            <aside className={`${showDetail ? 'hidden lg:flex' : 'flex'} w-full lg:w-[380px] xl:w-[420px] flex-col bg-white dark:bg-zinc-900 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300`}>
                <div className="p-5 lg:p-8 border-b border-slate-50 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Applications</h2>
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest leading-none">
                            {admissions.length} Total
                        </span>
                    </div>

                    <div className="flex gap-1.5 lg:gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-2 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-primary hover:bg-slate-100'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-3 lg:space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <span className="material-icons animate-spin text-primary">sync</span>
                        </div>
                    ) : (
                        admissions.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => handleSelectApp(app.id)}
                                className={`p-5 lg:p-6 rounded-3xl cursor-pointer transition-all duration-300 group border-2 ${selectedId === app.id
                                    ? 'bg-white dark:bg-zinc-800 border-primary shadow-xl shadow-primary/5 ring-4 ring-primary/5'
                                    : 'bg-slate-50/50 dark:bg-zinc-800/30 border-transparent hover:border-slate-200 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                                        {app.child_name?.charAt(0) || '?'}
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                        app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1">{app.child_name || 'Anonymous'}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    Submitted: {formatDate(app.created_at)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Detail Pane */}
            <section className={`${!showDetail ? 'hidden lg:flex' : 'flex'} flex-1 bg-white dark:bg-zinc-900 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex-col`}>
                {selectedApp ? (
                    <>
                        <div className="p-5 lg:p-10 border-b border-slate-50 dark:border-zinc-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/30 dark:bg-zinc-800/30 backdrop-blur-sm">
                            {/* Back button (mobile only) */}
                            <button
                                className="lg:hidden self-start flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest"
                                onClick={() => setShowDetail(false)}
                            >
                                <span className="material-icons text-base">arrow_back</span>
                                Back
                            </button>

                            <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0">
                                <div className="size-16 lg:size-24 bg-white dark:bg-zinc-800 rounded-[1.5rem] lg:rounded-[2rem] shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-2 shrink-0">
                                    {selectedApp.child_photo ? (
                                        <img src={selectedApp.child_photo} className="w-full h-full object-cover rounded-[1rem] lg:rounded-[1.5rem]" alt="Child" />
                                    ) : (
                                        <span className="material-icons text-4xl lg:text-5xl text-slate-200">face</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                                        <h2 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase truncate">{selectedApp.child_name || 'Anonymous'}</h2>
                                        <span className={`text-[10px] font-black px-3 lg:px-4 py-1 rounded-full uppercase tracking-[0.2em] border shrink-0 ${selectedApp.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            selectedApp.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {selectedApp.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 lg:gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
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

                            <div className="hidden sm:flex gap-4 shrink-0">
                                <button className="size-12 lg:size-14 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 transition-all">
                                    <span className="material-icons">print</span>
                                </button>
                                <button className="size-12 lg:size-14 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 transition-all">
                                    <span className="material-icons">file_download</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 lg:p-12 space-y-10 lg:space-y-16">
                            {/* Program Choices */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-10 h-0.5 bg-primary"></span>
                                    PROGRAM SELECTION
                                </h3>
                                <div className="flex flex-wrap gap-3 lg:gap-4">
                                    {selectedApp.programs_selected?.map((prog: string) => (
                                        <div key={prog} className="px-4 lg:px-6 py-3 lg:py-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
                                            <span className="material-icons text-primary text-xl">verified</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{prog}</span>
                                                {prog === 'Toddlers' && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">(Playgroup)</span>}
                                                {prog === 'Kamblee' && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">(Nursery)</span>}
                                                {prog === 'Pupalee' && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">(Jr KG)</span>}
                                                {prog === 'Tiddlee' && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">(Sr KG)</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Daycare time details */}
                                {(selectedApp.programs_selected?.includes('Daycare') || selectedApp.daycare_time_opted) && (
                                    <div className="mt-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-5 flex flex-wrap gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hours Opted</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">{selectedApp.daycare_time_opted || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">From</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">
                                                {selectedApp.daycare_time_from
                                                    ? selectedApp.daycare_time_from.toString().slice(0, 5)
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">
                                                {selectedApp.daycare_time_to
                                                    ? selectedApp.daycare_time_to.toString().slice(0, 5)
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Family Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <span className="w-10 h-0.5 bg-blue-500"></span>
                                        MOTHER / GUARDIAN 1
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-16 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-900/30 shrink-0 flex items-center justify-center border-2 border-blue-200 dark:border-blue-800">
                                                {selectedApp.mother_photo
                                                    ? <img src={selectedApp.mother_photo} className="w-full h-full object-cover" alt={selectedApp.mother_name} />
                                                    : <span className="text-lg font-black text-blue-400">{selectedApp.mother_name?.charAt(0) || '?'}</span>
                                                }
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                                <p className="text-base lg:text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedApp.mother_name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedApp.mother_cell_phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all">{selectedApp.mother_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <span className="w-10 h-0.5 bg-indigo-500"></span>
                                        FATHER / GUARDIAN 2
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-16 rounded-2xl overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 shrink-0 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800">
                                                {selectedApp.father_photo
                                                    ? <img src={selectedApp.father_photo} className="w-full h-full object-cover" alt={selectedApp.father_name} />
                                                    : <span className="text-lg font-black text-indigo-400">{selectedApp.father_name?.charAt(0) || '?'}</span>
                                                }
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                                <p className="text-base lg:text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedApp.father_name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedApp.father_cell_phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all">{selectedApp.father_email}</p>
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
                                <div className="bg-red-50/50 dark:bg-red-900/10 p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                                <span className="material-icons">report_problem</span>
                                                <span className="text-xs font-black uppercase tracking-widest">Food Allergies</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-relaxed">
                                                {selectedApp.food_allergies || selectedApp.allergies_reactions || 'NONE REPORTED'}
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

                            {/* Uploaded Documents */}
                            {(() => {
                                const docs = [
                                    { label: "Child Aadhaar — Front", url: selectedApp.aadhar_front },
                                    { label: "Child Aadhaar — Back", url: selectedApp.aadhar_back },
                                    { label: "Birth Certificate", url: selectedApp.birth_certificate },
                                    { label: "Father Aadhaar — Front", url: selectedApp.father_aadhar_front },
                                    { label: "Father Aadhaar — Back", url: selectedApp.father_aadhar_back },
                                    { label: "Mother Aadhaar — Front", url: selectedApp.mother_aadhar_front },
                                    { label: "Mother Aadhaar — Back", url: selectedApp.mother_aadhar_back },
                                    { label: "Guardian 1 Aadhaar — Front", url: selectedApp.guardian1_aadhar_front },
                                    { label: "Guardian 1 Aadhaar — Back", url: selectedApp.guardian1_aadhar_back },
                                    { label: "Guardian 2 Aadhaar — Front", url: selectedApp.guardian2_aadhar_front },
                                    { label: "Guardian 2 Aadhaar — Back", url: selectedApp.guardian2_aadhar_back },
                                    { label: "Address Proof", url: selectedApp.address_proof },
                                ].filter(d => d.url);
                                if (docs.length === 0) return null;
                                return (
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <span className="w-10 h-0.5 bg-amber-500"></span>
                                            UPLOADED DOCUMENTS
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {docs.map((doc) => (
                                                <a
                                                    key={doc.label}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex flex-col rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 hover:border-primary/40 hover:shadow-lg transition-all"
                                                >
                                                    <div className="aspect-[4/3] bg-slate-100 dark:bg-zinc-800 overflow-hidden relative">
                                                        {doc.url && (doc.url.endsWith('.pdf')) ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                                                <span className="material-icons text-4xl">picture_as_pdf</span>
                                                                <span className="text-[9px] font-black uppercase tracking-widest">PDF</span>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={doc.url}
                                                                alt={doc.label}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                            <span className="material-icons text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">open_in_new</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-white dark:bg-zinc-900">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{doc.label}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="h-20"></div>
                        </div>

                        {/* Sticky Action Bar */}
                        {selectedApp.status !== 'rejected' && (
                            <div className="p-5 lg:p-8 border-t border-slate-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex justify-end items-center px-5 lg:px-12 z-20">
                                {selectedApp.status === 'approved' && (
                                    <div className="flex items-center gap-3 px-8 lg:px-12 py-3 lg:py-4 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 rounded-2xl text-sm font-black uppercase tracking-widest">
                                        <span className="material-icons text-xl">check_circle</span>
                                        Approved
                                    </div>
                                )}
                                {selectedApp.status === 'pending' && (
                                    <div className="flex gap-3 lg:gap-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => updateStatus(selectedApp.id, 'rejected')}
                                            className="flex-1 sm:flex-none px-6 lg:px-10 py-3 lg:py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedApp.id, 'approved')}
                                            className="flex-1 sm:flex-none px-8 lg:px-12 py-3 lg:py-4 bg-primary hover:bg-lime-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <span className="material-icons text-xl">check_circle</span>
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 lg:p-20">
                        <div className="size-24 lg:size-40 bg-slate-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 lg:mb-10 transition-transform hover:rotate-12 duration-500">
                            <span className="material-icons text-[60px] lg:text-[100px]">assignment</span>
                        </div>
                        <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-slate-400 text-center">Select an application to review</h3>
                        <p className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] text-center">Detailed records will appear here</p>
                    </div>
                )}
            </section>
        </div>
    );
}
