'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUpload from '../components/PhotoUpload';
import SignaturePad from '../components/SignaturePad';

export default function GuardianInfo() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        father_name: '',
        father_employer: '',
        father_employer_address: '',
        father_work_phone: '',
        father_cell_phone: '',
        father_email: '',
        father_relationship: '',
        father_photo: '',
        unique_id: '',
        admission_date: '',
        father_signature: '',
        father_signature_date: '',
        // Sync fields
        emergency_contact1_name: '',
        emergency_contact1_phone: '',
        emergency_contact1_relation: '',
        emergency_contact2_name: '',
        emergency_contact2_phone: '',
        emergency_contact2_relation: ''
    });

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        console.log('[GuardianInfo] currentAdmissionId:', storedId);

        if (storedId) {
            const fetchAdmission = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('[GuardianInfo] Received data:', data);

                        // JIT Sync
                        let fName = data.father_name || '';
                        let fPhone = data.father_cell_phone || '';
                        if (!fName) {
                            if (data.emergency_contact1_relation === 'Father') fName = data.emergency_contact1_name || '';
                            else if (data.emergency_contact2_relation === 'Father') fName = data.emergency_contact2_name || '';
                        }
                        if (!fPhone) {
                            if (data.emergency_contact1_relation === 'Father') fPhone = data.emergency_contact1_phone || '';
                            else if (data.emergency_contact2_relation === 'Father') fPhone = data.emergency_contact2_phone || '';
                        }

                        setFormData({
                            id: storedId,
                            father_name: fName,
                            father_employer: data.father_employer || '',
                            father_employer_address: data.father_employer_address || '',
                            father_work_phone: data.father_work_phone || '',
                            father_cell_phone: fPhone,
                            father_email: data.father_email || '',
                            father_relationship: data.father_relationship || 'Father',
                            father_photo: data.father_photo || '',
                            unique_id: data.unique_id || '',
                            admission_date: data.admission_date || '',
                            father_signature: data.father_signature || '',
                            father_signature_date: data.father_signature_date || '',
                            emergency_contact1_name: data.emergency_contact1_name || '',
                            emergency_contact1_phone: data.emergency_contact1_phone || '',
                            emergency_contact1_relation: data.emergency_contact1_relation || '',
                            emergency_contact2_name: data.emergency_contact2_name || '',
                            emergency_contact2_phone: data.emergency_contact2_phone || '',
                            emergency_contact2_relation: data.emergency_contact2_relation || ''
                        });
                    }
                } catch (error) {
                    console.error('[GuardianInfo] Fetch error:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAdmission();
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'father_name') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact1_relation === 'Father') updates.emergency_contact1_name = value;
                if (prev.emergency_contact2_relation === 'Father') updates.emergency_contact2_name = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'father_cell_phone') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact1_relation === 'Father') updates.emergency_contact1_phone = value;
                if (prev.emergency_contact2_relation === 'Father') updates.emergency_contact2_phone = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'father_relationship') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact1_relation === 'Father') updates.emergency_contact1_relation = value;
                if (prev.emergency_contact2_relation === 'Father') updates.emergency_contact2_relation = value;
                return { ...prev, ...updates };
            });
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let submissionData = { ...formData };
        if (!submissionData.id) {
            const storedId = localStorage.getItem('currentAdmissionId');
            if (storedId) submissionData.id = storedId;
        }

        try {
            const response = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.id) {
                    localStorage.setItem('currentAdmissionId', data.id.toString());
                    setFormData(prev => ({ ...prev, id: data.id.toString() }));
                }
                alert("Guardian Information Saved!");
                router.push('/child-health');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            alert("An error occurred while saving.");
            console.error(error);
        }
    };

    const handleSaveDraft = async () => {
        let submissionData = { ...formData };
        if (!submissionData.id) {
            const storedId = localStorage.getItem('currentAdmissionId');
            if (storedId) submissionData.id = storedId;
        }

        try {
            const response = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            if (response.ok) alert("Draft saved successfully!");
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const handleBack = async () => {
        let submissionData = { ...formData };
        if (!submissionData.id) {
            const storedId = localStorage.getItem('currentAdmissionId');
            if (storedId) submissionData.id = storedId;
        }

        try {
            await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
        } catch (error) {
            console.error('Error saving on back:', error);
        }
        router.push('/parent-info');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleSignatureSave = async (dataUrl: string) => {
        if (!dataUrl) {
            setFormData(prev => ({
                ...prev,
                father_signature: '',
                father_signature_date: ''
            }));
            return;
        }

        try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `father_signature_info.png`, { type: 'image/png' });

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('type', 'signature');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await response.json();
            if (data.success) {
                const today = new Date().toISOString().split('T')[0];
                setFormData(prev => ({
                    ...prev,
                    father_signature: data.url,
                    father_signature_date: today
                }));
            }
        } catch (err) {
            console.error('Signature upload error:', err);
        }
    };

    return (
        <main className="font-body text-slate-800 dark:text-slate-200 transition-colors duration-200 bg-slate-50 dark:bg-zinc-950 min-h-screen">
            <div className="max-w-4xl mx-auto my-8 bg-background-light dark:bg-zinc-900 shadow-xl overflow-hidden min-h-screen flex flex-col">
                <div className="p-8 pb-0 text-center">
                    <div className="flex justify-center gap-8 mb-6">
                        <img alt="Child eating illustration" className="h-24 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlAJZ78IYskKQd1GlSG_3WvGQSTVON5RdjeiMQwn7i2rCZxR7JdKiVLLMvTDa3KYj1PcA6xEJJ-sJxfKMOYFb26K9DoP0ddUUMXyV9ckUNDDqULAefSRgD2D6YpDzpusx6OzDDyI73s33_AiCBVVQ3s8Hx3MobFSo3s_dcwN4G8ReHPhe4Zf0QDOEkJE-lQBRqU2NjHaATaSNSXzlVrMlDlj5YYQX30KV5k-1r7fhrz3vVrrK2pwQ9j5gVDuixlYtdM3JJpcUSmD4" />
                        <img alt="Child playing with blocks" className="h-24 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlAJZ78IYskKQd1GlSG_3WvGQSTVON5RdjeiMQwn7i2rCZxR7JdKiVLLMvTDa3KYj1PcA6xEJJ-sJxfKMOYFb26K9DoP0ddUUMXyV9ckUNDDqULAefSRgD2D6YpDzpusx6OzDDyI73s33_AiCBVVQ3s8Hx3MobFSo3s_dcwN4G8ReHPhe4Zf0QDOEkJE-lQBRqU2NjHaATaSNSXzlVrMlDlj5YYQX30KV5k-1r7fhrz3vVrrK2pwQ9j5gVDuixlYtdM3JJpcUSmD4" />
                        <img alt="Child jumping" className="h-24 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFTPFzN6Hmia1Md8Twcv1UfItviB8zWeMgVsp9u4F0XT6dNuAV11ykgB9fnNY-K-aw8AexNeSr89E1LUnmoXiMdlGp6uPn3gsCxyQF1c8qgP1zjnkinp7grFYEOwTx-A745NhBKuZEm_EGpMeGtrgBA5H9xU7DkSIytzZn8BMvqSZaSpNcI8T2L73I5PqE6__8zS0GyeZHAWQ_EM9os6OhYpyiL3aGfgt_tMwMAqkScvKFzaaTu_1WpE2Shga5SRXOJQ9-25QCJkc" />
                    </div>
                    <div className="bg-primary text-white py-3 px-6 rounded-sm mb-8">
                        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">Father's or Guardian 2 Information</h1>
                        <p className="text-xs uppercase tracking-widest font-bold mt-1 opacity-80">Section 3 of 7</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                    {loading && (
                        <div className="mx-8 mt-4 bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-center animate-pulse">
                            <span className="material-icons animate-spin mr-3 text-primary text-sm">sync</span>
                            <span className="text-primary font-bold text-xs uppercase tracking-widest">Syncing application data...</span>
                        </div>
                    )}
                    <div className="px-12 py-6 flex-grow">
                        <h2 className="font-display text-xl font-bold border-b-2 border-primary pb-2 mb-8 text-slate-900 dark:text-white">Father’s or Guardian 2 Information</h2>
                        <div className="space-y-8">
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Name :</label>
                                <input
                                    className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white"
                                    type="text"
                                    name="father_name"
                                    value={formData.father_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Employed by :</label>
                                <input
                                    className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white"
                                    type="text"
                                    name="father_employer"
                                    value={formData.father_employer}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-end">
                                    <label className="font-semibold whitespace-nowrap">Address of Employment :</label>
                                    <input
                                        className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white"
                                        type="text"
                                        name="father_employer_address"
                                        value={formData.father_employer_address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex items-end pl-0 md:pl-4">
                                    <input className="form-input-clean focus:ring-0 focus:border-primary dark:text-white" placeholder="(Street, City, State, ZIP)" type="text" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-end">
                                    <label className="font-semibold whitespace-nowrap">Work Phone :</label>
                                    <input
                                        className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white"
                                        type="tel"
                                        name="father_work_phone"
                                        value={formData.father_work_phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="font-semibold whitespace-nowrap">Cell Phone :</label>
                                    <input
                                        className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white"
                                        type="tel"
                                        name="father_cell_phone"
                                        value={formData.father_cell_phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Email :</label>
                                <input
                                    className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white"
                                    type="email"
                                    name="father_email"
                                    value={formData.father_email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Relationship to child :</label>
                                <input
                                    className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white"
                                    type="text"
                                    name="father_relationship"
                                    value={formData.father_relationship}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex items-start gap-4 mt-8">
                                <label className="font-semibold whitespace-nowrap pt-2">Father's Photo:</label>
                                <PhotoUpload
                                    onPhotoUploaded={async (url) => {
                                        setFormData(prev => ({ ...prev, father_photo: url }));

                                        // Auto-save photo to database immediately
                                        const currentId = formData.id || localStorage.getItem('currentAdmissionId');
                                        if (currentId) {
                                            try {
                                                await fetch('/api/submit-admission', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        id: currentId,
                                                        father_photo: url
                                                    }),
                                                });
                                            } catch (error) {
                                                console.error('Error auto-saving father photo:', error);
                                            }
                                        }
                                    }}
                                    currentPhotoUrl={formData.father_photo}
                                />
                            </div>
                            <div className="mt-8">
                                <SignaturePad
                                    label="Father's Signature"
                                    onSave={handleSignatureSave}
                                    savedSignatureUrl={formData.father_signature}
                                />
                                <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                    Date: {formatDate(formData.father_signature_date)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col">
                                <label className="font-semibold text-primary mb-1">Unique ID</label>
                                <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium">
                                    {formData.unique_id || <span className="text-sm text-gray-400 italic">Office use only</span>}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className="font-semibold text-primary mb-1">Date of Admission</label>
                                <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium">
                                    {formatDate(formData.admission_date)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto bg-[#fffde0] dark:bg-zinc-800 p-12 border-t-4 border-primary">


                        <div className="mt-12 flex justify-end gap-4 print:hidden">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all"
                            >
                                Save Draft
                            </button>
                            <button type="submit" className="px-10 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Save & Continue
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
