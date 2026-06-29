'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const WAIVER_TYPES = ['Manual', 'Sibling Discount', 'Staff Child', 'Scholarship', 'Early Bird'];
const APPLY_ON = ['total', 'registration', 'security_deposit', 'admission_form', 'installment', 'monthly'];
const STATUS_OPTS = ['Unpaid', 'Paid', 'Wave Off', 'Partial'];
const INST_COUNTS = [1, 2, 3, 4];

function fmt(n: any) { return '₹' + (parseFloat(n) || 0).toLocaleString('en-IN'); }

// Match a student's program name against template keywords
function matchTemplate(templates: any[], programName: string): any | null {
    if (!programName) return null;
    const name = programName.toLowerCase().trim();
    for (const t of templates) {
        const keywords: string[] = Array.isArray(t.match_keywords) ? t.match_keywords : [];
        if (keywords.some(k => name.includes(k.toLowerCase().trim()) || k.toLowerCase().trim().includes(name))) return t;
    }
    return null;
}

// Detect program from online admission programs_selected array
function detectProgramFromAdmission(programs: string[], templates: any[]): any | null {
    for (const prog of (programs || [])) {
        const match = matchTemplate(templates, prog);
        if (match) return match;
    }
    return null;
}

function StatCard({ label, value, color, icon }: any) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <span className="material-icons text-xl">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
            </div>
        </div>
    );
}

