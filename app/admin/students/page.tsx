'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Normalize both sources into one shape
function normalizeStudent(s: any, source: 'admission' | 'enrollment'): any {
    if (source === 'admission') {
        return {
            ...s,
            _source: 'admission',
            _raw: s,
            child_dob: s.child_dob,
            child_gender: s.child_gender,
            contact_phone: s.mother_cell_phone,
            program_display: Array.isArray(s.programs_selected) ? s.programs_selected.join(', ') : '',
            enrollment_date: s.created_at,
            enrollment_id: s.enrollment_id || null,  // from LEFT JOIN in admissions API
        };
    }
    return {
        _source: 'enrollment',
        _raw: s,
        id: s.id,
        unique_id: s.unique_id,
        child_name: s.child_name,
        child_dob: s.dob,
        child_gender: s.gender,
        child_photo: null,
        blood_group: s.blood_group,
        age: s.age,
        allergy: s.allergy,
        address: s.address,
        program_display: s.program_name || s.program_type,
        program_type: s.program_type,
        program_name: s.program_name,
        slot: s.slot || s.hours_opted,
        new_or_existing: s.new_or_existing,
        enrollment_date: s.enrollment_date,
        mother_name: '',
        mother_cell_phone: s.mother_phone,
        mother_email: s.mother_email,
        mother_work_phone: '',
        father_name: '',
        father_cell_phone: s.father_phone,
        father_email: s.father_email,
        father_work_phone: '',
        guardian_phone: s.guardian_phone,
        contact_phone: s.mother_phone || s.father_phone,
        kit_handover: s.kit_handover,
        photographs: s.photographs,
        enrollment_form_signed: s.enrollment_form_signed,
        referred_by: s.referred_by,
        // fee summary (joined in list query)
        fees_due: s.fees_due,
        total_amount: s.total_amount,
        fees_per_month: s.fees_per_month,
        total_amount_payable: s.total_amount_payable,
    };
}

function fmt(n: any) {
    const num = parseFloat(n) || 0;
    return '₹' + num.toLocaleString('en-IN');
}

