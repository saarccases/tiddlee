'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CareRoutines() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        child_age: '',
        father_name: '',
        mother_name: '',
        guardian_name: '',
        medical_auth_name: '',
        allergies_reactions: '',
        food_allergies: '',
        likes: '',
        dislikes: '',
        unique_id: '',
        admission_date: ''
    });

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            id: storedId,
                            child_name: data.child_name || '',
                            child_age: data.child_age || '',
                            father_name: data.father_name || '',
                            mother_name: data.mother_name || '',
                            guardian_name: data.guardian_name || '',
                            medical_auth_name: data.medical_auth_name || data.father_name || '',
                            allergies_reactions: data.allergies_reactions || '',
                            food_allergies: data.food_allergies || '',
                            likes: data.likes || '',
                            dislikes: data.dislikes || '',
                            unique_id: data.unique_id || '',
                            admission_date: data.admission_date || ''
                        });
                    }
                } catch (error) {
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                router.push('/document-upload');
            } else {
                alert('Failed to save data');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        router.push('/child-health');
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

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-background-dark transition-colors duration-200 pb-12 font-display">
            <div className="max-w-4xl mx-auto pt-6 md:pt-10 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-icons text-3xl">child_care</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white font-display tracking-tight">Medical Authorization</h1>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-display">Section 5 of 5</span>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className={`h-1.5 w-6 rounded-full bg-primary`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-100 dark:border-zinc-800">
                <div className="bg-primary py-5 px-8 text-center shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.2em] font-display">Medical Authorization</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-5 md:p-10 space-y-8 md:space-y-10">
                    {/* Medical Authorization Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-icons text-primary text-3xl">medical_services</span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Medical Authorization</h3>
                        </div>

                        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                            <div className="flex flex-wrap items-center gap-2 font-medium">
                                I,
                                <select
                                    className="border-b border-dashed border-slate-300 bg-transparent flex-1 min-w-[200px] outline-none px-2 py-1 text-primary font-bold cursor-pointer"
                                    name="medical_auth_name"
                                    value={formData.medical_auth_name}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select Parent / Guardian</option>
                                    {formData.father_name && (
                                        <option value={formData.father_name}>{formData.father_name} (Father)</option>
                                    )}
                                    {formData.mother_name && (
                                        <option value={formData.mother_name}>{formData.mother_name} (Mother)</option>
                                    )}
                                    {formData.guardian_name && (
                                        <option value={formData.guardian_name}>{formData.guardian_name} (Guardian)</option>
                                    )}
                                </select>
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


                    </div>

                    <div className="pt-8">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                I acknowledge and agree to the above Medical Authorization.
                            </span>
                        </label>
                    </div>

                    <div className="pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-full sm:w-auto px-10 py-3 border-2 border-slate-200 dark:border-zinc-700 rounded-full text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back
                        </button>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                type="submit"
                                disabled={isSaving || !acknowledged}
                                className="flex-1 md:flex-none bg-primary hover:bg-lime-600 text-white px-12 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Saving...' : 'Save & Continue'}
                                <span className="material-icons text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
