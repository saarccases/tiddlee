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
        food_allergies: '',
        likes: '',
        dislikes: '',
        sleep_routines: '',
        playtime_activities: '',
        is_potty_trained: '',
        redirection_techniques: '',
        additional_comments: '',
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
                            food_allergies: data.food_allergies || '',
                            likes: data.likes || '',
                            dislikes: data.dislikes || '',
                            sleep_routines: data.sleep_routines || '',
                            playtime_activities: data.playtime_activities || '',
                            is_potty_trained: data.is_potty_trained || '',
                            redirection_techniques: data.redirection_techniques || '',
                            additional_comments: data.additional_comments || '',
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
                router.push('/medical-authorization');
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
        router.push('/immunization-records');
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
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white font-display tracking-tight">Care & Potty Training</h1>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-display">Section 6 of 7</span>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5, 6, 0, 0].map((_, i) => (
                                <div key={i} className={`h-1.5 w-6 rounded-full ${i < 6 ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-800'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-100 dark:border-zinc-800">
                <div className="bg-white dark:bg-zinc-800 p-8 flex justify-center items-center gap-8 md:gap-16 border-b-8 border-primary overflow-x-auto">
                    <img alt="Children eating" className="h-24 md:h-32 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvMy--RDjtZHLzfBnYHwty_x-JMEWjzwRrasiIP3vV4tSAqBD3OvP1MChLBm0xiy2NRn9QwrSWsDrvtnXSulTfyJAdg0z6sm60Sodu55doAwKuoJpVwxmtbdkHE99vx7aA4pavf4Ojr9_Ai3ADgjBcS81Vy3qXkQbjsRnzKQWeEl7_DIQjzvz7U0qwiM8NBDyR3kz78QQJNofTCwqe4TcaO6Fb-IP5IpwbLh3xyyhNaHBMD6a3CStGFCvKs7-SqnsPKkFkciFvU2U" />
                    <img alt="Children playing" className="h-24 md:h-32 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpN1PgFKgDI2jpws2ZwJt5_TeBXx7s2M_jsPZXWBmX-b_cKIS8W93MSPo914wg2HI1nZoIX3jEVdE0GPu_mpx5aRPc2xLRibCxu0nhitgTYDBG7VOpxdkLDb0jj09gvga7v_2s_QXkPVtJ7gXw67J9mqwfgC3QazHgGwumzQO9hqK7o0hF5cWfscr6WH_zf1pH8_Z4zkLP1yju5QsrnY7SyoJI1QDo0ufYLSMK7TJk9oKEgzqxmNgxGH2fN5FPPi0bZOkl5FFQTlo" />
                    <img alt="Child sleeping" className="h-24 md:h-32 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeGVehOjeOqKk0WeGyS57LbjrCyeQRsT3ICAQSgti6Nb72e2YtHacMKV7znZJSS-LkARCihbgjOg00IzhLN2329WC_a4whHCJta0wzzsIR6fA_2gzgICvF7B9qjL9kWPi0ycnRyvSXyyUN4pqa8VS-l9pkcVIltqwDrP4maElhHP2p1KkA_BXTaVykKny2EDLkhWHwCwpVKXYI92Rp_WNdZ4RCshVNYKJup0Z2_DMLkO1LLmKXRh_lwOO9uM4nDRzCv8PbWdP-hCI" />
                </div>
                <div className="bg-primary py-5 px-8 text-center shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.2em] font-display">Child Care Information Sheet</h2>
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
                                    value={formData.food_allergies}
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

                    <div className="pt-8 border-t border-slate-100 dark:border-zinc-800 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                                <span className="material-icons">hotel</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Rest Time</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">We do "rest time" after lunch. Children are encouraged to sit quietly and try to sleep.</p>
                            </div>
                        </div>
                        <div className="space-y-2 pl-14">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sleep time routines or tricks:</label>
                            <textarea
                                className="w-full bg-white dark:bg-zinc-800 rounded-xl border-slate-200 dark:border-zinc-700 focus:border-primary focus:ring-primary p-4 text-slate-800 dark:text-slate-100 font-medium transition-all"
                                placeholder="e.g. favorite blanket, specific song..."
                                rows={2}
                                name="sleep_routines"
                                value={formData.sleep_routines}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-zinc-800 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                                <span className="material-icons">celebration</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Playtime</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">Various activities are performed throughout the day.</p>
                            </div>
                        </div>
                        <div className="space-y-2 pl-14">
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Favorite playtime activities:</label>
                            <textarea
                                className="w-full bg-white dark:bg-zinc-800 rounded-xl border-slate-200 dark:border-zinc-700 focus:border-primary focus:ring-primary p-4 text-slate-800 dark:text-slate-100 font-medium transition-all"
                                placeholder="e.g. drawing, blocks, outdoor play..."
                                rows={2}
                                name="playtime_activities"
                                value={formData.playtime_activities}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-zinc-800 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <label className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Is your child Potty Trained?</label>
                            <div className="flex items-center gap-8">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        className="text-primary focus:ring-primary h-6 w-6 border-slate-300 dark:border-zinc-600 dark:bg-zinc-700"
                                        name="is_potty_trained"
                                        type="radio"
                                        value="yes"
                                        checked={formData.is_potty_trained === 'yes'}
                                        onChange={handleChange}
                                    />
                                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Yes</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        className="text-primary focus:ring-primary h-6 w-6 border-slate-300 dark:border-zinc-600 dark:bg-zinc-700"
                                        name="is_potty_trained"
                                        type="radio"
                                        value="no"
                                        checked={formData.is_potty_trained === 'no'}
                                        onChange={handleChange}
                                    />
                                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">No</span>
                                </label>
                            </div>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border-l-4 border-primary">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 italic leading-relaxed">
                                *We will try to encourage training through our facility, but training is best started in your home.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">Preferred Redirection Techniques</label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic -mt-2">Techniques used when the child is upset or showing challenging behavior.</p>
                                <textarea
                                    className="w-full bg-slate-50/50 dark:bg-zinc-800 shadow-inner rounded-xl border border-slate-100 dark:border-zinc-800 p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                                    rows={3}
                                    name="redirection_techniques"
                                    value={formData.redirection_techniques}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">Additional Comments</label>
                                <textarea
                                    className="w-full bg-slate-50/50 dark:bg-zinc-800 shadow-inner rounded-xl border border-slate-100 dark:border-zinc-800 p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 transition-all"
                                    rows={2}
                                    name="additional_comments"
                                    value={formData.additional_comments}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Section 06 • Care Routines & Potty Training</p>
                <p className="text-slate-400 text-[10px] mt-2 italic">© {new Date().getFullYear()} TIDDLEE Pre-School. All rights reserved.</p>
            </footer>
        </main>
    );
}
