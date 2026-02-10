'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SignaturePad from '../components/SignaturePad';

export default function MedicalAuthorization() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        father_name: '',
        admission_date: '',
        unique_id: '',
        father_signature: '',
        father_signature_date: ''
    });

    useEffect(() => {
        // Fetch existing admission data
        const fetchData = async () => {
            const storedId = localStorage.getItem('currentAdmissionId');
            if (storedId) {
                try {
                    const response = await fetch(`/api/get-admission?id=${storedId}`);
                    const data = await response.json();

                    if (data) {
                        setFormData({
                            id: storedId,
                            child_name: data.child_name || '',
                            father_name: data.father_name || '',
                            admission_date: data.admission_date || '',
                            unique_id: data.unique_id || '',
                            father_signature: data.father_signature || '',
                            father_signature_date: data.father_signature_date || ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching admission data:', error);
                }
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
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
            const file = new File([blob], `father_signature_med.png`, { type: 'image/png' });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/preschool-policies');
            } else {
                alert('Failed to save. Please try again.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-quicksand text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl overflow-hidden rounded-xl border border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center pt-8 pb-4 text-center">
                        <div className="h-48 w-auto mb-4 flex items-center justify-center bg-gray-100 rounded-lg p-4">
                            <span className="material-icons-outlined text-6xl text-gray-300">medical_services</span>
                        </div>

                        <div className="w-full bg-primary py-4 px-6">
                            <h1 className="font-display text-3xl font-bold text-white uppercase tracking-wide">Medical Authorization</h1>
                            <p className="text-[10px] text-white/80 font-bold uppercase tracking-[0.2em] mt-1">Section 7 of 7</p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
                            <div className="flex flex-wrap items-center gap-2 font-medium">
                                I, <input
                                    className="border-b border-dashed border-slate-300 bg-transparent flex-1 min-w-[200px] outline-none px-2 py-1 text-primary font-bold"
                                    placeholder="Full Name of Parent/Guardian"
                                    type="text"
                                    value={formData.father_name}
                                    readOnly
                                />
                                parent/guardian of
                                <input
                                    className="border-b border-dashed border-slate-300 bg-transparent flex-1 min-w-[200px] outline-none px-2 py-1 text-primary font-bold"
                                    placeholder="Name of Child"
                                    type="text"
                                    value={formData.child_name}
                                    readOnly
                                />
                            </div>
                            <p>
                                do hereby authorize <span className="font-bold text-primary">TIDDLEE</span> to administer medical treatment on my child. I understand every effort will be made to contact parent/guardian or emergency contact before treatment is administered.
                            </p>
                            <p>
                                I further authorise <span className="font-bold text-primary">TIDDLEE</span> to administer emergency care/treatment as needed until medical assistance is available. This includes allowing <span className="font-bold text-primary">TIDDLEE</span> to make decisions regarding medications if parent/guardian or emergency contact is not available.
                            </p>
                            <p>
                                I agree to pay all costs resulting from emergency medical care and/or treatment for my child as secured or authorized under this consent.
                            </p>
                            <p>
                                I understand in absence of the medical history, the medical professionals may not be able to provide appropriate medical care in emergency.
                            </p>
                        </div>

                        <div className="mt-12 max-w-md mx-auto md:mx-0">
                            <SignaturePad
                                label="Parent / Guardian Signature"
                                onSave={handleSignatureSave}
                                savedSignatureUrl={formData.father_signature}
                            />
                            <div className="mt-2 flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Parent / Guardian Signature</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Date: {formatDate(formData.father_signature_date)}</span>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row gap-8 pt-8 border-t border-slate-100 dark:border-zinc-800">
                            <div className="flex-1">
                                <label className="block text-primary font-bold mb-1">Unique ID</label>
                                <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium">
                                    {formData.unique_id || <span className="text-sm text-gray-400 italic">Office use only</span>}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-primary font-bold mb-1">Date of Admission</label>
                                <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium">
                                    {formatDate(formData.admission_date)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                        <Link href="/care-routines" className="px-6 py-2 border border-gray-300 text-gray-600 font-semibold rounded-full hover:bg-gray-100 transition-colors">
                            Back
                        </Link>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest hidden md:block">
                            Section 07 | Tiddlee Preschool & Daycare | Form Ref: MED-AUTH-V2
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save & Next'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
