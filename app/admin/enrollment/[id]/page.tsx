'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const MONTHS = [
    { key: 'april', label: 'April' }, { key: 'may', label: 'May' },
    { key: 'june', label: 'June' }, { key: 'july', label: 'July' },
    { key: 'august', label: 'August' }, { key: 'september', label: 'September' },
    { key: 'october', label: 'October' }, { key: 'november', label: 'November' },
    { key: 'december', label: 'December' }, { key: 'january', label: 'January' },
    { key: 'february', label: 'February' }, { key: 'march', label: 'March' },
];

const STATUS_OPTIONS = ['Paid', 'Unpaid', 'Partial', 'Wave Off', 'Carry Forward'];

function fmt(n: any) {
    const num = parseFloat(n) || 0;
    return '₹' + num.toLocaleString('en-IN');
}

function StatusBadge({ status }: { status: string }) {
    const s = (status || '').toLowerCase();
    const map: any = {
        paid: 'bg-green-100 text-green-700',
        unpaid: 'bg-red-100 text-red-700',
        partial: 'bg-yellow-100 text-yellow-700',
        'wave off': 'bg-purple-100 text-purple-700',
        'carry forward': 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[s] || 'bg-slate-100 text-slate-600'}`}>{status || '—'}</span>;
}

function InfoRow({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{value || '—'}</span>
        </div>
    );
}

export default function EnrollmentDetail() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [fees, setFees] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editFees, setEditFees] = useState<any>({});

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/enrollment?id=${id}`);
            if (res.ok) {
                const d = await res.json();
                setData(d);
                setFees(d.fees || {});
                setEditFees(d.fees || {});
            }
        } finally { setLoading(false); }
    };

    const saveFees = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/enrollment', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type: data.program_type, fees: editFees }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            fetchData();
        } finally { setSaving(false); }
    };

    const setFeeField = (field: string, value: any) => {
        setEditFees((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) return (
        <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!data) return <div className="text-center py-24 text-slate-400">Student not found</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/enrollment" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
                    <span className="material-icons text-slate-500">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">{data.child_name}</h1>
                    <p className="text-sm text-slate-500 font-mono">{data.unique_id} · {data.program_type === 'preschool' ? 'Preschool' : 'Daycare'}</p>
                </div>
                <div className="ml-auto flex gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${data.new_or_existing === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {data.new_or_existing}
                    </span>
                </div>
            </div>

            {/* Student Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Student Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <InfoRow label="Gender" value={data.gender} />
                    <InfoRow label="Date of Birth" value={data.dob} />
                    <InfoRow label="Age" value={data.age} />
                    <InfoRow label="Blood Group" value={data.blood_group} />
                    <InfoRow label="Program" value={data.program_name} />
                    <InfoRow label="Slot / Hours" value={data.slot || data.hours_opted} />
                    <InfoRow label="Enrolled On" value={data.enrollment_date} />
                    <InfoRow label="Allergy" value={data.allergy} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800">
                    <InfoRow label="Mother Phone" value={data.mother_phone} />
                    <InfoRow label="Father Phone" value={data.father_phone} />
                    <InfoRow label="Guardian Phone" value={data.guardian_phone} />
                    <InfoRow label="Mother Email" value={data.mother_email} />
                    <InfoRow label="Father Email" value={data.father_email} />
                    <InfoRow label="Address" value={data.address} />
                </div>
                <div className="grid grid-cols-3 gap-5 mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800">
                    <InfoRow label="Kit Handover" value={data.kit_handover} />
                    <InfoRow label="Photographs" value={data.photographs} />
                    <InfoRow label="Form Signed" value={data.enrollment_form_signed} />
                </div>
            </div>

            {/* Fee Section */}
            {data.program_type === 'preschool' ? (
                <PreschoolFees fees={editFees} setFeeField={setFeeField} />
            ) : (
                <DaycareFees fees={editFees} setFeeField={setFeeField} feePerMonth={editFees.fees_per_month} />
            )}

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={saveFees}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-lime-600 disabled:opacity-50 transition-all"
                >
                    <span className="material-icons text-sm">{saved ? 'check' : 'save'}</span>
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

function PreschoolFees({ fees, setFeeField }: { fees: any; setFeeField: Function }) {
    const numInst = parseInt(fees.num_installments) || 1;

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'School Fees', value: fmt(fees.school_fees), color: 'text-slate-700' },
                    { label: 'Total Amount', value: fmt(fees.total_amount), color: 'text-blue-700' },
                    { label: 'Amount Paid', value: fmt(parseFloat(fees.total_amount || 0) - parseFloat(fees.fees_due || 0)), color: 'text-green-700' },
                    { label: 'Fees Due', value: fmt(fees.fees_due), color: parseFloat(fees.fees_due) > 0 ? 'text-red-600' : 'text-green-600' },
                ].map(c => (
                    <div key={c.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{c.label}</p>
                        <p className={`text-xl font-black mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6 space-y-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Fee Details</h2>

                {/* One-time fees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Registration Amount</label>
                        <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 outline-none" value={fees.registration_amount || ''} onChange={e => setFeeField('registration_amount', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Registration Status</label>
                        <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 outline-none" value={fees.registration_status || 'Unpaid'} onChange={e => setFeeField('registration_status', e.target.value)}>
                            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Security Deposit</label>
                        <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 outline-none" value={fees.security_deposit_amount || ''} onChange={e => setFeeField('security_deposit_amount', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Security Deposit Status</label>
                        <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 outline-none" value={fees.security_deposit_status || 'Unpaid'} onChange={e => setFeeField('security_deposit_status', e.target.value)}>
                            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Admission Form Fee</label>
                        <div className="flex gap-2">
                            <input type="number" className="flex-1 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 outline-none" value={fees.admission_form_fee || ''} onChange={e => setFeeField('admission_form_fee', e.target.value)} />
                            <select className="border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.admission_form_status || 'Unpaid'} onChange={e => setFeeField('admission_form_status', e.target.value)}>
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Wave Off */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Wave Off Type</label>
                        <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.wave_off_type || ''} onChange={e => setFeeField('wave_off_type', e.target.value)}>
                            <option value="">None</option>
                            <option value="manual">Manual</option>
                            <option value="sibling">Sibling Discount</option>
                            <option value="staff">Staff Child</option>
                            <option value="scholarship">Scholarship</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Wave Off Reason</label>
                        <input type="text" className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.wave_off_reason || ''} onChange={e => setFeeField('wave_off_reason', e.target.value)} placeholder="Reason for wave off..." />
                    </div>
                </div>

                {/* Installments */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-wide">Installments</h3>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-500">No. of Installments:</label>
                            <select className="border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.num_installments || 1} onChange={e => setFeeField('num_installments', parseInt(e.target.value))}>
                                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[1,2,3,4].slice(0, numInst).map(n => (
                            <div key={n} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400">Installment {n} Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                        <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary/20" value={fees[`inst${n}_amount`] || ''} onChange={e => setFeeField(`inst${n}_amount`, e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400">Status</label>
                                    <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 outline-none" value={fees[`inst${n}_status`] || 'Unpaid'} onChange={e => setFeeField(`inst${n}_status`, e.target.value)}>
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400">Part Payment</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                        <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary/20" value={fees[`inst${n}_part_payment`] || ''} onChange={e => setFeeField(`inst${n}_part_payment`, e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400">Difference</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                        <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary/20" value={fees[`inst${n}_difference`] || ''} onChange={e => setFeeField(`inst${n}_difference`, e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DaycareFees({ fees, setFeeField, feePerMonth }: { fees: any; setFeeField: Function; feePerMonth: any }) {
    const paidMonths = MONTHS.filter(m => (fees[`${m.key}_status`] || '').toLowerCase() === 'paid').length;
    const totalPaid = paidMonths * (parseFloat(feePerMonth) || 0);

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Monthly Fee', value: fmt(fees.fees_per_month) },
                    { label: 'Months Paid', value: `${paidMonths}/12` },
                    { label: 'Total Paid', value: fmt(totalPaid) },
                    { label: 'Total Payable', value: fmt(fees.total_amount_payable) },
                ].map(c => (
                    <div key={c.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{c.label}</p>
                        <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6 space-y-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Fee Details</h2>

                {/* Basic fees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Monthly Fee</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                            <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/20" value={fees.fees_per_month || ''} onChange={e => setFeeField('fees_per_month', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Security Deposit</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.security_deposit_amount || ''} onChange={e => setFeeField('security_deposit_amount', e.target.value)} />
                            </div>
                            <select className="border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.security_deposit_status || 'Unpaid'} onChange={e => setFeeField('security_deposit_status', e.target.value)}>
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Admission Form Fee</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input type="number" className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.admission_form_fee || ''} onChange={e => setFeeField('admission_form_fee', e.target.value)} />
                            </div>
                            <select className="border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-2 text-sm bg-slate-50 dark:bg-zinc-800 outline-none" value={fees.admission_form_status || 'Unpaid'} onChange={e => setFeeField('admission_form_status', e.target.value)}>
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Monthly Fee Grid */}
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <h3 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-wide mb-4">Monthly Fee Status (Academic Year)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {MONTHS.map(({ key, label }) => {
                            const status = fees[`${key}_status`] || 'Unpaid';
                            const extra = fees[`${key}_extra_amount`] || '';
                            const isPaid = status.toLowerCase() === 'paid';
                            return (
                                <div key={key} className={`p-3 rounded-xl border-2 transition-all ${isPaid ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">{label}</span>
                                        {isPaid && <span className="material-icons text-green-500 text-sm">check_circle</span>}
                                    </div>
                                    <select
                                        className={`w-full rounded-lg px-2 py-1.5 text-xs font-bold border outline-none mb-2 ${isPaid ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300'}`}
                                        value={status}
                                        onChange={e => setFeeField(`${key}_status`, e.target.value)}
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Extra amt"
                                            className="w-full pl-5 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-1 focus:ring-primary/20"
                                            value={extra}
                                            onChange={e => setFeeField(`${key}_extra_amount`, e.target.value)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
