'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const vaccines = [
    "DTP/DTNP", "IPV/OPV", "MMR", "Rota virus", "HIB",
    "Hep A", "Hep B", "Varicella", "HPV", "Flu", "TT"
];

export default function ImmunizationRecords() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        immunization_records: {} as Record<string, string[]>,
        current_height: '',
        current_weight: '',
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
                        let records = {};
                        if (data.immunization_records) {
                            try {
                                records = typeof data.immunization_records === 'string'
                                    ? JSON.parse(data.immunization_records)
                                    : data.immunization_records;
                            } catch (e) {
                                console.error('Error parsing immunization records:', e);
                            }
                        }

                        setFormData({
                            id: storedId,
                            immunization_records: records,
                            current_height: data.current_height || '',
                            current_weight: data.current_weight || '',
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

    const handleTableChange = (vaccine: string, index: number, value: string) => {
        setFormData(prev => {
            const newRecords = { ...prev.immunization_records };
            if (!newRecords[vaccine]) newRecords[vaccine] = ['', '', '', '', '', ''];
            newRecords[vaccine][index] = value;
            return { ...prev, immunization_records: newRecords };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                router.push('/care-routines');
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
        <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200 py-12 px-4 font-quicksand">
            <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                <header className="bg-white dark:bg-zinc-900 pt-12 pb-6 flex flex-col items-center">
                    <img
                        alt="Immunization Illustration"
                        className="h-64 object-contain mb-8"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx5ICZOBDyQv1boeZBRl4Yuug3SCPdCvTNUjpSnGdodq48F0nG1C9txKN9ftrIhNtoeFZ7e2T_UAC1t8WzzOKsGJxvaD_PehK-1-odZgvCKfx_99zN9z6cXHyN-rEYyhiRWsenTeJNkDFqoMjNaD6pGPZyywmE9JxyikaEL-afAM8ScYWdaBYfj6kJGOtgw9JhoVhTCadkcn0t6IJX7iaYxD3GheDilbv8SHfhE_k4JWhc0WIPqpJ9wXVlvPLSLJQ9FFPY1wGffdw"
                    />
                    <div className="w-full bg-primary py-4 px-8 text-center shadow-md">
                        <h1 className="text-3xl font-bold text-white uppercase tracking-wide font-display">Child Medical Information Sheet</h1>
                        <p className="text-sm text-white/90 font-bold uppercase tracking-widest mt-1">Section 5 of 7 • Immunization Records</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-icons text-primary text-3xl">vaccines</span>
                            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200 font-display">Immunization Records</h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            Kindly enter the dates of dosage from your child's medical records. Subsequent medical dosages are requested to be entered in the sheet.
                        </p>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-zinc-800">
                                        <th className="border border-slate-200 dark:border-zinc-700 p-4 text-left font-bold text-slate-700 dark:text-slate-200 uppercase text-xs w-1/4">Vaccine Name</th>
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <th key={i} className="border border-slate-200 dark:border-zinc-700 p-2 text-center font-bold text-slate-600 dark:text-slate-300 uppercase text-[10px]">Dose {i}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {vaccines.map(v => (
                                        <tr key={v} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="border border-slate-200 dark:border-zinc-700 p-4 font-bold text-sm text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-zinc-800/30">{v}</td>
                                            {[0, 1, 2, 3, 4, 5].map(i => (
                                                <td key={i} className="border border-slate-200 dark:border-zinc-700 p-0">
                                                    <input
                                                        className="w-full h-12 border-none bg-transparent text-center focus:ring-2 focus:ring-primary/20 text-sm dark:text-white"
                                                        placeholder="DD/MM/YY"
                                                        type="text"
                                                        value={formData.immunization_records[v]?.[i] || ''}
                                                        onChange={(e) => handleTableChange(v, i, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Height (cm)</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    type="text"
                                    name="current_height"
                                    value={formData.current_height}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Weight (kg)</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    type="text"
                                    name="current_weight"
                                    value={formData.current_weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <label className="block text-primary font-bold mb-1">Unique ID</label>
                                <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium">
                                    {formData.unique_id || <span className="text-sm text-gray-400 italic">Office use only</span>}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-primary font-bold mb-1">Date of Admission</label>
                                <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap overflow-hidden">
                                    {formatDate(formData.admission_date)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-10 border-t border-slate-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-10 py-3 rounded-full border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary hover:bg-lime-600 text-white font-bold py-4 px-12 rounded-full shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save & Continue'}
                            <span className="material-icons">arrow_forward</span>
                        </button>
                    </div>
                </form>

                <footer className="bg-slate-50 dark:bg-zinc-950 p-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                    TIDDLEE Preschool • Child Medical Information • Form MED-05
                </footer>
            </div>
        </main>
    );
}
