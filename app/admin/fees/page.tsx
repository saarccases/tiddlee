'use client';

import React, { useState, useEffect } from 'react';

const PROGRAMS = ['Toddlers', 'Kamblee', 'Pupalee', 'Tiddlee'];
const FEE_TYPES = ['Registration', 'Tuition', 'Activity', 'Material', 'Transport', 'Other'];
const FREQUENCIES = ['one-time', 'monthly', 'quarterly', 'yearly'];

export default function FeesManagement() {
    const [fees, setFees] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingFee, setEditingFee] = useState<any>(null);
    const [selectedProgram, setSelectedProgram] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [studentFees, setStudentFees] = useState<any[]>([]);
    const [loadingStudentFees, setLoadingStudentFees] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        program_name: PROGRAMS[0],
        fee_type: FEE_TYPES[0],
        amount: '',
        frequency: FREQUENCIES[0],
    });

    useEffect(() => {
        fetchFees();
        fetchStudents();
    }, []);

    const fetchFees = async () => {
        try {
            const res = await fetch('/api/admin/fees');
            if (res.ok) setFees(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/admin/admissions?status=approved');
            if (res.ok) setStudents(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudentFees = async (admissionId: number) => {
        setLoadingStudentFees(true);
        try {
            const res = await fetch(`/api/admin/fees?admission_id=${admissionId}`);
            if (res.ok) setStudentFees(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStudentFees(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const payload = editingFee ? { ...formData, id: editingFee.id } : formData;
            const res = await fetch('/api/admin/fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                fetchFees();
                resetForm();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/fees?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchFees();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (fee: any) => {
        setEditingFee(fee);
        setFormData({
            program_name: fee.program_name,
            fee_type: fee.fee_type,
            amount: fee.amount,
            frequency: fee.frequency,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingFee(null);
        setFormData({ program_name: PROGRAMS[0], fee_type: FEE_TYPES[0], amount: '', frequency: FREQUENCIES[0] });
    };

    const markAsPaid = async (studentFeeId: number) => {
        try {
            const res = await fetch('/api/admin/fees', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_status',
                    student_fee_id: studentFeeId,
                    status: 'paid',
                    paid_date: new Date().toISOString().split('T')[0],
                }),
            });
            if (res.ok && selectedStudent) {
                fetchStudentFees(selectedStudent.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredFees = selectedProgram === 'all' ? fees : fees.filter(f => f.program_name === selectedProgram);

    // Group fees by program
    const groupedFees: Record<string, any[]> = {};
    filteredFees.forEach(f => {
        if (!groupedFees[f.program_name]) groupedFees[f.program_name] = [];
        groupedFees[f.program_name].push(f);
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Fee Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                        <span className="inline-block w-4 h-[2px] bg-primary"></span>
                        Set Fees per Programme
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-primary hover:bg-lime-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/30 transition-all hover:-translate-y-1"
                >
                    <span className="material-icons text-xl">add</span>
                    Add Fee
                </button>
            </div>

            {/* Program Filter */}
            <div className="flex gap-3">
                <button
                    onClick={() => setSelectedProgram('all')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedProgram === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-zinc-800 text-slate-400 hover:text-primary border border-slate-100 dark:border-zinc-700'}`}
                >
                    All
                </button>
                {PROGRAMS.map(p => (
                    <button
                        key={p}
                        onClick={() => setSelectedProgram(p)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedProgram === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-zinc-800 text-slate-400 hover:text-primary border border-slate-100 dark:border-zinc-700'}`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Fee Cards by Program */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-icons animate-spin text-4xl text-primary">sync</span>
                </div>
            ) : Object.keys(groupedFees).length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-xl p-20 text-center">
                    <span className="material-icons text-[80px] text-slate-200 dark:text-zinc-700">account_balance_wallet</span>
                    <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-sm">No fees configured yet</p>
                    <p className="mt-2 text-slate-300 text-xs font-bold uppercase tracking-widest">Add fee structures for each programme</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedFees).map(([program, programFees]) => (
                        <div key={program} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <span className="material-icons text-primary text-xl">school</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{program}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{programFees.length} fee item{programFees.length > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total (One-time)</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        {formatCurrency(programFees.filter((f: any) => f.frequency === 'one-time').reduce((sum: number, f: any) => sum + Number(f.amount), 0))}
                                    </p>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                                {programFees.map((fee: any) => (
                                    <div key={fee.id} className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                                <span className="material-icons text-lg">
                                                    {fee.fee_type === 'Registration' ? 'app_registration' :
                                                     fee.fee_type === 'Tuition' ? 'menu_book' :
                                                     fee.fee_type === 'Activity' ? 'sports_soccer' :
                                                     fee.fee_type === 'Material' ? 'inventory_2' :
                                                     fee.fee_type === 'Transport' ? 'directions_bus' : 'receipt'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{fee.fee_type}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fee.frequency}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(fee.amount)}</p>
                                            <button
                                                onClick={() => handleEdit(fee)}
                                                className="size-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-icons text-base">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(fee.id)}
                                                className="size-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-icons text-base">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Student Fee Status */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Student Fee Status</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Student</th>
                                    <th className="px-8 py-5">Programme</th>
                                    <th className="px-8 py-5">Fee Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-16 text-center text-slate-300 font-black uppercase tracking-widest text-sm">
                                            No approved students
                                        </td>
                                    </tr>
                                ) : (
                                    students.map(student => (
                                        <tr
                                            key={student.id}
                                            onClick={() => { setSelectedStudent(student); fetchStudentFees(student.id); }}
                                            className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                                                        {student.child_photo ? (
                                                            <img src={student.child_photo} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <span className="material-icons text-xl text-slate-200">face</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{student.child_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.unique_id || 'No ID'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {student.programs_selected?.map((p: string) => (
                                                        <span key={p} className="text-[9px] font-black bg-primary/5 text-primary px-2.5 py-1 rounded-lg uppercase tracking-widest border border-primary/10">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="size-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all ml-auto">
                                                    <span className="material-icons text-base">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Fee Modal */}
            {showForm && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={resetForm} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl z-50 animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-zinc-800">
                        <div className="p-8 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{editingFee ? 'Edit Fee' : 'Add New Fee'}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Set fee for a programme</p>
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Programme</label>
                                <select
                                    value={formData.program_name}
                                    onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fee Type</label>
                                <select
                                    value={formData.fee_type}
                                    onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount (INR)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Frequency</label>
                                <div className="flex gap-2">
                                    {FREQUENCIES.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFormData({ ...formData, frequency: f })}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.frequency === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-4">
                            <button
                                onClick={resetForm}
                                className="px-8 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-4 bg-primary hover:bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all flex items-center gap-2"
                            >
                                <span className="material-icons text-base">{editingFee ? 'save' : 'add'}</span>
                                {editingFee ? 'Update' : 'Add Fee'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Student Fee Detail Slideout */}
            {selectedStudent && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                        onClick={() => { setSelectedStudent(null); setStudentFees([]); }}
                    />
                    <div className="fixed top-0 right-0 h-full w-full max-w-[550px] bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                            <div className="flex items-center justify-between mb-5">
                                <button
                                    onClick={() => { setSelectedStudent(null); setStudentFees([]); }}
                                    className="size-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="size-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-1 overflow-hidden">
                                    {selectedStudent.child_photo ? (
                                        <img src={selectedStudent.child_photo} className="w-full h-full object-cover rounded-xl" alt="" />
                                    ) : (
                                        <span className="material-icons text-3xl text-slate-200">face</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedStudent.child_name}</h3>
                                    <div className="flex gap-3 mt-1">
                                        {selectedStudent.programs_selected?.map((p: string) => (
                                            <span key={p} className="text-[9px] font-black bg-primary/5 text-primary px-2.5 py-1 rounded-lg uppercase tracking-widest border border-primary/10">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fee Items */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="w-8 h-0.5 bg-primary"></span>
                                Fee Breakdown
                            </h4>

                            {loadingStudentFees ? (
                                <div className="flex items-center justify-center py-16">
                                    <span className="material-icons animate-spin text-3xl text-primary">sync</span>
                                </div>
                            ) : studentFees.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="material-icons text-[60px] text-slate-200 dark:text-zinc-700">receipt_long</span>
                                    <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-xs">No fees assigned yet</p>
                                    <p className="mt-1 text-slate-300 text-[10px] font-bold uppercase tracking-widest">Fees are auto-assigned when programme fees are configured</p>
                                </div>
                            ) : (
                                <>
                                    {studentFees.map((sf: any) => (
                                        <div key={sf.id} className={`p-5 rounded-2xl border-2 flex items-center justify-between ${sf.status === 'paid' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20' : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-xl flex items-center justify-center ${sf.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    <span className="material-icons text-lg">{sf.status === 'paid' ? 'check_circle' : 'schedule'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{sf.fee_type}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sf.program_name} · {sf.frequency}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(sf.amount)}</p>
                                                {sf.status === 'pending' && (
                                                    <button
                                                        onClick={() => markAsPaid(sf.id)}
                                                        className="px-4 py-2 bg-primary hover:bg-lime-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {sf.status === 'paid' && (
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Paid</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Total */}
                                    <div className="mt-6 p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Total</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            {formatCurrency(studentFees.reduce((sum: number, sf: any) => sum + Number(sf.amount), 0))}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                            Paid: {formatCurrency(studentFees.filter((sf: any) => sf.status === 'paid').reduce((sum: number, sf: any) => sum + Number(sf.amount), 0))}
                                        </p>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                            Pending: {formatCurrency(studentFees.filter((sf: any) => sf.status === 'pending').reduce((sum: number, sf: any) => sum + Number(sf.amount), 0))}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