export default function StudentDirectory() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [setupProgramType, setSetupProgramType] = useState<'preschool' | 'daycare' | ''>('');
    const [settingUpFees, setSettingUpFees] = useState(false);
    const [setupError, setSetupError] = useState('');

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        try {
            const [admRes, psRes, dcRes] = await Promise.all([
                fetch('/api/admin/admissions?status=approved'),
                fetch('/api/admin/enrollment?type=preschool'),
                fetch('/api/admin/enrollment?type=daycare'),
            ]);
            const admissions = admRes.ok ? (await admRes.json()).map((s: any) => normalizeStudent(s, 'admission')) : [];
            const preschool = psRes.ok ? (await psRes.json()).map((s: any) => normalizeStudent(s, 'enrollment')) : [];
            const daycare = dcRes.ok ? (await dcRes.json()).map((s: any) => normalizeStudent(s, 'enrollment')) : [];
            setStudents([...admissions, ...preschool, ...daycare]);
        } catch (err) {
        } finally { setLoading(false); }
    };

    const filteredStudents = students.filter(s =>
        s.child_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.unique_id?.toLowerCase().includes(search.toLowerCase()) ||
        s.mother_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_phone?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
    const formatDateInput = (d: string) => { try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; } };

    const openDetail = (student: any) => {
        setSelectedStudent(student);
        setEditing(false);
        setEditData({});
        setSetupError('');
        // Auto-detect program type from programs_selected for online form students
        if (student._source === 'admission') {
            const progs: string[] = Array.isArray(student.programs_selected)
                ? student.programs_selected
                : (student._raw?.programs_selected || []);
            const hasDaycare = progs.some((p: string) => p.toLowerCase().includes('daycare') || p.toLowerCase().includes('dc'));
            setSetupProgramType(hasDaycare ? 'daycare' : progs.length > 0 ? 'preschool' : '');
        } else {
            setSetupProgramType('');
        }
    };

    const startEditing = () => { setEditData({ ...selectedStudent }); setEditing(true); };
    const cancelEditing = () => { setEditing(false); setEditData({}); };
    const handleChange = (field: string, value: string) => setEditData((p: any) => ({ ...p, [field]: value }));

    const setupFees = async () => {
        if (!setupProgramType || !selectedStudent) return;
        setSettingUpFees(true);
        setSetupError('');
        try {
            // Step 1: Convert admission → enrollment
            const enrollRes = await fetch('/api/admin/admissions/setup-enrollment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admission_id: selectedStudent.id, program_type: setupProgramType }),
            });
            const enrollData = await enrollRes.json();
            if (!enrollData.success) { setSetupError(enrollData.error || 'Failed to create enrollment'); return; }

            const enrollmentId = enrollData.enrollment_id;

            // Step 2: Fetch active academic year
            const yearRes = await fetch('/api/admin/fees/academic-years');
            const years = yearRes.ok ? await yearRes.json() : [];
            const activeYear = years.find((y: any) => y.status === 'active') || years[0];
            if (!activeYear) { setSetupError('No active academic year found. Run Setup DB in Fees page first.'); return; }

            // Step 3: Fetch templates and match
            const tmplRes = await fetch('/api/admin/fees/templates');
            const templates = tmplRes.ok ? await tmplRes.json() : [];
            const progs: string[] = Array.isArray(selectedStudent.programs_selected)
                ? selectedStudent.programs_selected
                : (selectedStudent._raw?.programs_selected || []);
            const hoursOpted = selectedStudent._raw?.daycare_time_opted || '';
            const searchStr = [...progs, hoursOpted].join(' ');
            let matched = null;
            for (const t of templates) {
                const kws: string[] = Array.isArray(t.match_keywords) ? t.match_keywords : [];
                if (kws.some((k: string) => searchStr.toLowerCase().includes(k.toLowerCase()))) { matched = t; break; }
            }
            // Fallback: match by program type
            if (!matched) matched = templates.find((t: any) => t.program_type === setupProgramType) || null;

            // Step 4: Create fee plan
            const totalAmount = setupProgramType === 'preschool'
                ? parseFloat(matched?.school_fees || 0)
                : parseFloat(matched?.monthly_fee || 0) * 12;

            const feeRes = await fetch('/api/admin/fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollment_id: enrollmentId,
                    academic_year_id: activeYear.id,
                    program_type: setupProgramType,
                    school_fees: matched?.school_fees || 0,
                    num_installments: matched?.num_installments || 1,
                    installments: Array.from({ length: matched?.num_installments || 1 }, (_, i) => ({
                        no: i + 1,
                        amount: matched ? Math.round(parseFloat(matched.school_fees || 0) / (matched.num_installments || 1)) : 0,
                        due_date: '',
                    })),
                    monthly_fee: matched?.monthly_fee || 0,
                    hours_opted: matched?.hours_opted || hoursOpted || '',
                    registration_amount: matched?.registration_amount || 0,
                    registration_status: matched?.registration_status || 'Unpaid',
                    security_deposit_amount: matched?.security_deposit_amount || 0,
                    security_deposit_status: matched?.security_deposit_status || 'Unpaid',
                    admission_form_fee: matched?.admission_form_fee || 0,
                    admission_form_status: matched?.admission_form_status || 'Unpaid',
                    total_amount: totalAmount,
                }),
            });
            const feeData = await feeRes.json();
            if (!feeData.id) { setSetupError('Enrollment created but fee plan failed. Go to Fees page to add manually.'); return; }

            // Done — go to fee detail page
            window.location.href = `/admin/fees/${feeData.id}`;
        } finally { setSettingUpFees(false); }
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            if (selectedStudent._source === 'enrollment') {
                const { id, program_type } = selectedStudent._raw;
                const enrollment: any = {
                    child_name: editData.child_name,
                    gender: editData.child_gender,
                    dob: editData.child_dob,
                    age: editData.age,
                    blood_group: editData.blood_group,
                    allergy: editData.allergy,
                    address: editData.address,
                    mother_phone: editData.mother_cell_phone,
                    mother_email: editData.mother_email,
                    father_phone: editData.father_cell_phone,
                    father_email: editData.father_email,
                    guardian_phone: editData.guardian_phone,
                    kit_handover: editData.kit_handover,
                    photographs: editData.photographs,
                    enrollment_form_signed: editData.enrollment_form_signed,
                };
                await fetch('/api/admin/enrollment', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, type: program_type, enrollment }),
                });
            } else {
                await fetch('/api/submit-admission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editData._raw || editData),
                });
            }
            setStudents(prev => prev.map(s =>
                s._source === selectedStudent._source && s.id === selectedStudent.id
                    ? { ...s, ...editData }
                    : s
            ));
            setSelectedStudent((p: any) => ({ ...p, ...editData }));
            setEditing(false);
        } catch (err) {
        } finally { setSaving(false); }
    };

    const Field = ({ label, field, type = 'text' }: { label: string; field: string; type?: string }) => {
        const value = editing ? (editData[field] ?? '') : (selectedStudent?.[field] ?? '');
        if (editing) {
            return (
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    {type === 'textarea' ? (
                        <textarea value={value} onChange={e => handleChange(field, e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all resize-none" rows={3} />
                    ) : (
                        <input type={type} value={type === 'date' ? formatDateInput(value) : value}
                            onChange={e => handleChange(field, e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all" />
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
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Student Directory</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                        <span className="inline-block w-4 h-[2px] bg-primary"></span>
                        Manage Enrolled Records
                    </p>
                </div>
                <button className="self-start sm:self-auto bg-primary hover:bg-lime-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/30 transition-all hover:-translate-y-1">
                    <span className="material-icons text-xl">person_add</span>
                    Register New Student
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-zinc-900 p-4 lg:p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <span className="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input type="text" placeholder="Search by name, parent, or ID..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl text-sm font-black uppercase tracking-widest placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                        <select className="flex-1 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 appearance-none">
                            <option>All Programs</option>
                            <option>Preschool</option>
                            <option>Daycare</option>
                        </select>
                        <button className="size-12 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shrink-0">
                            <span className="material-icons">filter_list</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Unique ID</th>
                                <th className="px-10 py-6">Student Details</th>
                                <th className="px-10 py-6">Program</th>
                                <th className="px-10 py-6">Contact</th>
                                <th className="px-10 py-6">Enrolled On</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={6} className="px-10 py-20 text-center">
                                    <span className="material-icons animate-spin text-4xl text-primary">sync</span>
                                </td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={6} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                                    No students found
                                </td></tr>
                            ) : filteredStudents.map((student) => (
                                <tr key={`${student._source}-${student.id}`}
                                    onClick={() => openDetail(student)}
                                    className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 uppercase tracking-widest w-fit">
                                                {student.unique_id || 'PENDING'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest w-fit ${student._source === 'enrollment'
                                                ? student.program_type === 'daycare' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                                                : 'bg-primary/10 text-primary'}`}>
                                                {student._source === 'enrollment'
                                                    ? (student.program_type === 'daycare' ? 'Daycare' : 'Preschool')
                                                    : 'Online Form'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="size-14 bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-1 border border-slate-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                                                {student.child_photo
                                                    ? <img src={student.child_photo} className="w-full h-full object-cover rounded-xl" alt="Child" />
                                                    : <span className="material-icons text-3xl text-slate-200">face</span>}
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">{student.child_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DOB: {formatDate(student.child_dob)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-[9px] font-black bg-primary/5 text-primary px-3 py-1 rounded-lg uppercase tracking-widest border border-primary/10">
                                            {student.program_display || '—'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        {student.mother_name && <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-none mb-1">{student.mother_name}</p>}
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.contact_phone || '—'}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{formatDate(student.enrollment_date)}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={e => { e.stopPropagation(); openDetail(student); }}
                                                className="size-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <span className="material-icons text-lg">description</span>
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); setSelectedStudent(student); setEditData({ ...student }); setEditing(true); }}
                                                className="size-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <span className="material-icons text-lg">edit</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] flex items-center gap-6 hover:bg-primary/10 transition-all">
                    <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 transform rotate-3 scale-110">
                        <span className="material-icons text-3xl font-bold">groups</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Students</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{students.length}</h4>
                    </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-8 rounded-[2rem] flex items-center gap-6 hover:bg-blue-50 transition-all">
                    <div className="size-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 transform -rotate-3 scale-110">
                        <span className="material-icons text-3xl font-bold">upload_file</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Excel Imported</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                            {students.filter(s => s._source === 'enrollment').length}
                        </h4>
                    </div>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 p-8 rounded-[2rem] flex items-center gap-6 hover:bg-purple-50 transition-all">
                    <div className="size-16 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 transform rotate-6 scale-110">
                        <span className="material-icons text-3xl font-bold">assignment_turned_in</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Online Applications</p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                            {students.filter(s => s._source === 'admission').length}
                        </h4>
                    </div>
                </div>
            </div>

            {/* Unified Student Detail Slideout */}
            {selectedStudent && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                        onClick={() => { setSelectedStudent(null); setEditing(false); }} />
                    <div className="fixed top-0 right-0 h-full w-full sm:max-w-[600px] lg:max-w-[700px] bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Panel Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => { setSelectedStudent(null); setEditing(false); }}
                                    className="size-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                                    <span className="material-icons">close</span>
                                </button>
                                <div className="flex gap-3">
                                    {!editing ? (
                                        <button onClick={startEditing}
                                            className="px-6 py-3 bg-primary hover:bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                            <span className="material-icons text-base">edit</span>Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={cancelEditing}
                                                className="px-6 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">
                                                Cancel
                                            </button>
                                            <button onClick={saveChanges} disabled={saving}
                                                className="px-6 py-3 bg-primary hover:bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50">
                                                <span className="material-icons text-base">{saving ? 'sync' : 'save'}</span>
                                                {saving ? 'Saving...' : 'Update'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-white dark:bg-zinc-800 rounded-[1.5rem] shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center p-1.5 overflow-hidden">
                                    {selectedStudent.child_photo
                                        ? <img src={selectedStudent.child_photo} className="w-full h-full object-cover rounded-[1rem]" alt="Child" />
                                        : <span className="material-icons text-4xl text-slate-200">face</span>}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedStudent.child_name}</h2>
                                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="material-icons text-sm">tag</span>{selectedStudent.unique_id || 'No ID'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedStudent._source === 'enrollment'
                                            ? selectedStudent.program_type === 'daycare' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                                            : 'bg-primary/10 text-primary'}`}>
                                            {selectedStudent._source === 'enrollment'
                                                ? (selectedStudent.program_type === 'daycare' ? 'Daycare' : 'Preschool')
                                                : 'Online Form'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10">

                            {/* Child Information — both sources */}
                            <div className="space-y-5">
                                <SectionTitle color="bg-primary" label="Child Information" />
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Full Name" field="child_name" />
                                        {selectedStudent._source === 'admission' && <Field label="Nickname" field="child_nickname" />}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Field label="Date of Birth" field="child_dob" type="date" />
                                        <Field label="Age" field="age" />
                                        <Field label="Gender" field="child_gender" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Blood Group" field="blood_group" />
                                        <Field label="Allergy" field="allergy" />
                                    </div>
                                    <Field label="Address" field="address" type="textarea" />
                                </div>
                            </div>

                            {/* Program — both sources */}
                            <div className="space-y-5">
                                <SectionTitle color="bg-emerald-500" label="Program & Enrollment" />
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    {selectedStudent._source === 'admission' ? (
                                        <div className="flex flex-wrap gap-3">
                                            {selectedStudent._raw?.programs_selected?.map((prog: string) => (
                                                <div key={prog} className="px-5 py-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-2">
                                                    <span className="material-icons text-primary text-lg">verified</span>
                                                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{prog}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Program" field="program_name" />
                                            <Field label="Slot / Hours" field="slot" />
                                            <Field label="New / Existing" field="new_or_existing" />
                                            <Field label="Enrolled On" field="enrollment_date" type="date" />
                                            <Field label="Kit Handover" field="kit_handover" />
                                            <Field label="Photos" field="photographs" />
                                            <Field label="Form Signed" field="enrollment_form_signed" />
                                            <Field label="Referred By" field="referred_by" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mother / Guardian 1 — both sources */}
                            <div className="space-y-5">
                                <SectionTitle color="bg-blue-500" label="Mother / Guardian 1" />
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    {selectedStudent._source === 'admission' && <Field label="Full Name" field="mother_name" />}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Phone" field="mother_cell_phone" />
                                        <Field label="Email" field="mother_email" />
                                    </div>
                                    {selectedStudent._source === 'admission' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Employer" field="mother_employer" />
                                            <Field label="Work Phone" field="mother_work_phone" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Father / Guardian 2 — both sources */}
                            <div className="space-y-5">
                                <SectionTitle color="bg-indigo-500" label="Father / Guardian 2" />
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                    {selectedStudent._source === 'admission' && <Field label="Full Name" field="father_name" />}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Phone" field="father_cell_phone" />
                                        <Field label="Email" field="father_email" />
                                    </div>
                                    {selectedStudent._source === 'admission' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Employer" field="father_employer" />
                                            <Field label="Work Phone" field="father_work_phone" />
                                        </div>
                                    ) : (
                                        <Field label="Guardian Phone" field="guardian_phone" />
                                    )}
                                </div>
                            </div>

                            {/* Fee Management — admission students */}
                            {selectedStudent._source === 'admission' && (
                                <div className="space-y-5">
                                    <SectionTitle color="bg-amber-500" label="Fee Management" />
                                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[1.5rem] border border-amber-100 dark:border-amber-900/20 space-y-4">
                                        {selectedStudent.enrollment_id ? (
                                            <Link href={`/admin/fees`}
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                <span className="material-icons text-base">account_balance_wallet</span>
                                                Manage Fees & Installments
                                            </Link>
                                        ) : (
                                            <>
                                                {/* Auto-detected program badge */}
                                                {setupProgramType ? (
                                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                                                        <span className="material-icons text-green-500 text-sm">auto_awesome</span>
                                                        <p className="text-xs font-bold text-green-700">
                                                            Program detected: <span className="capitalize">{setupProgramType}</span>
                                                            {(selectedStudent._raw?.programs_selected || []).join(', ') && ` (${(selectedStudent._raw?.programs_selected || []).join(', ')})`}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-500 text-center">Select a program type to begin.</p>
                                                )}
                                                <div className="flex gap-3">
                                                    {(['preschool', 'daycare'] as const).map(pt => (
                                                        <button key={pt} onClick={() => setSetupProgramType(pt)}
                                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all capitalize ${setupProgramType === pt
                                                                ? 'border-amber-500 bg-amber-500 text-white'
                                                                : 'border-slate-200 dark:border-zinc-700 text-slate-500 hover:border-amber-300'}`}>
                                                            {pt}
                                                        </button>
                                                    ))}
                                                </div>
                                                {setupError && (
                                                    <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl font-bold">{setupError}</p>
                                                )}
                                                <button onClick={setupFees} disabled={!setupProgramType || settingUpFees}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40">
                                                    <span className="material-icons text-base">{settingUpFees ? 'sync' : 'add_circle'}</span>
                                                    {settingUpFees ? 'Creating enrollment & fee plan...' : 'Set Up Fees'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Fee Summary — enrollment students only */}
                            {selectedStudent._source === 'enrollment' && (
                                <div className="space-y-5">
                                    <SectionTitle color="bg-amber-500" label="Fee Summary" />
                                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[1.5rem] border border-amber-100 dark:border-amber-900/20 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedStudent.program_type === 'preschool' ? (
                                                <>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fees</p>
                                                        <p className="text-lg font-black text-slate-800 dark:text-white">{fmt(selectedStudent.total_amount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fees Due</p>
                                                        <p className={`text-lg font-black ${parseFloat(selectedStudent.fees_due) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {parseFloat(selectedStudent.fees_due) > 0 ? fmt(selectedStudent.fees_due) : 'Cleared'}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Fee</p>
                                                        <p className="text-lg font-black text-slate-800 dark:text-white">{fmt(selectedStudent.fees_per_month)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                                                        <p className="text-lg font-black text-slate-800 dark:text-white">{fmt(selectedStudent.total_amount_payable)}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <Link href={`/admin/enrollment/${selectedStudent.id}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                            <span className="material-icons text-base">account_balance_wallet</span>
                                            Manage Fees & Installments
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Emergency Contact — admission only */}
                            {selectedStudent._source === 'admission' && (
                                <div className="space-y-5">
                                    <SectionTitle color="bg-orange-500" label="Emergency Contact" />
                                    <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-[1.5rem] border border-orange-100 dark:border-orange-900/20 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <Field label="Name" field="emergency_contact_name" />
                                            <Field label="Phone" field="emergency_contact_phone" />
                                            <Field label="Relation" field="emergency_contact_relation" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Medical — admission only */}
                            {selectedStudent._source === 'admission' && (
                                <div className="space-y-5">
                                    <SectionTitle color="bg-red-500" label="Medical & Health" />
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
                            )}

                            {/* Physician — admission only */}
                            {selectedStudent._source === 'admission' && (
                                <div className="space-y-5">
                                    <SectionTitle color="bg-teal-500" label="Physician Details" />
                                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Physician Name" field="physician_name" />
                                            <Field label="Physician Phone" field="physician_phone" />
                                        </div>
                                        <Field label="Physician Address" field="physician_address" type="textarea" />
                                    </div>
                                </div>
                            )}

                            {/* Preferences — admission only */}
                            {selectedStudent._source === 'admission' && (
                                <div className="space-y-5">
                                    <SectionTitle color="bg-purple-500" label="Preferences & Habits" />
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
                            )}

                            <div className="h-10"></div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function SectionTitle({ color, label }: { color: string; label: string }) {
    return (
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className={`w-8 h-0.5 ${color}`}></span>
            {label}
        </h3>
    );
}