// ── Template Form (create / edit) ──────────────────────────────────────
function TemplateForm({ initial, onSave, onCancel }: { initial?: any; onSave: (data: any) => void; onCancel: () => void }) {
    const [d, setD] = useState<any>(initial || {
        template_name: '', program_type: 'preschool',
        school_fees: '', registration_amount: '', registration_status: 'Unpaid',
        security_deposit_amount: '', security_deposit_status: 'Unpaid',
        admission_form_fee: '', admission_form_status: 'Unpaid',
        num_installments: 1, monthly_fee: '', hours_opted: '',
        match_keywords: [],
    });
    const [kw, setKw] = useState('');

    const set = (f: string, v: any) => setD((p: any) => ({ ...p, [f]: v }));
    const addKw = () => { if (kw.trim()) { set('match_keywords', [...(d.match_keywords || []), kw.trim()]); setKw(''); } };
    const removeKw = (i: number) => set('match_keywords', d.match_keywords.filter((_: any, idx: number) => idx !== i));

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Template Name</label>
                    <input className="w-full px-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none"
                        placeholder="e.g. Toddler 2-3Yrs" value={d.template_name} onChange={e => set('template_name', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Program Type</label>
                    <div className="flex gap-2">
                        {(['preschool', 'daycare'] as const).map(pt => (
                            <button key={pt} onClick={() => set('program_type', pt)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 capitalize transition-all ${d.program_type === pt ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-500'}`}>
                                {pt}
                            </button>
                        ))}
                    </div>
                </div>

                {d.program_type === 'preschool' ? (
                    <>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">School Fees</label>
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input type="number" className="w-full pl-7 pr-3 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={d.school_fees} onChange={e => set('school_fees', e.target.value)} /></div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">No. of Installments</label>
                            <div className="flex gap-2">
                                {INST_COUNTS.map(n => (
                                    <button key={n} onClick={() => set('num_installments', n)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${d.num_installments === n ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-500'}`}>{n}</button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Monthly Fee (incl. tax)</label>
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input type="number" className="w-full pl-7 pr-3 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={d.monthly_fee} onChange={e => set('monthly_fee', e.target.value)} /></div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Hours Opted</label>
                            <input type="text" placeholder="e.g. 6" className="w-full px-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={d.hours_opted} onChange={e => set('hours_opted', e.target.value)} />
                        </div>
                    </>
                )}
            </div>

            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">One-Time Fees</p>
            <div className="space-y-3">
                {[
                    { label: 'Registration', f: 'registration_amount', sf: 'registration_status' },
                    { label: 'Security Deposit', f: 'security_deposit_amount', sf: 'security_deposit_status' },
                    { label: 'Admission Form Fee', f: 'admission_form_fee', sf: 'admission_form_status' },
                ].map(({ label, f, sf }) => (
                    <div key={f} className="flex items-center gap-3">
                        <label className="text-xs font-bold text-slate-500 w-36 shrink-0">{label}</label>
                        <div className="relative flex-1"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                            <input type="number" className="w-full pl-5 pr-2 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 outline-none" value={d[f] || ''} onChange={e => set(f, e.target.value)} /></div>
                        <select className="border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-xs bg-slate-50 dark:bg-zinc-800 outline-none" value={d[sf] || 'Unpaid'} onChange={e => set(sf, e.target.value)}>
                            {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide">Match Keywords</label>
                <p className="text-xs text-slate-400">Keywords used to auto-match this template when a student's program name is selected.</p>
                <div className="flex flex-wrap gap-2 min-h-8">
                    {(d.match_keywords || []).map((k: string, i: number) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            {k}
                            <button onClick={() => removeKw(i)} className="ml-1 text-primary/50 hover:text-red-500 transition-colors">×</button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input className="flex-1 px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none"
                        placeholder='e.g. "Toddler", "Toddler 2-3"'
                        value={kw} onChange={e => setKw(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addKw()} />
                    <button onClick={addKw} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-lime-600 transition-all">Add</button>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={() => onSave(d)} disabled={!d.template_name}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-lime-600 disabled:opacity-40 transition-all">
                    {initial ? 'Update Template' : 'Save Template'}
                </button>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function FeesPage() {
    const [tab, setTab] = useState<'fees' | 'templates'>('fees');
    const [feeTab, setFeeTab] = useState<'all' | 'preschool' | 'daycare' | 'overdue' | 'waivers'>('all');
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [fees, setFees] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [migrated, setMigrated] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [search, setSearch] = useState('');

    // Template management
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    // Add Fee Plan modal
    const [showAdd, setShowAdd] = useState(false);
    const [addStep, setAddStep] = useState(1);
    const [addData, setAddData] = useState<any>({});
    const [matchedTemplate, setMatchedTemplate] = useState<any>(null);
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');

    // Bulk create modal
    const [showBulk, setShowBulk] = useState(false);
    const [bulkPreview, setBulkPreview] = useState<any>(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkCreating, setBulkCreating] = useState(false);
    const [bulkResult, setBulkResult] = useState<any>(null);

    // Waiver modal
    const [showWaiver, setShowWaiver] = useState(false);
    const [waiverFee, setWaiverFee] = useState<any>(null);
    const [waiverData, setWaiverData] = useState<any>({ waiver_type: 'Manual', apply_on: 'total', amount: '', percentage: '', reason: '', approved_by: '' });
    const [savingWaiver, setSavingWaiver] = useState(false);

    // New year modal
    const [showNewYear, setShowNewYear] = useState(false);
    const [newYear, setNewYear] = useState({ year_label: '', start_date: '', end_date: '' });

    useEffect(() => { runInit(); }, []);
    useEffect(() => { if (selectedYear) fetchFees(); }, [selectedYear, feeTab]);

    const runInit = async () => {
        await Promise.all([fetchYears(), fetchTemplates()]);
        setLoading(false);
    };

    const runMigration = async () => {
        setMigrating(true);
        await fetch('/api/admin/fees/migrate');
        setMigrating(false);
        setMigrated(true);
        fetchYears();
        fetchTemplates();
    };

    const fetchYears = async () => {
        try {
            const res = await fetch('/api/admin/fees/academic-years');
            if (res.ok) {
                const data = await res.json();
                setAcademicYears(data);
                if (data.length > 0) setSelectedYear(data.find((y: any) => y.status === 'active') || data[0]);
            }
        } catch {}
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/fees/templates');
            if (res.ok) setTemplates(await res.json());
        } catch {}
    };

    const fetchFees = async () => {
        if (!selectedYear) return;
        setLoading(true);
        try {
            const typeParam = ['all', 'overdue', 'waivers'].includes(feeTab) ? 'all' : feeTab;
            const res = await fetch(`/api/admin/fees?year_id=${selectedYear.id}&type=${typeParam}`);
            if (res.ok) setFees(await res.json());
        } finally { setLoading(false); }
    };

    const fetchEnrollments = async () => {
        const [psRes, dcRes] = await Promise.all([
            fetch('/api/admin/enrollment?type=preschool'),
            fetch('/api/admin/enrollment?type=daycare'),
        ]);
        const ps = psRes.ok ? await psRes.json() : [];
        const dc = dcRes.ok ? await dcRes.json() : [];
        setEnrollments([...ps, ...dc]);
    };

    // When student is selected — auto-match template
    const onStudentSelect = (enrollmentId: string) => {
        const student = enrollments.find(e => String(e.id) === enrollmentId);
        if (!student) return;

        // Build program string for matching
        const programStr = student.program_name || student.slot || student.hours_opted || student.program_type || '';
        const matched = matchTemplate(templates, programStr);

        setMatchedTemplate(matched || null);

        // Pre-fill from matched template or sensible defaults
        const t = matched || {};
        setAddData({
            enrollment_id: enrollmentId,
            academic_year_id: selectedYear?.id,
            program_type: matched?.program_type || student.program_type || 'preschool',
            template_id: matched?.id || null,
            school_fees: t.school_fees || '',
            num_installments: t.num_installments || 1,
            installments: Array.from({ length: t.num_installments || 1 }, (_, i) => ({ no: i + 1, amount: '', due_date: '' })),
            monthly_fee: t.monthly_fee || '',
            hours_opted: t.hours_opted || student.hours_opted || '',
            registration_amount: t.registration_amount || '',
            registration_status: t.registration_status || 'Unpaid',
            security_deposit_amount: t.security_deposit_amount || '',
            security_deposit_status: t.security_deposit_status || 'Unpaid',
            admission_form_fee: t.admission_form_fee || '',
            admission_form_status: t.admission_form_status || 'Unpaid',
        });
    };

    const onTemplateChange = (templateId: string) => {
        const t = templates.find(tp => String(tp.id) === templateId);
        if (!t) return;
        setMatchedTemplate(t);
        setAddData((p: any) => ({
            ...p,
            program_type: t.program_type,
            template_id: t.id,
            school_fees: t.school_fees || '',
            num_installments: t.num_installments || 1,
            installments: Array.from({ length: t.num_installments || 1 }, (_, i) => ({ no: i + 1, amount: p.installments?.[i]?.amount || '', due_date: p.installments?.[i]?.due_date || '' })),
            monthly_fee: t.monthly_fee || '',
            hours_opted: t.hours_opted || p.hours_opted || '',
            registration_amount: t.registration_amount || '',
            registration_status: t.registration_status || 'Unpaid',
            security_deposit_amount: t.security_deposit_amount || '',
            security_deposit_status: t.security_deposit_status || 'Unpaid',
            admission_form_fee: t.admission_form_fee || '',
            admission_form_status: t.admission_form_status || 'Unpaid',
        }));
    };

    const setAddField = (field: string, value: any) => setAddData((p: any) => ({ ...p, [field]: value }));

    const updateInstallments = (count: number) => {
        const insts = Array.from({ length: count }, (_, i) => ({
            no: i + 1,
            amount: addData.installments?.[i]?.amount || '',
            due_date: addData.installments?.[i]?.due_date || '',
        }));
        setAddData((p: any) => ({ ...p, num_installments: count, installments: insts }));
    };

    const openAddModal = async () => {
        await fetchEnrollments();
        setAddData({ academic_year_id: selectedYear?.id, num_installments: 1, installments: [{ no: 1, amount: '', due_date: '' }] });
        setMatchedTemplate(null);
        setAddStep(1);
        setAddError('');
        setShowAdd(true);
    };

    const submitFeePlan = async () => {
        setAdding(true);
        setAddError('');
        try {
            const total = addData.program_type === 'preschool'
                ? parseFloat(addData.school_fees || 0)
                : parseFloat(addData.monthly_fee || 0) * 12;
            const res = await fetch('/api/admin/fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...addData, total_amount: total }),
            });
            const data = await res.json();
            if (!res.ok) { setAddError(data.error || 'Failed'); return; }
            setShowAdd(false);
            fetchFees();
            if (data.id) window.location.href = `/admin/fees/${data.id}`;
        } finally { setAdding(false); }
    };

    // Template CRUD
    const openBulkCreate = async () => {
        if (!selectedYear) return;
        setBulkResult(null);
        setBulkPreview(null);
        setShowBulk(true);
        setBulkLoading(true);
        try {
            const res = await fetch(`/api/admin/fees/bulk-create?year_id=${selectedYear.id}`);
            if (res.ok) setBulkPreview(await res.json());
        } finally { setBulkLoading(false); }
    };

    const runBulkCreate = async () => {
        if (!selectedYear) return;
        setBulkCreating(true);
        try {
            const res = await fetch('/api/admin/fees/bulk-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year_id: selectedYear.id, skip_unmatched: true }),
            });
            const data = await res.json();
            setBulkResult(data);
            fetchFees();
        } finally { setBulkCreating(false); }
    };

    const saveTemplate = async (data: any) => {
        const method = editingTemplate ? 'PATCH' : 'POST';
        const body = editingTemplate ? { id: editingTemplate.id, ...data } : data;
        await fetch('/api/admin/fees/templates', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        setShowTemplateForm(false);
        setEditingTemplate(null);
        fetchTemplates();
    };

    const deleteTemplate = async (id: number) => {
        if (!confirm('Delete this template?')) return;
        await fetch(`/api/admin/fees/templates?id=${id}`, { method: 'DELETE' });
        fetchTemplates();
    };

    const submitWaiver = async () => {
        setSavingWaiver(true);
        try {
            await fetch('/api/admin/fees/waiver', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_fee_id: waiverFee.id, ...waiverData }) });
            setShowWaiver(false);
            fetchFees();
        } finally { setSavingWaiver(false); }
    };

    const createYear = async () => {
        await fetch('/api/admin/fees/academic-years', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newYear) });
        setShowNewYear(false);
        fetchYears();
    };

    const filtered = fees.filter(f => {
        const s = f.child_name?.toLowerCase().includes(search.toLowerCase()) || f.unique_id?.toLowerCase().includes(search.toLowerCase());
        if (feeTab === 'overdue') return s && parseFloat(f.total_due) > 0;
        if (feeTab === 'waivers') return s && parseFloat(f.total_waiver) > 0;
        return s;
    });

    const totalBilled = fees.reduce((s, f) => s + parseFloat(f.total_amount || 0), 0);
    const totalCollected = fees.reduce((s, f) => s + parseFloat(f.total_paid || 0), 0);
    const totalDue = fees.reduce((s, f) => s + parseFloat(f.total_due || 0), 0);
    const totalWaiver = fees.reduce((s, f) => s + parseFloat(f.total_waiver || 0), 0);

    const selectedStudent = enrollments.find(e => String(e.id) === String(addData.enrollment_id));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Fee Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Academic year-wise fee tracking for Preschool & Daycare</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={runMigration} disabled={migrating || migrated}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold disabled:opacity-50 transition-all">
                        <span className="material-icons text-sm">storage</span>
                        {migrating ? 'Setting up...' : migrated ? 'DB Ready ✓' : 'Setup DB'}
                    </button>
                    {tab === 'fees' && (
                        <>
                            <button onClick={openBulkCreate}
                                className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all">
                                <span className="material-icons text-sm">auto_awesome</span>Bulk Create
                            </button>
                            <button onClick={openAddModal}
                                className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-lime-600 transition-all">
                                <span className="material-icons text-sm">add</span>Add Fee Plan
                            </button>
                        </>
                    )}
                    {tab === 'templates' && (
                        <button onClick={() => { setEditingTemplate(null); setShowTemplateForm(true); }}
                            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-lime-600 transition-all">
                            <span className="material-icons text-sm">add</span>New Template
                        </button>
                    )}
                </div>
            </div>

            {/* Main tab switcher */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
                {(['fees', 'templates'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t === 'fees' ? '📋 Fee Plans' : '🗂 Templates'}
                    </button>
                ))}
            </div>

            {/* ═══════════════ TEMPLATES TAB ═══════════════ */}
            {tab === 'templates' && (
                <div className="space-y-4">
                    {showTemplateForm ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                            <h2 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-widest mb-5">
                                {editingTemplate ? 'Edit Template' : 'New Template'}
                            </h2>
                            <TemplateForm
                                initial={editingTemplate}
                                onSave={saveTemplate}
                                onCancel={() => { setShowTemplateForm(false); setEditingTemplate(null); }}
                            />
                        </div>
                    ) : (
                        <>
                            {templates.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <span className="material-icons text-5xl text-slate-200 block mb-3">library_books</span>
                                    <p className="font-bold text-slate-400">No templates yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Create templates to auto-fill fee amounts when adding a plan</p>
                                    <button onClick={() => setShowTemplateForm(true)}
                                        className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-lime-600 transition-all">
                                        + Create First Template
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {templates.map(t => (
                                        <div key={t.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-black text-slate-800 dark:text-white">{t.template_name}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.program_type === 'preschool' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {t.program_type}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => { setEditingTemplate(t); setShowTemplateForm(true); }}
                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-primary transition-all">
                                                        <span className="material-icons text-sm">edit</span>
                                                    </button>
                                                    <button onClick={() => deleteTemplate(t.id)}
                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                                        <span className="material-icons text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                {t.program_type === 'preschool' ? (
                                                    <>
                                                        <div><span className="text-slate-400">School Fees</span><p className="font-bold text-slate-700 dark:text-slate-200">{fmt(t.school_fees)}</p></div>
                                                        <div><span className="text-slate-400">Installments</span><p className="font-bold text-slate-700 dark:text-slate-200">{t.num_installments}</p></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div><span className="text-slate-400">Monthly Fee</span><p className="font-bold text-slate-700 dark:text-slate-200">{fmt(t.monthly_fee)}</p></div>
                                                        <div><span className="text-slate-400">Hours</span><p className="font-bold text-slate-700 dark:text-slate-200">{t.hours_opted || '—'}</p></div>
                                                    </>
                                                )}
                                                <div><span className="text-slate-400">Registration</span><p className="font-bold text-slate-700 dark:text-slate-200">{fmt(t.registration_amount)}</p></div>
                                                <div><span className="text-slate-400">Security Dep.</span><p className="font-bold text-slate-700 dark:text-slate-200">{fmt(t.security_deposit_amount)}</p></div>
                                            </div>

                                            {(t.match_keywords || []).length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800">
                                                    {(t.match_keywords || []).map((k: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] rounded-full font-bold">{k}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ═══════════════ FEE PLANS TAB ═══════════════ */}
            {tab === 'fees' && (
                <>
                    {/* Academic Year Bar */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Year:</span>
                        {academicYears.map(y => (
                            <button key={y.id} onClick={() => setSelectedYear(y)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedYear?.id === y.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/40'}`}>
                                {y.year_label}
                                {y.status === 'active' && <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-600 text-[9px] rounded-full font-black">ACTIVE</span>}
                            </button>
                        ))}
                        <button onClick={() => setShowNewYear(true)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 text-sm hover:border-primary hover:text-primary transition-all">
                            <span className="material-icons text-sm">add</span> New Year
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Billed" value={fmt(totalBilled)} color="bg-blue-50 text-blue-600" icon="receipt_long" />
                        <StatCard label="Collected" value={fmt(totalCollected)} color="bg-green-50 text-green-600" icon="check_circle" />
                        <StatCard label="Outstanding" value={fmt(totalDue)} color="bg-red-50 text-red-600" icon="warning" />
                        <StatCard label="Waivers" value={fmt(totalWaiver)} color="bg-purple-50 text-purple-600" icon="loyalty" />
                    </div>

                    {/* Fee Plans Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 gap-4 flex-wrap">
                            <div className="flex bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 gap-0.5">
                                {(['all', 'preschool', 'daycare', 'overdue', 'waivers'] as const).map(t => (
                                    <button key={t} onClick={() => setFeeTab(t)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${feeTab === t ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                        {t === 'overdue' ? '⚠ Overdue' : t}
                                    </button>
                                ))}
                            </div>
                            <input type="text" placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)}
                                className="border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none w-52" />
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <span className="material-icons text-5xl block mb-3">account_balance_wallet</span>
                                <p className="font-bold">No fee plans found</p>
                                <p className="text-sm mt-1">Click "Add Fee Plan" to get started · Run Setup DB first if needed</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-zinc-800/50">
                                        <tr>{['Student', 'Program', 'Year', 'Total', 'Paid', 'Due', 'Waiver', 'Actions'].map(h => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {filtered.map(f => (
                                            <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-5 py-4"><p className="font-bold text-slate-800 dark:text-white">{f.child_name}</p><p className="text-xs text-slate-400 font-mono">{f.unique_id}</p></td>
                                                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${f.program_type === 'preschool' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{f.program_type === 'preschool' ? 'Preschool' : 'Daycare'}</span></td>
                                                <td className="px-5 py-4 text-sm text-slate-600 font-bold">{f.year_label}</td>
                                                <td className="px-5 py-4 font-semibold">{fmt(f.total_amount)}</td>
                                                <td className="px-5 py-4 font-semibold text-green-600">{fmt(f.total_paid)}</td>
                                                <td className="px-5 py-4">{parseFloat(f.total_due) > 0 ? <span className="font-bold text-red-600">{fmt(f.total_due)}</span> : <span className="text-green-600 font-bold text-xs">Cleared ✓</span>}</td>
                                                <td className="px-5 py-4 text-purple-600 font-semibold">{parseFloat(f.total_waiver) > 0 ? fmt(f.total_waiver) : '—'}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex gap-2">
                                                        <Link href={`/admin/fees/${f.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
                                                            <span className="material-icons text-sm">open_in_new</span>Manage
                                                        </Link>
                                                        <button onClick={() => { setWaiverFee(f); setWaiverData({ waiver_type: 'Manual', apply_on: 'total', amount: '', percentage: '', reason: '', approved_by: '' }); setShowWaiver(true); }}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-all">
                                                            <span className="material-icons text-sm">loyalty</span>Waiver
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ══ ADD FEE PLAN MODAL (2-step with template auto-match) ══ */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div><h2 className="text-lg font-black text-slate-800 dark:text-white">Add Fee Plan</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Step {addStep} of 2</p></div>
                            <button onClick={() => setShowAdd(false)} className="size-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800">
                                <span className="material-icons text-slate-400">close</span>
                            </button>
                        </div>
                        <div className="flex px-6 pt-4 gap-2">
                            {[1, 2].map(s => <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${addStep >= s ? 'bg-primary' : 'bg-slate-200'}`} />)}
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Step 1: Student + Year + Template auto-match */}
                            {addStep === 1 && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Select Student</label>
                                        <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 outline-none"
                                            value={addData.enrollment_id || ''}
                                            onChange={e => onStudentSelect(e.target.value)}>
                                            <option value="">Choose student...</option>
                                            {enrollments.map(e => (
                                                <option key={e.id} value={e.id}>
                                                    {e.child_name} ({e.unique_id || 'No ID'}) — {e.program_name || e.program_type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Template match result */}
                                    {addData.enrollment_id && (
                                        <div className={`p-4 rounded-xl border-2 ${matchedTemplate ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-amber-200 bg-amber-50 dark:bg-amber-900/10'}`}>
                                            {matchedTemplate ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons text-green-500 text-lg">auto_awesome</span>
                                                    <div>
                                                        <p className="text-sm font-black text-green-700">Template matched: {matchedTemplate.template_name}</p>
                                                        <p className="text-xs text-green-600">Fee amounts pre-filled. You can adjust in Step 2.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons text-amber-500 text-lg">warning</span>
                                                    <p className="text-sm font-bold text-amber-700">No template matched. Select one manually or fill amounts in Step 2.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Manual template override */}
                                    {addData.enrollment_id && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Override Template (optional)</label>
                                            <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 outline-none"
                                                value={addData.template_id || ''}
                                                onChange={e => onTemplateChange(e.target.value)}>
                                                <option value="">— Use auto-matched —</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.template_name} ({t.program_type})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Academic Year</label>
                                        <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800 outline-none"
                                            value={addData.academic_year_id || ''}
                                            onChange={e => setAddField('academic_year_id', e.target.value)}>
                                            {academicYears.map(y => (
                                                <option key={y.id} value={y.id}>{y.year_label}{y.status === 'active' ? ' (Active)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Review & adjust fee amounts */}
                            {addStep === 2 && (
                                <div className="space-y-5">
                                    {/* Student + program info banner */}
                                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="font-black text-slate-800 dark:text-white">{selectedStudent?.child_name}</p>
                                            <p className="text-xs text-slate-500">{selectedStudent?.program_name || selectedStudent?.program_type}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(['preschool', 'daycare'] as const).map(pt => (
                                                <button key={pt} onClick={() => setAddField('program_type', pt)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 capitalize transition-all ${addData.program_type === pt ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-500'}`}>
                                                    {pt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preschool fields */}
                                    {addData.program_type === 'preschool' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">School Fees</label>
                                                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                                        <input type="number" className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={addData.school_fees || ''} onChange={e => setAddField('school_fees', e.target.value)} /></div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">No. of Installments</label>
                                                    <div className="flex gap-1.5">
                                                        {INST_COUNTS.map(n => (
                                                            <button key={n} onClick={() => updateInstallments(n)}
                                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${addData.num_installments === n ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-500'}`}>{n}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase">Installment Amounts & Due Dates</label>
                                                {addData.installments?.map((inst: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-400 font-bold">Inst {inst.no}</label>
                                                            <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                                <input type="number" className="w-full pl-5 pr-2 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
                                                                    value={inst.amount} onChange={e => { const arr = [...addData.installments]; arr[i].amount = e.target.value; setAddField('installments', arr); }} /></div>
                                                        </div>
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-xs text-slate-400 font-bold">Due Date</label>
                                                            <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
                                                                value={inst.due_date} onChange={e => { const arr = [...addData.installments]; arr[i].due_date = e.target.value; setAddField('installments', arr); }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Daycare fields */}
                                    {addData.program_type === 'daycare' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Monthly Fee (incl. tax)</label>
                                                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                                    <input type="number" className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={addData.monthly_fee || ''} onChange={e => setAddField('monthly_fee', e.target.value)} /></div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Hours Opted</label>
                                                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={addData.hours_opted || ''} onChange={e => setAddField('hours_opted', e.target.value)} />
                                            </div>
                                            {addData.monthly_fee && (
                                                <div className="col-span-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                    <p className="text-xs font-bold text-blue-600">Annual total: {fmt(parseFloat(addData.monthly_fee) * 12)} (12 × {fmt(addData.monthly_fee)})</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* One-time fees (both types) */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wide">One-Time Fees</label>
                                        {[
                                            { label: 'Registration', f: 'registration_amount', sf: 'registration_status' },
                                            { label: 'Security Deposit', f: 'security_deposit_amount', sf: 'security_deposit_status' },
                                            { label: 'Admission Form Fee', f: 'admission_form_fee', sf: 'admission_form_status' },
                                        ].map(({ label, f, sf }) => (
                                            <div key={f} className="flex items-center gap-3">
                                                <label className="text-xs font-bold text-slate-500 w-36 shrink-0">{label}</label>
                                                <div className="relative flex-1"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                    <input type="number" className="w-full pl-5 pr-2 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none" value={addData[f] || ''} onChange={e => setAddField(f, e.target.value)} /></div>
                                                <select className="border border-slate-200 rounded-lg px-2 py-2 text-xs bg-slate-50 outline-none" value={addData[sf] || 'Unpaid'} onChange={e => setAddField(sf, e.target.value)}>
                                                    {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>

                                    {addError && <p className="text-red-600 text-sm font-bold bg-red-50 px-4 py-2 rounded-xl">{addError}</p>}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-between">
                            <button onClick={() => addStep > 1 ? setAddStep(s => s - 1) : setShowAdd(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">
                                {addStep === 1 ? 'Cancel' : '← Back'}
                            </button>
                            {addStep < 2 ? (
                                <button onClick={() => setAddStep(2)} disabled={!addData.enrollment_id}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-lime-600 disabled:opacity-40 transition-all">
                                    Next →
                                </button>
                            ) : (
                                <button onClick={submitFeePlan} disabled={adding}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-lime-600 disabled:opacity-50 transition-all">
                                    <span className="material-icons text-sm">{adding ? 'sync' : 'save'}</span>
                                    {adding ? 'Saving...' : 'Save Fee Plan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* WAIVER MODAL */}
            {showWaiver && waiverFee && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div><h2 className="text-lg font-black text-slate-800 dark:text-white">Apply Waiver</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{waiverFee.child_name} · {waiverFee.year_label}</p></div>
                            <button onClick={() => setShowWaiver(false)} className="size-9 flex items-center justify-center rounded-xl hover:bg-slate-100"><span className="material-icons text-slate-400">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Waiver Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {WAIVER_TYPES.map(t => (
                                        <button key={t} onClick={() => setWaiverData((p: any) => ({ ...p, waiver_type: t }))}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all text-left ${waiverData.waiver_type === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Apply On</label>
                                <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 outline-none capitalize"
                                    value={waiverData.apply_on} onChange={e => setWaiverData((p: any) => ({ ...p, apply_on: e.target.value }))}>
                                    {APPLY_ON.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹)</label>
                                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                        <input type="number" placeholder="0" className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none"
                                            value={waiverData.amount} onChange={e => setWaiverData((p: any) => ({ ...p, amount: e.target.value, percentage: '' }))} /></div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">OR Percentage</label>
                                    <div className="relative">
                                        <input type="number" placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none"
                                            value={waiverData.percentage} onChange={e => setWaiverData((p: any) => ({ ...p, percentage: e.target.value, amount: '' }))} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Reason</label>
                                <textarea rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none resize-none"
                                    placeholder="Reason for waiver..." value={waiverData.reason} onChange={e => setWaiverData((p: any) => ({ ...p, reason: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Approved By</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none"
                                    placeholder="Admin name..." value={waiverData.approved_by} onChange={e => setWaiverData((p: any) => ({ ...p, approved_by: e.target.value }))} />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setShowWaiver(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={submitWaiver} disabled={savingWaiver || (!waiverData.amount && !waiverData.percentage)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition-all">
                                <span className="material-icons text-sm">loyalty</span>{savingWaiver ? 'Applying...' : 'Apply Waiver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK CREATE MODAL */}
            {showBulk && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-white">Bulk Create Fee Plans</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{selectedYear?.year_label} · Auto-match templates from enrolled students</p>
                            </div>
                            <button onClick={() => setShowBulk(false)} className="size-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800">
                                <span className="material-icons text-slate-400">close</span>
                            </button>
                        </div>

                        <div className="p-6">
                            {bulkLoading && (
                                <div className="flex flex-col items-center py-12 gap-3">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                                    <p className="text-sm text-slate-500">Analysing enrolled students...</p>
                                </div>
                            )}

                            {/* Result after creation */}
                            {bulkResult && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
                                            <p className="text-2xl font-black text-green-600">{bulkResult.created}</p>
                                            <p className="text-xs font-bold text-green-500 mt-1">Created</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                                            <p className="text-2xl font-black text-slate-500">{bulkResult.skipped}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">Skipped</p>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-xl text-center border border-red-100">
                                            <p className="text-2xl font-black text-red-500">{bulkResult.errors}</p>
                                            <p className="text-xs font-bold text-red-400 mt-1">Errors</p>
                                        </div>
                                    </div>

                                    {bulkResult.details?.created?.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-black text-green-600 uppercase">Created</p>
                                            {bulkResult.details.created.map((c: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg">
                                                    <span className="text-sm font-bold text-slate-700">{c.child_name}</span>
                                                    <span className="text-xs text-green-600 font-bold">{c.template}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {bulkResult.details?.skipped?.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-black text-slate-500 uppercase">Skipped</p>
                                            {bulkResult.details.skipped.map((s: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                                                    <span className="text-sm font-bold text-slate-600">{s.child_name}</span>
                                                    <span className="text-xs text-slate-400">{s.reason}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {bulkResult.details?.errors?.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-black text-red-500 uppercase">Errors</p>
                                            {bulkResult.details.errors.map((e: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg">
                                                    <span className="text-sm font-bold text-red-700">{e.child_name}</span>
                                                    <span className="text-xs text-red-400">{e.error}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button onClick={() => setShowBulk(false)} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-lime-600 transition-all">Done</button>
                                    </div>
                                </div>
                            )}

                            {/* Preview before creation */}
                            {!bulkLoading && !bulkResult && bulkPreview && (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
                                            <p className="text-2xl font-black text-green-600">{bulkPreview.matched}</p>
                                            <p className="text-xs font-bold text-green-500 mt-1">Will create</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-xl text-center border border-amber-100">
                                            <p className="text-2xl font-black text-amber-500">{bulkPreview.unmatched}</p>
                                            <p className="text-xs font-bold text-amber-400 mt-1">No template match</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                                            <p className="text-2xl font-black text-slate-500">{bulkPreview.already_exists}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1">Already exist</p>
                                        </div>
                                    </div>

                                    {/* Student list */}
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {bulkPreview.students?.map((s: any, i: number) => (
                                            <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                                                s.already_exists ? 'bg-slate-50 border-slate-100 opacity-60' :
                                                s.matched ? 'bg-green-50 border-green-100' :
                                                'bg-amber-50 border-amber-100'
                                            }`}>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{s.child_name}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{s.unique_id} · {s.program_str}</p>
                                                </div>
                                                <div className="text-right">
                                                    {s.already_exists ? (
                                                        <span className="text-xs font-bold text-slate-400">Already exists</span>
                                                    ) : s.matched ? (
                                                        <span className="text-xs font-bold text-green-600">→ {s.template_name}</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-amber-500">No match — skip</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {bulkPreview.unmatched > 0 && (
                                        <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
                                            <span className="font-black">Note:</span> {bulkPreview.unmatched} student(s) have no matching template and will be skipped. Add keywords to the matching template, then run again.
                                        </p>
                                    )}

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={() => setShowBulk(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">Cancel</button>
                                        <button onClick={runBulkCreate} disabled={bulkCreating || bulkPreview.matched === 0}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-40 transition-all">
                                            <span className="material-icons text-sm">{bulkCreating ? 'sync' : 'auto_awesome'}</span>
                                            {bulkCreating ? 'Creating...' : `Create ${bulkPreview.matched} Fee Plans`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* NEW YEAR MODAL */}
            {showNewYear && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="p-6 border-b border-slate-100"><h2 className="text-lg font-black text-slate-800 dark:text-white">New Academic Year</h2></div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Year Label</label>
                                <input type="text" placeholder="e.g. 2027-28" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none"
                                    value={newYear.year_label} onChange={e => setNewYear(p => ({ ...p, year_label: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Start</label>
                                    <input type="date" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={newYear.start_date} onChange={e => setNewYear(p => ({ ...p, start_date: e.target.value }))} /></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">End</label>
                                    <input type="date" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={newYear.end_date} onChange={e => setNewYear(p => ({ ...p, end_date: e.target.value }))} /></div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setShowNewYear(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={createYear} disabled={!newYear.year_label || !newYear.start_date || !newYear.end_date}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-lime-600 disabled:opacity-40 transition-all">Create Year</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
