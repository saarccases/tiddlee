'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const MONTHS = ['April','May','June','July','August','September','October','November','December','January','February','March'];
const STATUS_OPTS = ['Unpaid', 'Paid', 'Partial', 'Wave Off', 'Carry Forward'];

function fmt(n: any) {
    const num = parseFloat(n) || 0;
    return '₹' + num.toLocaleString('en-IN');
}

function InfoRow({ label, value }: { label: string; value: any }) {
    return (
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{value || '—'}</p>
        </div>
    );
}

export default function FeeDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [installments, setInstallments] = useState<any[]>([]);
    const [monthly, setMonthly] = useState<any[]>([]);
    const [waivers, setWaivers] = useState<any[]>([]);
    const [fee, setFee] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/fees/detail?id=${id}`);
            if (res.ok) {
                const d = await res.json();
                setData(d);
                setInstallments(d.installments || []);
                setMonthly(d.monthly || []);
                setWaivers(d.waivers || []);
                setFee({
                    registration_status: d.registration_status,
                    security_deposit_status: d.security_deposit_status,
                    admission_form_status: d.admission_form_status,
                    notes: d.notes,
                    extra_hours: d.extra_hours,
                    extra_hours_amount: d.extra_hours_amount,
                });
            }
        } finally { setLoading(false); }
    };

    const save = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/fees/detail', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, fee, installments, monthly }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            fetchData();
        } finally { setSaving(false); }
    };

    const removeWaiver = async (wId: number) => {
        await fetch(`/api/admin/fees/waiver?id=${wId}&student_fee_id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const updateInst = (i: number, field: string, value: any) => {
        setInstallments(prev => prev.map((inst, idx) => idx === i ? { ...inst, [field]: value } : inst));
    };

    const updateMonth = (i: number, field: string, value: any) => {
        setMonthly(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
    };

    if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!data) return <div className="text-center py-24 text-slate-400">Fee plan not found</div>;

    const totalInstPaid = installments.reduce((s, inst) => {
        if (inst.status === 'Paid') return s + parseFloat(inst.amount || 0);
        return s + parseFloat(inst.part_payment || 0);
    }, 0);
    const totalMonthPaid = monthly.reduce((s, m) => s + parseFloat(m.amount_paid || 0), 0);
    const totalWaiver = waivers.reduce((s, w) => s + parseFloat(w.amount || 0), 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/fees" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
                    <span className="material-icons text-slate-500">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">{data.child_name}</h1>
                    <p className="text-sm text-slate-500 font-mono">{data.unique_id} · {data.year_label} · {data.program_type === 'preschool' ? 'Preschool' : 'Daycare'}</p>
                </div>
                <div className="ml-auto">
                    <button onClick={save} disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-lime-600 disabled:opacity-50 transition-all">
                        <span className="material-icons text-sm">{saved ? 'check' : 'save'}</span>
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Fees', value: fmt(data.total_amount), color: 'text-slate-700' },
                    { label: 'Collected', value: fmt(data.total_paid), color: 'text-green-600' },
                    { label: 'Outstanding', value: fmt(data.total_due), color: parseFloat(data.total_due) > 0 ? 'text-red-600' : 'text-green-600' },
                    { label: 'Waivers', value: fmt(totalWaiver), color: 'text-purple-600' },
                ].map(c => (
                    <div key={c.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{c.label}</p>
                        <p className={`text-xl font-black mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Student Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Student Info</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoRow label="Program" value={data.program_name || data.program_type} />
                    <InfoRow label="Slot / Hours" value={data.slot || data.hours_opted} />
                    <InfoRow label="Mother Phone" value={data.mother_phone} />
                    <InfoRow label="Father Phone" value={data.father_phone} />
                </div>
            </div>

            {/* One-Time Fees */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">One-Time Fees</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Registration', amtField: 'registration_amount', stField: 'registration_status' },
                        { label: 'Security Deposit', amtField: 'security_deposit_amount', stField: 'security_deposit_status' },
                        { label: 'Admission Form Fee', amtField: 'admission_form_fee', stField: 'admission_form_status' },
                    ].map(({ label, amtField, stField }) => (
                        <div key={label} className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl space-y-2">
                            <p className="text-xs font-black text-slate-500 uppercase">{label}</p>
                            <p className="text-lg font-black text-slate-800 dark:text-white">{fmt(data[amtField])}</p>
                            <select
                                className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 outline-none"
                                value={fee[stField] || data[stField] || 'Unpaid'}
                                onChange={e => setFee((p: any) => ({ ...p, [stField]: e.target.value }))}>
                                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preschool Installments */}
            {data.program_type === 'preschool' && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Installments</h2>
                        <span className="text-xs font-bold text-slate-400">Paid: {fmt(totalInstPaid)} of {fmt(data.school_fees)}</span>
                    </div>
                    <div className="space-y-3">
                        {installments.map((inst, i) => {
                            const isPaid = inst.status === 'Paid';
                            const isPartial = inst.status === 'Partial';
                            const isOverdue = inst.due_date && new Date(inst.due_date) < new Date() && !isPaid;
                            return (
                                <div key={inst.id} className={`p-4 rounded-xl border-2 ${isPaid ? 'border-green-200 bg-green-50/50' : isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                                        <div className="space-y-1">
                                            <label className="text-xs font-black text-slate-400">Installment {inst.installment_no}</label>
                                            <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                <input type="number" className="w-full pl-5 pr-2 py-2 border border-slate-200 rounded-lg text-sm bg-white dark:bg-zinc-900 outline-none"
                                                    value={inst.amount} onChange={e => updateInst(i, 'amount', e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-black text-slate-400">Status</label>
                                            <select className={`w-full border rounded-lg px-2 py-2 text-xs outline-none ${isPaid ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-white dark:bg-zinc-900'}`}
                                                value={inst.status} onChange={e => updateInst(i, 'status', e.target.value)}>
                                                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-black text-slate-400">Part Payment</label>
                                            <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                                <input type="number" className="w-full pl-5 pr-2 py-2 border border-slate-200 rounded-lg text-sm bg-white dark:bg-zinc-900 outline-none"
                                                    value={inst.part_payment || ''} onChange={e => updateInst(i, 'part_payment', e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-black text-slate-400">Due Date</label>
                                            <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white dark:bg-zinc-900 outline-none"
                                                value={inst.due_date ? inst.due_date.split('T')[0] : ''} onChange={e => updateInst(i, 'due_date', e.target.value)} />
                                        </div>
                                    </div>
                                    {isOverdue && <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1"><span className="material-icons text-sm">warning</span>Overdue</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Daycare Monthly Grid */}
            {data.program_type === 'daycare' && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Monthly Payments (Apr – Mar)</h2>
                        <span className="text-xs font-bold text-slate-400">Collected: {fmt(totalMonthPaid)} of {fmt(data.monthly_fee * 12)}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {monthly.map((m, i) => {
                            const amtPaid = parseFloat(m.amount_paid || 0);
                            const amtDue = parseFloat(m.amount_due || 0);
                            const isPaid = amtPaid >= amtDue && amtDue > 0;
                            const isPartial = amtPaid > 0 && amtPaid < amtDue;
                            const balance = amtDue - amtPaid;
                            return (
                                <div key={m.id} className={`p-3 rounded-xl border-2 transition-all ${isPaid ? 'border-green-200 bg-green-50/50' : isPartial ? 'border-yellow-200 bg-yellow-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">{m.month_name}</span>
                                        {isPaid && <span className="material-icons text-green-500 text-sm">check_circle</span>}
                                        {isPartial && <span className="material-icons text-yellow-500 text-sm">timelapse</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-1.5">Due: {fmt(amtDue)}</p>
                                    <div className="relative mb-1.5">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                        <input type="number" placeholder="Amount paid"
                                            className="w-full pl-5 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-1 focus:ring-primary/20"
                                            value={m.amount_paid || ''} onChange={e => updateMonth(i, 'amount_paid', e.target.value)} />
                                    </div>
                                    {balance > 0 && amtPaid > 0 && (
                                        <p className="text-[10px] text-yellow-600 font-bold">Balance: {fmt(balance)}</p>
                                    )}
                                    <input type="date" className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none mt-1"
                                        value={m.paid_date ? m.paid_date.split('T')[0] : ''} onChange={e => updateMonth(i, 'paid_date', e.target.value)}
                                        placeholder="Paid date" />
                                </div>
                            );
                        })}
                    </div>

                    {/* Extra hours */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase">Extra Hours</label>
                            <input type="number" className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none"
                                value={fee.extra_hours || ''} onChange={e => setFee((p: any) => ({ ...p, extra_hours: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase">Extra Hours Amount</label>
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input type="number" className="w-full pl-7 pr-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none"
                                    value={fee.extra_hours_amount || ''} onChange={e => setFee((p: any) => ({ ...p, extra_hours_amount: e.target.value }))} /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Waivers */}
            {waivers.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Applied Waivers</h2>
                    <div className="space-y-3">
                        {waivers.map(w => (
                            <div key={w.id} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-purple-500 text-sm">loyalty</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{w.waiver_type}</span>
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full font-bold">{fmt(w.amount)}</span>
                                    </div>
                                    {w.reason && <p className="text-xs text-slate-500 mt-1 ml-6">{w.reason}</p>}
                                    {w.approved_by && <p className="text-xs text-slate-400 mt-0.5 ml-6">Approved by: {w.approved_by}</p>}
                                </div>
                                <button onClick={() => removeWaiver(w.id)}
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all">
                                    <span className="material-icons text-sm">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Notes</h2>
                <textarea rows={3} className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm bg-slate-50 dark:bg-zinc-800 outline-none resize-none"
                    placeholder="Internal notes about this fee plan..."
                    value={fee.notes || ''} onChange={e => setFee((p: any) => ({ ...p, notes: e.target.value }))} />
            </div>

            {/* Save button (bottom) */}
            <div className="flex justify-end pb-8">
                <button onClick={save} disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-lime-600 disabled:opacity-50 transition-all">
                    <span className="material-icons text-sm">{saved ? 'check' : 'save'}</span>
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
