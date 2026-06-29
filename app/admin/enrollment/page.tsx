'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const MONTHS = ['april','may','june','july','august','september','october','november','december','january','february','march'];

function StatusBadge({ status }: { status: string }) {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Paid</span>;
    if (s === 'unpaid') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Unpaid</span>;
    if (s === 'wave off' || s === 'wave off') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Wave Off</span>;
    if (s === 'carry forward') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Carry Fwd</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status || '—'}</span>;
}

function fmt(n: any) {
    const num = parseFloat(n) || 0;
    if (num === 0) return '—';
    return '₹' + num.toLocaleString('en-IN');
}

export default function EnrollmentPage() {
    const [tab, setTab] = useState<'preschool' | 'daycare'>('preschool');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const [migrating, setMigrating] = useState(false);
    const [migrated, setMigrated] = useState(false);
    const [search, setSearch] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchStudents(); }, [tab]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/enrollment?type=${tab}`);
            if (res.ok) setStudents(await res.json());
        } finally { setLoading(false); }
    };

    const runMigration = async () => {
        setMigrating(true);
        try {
            const res = await fetch('/api/admin/migrate-enrollment');
            if (res.ok) setMigrated(true);
        } finally { setMigrating(false); }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        setImportResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/import-enrollment', { method: 'POST', body: formData });
            const data = await res.json();
            setImportResult(data);
            fetchStudents();
        } finally {
            setImporting(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const filtered = students.filter(s =>
        s.child_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.unique_id?.toLowerCase().includes(search.toLowerCase())
    );

    const overdueCount = students.filter(s => parseFloat(s.fees_due) > 0 || parseFloat(s.total_amount_payable) > 0).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Enrollment & Fees</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage Preschool and Daycare student enrollment & fee tracking</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={runMigration}
                        disabled={migrating || migrated}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold disabled:opacity-50 transition-all"
                    >
                        <span className="material-icons text-sm">storage</span>
                        {migrating ? 'Setting up...' : migrated ? 'DB Ready ✓' : 'Setup DB'}
                    </button>
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={importing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-lime-600 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
                    >
                        <span className="material-icons text-sm">upload_file</span>
                        {importing ? 'Importing...' : 'Import Excel'}
                    </button>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                </div>
            </div>

            {/* Import Result */}
            {importResult && (
                <div className={`rounded-xl p-4 border ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 font-bold text-sm mb-2">
                        <span className="material-icons text-sm">{importResult.success ? 'check_circle' : 'error'}</span>
                        {importResult.success ? 'Import Complete' : 'Import Failed'}
                    </div>
                    {importResult.results && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {importResult.results.preschool && (
                                <div>
                                    <p className="font-bold text-slate-700">Preschool</p>
                                    <p className="text-green-700">✓ Imported: {importResult.results.preschool.imported}</p>
                                    <p className="text-yellow-700">⟳ Skipped: {importResult.results.preschool.skipped}</p>
                                    {importResult.results.preschool.errors?.length > 0 && (
                                        <p className="text-red-600 text-xs mt-1">{importResult.results.preschool.errors.slice(0,3).join(', ')}</p>
                                    )}
                                </div>
                            )}
                            {importResult.results.daycare && (
                                <div>
                                    <p className="font-bold text-slate-700">Daycare</p>
                                    <p className="text-green-700">✓ Imported: {importResult.results.daycare.imported}</p>
                                    <p className="text-yellow-700">⟳ Skipped: {importResult.results.daycare.skipped}</p>
                                    {importResult.results.daycare.errors?.length > 0 && (
                                        <p className="text-red-600 text-xs mt-1">{importResult.results.daycare.errors.slice(0,3).join(', ')}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {importResult.error && <p className="text-red-600 text-sm">{importResult.error}</p>}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: students.length, icon: 'groups', color: 'text-blue-600 bg-blue-50' },
                    { label: 'Overdue Fees', value: overdueCount, icon: 'warning', color: 'text-red-600 bg-red-50' },
                    { label: 'New Enrollments', value: students.filter(s => s.new_or_existing === 'New').length, icon: 'person_add', color: 'text-green-600 bg-green-50' },
                    { label: 'Existing Students', value: students.filter(s => s.new_or_existing === 'Existing').length, icon: 'how_to_reg', color: 'text-purple-600 bg-purple-50' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <span className="material-icons text-xl">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs + Search */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 gap-4">
                    <div className="flex bg-slate-100 dark:bg-zinc-800 rounded-xl p-1">
                        {(['preschool', 'daycare'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' : 'text-slate-500'}`}
                            >
                                {t === 'daycare' ? 'Daycare' : 'Preschool'}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Search name or ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 outline-none w-48"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <span className="material-icons text-5xl block mb-3">inbox</span>
                        <p className="font-bold">No students found</p>
                        <p className="text-sm mt-1">Import the Excel sheet to get started</p>
                    </div>
                ) : tab === 'preschool' ? (
                    <PreschoolTable students={filtered} />
                ) : (
                    <DaycareTable students={filtered} />
                )}
            </div>
        </div>
    );
}

function PreschoolTable({ students }: { students: any[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800/50">
                    <tr>
                        {['ID', 'Child Name', 'Program', 'Slot', 'New/Existing', 'Total Fees', 'Paid', 'Due', 'Action'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {students.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.unique_id || '—'}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{s.child_name}</td>
                            <td className="px-4 py-3 text-slate-600">{s.program_name || '—'}</td>
                            <td className="px-4 py-3 text-slate-500">{s.slot || '—'}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.new_or_existing === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {s.new_or_existing}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-semibold">{fmt(s.total_amount)}</td>
                            <td className="px-4 py-3 text-green-600 font-semibold">{fmt(s.school_fees ? (parseFloat(s.school_fees) - parseFloat(s.fees_due || 0)) : 0)}</td>
                            <td className="px-4 py-3">
                                {parseFloat(s.fees_due) > 0
                                    ? <span className="font-bold text-red-600">{fmt(s.fees_due)}</span>
                                    : <span className="text-green-600 font-bold">Cleared</span>}
                            </td>
                            <td className="px-4 py-3">
                                <Link href={`/admin/enrollment/${s.id}`} className="flex items-center gap-1 text-primary hover:underline font-bold text-xs">
                                    View <span className="material-icons text-sm">arrow_forward</span>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DaycareTable({ students }: { students: any[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800/50">
                    <tr>
                        {['ID', 'Child Name', 'Hours Opted', 'New/Existing', 'Monthly Fee', 'Total Payable', 'Action'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {students.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.unique_id || '—'}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{s.child_name}</td>
                            <td className="px-4 py-3 text-slate-600">{s.hours_opted || '—'}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.new_or_existing === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {s.new_or_existing}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-semibold">{fmt(s.fees_per_month)}</td>
                            <td className="px-4 py-3 font-semibold">{fmt(s.total_amount_payable)}</td>
                            <td className="px-4 py-3">
                                <Link href={`/admin/enrollment/${s.id}`} className="flex items-center gap-1 text-primary hover:underline font-bold text-xs">
                                    View <span className="material-icons text-sm">arrow_forward</span>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
