'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChildHealth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        blood_group: '',
        current_height: '',
        current_weight: '',
        allergies_reactions: '',
        past_illnesses: '',
        other_health_info: '',
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
                            blood_group: data.blood_group || '',
                            current_height: data.current_height || '',
                            current_weight: data.current_weight || '',
                            allergies_reactions: data.allergies_reactions || data.allergies || '',
                            past_illnesses: data.past_illnesses || '',
                            other_health_info: data.other_health_info || '',
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
                router.push('/immunization-records');
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
        router.push('/guardian-info');
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
        <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200 py-12 px-4 font-quicksand">
            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                <header className="bg-white dark:bg-zinc-900 p-8 flex flex-col items-center">
                    <div className="flex justify-center items-center py-4">
                        <img
                            alt="Health Illustrations"
                            className="max-w-full h-auto max-h-48 object-contain"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhPQm5NPyBYXhEJomXAV7mSjIL6rpYD-maC-vQDRL1VXHNUoHnCCEN2ZxN1pe3ZvLbVEnsWuqA-X0S-POdVa5VcqKCtKIeIW_RQnMBuFYZLefhQspAgG18YryKLoTU0XrUU-W_94LlL_ufMNh36IvmSmZup3BdyCFYZ3h8CnH2bLoGVrnE_-4QHb0DPqYyCwDZ7IHOR_O9vgyqZErePWmg0R8wEv1f0WiRm7cCGdqI5z0gv5DXDR1XAHqH_BdCwUSBB3jwZdrbcv8"
                        />
                    </div>
                    <div className="w-full bg-primary text-white py-4 px-8 text-center rounded-lg shadow-md">
                        <h1 className="text-3xl font-bold tracking-tight font-display uppercase">Child HEALTH Information Sheet</h1>
                        <p className="text-sm opacity-90 mt-1 uppercase tracking-widest font-bold">Section 4 of 7</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                    {loading && (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Child's Name</label>
                            <input
                                className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                placeholder="Enter child's full name"
                                type="text"
                                name="child_name"
                                value={formData.child_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                            <input
                                className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                placeholder="e.g. O+ Positive"
                                type="text"
                                name="blood_group"
                                value={formData.blood_group}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                            <input
                                className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                placeholder="e.g. 100"
                                type="text"
                                name="current_height"
                                value={formData.current_height}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                            <input
                                className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                placeholder="e.g. 15"
                                type="text"
                                name="current_weight"
                                value={formData.current_weight}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">
                                <span className="material-icons text-red-500 text-base mr-2">report_problem</span>
                                Known Allergies & Reactions
                            </label>
                            <textarea
                                className="w-full bg-slate-50/50 dark:bg-zinc-800 shadow-inner rounded-xl border border-slate-100 dark:border-zinc-800 p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Please list any food or environmental allergies..."
                                rows={4}
                                name="allergies_reactions"
                                value={formData.allergies_reactions}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">
                                <span className="material-icons text-blue-500 text-base mr-2">history</span>
                                Past Illnesses
                            </label>
                            <textarea
                                className="w-full bg-slate-50/50 dark:bg-zinc-800 shadow-inner rounded-xl border border-slate-100 dark:border-zinc-800 p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Mention any major illnesses or surgeries..."
                                rows={4}
                                name="past_illnesses"
                                value={formData.past_illnesses}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Other Health Information</label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">Please list any other health information you feel we should know about your child.</p>
                        <textarea
                            className="w-full bg-slate-50/50 dark:bg-zinc-800 shadow-inner rounded-xl border border-slate-100 dark:border-zinc-800 p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                            rows={3}
                            name="other_health_info"
                            value={formData.other_health_info}
                            onChange={handleChange}
                        ></textarea>
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

                    <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-8 py-3 rounded-full border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary hover:bg-lime-600 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save & Continue'}
                            <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                    </div>
                </form>

                <footer className="bg-slate-50 dark:bg-zinc-950 p-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Preschool Admission Form • Confidential Document • Section 04
                </footer>
            </div>
        </main>
    );
}
