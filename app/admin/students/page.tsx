'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentDirectory() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/admin/admissions?status=approved');
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.child_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.unique_id?.toLowerCase().includes(search.toLowerCase()) ||
        s.mother_name?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB');
    };

    const formatDateInput = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const openDetail = (student: any) => {
        setSelectedStudent(student);
        setEditing(false);
        setEditData({});
    };

    const startEditing = () => {
        setEditData({ ...selectedStudent });
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setEditData({});
    };

    const handleChange = (field: string, value: string) => {
        setEditData((prev: any) => ({ ...prev, [field]: value }));
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            if (response.ok) {
                // Update local state
                setStudents(prev => prev.map(s => s.id === editData.id ? { ...s, ...editData } : s));
                setSelectedStudent({ ...selectedStudent, ...editData });
                setEditing(false);
            }
        } catch (err) {
        } finally {
            setSaving(false);
        }
    };

    // Render a field: view mode shows text, edit mode shows input
    const Field = ({ label, field, type = 'text' }: { label: string; field: string; type?: string }) => {
        const value = editing ? (editData[field] ?? '') : (selectedStudent?.[field] ?? '');
        if (editing) {
            return (
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    {type === 'textarea' ? (
                        <textarea
                            value={value}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            rows={3}
                        />
                    ) : (
                        <input
                            type={type}
                            value={type === 'date' ? formatDateInput(value) : value}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    )}
                </div>
            );
        }
        return (
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {type === 'date' ? formatDate(value) : (value || '—')}
                </p>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Student Directory</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                        <span className="inline-block w-4 h-[2px] bg-primary"></span>
                        Manage Enrolled Records
                    </p>
                </div>
                <button className="bg-primary hover:bg-lime-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/30 transition-all hover:-translate-y-1">
                    <span className="material-icons text-xl">person_add</span>
                    Register New Student
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative">
                        <span className="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by name, parent, or ID..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl text-sm font-black uppercase tracking-widest placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all mt-0"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <select className="bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 appearance-none min-w-[180px]">
                            <option>All Programs</option>
                            <option>Playgroup</option>
                            <option>Nursery</option>
                            <option>KG 1</option>
                            <option>KG 2</option>
                        </select>
                        <button className="size-14 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                            <span className="material-icons">filter_list</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Directory Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Unique ID</th>
                                <th className="px-10 py-6">Student Details</th>
                                <th className="px-10 py-6">Programs</th>
                                <th className="px-10 py-6">Parent Contact</th>
                                <th className="px-10 py-6">Enrollment Date</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-20 text-center">
                                        <span className="material-icons animate-spin text-4xl text-primary">sync</span>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                                        No enrolled students found matching your search
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        onClick={() => openDetail(student)}
                                        className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                    >
                                        <td className="px-10 py-8">
                                            <span className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 uppercase tracking-widest">
                                                {student.unique_id || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="size-14 bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-1 border border-slate-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                                                    {student.child_photo ? (
                                                        <img src={student.child_photo} className="w-full h-full object-cover rounded-xl" alt="Child" />
                                                    ) : (
                                                        <span className="material-icons text-3xl text-slate-200">face</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">{student.child_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DOB: {formatDate(student.child_dob)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-wrap gap-2">
                                                {student.programs_selected?.map((p: string) => (
                                                    <span key={p} className="text-[9px] font-black bg-primary/5 text-primary px-3 py-1 rounded-lg uppercase tracking-widest border border-primary/10">{p}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-none mb-1">{student.mother_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.mother_cell_phone}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{formatDate(student.created_at)}</span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openDetail(student); }}
                                                    className="size-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="material-icons text-lg">description</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setEditData({ ...student }); setEditing(true); }}
                                                    className="size-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="material-icons text-lg">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] flex items-center gap-6 group hover:bg-primary/10 transition-all">
                    <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 transform rotate-3 scale-110">
                        <span className="material-icons text-3xl font-bold">groups</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Enrollment</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{students.length} <span className="text-sm text-emerald-500 ml-2">+4%</span></h4>
                    </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-8 rounded-[2rem] flex items-center gap-6 group hover:bg-blue-50 transition-all">
                    <div className="size-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 transform -rotate-3 scale-110">
                        <span className="material-icons text-3xl font-bold">assignment_turned_in</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Active Programs</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">4 <span className="text-sm text-slate-400 ml-2">Units</span></h4>
                    </div>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 p-8 rounded-[2rem] flex items-center gap-6 group hover:bg-purple-50 transition-all">
                    <div className="size-16 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 transform rotate-6 scale-110">
                        <span className="material-icons text-3xl font-bold">cake</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Birthdays this Month</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">12 <span className="text-sm text-slate-400 ml-2 font-bold italic">Upcoming</span></h4>
                    </div>
                </div>
            </div>

            {/* Student Detail Slideout */}
            {selectedStudent && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                        onClick={() => { setSelectedStudent(null); setEditing(false); }}
                    />

                    {/* Panel */}
                    <div className="fixed top-0 right-0 h-full w-full max-w-[700px] bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => { setSelectedStudent(null); setEditing(false); }}
                                    className="size-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                                <div className="flex gap-3">
                                    {!editing ? (
                                        <button
                                            onClick={startEditing}
                                            className="px-6 py-3 bg-primary hover:bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                                        >
                                            <span className="material-icons text-base">edit</span>
                                            Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={cancelEditing}
                                                className="px-6 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveChanges}
                                                disabled={saving}
                                                className="px-6 py-3 bg-primary hover:bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                                            >
                                                <span className="material-icons text-base">{saving ? 'sync' : 'save'}</span>
                                                {saving ? 'Saving...' : 'Update'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-white dark:bg-zinc-800 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-1.5 overflow-hidden">
                                    {selectedStudent.child_photo ? (
                                        <img src={selectedStudent.child_photo} className="w-full h-full object-cover rounded-[1rem]" alt="Child" />
                                    ) : (
                                        <span className="material-icons text-4xl text-slate-200">face</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedStudent.child_name}</h2>
                                    <div className="mt-1 flex items-center gap-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5">
                                            <span className="material-icons text-sm">cake</span>
                                            {formatDate(selectedStudent.child_dob)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="material-icons text-sm">tag</span>
                                            {selectedStudent.unique_id || 'No ID'}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="material-icons text-sm">{selectedStudent.child_gender === 'Male' ? 'male' : 'female'}</span>
                                            {selectedStudent.child_gender || '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Child Information */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-primary"></span>
                                    Child Information
                                </h3>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Full Name" field="child_name" />
                                        <Field label="Nickname" field="child_nickname" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Field label="Date of Birth" field="child_dob" type="date" />
                                        <Field label="Age" field="child_age" />
                                        <Field label="Gender" field="child_gender" />
                                    </div>
                                    <Field label="Residence Address" field="child_residence_address" type="textarea" />
                                </div>
                            </div>

                            {/* Program Selection */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-emerald-500"></span>
                                    Program Selection
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {selectedStudent.programs_selected?.map((prog: string) => (
                                        <div key={prog} className="px-5 py-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-2">
                                            <span className="material-icons text-primary text-lg">verified</span>
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{prog}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mother / Guardian 1 */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-blue-500"></span>
                                    Mother / Guardian 1
                                </h3>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    <Field label="Full Name" field="mother_name" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Phone" field="mother_cell_phone" />
                                        <Field label="Email" field="mother_email" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Employer" field="mother_employer" />
                                        <Field label="Work Phone" field="mother_work_phone" />
                                    </div>
                                    <Field label="Address" field="mother_residence_address" type="textarea" />
                                </div>
                            </div>

                            {/* Father / Guardian 2 */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-indigo-500"></span>
                                    Father / Guardian 2
                                </h3>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    <Field label="Full Name" field="father_name" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Phone" field="father_cell_phone" />
                                        <Field label="Email" field="father_email" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Employer" field="father_employer" />
                                        <Field label="Work Phone" field="father_work_phone" />
                                    </div>
                                    <Field label="Address" field="father_residence_address" type="textarea" />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-orange-500"></span>
                                    Emergency Contact
                                </h3>
                                <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-[1.5rem] border border-orange-100 dark:border-orange-900/20 space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <Field label="Name" field="emergency_contact_name" />
                                        <Field label="Phone" field="emergency_contact_phone" />
                                        <Field label="Relation" field="emergency_contact_relation" />
                                    </div>
                                </div>
                            </div>

                            {/* Medical & Health */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-red-500"></span>
                                    Medical & Health
                                </h3>
                                <div className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-[1.5rem] border border-red-100 dark:border-red-900/20 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Blood Group" field="blood_group" />
                                        <Field label="Food Allergies" field="food_allergies" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Allergies / Reactions" field="allergies_reactions" />
                                        <Field label="Past Illnesses" field="past_illnesses" />
                                    </div>
                                    <Field label="Other Health Info" field="other_health_info" type="textarea" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Height" field="current_height" />
                                        <Field label="Weight" field="current_weight" />
                                    </div>
                                </div>
                            </div>

                            {/* Physician */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-teal-500"></span>
                                    Physician Details
                                </h3>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Physician Name" field="physician_name" />
                                        <Field label="Physician Phone" field="physician_phone" />
                                    </div>
                                    <Field label="Physician Address" field="physician_address" type="textarea" />
                                </div>
                            </div>

                            {/* Child Preferences */}
                            <div className="space-y-5">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-8 h-0.5 bg-purple-500"></span>
                                    Preferences & Habits
                                </h3>
                                <div className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-[1.5rem] border border-purple-100 dark:border-purple-900/20 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Likes" field="likes" />
                                        <Field label="Dislikes" field="dislikes" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Sleep Routines" field="sleep_routines" />
                                        <Field label="Playtime Activities" field="playtime_activities" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Potty Trained" field="is_potty_trained" />
                                        <Field label="Languages Spoken" field="languages_spoken" />
                                    </div>
                                    <Field label="Additional Comments" field="additional_comments" type="textarea" />
                                </div>
                            </div>

                            <div className="h-10"></div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
