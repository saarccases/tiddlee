'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HealthHygienePolicies() {
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
                    console.error('[HealthHygienePolicies] Fetch error:', error);
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
        <div className="bg-slate-50 min-h-screen py-8 font-outfit text-slate-800">
            <div className="max-w-5xl mx-auto my-8 bg-white shadow-xl overflow-hidden min-h-[1100px] flex flex-col border border-slate-200">
                <header className="p-8 pb-4">
                    <h2 className="text-xl font-bold text-slate-700 border-b-2 border-primary pb-2 inline-block">
                        Preschool &amp; Daycare Common Policies
                    </h2>
                </header>

                <main className="flex-grow p-8 pt-4">
                    <div className="space-y-8 text-slate-700 leading-relaxed">
                        <section>
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-primary mt-1">label</span>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">Clothing Label:</h3>
                                    <p>We request you to label the clothing so as to avoid the confusion and mismatch. Though the staff is trained in handling this, and also the clothing is kept in particular bags, but sometimes we have noticed that children have similar dress.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-primary mt-1">shopping_bag</span>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">Plastic Bags:</h3>
                                    <p>We request to provide with 2 plastic bags in the main bags duly labeled if possible, to keep the soiled clothes, which are to be taken back every day.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-primary mt-1">block</span>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">Toys/Eatables Policy:</h3>
                                    <p>We ask that children do not bring toy/any eatables from home to the facility. We are not responsible for any items brought into the facility.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-primary mt-1">medical_services</span>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">Sick Policy:</h3>
                                    <p>For the safety of all of our children, if children are running a fever, vomiting or carrying a contagious disease should not report to the facility for 24 hours. If your child becomes sick while in our care, under our discretion, we will notify the parent and the child must be picked up immediately.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-start gap-3">
                                <span className="material-icons text-primary mt-1">health_and_safety</span>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">Head Lice:</h3>
                                    <p>If Head Lice are detected on a child whilst at the Preschool/Daycare the Center will immediately contact the Parent or emergency contact person. The child will be segregated from other children until someone arrives to collect him/her. A child cannot return to the facility until treated and all head lice are removed.</p>
                                </div>
                            </div>
                        </section>

                        <div className="bg-slate-100 p-6 rounded-lg text-center font-bold tracking-wide mt-6 border border-slate-200">
                            ILLNESS SPREADS EASILY AMONG THIS AGE GROUP AND WE ASK FOR YOUR FULL COOPERATION REGARDING THIS POLICY.
                        </div>
                    </div>

                    <div className="mt-20 flex flex-col md:flex-row gap-8 pt-8 border-t border-slate-100">
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
                </main>

                <footer className="mt-auto">
                    <div className="h-2 bg-primary w-full"></div>

                    <div className="p-8 flex justify-between items-center bg-slate-50 border-t border-primary/20">
                        <Link href="/common-policies" className="px-6 py-2 border border-primary/30 text-primary font-semibold rounded-full hover:bg-white transition-colors">
                            Back
                        </Link>
                        <Link href="/consent-introduction" className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            Save &amp; Next
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
