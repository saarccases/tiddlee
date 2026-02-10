'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BitingPolicy() {
    const [formData, setFormData] = useState({
        unique_id: '',
        admission_date: ''
    });

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId) {
            const fetchAdmission = async () => {
                try {
                    const response = await fetch(`/api/get-admission?id=${storedId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            unique_id: data.unique_id || '',
                            admission_date: data.admission_date || ''
                        });
                    }
                } catch (error) {
                    console.error('[BitingPolicy] Fetch error:', error);
                }
            };
            fetchAdmission();
        }
    }, []);

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
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-inter text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl overflow-hidden rounded-xl border border-slate-200">

                {/* Top Header */}
                <div className="text-center pt-8 pb-4 font-quicksand">
                    <h2 className="text-xl font-bold text-slate-700 uppercase tracking-widest mb-4">Preschool &amp; Daycare Common Policies</h2>

                    {/* Circular Illustrations Area */}
                    <div className="flex justify-center gap-6 mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-primary/20">
                            <span className="material-icons-outlined text-4xl text-slate-300">face</span>
                        </div>
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-primary/20">
                            <span className="material-icons-outlined text-4xl text-slate-300">psychology</span>
                        </div>
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-primary/20">
                            <span className="material-icons-outlined text-4xl text-slate-300">mood_bad</span>
                        </div>
                    </div>

                    <div className="bg-[#99cc00] py-3 px-10 inline-block rounded-r-full rounded-l-full shadow-md">
                        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Biting Policy</h1>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10">

                    <section>
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm">circle</span> Biting Policy Tenets
                        </h3>
                        <p className="text-slate-600 leading-relaxed pl-6 font-medium">
                            Biting is a common developmental stage that many children go through. It is usually a temporary condition that is most common between thirteen and twenty-four months of age. The safety of the children at the center is our primary concern. The center's biting policy addresses the actions the staff will take if a biting incident occurs.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm">circle</span> For the child that bit
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 pl-6 marker:text-primary font-medium">
                            <li>The child will be immediately removed from the situation.</li>
                            <li>The child will be told firmly, "No biting, biting hurts."</li>
                            <li>The child will be redirected to another activity.</li>
                            <li>The parents will be notified of the incident.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm">circle</span> When biting continues
                        </h3>
                        <p className="text-slate-600 leading-relaxed pl-6 mb-3 font-medium">
                            If the child continues to bite, the following procedures will be followed:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 pl-6 marker:text-primary font-medium">
                            <li>The child will be shadowed by a staff member to prevent further incidents.</li>
                            <li>The staff will observe the child to determine what triggers the biting.</li>
                            <li>A conference will be scheduled with the parents to discuss a plan of action.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm">circle</span> Excessive Biting
                        </h3>
                        <p className="text-slate-600 leading-relaxed pl-6 font-medium">
                            If a child bites excessively, meaning 3 or more times in one day, the parent will be called to pick up the child for the remainder of the day. This is for the safety of the other children in the class. If the biting behavior persists and threatens the safety of other children, the center reserves the right to terminate enrollment.
                        </p>
                    </section>

                    <div className="flex flex-col md:flex-row gap-8 pt-8 border-t border-slate-100">
                        <div className="flex-1">
                            <label className="block text-primary font-bold mb-1">Unique ID</label>
                            <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 font-medium">
                                {formData.unique_id || <span className="text-sm text-gray-400 italic">Office use only</span>}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-primary font-bold mb-1">Date of Admission</label>
                            <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 font-medium">
                                {formatDate(formData.admission_date)}
                            </div>
                        </div>
                    </div>
                </div>



                <div className="p-4 bg-slate-100 flex justify-between items-center px-8 border-t border-slate-200 font-quicksand">
                    <Link href="/daycare-policies" className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-full hover:bg-white transition-colors">
                        Back
                    </Link>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest hidden md:block">
                        Section 11 | Tiddlee Preschool
                    </div>
                    <Link href="/operations-policy" className="bg-[#99cc00] hover:bg-[#88b600] text-white px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95">
                        Save &amp; Continue
                    </Link>
                </div>
            </div>
        </div>
    );
}
