'use client';

import React, { useState, useEffect, useRef } from 'react';

const ROLES = ['Lead Educator', 'Assistant Educator', 'Support Staff', 'Preschool Nurse', 'Admin Staff', 'Caretaker', 'Driver', 'Cook', 'Counselor', 'Other'];
const DEPARTMENTS = ['Preschool', 'Daycare', 'Administration', 'Medical', 'Support', 'Transport'];
const PROGRAMS = ['Toddlers (Playgroup)', 'Kamblee (Nursery)', 'Pupalee (Jr KG)', 'Tiddlee (Sr KG)', 'Daycare', 'All Programs'];
const STATUS_OPTIONS = ['active', 'on_leave', 'inactive'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

type WorkExp = { company: string; role: string; from: string; to: string; description: string };
type Staff = {
    id?: number;
    employee_id?: string;
    name: string;
    photo?: string;
    dob?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
    blood_group?: string;
    role?: string;
    department?: string;
    status?: string;
    joining_date?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    work_experience?: WorkExp[];
    programs_handling?: string[];
    class_notes?: string;
    qualifications?: string[];
};

const EMPTY_STAFF: Staff = {
    name: '',
    photo: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    blood_group: '',
    role: '',
    department: '',
    status: 'active',
    joining_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    work_experience: [],
    programs_handling: [],
    class_notes: '',
    qualifications: [],
};

const EMPTY_EXP: WorkExp = { company: '', role: '', from: '', to: '', description: '' };

function statusColor(status?: string) {
    if (status === 'active') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (status === 'on_leave') return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-slate-100 text-slate-500 border-slate-200';
}
function statusLabel(s?: string) {
    if (s === 'active') return 'Active';
    if (s === 'on_leave') return 'On Leave';
    return 'Inactive';
}
function statusDot(s?: string) {
    if (s === 'active') return 'bg-primary shadow-lg shadow-primary/50';
    if (s === 'on_leave') return 'bg-amber-400';
    return 'bg-slate-300';
}
function initials(name?: string) {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}
function fmtDate(d?: string) {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function StaffManagement() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selected, setSelected] = useState<Staff | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'handling'>('personal');

    // Edit panel
    const [panelOpen, setPanelOpen] = useState(false);
    const [editData, setEditData] = useState<Staff>(EMPTY_STAFF);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => { fetchStaff(); }, [filterStatus]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/staff?status=${filterStatus}`);
            if (res.ok) setStaffList(await res.json());
        } catch { } finally { setLoading(false); }
    };

    const filtered = staffList.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.role?.toLowerCase().includes(search.toLowerCase()) ||
        s.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
        s.department?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditData(EMPTY_STAFF);
        setPanelOpen(true);
    };

    const openEdit = (s: Staff) => {
        setEditData({
            ...s,
            work_experience: s.work_experience?.length ? s.work_experience : [],
            programs_handling: s.programs_handling || [],
            qualifications: s.qualifications || [],
        });
        setPanelOpen(true);
    };

    const handleSelect = (s: Staff) => {
        setSelected(s);
        setShowDetail(true);
        setActiveSection('personal');
    };

    const setField = (field: keyof Staff, value: any) => setEditData(p => ({ ...p, [field]: value }));

    const toggleProgram = (prog: string) => {
        setEditData(p => ({
            ...p,
            programs_handling: p.programs_handling?.includes(prog)
                ? p.programs_handling.filter(x => x !== prog)
                : [...(p.programs_handling || []), prog],
        }));
    };

    const toggleQualification = (q: string) => {
        setEditData(p => ({
            ...p,
            qualifications: p.qualifications?.includes(q)
                ? p.qualifications.filter(x => x !== q)
                : [...(p.qualifications || []), q],
        }));
    };

    const addExp = () => setEditData(p => ({ ...p, work_experience: [...(p.work_experience || []), { ...EMPTY_EXP }] }));
    const removeExp = (i: number) => setEditData(p => ({ ...p, work_experience: (p.work_experience || []).filter((_, idx) => idx !== i) }));
    const setExp = (i: number, field: keyof WorkExp, val: string) => {
        setEditData(p => {
            const exps = [...(p.work_experience || [])];
            exps[i] = { ...exps[i], [field]: val };
            return { ...p, work_experience: exps };
        });
    };

    const handleSave = async () => {
        if (!editData.name.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            if (res.ok) {
                const data = await res.json();
                await fetchStaff();
                setPanelOpen(false);
                // Re-select updated staff
                if (selected?.id === editData.id || !editData.id) {
                    const updated = staffList.find(s => s.id === (editData.id || data.id));
                    if (updated) setSelected(updated);
                }
            }
        } catch { } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        try {
            await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
            setStaffList(p => p.filter(s => s.id !== id));
            if (selected?.id === id) { setSelected(null); setShowDetail(false); }
            setDeleteConfirm(null);
        } catch { }
    };

    // Stats
    const totalStaff = staffList.length;
    const activeCount = staffList.filter(s => s.status === 'active').length;
    const onLeaveCount = staffList.filter(s => s.status === 'on_leave').length;

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Staff Directory</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                        <span className="inline-block w-4 h-[2px] bg-primary"></span>
                        Manage Staff Records & Assignments
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="self-start sm:self-auto bg-primary hover:bg-lime-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/30 transition-all hover:-translate-y-1"
                >
                    <span className="material-icons text-xl">person_add</span>
                    Add Staff Member
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 lg:p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4">
                    <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="material-icons text-primary text-xl">badge</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{totalStaff}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 lg:p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4">
                    <div className="size-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="material-icons text-emerald-600 dark:text-emerald-400 text-xl">check_circle</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{activeCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 lg:p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4">
                    <div className="size-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="material-icons text-amber-600 dark:text-amber-400 text-xl">schedule</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On Leave</p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{onLeaveCount}</p>
                    </div>
                </div>
            </div>

            {/* Main two-panel layout */}
            <div className="h-[calc(100vh-22rem)] flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden">

                {/* LEFT: Staff List */}
                <aside className={`${showDetail ? 'hidden lg:flex' : 'flex'} w-full lg:w-[360px] xl:w-[400px] flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden`}>
                    {/* Search + Filter */}
                    <div className="p-5 lg:p-6 border-b border-slate-50 dark:border-zinc-800 space-y-4">
                        <div className="relative">
                            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, role, ID..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl text-sm font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            {['all', 'active', 'on_leave', 'inactive'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`flex-1 py-2 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-[0.15em] transition-all ${filterStatus === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-primary'}`}
                                >
                                    {s === 'on_leave' ? 'Leave' : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Staff Cards */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-5 space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <span className="material-icons animate-spin text-primary text-3xl">sync</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                                <span className="material-icons text-5xl mb-3">badge</span>
                                <p className="text-xs font-black uppercase tracking-widest">No staff found</p>
                            </div>
                        ) : (
                            filtered.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => handleSelect(s)}
                                    className={`p-4 lg:p-5 rounded-3xl cursor-pointer transition-all duration-200 border-2 group ${selected?.id === s.id
                                        ? 'bg-white dark:bg-zinc-800 border-primary shadow-xl shadow-primary/5 ring-4 ring-primary/5'
                                        : 'bg-slate-50/50 dark:bg-zinc-800/30 border-transparent hover:border-slate-200 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 font-black text-primary group-hover:scale-105 transition-transform">
                                            {s.photo ? (
                                                <img src={s.photo} className="w-full h-full object-cover" alt={s.name} />
                                            ) : (
                                                <span className="text-sm">{initials(s.name)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{s.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{s.role || '—'}</p>
                                            {s.employee_id && (
                                                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">{s.employee_id}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className={`size-2.5 rounded-full ${statusDot(s.status)}`}></span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${statusColor(s.status)}`}>
                                                {statusLabel(s.status)}
                                            </span>
                                        </div>
                                    </div>
                                    {s.programs_handling && s.programs_handling.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {s.programs_handling.slice(0, 2).map(p => (
                                                <span key={p} className="text-[8px] font-black bg-primary/5 text-primary px-2 py-0.5 rounded-md uppercase tracking-widest border border-primary/10">
                                                    {p.split(' ')[0]}
                                                </span>
                                            ))}
                                            {s.programs_handling.length > 2 && (
                                                <span className="text-[8px] font-black text-slate-400">+{s.programs_handling.length - 2}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* RIGHT: Detail Panel */}
                <section className={`${!showDetail ? 'hidden lg:flex' : 'flex'} flex-1 bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex-col`}>
                    {selected ? (
                        <>
                            {/* Detail Header */}
                            <div className="p-5 lg:p-8 border-b border-slate-50 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-800/30">
                                <button
                                    className="lg:hidden mb-4 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest"
                                    onClick={() => setShowDetail(false)}
                                >
                                    <span className="material-icons text-base">arrow_back</span>
                                    Back
                                </button>
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-center gap-4 lg:gap-6">
                                        <div className="size-16 lg:size-20 rounded-[1.5rem] overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 shadow-xl">
                                            {selected.photo ? (
                                                <img src={selected.photo} className="w-full h-full object-cover" alt={selected.name} />
                                            ) : (
                                                <span className="text-2xl font-black text-primary">{initials(selected.name)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selected.name}</h2>
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                {selected.role && (
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selected.role}</span>
                                                )}
                                                {selected.department && (
                                                    <>
                                                        <span className="text-slate-300">·</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selected.department}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${statusColor(selected.status)}`}>
                                                    {statusLabel(selected.status)}
                                                </span>
                                                {selected.employee_id && (
                                                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 border border-slate-200 dark:border-zinc-700">
                                                        {selected.employee_id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 shrink-0">
                                        <button
                                            onClick={() => openEdit(selected)}
                                            className="px-5 py-2.5 bg-primary hover:bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                                        >
                                            <span className="material-icons text-base">edit</span>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(selected.id!)}
                                            className="size-10 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            <span className="material-icons text-base">delete</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Section Tabs */}
                                <div className="flex gap-2 mt-5 border-b border-slate-100 dark:border-zinc-800 -mb-px">
                                    {(['personal', 'experience', 'handling'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveSection(tab)}
                                            className={`pb-3 px-1 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeSection === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {tab === 'personal' ? 'Personal Info' : tab === 'experience' ? 'Work Experience' : 'Class Handling'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Detail Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8">
                                {/* ─── PERSONAL INFO ─── */}
                                {activeSection === 'personal' && (
                                    <div className="space-y-8">
                                        {/* Contact */}
                                        <div className="space-y-4">
                                            <SectionLabel color="bg-primary" label="Contact Details" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InfoCard icon="phone" label="Phone" value={selected.phone} />
                                                <InfoCard icon="email" label="Email" value={selected.email} />
                                                <InfoCard icon="location_on" label="Address" value={selected.address} className="sm:col-span-2" />
                                            </div>
                                        </div>

                                        {/* Personal */}
                                        <div className="space-y-4">
                                            <SectionLabel color="bg-blue-500" label="Personal Details" />
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <InfoCard icon="cake" label="Date of Birth" value={fmtDate(selected.dob)} />
                                                <InfoCard icon="wc" label="Gender" value={selected.gender} />
                                                <InfoCard icon="bloodtype" label="Blood Group" value={selected.blood_group} />
                                            </div>
                                        </div>

                                        {/* Employment */}
                                        <div className="space-y-4">
                                            <SectionLabel color="bg-purple-500" label="Employment Details" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InfoCard icon="work" label="Role" value={selected.role} />
                                                <InfoCard icon="corporate_fare" label="Department" value={selected.department} />
                                                <InfoCard icon="event" label="Joining Date" value={fmtDate(selected.joining_date)} />
                                                <InfoCard icon="badge" label="Employee ID" value={selected.employee_id} />
                                            </div>
                                            {selected.qualifications && selected.qualifications.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qualifications</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selected.qualifications.map(q => (
                                                            <span key={q} className="text-[10px] font-black bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-xl border border-purple-100 dark:border-purple-900/30 uppercase tracking-widest">{q}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Emergency Contact */}
                                        {(selected.emergency_contact_name || selected.emergency_contact_phone) && (
                                            <div className="space-y-4">
                                                <SectionLabel color="bg-red-500" label="Emergency Contact" />
                                                <div className="bg-red-50/50 dark:bg-red-900/10 p-5 rounded-[1.5rem] border border-red-100 dark:border-red-900/20">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <InfoCard icon="person" label="Name" value={selected.emergency_contact_name} bare />
                                                        <InfoCard icon="phone" label="Phone" value={selected.emergency_contact_phone} bare />
                                                        <InfoCard icon="family_restroom" label="Relation" value={selected.emergency_contact_relation} bare />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─── WORK EXPERIENCE ─── */}
                                {activeSection === 'experience' && (
                                    <div className="space-y-6">
                                        {!selected.work_experience?.length ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                                                <span className="material-icons text-[60px] mb-4">history_edu</span>
                                                <p className="text-sm font-black uppercase tracking-widest">No work experience added</p>
                                                <button onClick={() => openEdit(selected)} className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20">
                                                    <span className="material-icons text-base">add</span>
                                                    Add Experience
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                {/* Timeline */}
                                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-zinc-800"></div>
                                                <div className="space-y-6 pl-16">
                                                    {selected.work_experience.map((exp, i) => (
                                                        <div key={i} className="relative">
                                                            <div className="absolute -left-10 top-4 size-4 rounded-full bg-primary border-4 border-white dark:border-zinc-900 shadow-md"></div>
                                                            <div className="bg-slate-50 dark:bg-zinc-800/50 p-5 lg:p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 hover:border-primary/20 transition-all">
                                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                                                    <div>
                                                                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{exp.role || '—'}</p>
                                                                        <p className="text-sm font-bold text-primary mt-0.5">{exp.company || '—'}</p>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-zinc-800 whitespace-nowrap">
                                                                        {exp.from || '?'} — {exp.to || 'Present'}
                                                                    </span>
                                                                </div>
                                                                {exp.description && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{exp.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─── CLASS / STUDENT HANDLING ─── */}
                                {activeSection === 'handling' && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <SectionLabel color="bg-primary" label="Programs / Classes Assigned" />
                                            {!selected.programs_handling?.length ? (
                                                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-[1.5rem] p-8 text-center border border-slate-100 dark:border-zinc-800">
                                                    <span className="material-icons text-4xl text-slate-200 dark:text-zinc-700">school</span>
                                                    <p className="mt-3 text-xs font-black text-slate-400 uppercase tracking-widest">No programs assigned yet</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {selected.programs_handling.map(prog => (
                                                        <div key={prog} className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center gap-3">
                                                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                                                <span className="material-icons text-primary text-lg">school</span>
                                                            </div>
                                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{prog}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {selected.class_notes && (
                                            <div className="space-y-4">
                                                <SectionLabel color="bg-amber-500" label="Notes & Responsibilities" />
                                                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-[1.5rem] border border-amber-100 dark:border-amber-900/20">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{selected.class_notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10">
                            <div className="size-24 lg:size-40 bg-slate-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 lg:mb-10">
                                <span className="material-icons text-[60px] lg:text-[100px]">badge</span>
                            </div>
                            <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-slate-400 text-center">Select a staff member</h3>
                            <p className="mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] text-center">Profile details will appear here</p>
                        </div>
                    )}
                </section>
            </div>

            {/* ─── Add / Edit Staff Modal ─── */}
            {panelOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setPanelOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                            <div className="size-12 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 font-black text-primary text-lg border-2 border-primary/20">
                                {editData.photo ? <img src={editData.photo} className="w-full h-full object-cover" alt="" /> : initials(editData.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {editData.id ? 'Edit Staff Member' : 'Add New Staff Member'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {editData.name || 'Fill in the details below'}
                                </p>
                            </div>
                            <button
                                onClick={() => setPanelOpen(false)}
                                className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all shrink-0"
                            >
                                <span className="material-icons text-xl">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">

                            {/* ── Photo + Basic ── */}
                            <div className="px-6 pt-6 pb-5 border-b border-slate-50 dark:border-zinc-800/60">
                                <PanelLabel label="Basic Information" />
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Staff Photo</label>
                                        <StaffPhotoUpload
                                            currentUrl={editData.photo || ''}
                                            name={editData.name}
                                            onUploaded={url => setField('photo', url)}
                                        />
                                    </div>
                                    <FormField label="Full Name *" placeholder="e.g. Sarah Wilson" value={editData.name} onChange={v => setField('name', v)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormSelect label="Role" value={editData.role || ''} onChange={v => setField('role', v)} options={ROLES} />
                                        <FormSelect label="Department" value={editData.department || ''} onChange={v => setField('department', v)} options={DEPARTMENTS} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormSelect label="Status" value={editData.status || 'active'} onChange={v => setField('status', v)} options={STATUS_OPTIONS} optionLabels={['Active', 'On Leave', 'Inactive']} />
                                        <FormField label="Joining Date" type="date" value={editData.joining_date || ''} onChange={v => setField('joining_date', v)} />
                                    </div>
                                    <FormField label="Employee ID" placeholder="Auto-generated if blank" value={editData.employee_id || ''} onChange={v => setField('employee_id', v)} />
                                </div>
                            </div>

                            {/* ── Personal Info ── */}
                            <div className="px-6 pt-6 pb-5 border-b border-slate-50 dark:border-zinc-800/60">
                                <PanelLabel label="Personal Information" />
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField label="Date of Birth" type="date" value={editData.dob || ''} onChange={v => setField('dob', v)} />
                                        <FormSelect label="Gender" value={editData.gender || ''} onChange={v => setField('gender', v)} options={['Male', 'Female', 'Other']} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Phone" type="tel" placeholder="+91 00000 00000" value={editData.phone || ''} onChange={v => setField('phone', v)} />
                                        <FormField label="Email" type="email" placeholder="email@example.com" value={editData.email || ''} onChange={v => setField('email', v)} />
                                    </div>
                                    <FormSelect label="Blood Group" value={editData.blood_group || ''} onChange={v => setField('blood_group', v)} options={BLOOD_GROUPS} />
                                    <FormTextarea label="Residence Address" placeholder="Full address" value={editData.address || ''} onChange={v => setField('address', v)} />
                                </div>
                            </div>

                            {/* ── Qualifications ── */}
                            <div className="px-6 pt-6 pb-5 border-b border-slate-50 dark:border-zinc-800/60">
                                <PanelLabel label="Qualifications" />
                                <div className="grid grid-cols-2 gap-2">
                                    {(['B.Ed', 'M.Ed', 'B.A', 'M.A', 'B.Sc', 'Diploma in ECE', 'Montessori Certified', 'First Aid Certified', 'CPR Certified', 'Other'].map(q => (
                                        <label key={q} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${editData.qualifications?.includes(q) ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-100 dark:border-zinc-800 hover:border-slate-200'}`}>
                                            <input type="checkbox" className="hidden" checked={editData.qualifications?.includes(q) || false} onChange={() => toggleQualification(q)} />
                                            <span className={`size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${editData.qualifications?.includes(q) ? 'border-purple-500 bg-purple-500' : 'border-slate-300'}`}>
                                                {editData.qualifications?.includes(q) && <span className="material-icons text-white text-sm">check</span>}
                                            </span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{q}</span>
                                        </label>
                                    )))}
                                </div>
                            </div>

                            {/* ── Emergency Contact ── */}
                            <div className="px-6 pt-6 pb-5 border-b border-slate-50 dark:border-zinc-800/60">
                                <PanelLabel label="Emergency Contact" />
                                <div className="space-y-4">
                                    <FormField label="Contact Name" placeholder="Full name" value={editData.emergency_contact_name || ''} onChange={v => setField('emergency_contact_name', v)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Phone" type="tel" placeholder="+91 00000 00000" value={editData.emergency_contact_phone || ''} onChange={v => setField('emergency_contact_phone', v)} />
                                        <FormField label="Relation" placeholder="e.g. Spouse" value={editData.emergency_contact_relation || ''} onChange={v => setField('emergency_contact_relation', v)} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Work Experience ── */}
                            <div className="px-6 pt-6 pb-5 border-b border-slate-50 dark:border-zinc-800/60">
                                <div className="flex items-center justify-between mb-4">
                                    <PanelLabel label="Work Experience" noMargin />
                                    <button
                                        onClick={addExp}
                                        className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                                    >
                                        <span className="material-icons text-sm">add</span>
                                        Add Entry
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(editData.work_experience || []).length === 0 && (
                                        <div className="flex flex-col items-center py-8 text-slate-300 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700">
                                            <span className="material-icons text-4xl mb-2">history_edu</span>
                                            <p className="text-xs font-black uppercase tracking-widest">No experience added yet</p>
                                        </div>
                                    )}
                                    {(editData.work_experience || []).map((exp, i) => (
                                        <div key={i} className="bg-slate-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="size-5 rounded-full bg-primary/20 text-primary text-[9px] font-black flex items-center justify-center">{i + 1}</span>
                                                    Experience Entry
                                                </span>
                                                <button onClick={() => removeExp(i)} className="size-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 flex items-center justify-center transition-all">
                                                    <span className="material-icons text-sm">close</span>
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField label="Company / School" placeholder="Organisation name" value={exp.company} onChange={v => setExp(i, 'company', v)} compact />
                                                <FormField label="Role / Designation" placeholder="e.g. Class Teacher" value={exp.role} onChange={v => setExp(i, 'role', v)} compact />
                                                <FormField label="From (Year)" placeholder="2018" value={exp.from} onChange={v => setExp(i, 'from', v)} compact />
                                                <FormField label="To (Year)" placeholder="2022 or Present" value={exp.to} onChange={v => setExp(i, 'to', v)} compact />
                                            </div>
                                            <FormTextarea label="Description" placeholder="Brief description of responsibilities..." value={exp.description} onChange={v => setExp(i, 'description', v)} rows={2} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Class / Student Handling ── */}
                            <div className="px-6 pt-6 pb-8">
                                <PanelLabel label="Class & Student Handling" />
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Programs</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PROGRAMS.map(prog => (
                                                <label key={prog} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${editData.programs_handling?.includes(prog) ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-zinc-800 hover:border-primary/20'}`}>
                                                    <input type="checkbox" className="hidden" checked={editData.programs_handling?.includes(prog) || false} onChange={() => toggleProgram(prog)} />
                                                    <span className={`size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${editData.programs_handling?.includes(prog) ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                                        {editData.programs_handling?.includes(prog) && <span className="material-icons text-white text-sm">check</span>}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{prog}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <FormTextarea label="Notes & Responsibilities" placeholder="Describe their specific duties, student group, shift timings, etc." value={editData.class_notes || ''} onChange={v => setField('class_notes', v)} rows={4} />
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-4 shrink-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                                {editData.id ? `Editing: ${editData.name}` : 'New staff member'}
                            </p>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setPanelOpen(false)}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !editData.name.trim()}
                                    className="flex-1 sm:flex-none px-8 py-2.5 bg-primary hover:bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    <span className={`material-icons text-base ${saving ? 'animate-spin' : ''}`}>{saving ? 'sync' : 'save'}</span>
                                    {saving ? 'Saving...' : editData.id ? 'Update Staff' : 'Add Staff'}
                                </button>
                            </div>
                        </div>

                        </div>
                    </div>
                </>
            )}

            {/* ─── Delete Confirm Modal ─── */}
            {deleteConfirm !== null && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl z-50 p-8 border border-slate-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <span className="material-icons text-red-500 text-3xl">delete_forever</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter text-center">Remove Staff Member?</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center mt-2">This action cannot be undone.</p>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">
                                Remove
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Reusable sub-components ── */

function SectionLabel({ color, label }: { color: string; label: string }) {
    return (
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-4">
            <span className={`w-8 h-0.5 ${color}`}></span>
            {label}
        </h3>
    );
}

function InfoCard({ icon, label, value, className = '', bare }: { icon: string; label: string; value?: string; className?: string; bare?: boolean }) {
    const content = (
        <div className={className}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className="material-icons text-slate-400 text-base">{icon}</span>
                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight break-all">{value || '—'}</p>
            </div>
        </div>
    );
    if (bare) return content;
    return (
        <div className={`bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 ${className}`}>
            {content}
        </div>
    );
}

function PanelLabel({ label, noMargin }: { label: string; noMargin?: boolean }) {
    return (
        <p className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ${noMargin ? '' : 'mb-4'}`}>
            <span className="w-6 h-0.5 bg-primary inline-block"></span>
            {label}
        </p>
    );
}

function FormField({ label, placeholder, value, onChange, type = 'text', compact }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string; compact?: boolean }) {
    return (
        <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`w-full px-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${compact ? 'py-2' : 'py-3'}`}
            />
        </div>
    );
}

function FormSelect({ label, value, onChange, options, optionLabels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; optionLabels?: string[] }) {
    return (
        <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
                <option value="">Select {label}</option>
                {options.map((o, i) => <option key={o} value={o}>{optionLabels ? optionLabels[i] : o}</option>)}
            </select>
        </div>
    );
}

function FormTextarea({ label, placeholder, value, onChange, rows = 3 }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void; rows?: number }) {
    return (
        <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={rows}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
        </div>
    );
}

function StaffPhotoUpload({ currentUrl, name, onUploaded }: { currentUrl: string; name: string; onUploaded: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return; }
        setError('');
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) { onUploaded(data.url); }
            else { setError('Upload failed. Please try again.'); }
        } catch { setError('Upload failed. Please try again.'); }
        finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
    };

    return (
        <div className="flex items-center gap-5">
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative size-24 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border-2 border-dashed cursor-pointer transition-all group
                    ${currentUrl ? 'border-primary/30 bg-primary/5 hover:border-primary' : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:border-primary hover:bg-primary/5'}`}
            >
                {currentUrl ? (
                    <>
                        <img src={currentUrl} className="w-full h-full object-cover" alt={name} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <span className="material-icons text-white text-xl">edit</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-primary transition-colors">
                        <span className="material-icons text-3xl">{uploading ? 'sync' : 'add_a_photo'}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{uploading ? 'Uploading' : 'Upload'}</span>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center">
                        <span className="material-icons animate-spin text-primary text-2xl">sync</span>
                    </div>
                )}
            </div>
            <div className="flex-1">
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {currentUrl ? 'Photo uploaded' : 'Upload a staff photo'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB. Click to {currentUrl ? 'change' : 'upload'}.</p>
                {error && <p className="text-xs text-red-500 font-bold mt-1">{error}</p>}
                {currentUrl && (
                    <button
                        type="button"
                        onClick={() => onUploaded('')}
                        className="mt-2 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                        <span className="material-icons text-sm">delete</span>
                        Remove photo
                    </button>
                )}
            </div>
        </div>
    );
}
