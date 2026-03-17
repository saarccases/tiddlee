'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CareRoutines() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        child_age: '',
        father_name: '',
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
                            allergies_reactions: data.allergies_reactions || '',
                            food_allergies: data.food_allergies || '',
                            likes: data.likes || '',
                            dislikes: data.dislikes || '',
                            unique_id: data.unique_id || '',
                            admission_date: data.admission_date || ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
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
                const programType = localStorage.getItem('selectedProgramType');
                if (programType === 'daycare') {
                    router.push('/daycare-policies');
                } else {
                    router.push('/preschool-policies');
                }
            } else {
                alert('Failed to save data');
            }
        } catch (error) {
            console.error('Error saving:', error);
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
        <main className="min-h-screen bg-slate-50 dark:bg-background-dark transition-colors duration-200 pb-12 font-quicksand">
            <div className="max-w-4xl mx-auto pt-10 px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-icons text-3xl">child_care</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white font-display tracking-tight">Child Care & Medical Authorization</h1>
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
                <div className="bg-white dark:bg-zinc-800 p-8 flex justify-center items-center gap-8 md:gap-16 border-b-8 border-primary overflow-x-auto">
                    <img alt="Children eating" className="h-24 md:h-32 object-contain" src="/images/care-1.png" />
                    <img alt="Children playing" className="h-24 md:h-32 object-contain" src="/images/care-2.png" />
                    <img alt="Child sleeping" className="h-24 md:h-32 object-contain" src="/images/care-3.png" />
                </div>
                <div className="bg-primary py-5 px-8 text-center shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.2em] font-display">Child Care & Medical Authorization</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Child's Name</label>
                            <input
                                className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                placeholder="Enter full name"
                                type="text"
                                name="child_name"
                                value={formData.child_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Age Context</label>
                            <input
                                className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                placeholder="Years/Months"
                                type="text"
                                name="child_age"
                                value={formData.child_age}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Food Allergies / Dietary Restrictions</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="..."
                                    type="text"
                                    name="food_allergies"
                                    value={formData.food_allergies || formData.allergies_reactions}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Likes</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="..."
                                    type="text"
                                    name="likes"
                                    value={formData.likes}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Dislikes</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="..."
                                    type="text"
                                    name="dislikes"
                                    value={formData.dislikes}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Authorization Section */}
                    <div className="pt-8 border-t border-slate-100 dark:border-zinc-800 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-icons text-primary text-3xl">medical_services</span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Medical Authorization</h3>
                        </div>

                        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
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


                    </div>

                    <div className="flex flex-col md:flex-row gap-8 pt-8 border-t border-slate-100 dark:border-zinc-800">
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

                    <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-full md:w-auto px-10 py-3 border-2 border-slate-200 dark:border-zinc-700 rounded-full text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back
                        </button>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 md:flex-none bg-primary hover:bg-lime-600 text-white px-12 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Saving...' : 'Save & Continue'}
                                <span className="material-icons text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <footer className="max-w-4xl mx-auto mt-12 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Section 05 • Child Care & Medical Authorization</p>
                <p className="text-slate-400 text-[10px] mt-2 italic">&copy; {new Date().getFullYear()} TIDDLEE Pre-School. All rights reserved.</p>
            </footer>
        </main>
    );
}
