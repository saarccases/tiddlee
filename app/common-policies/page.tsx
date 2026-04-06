'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CommonPolicies() {
    const [programType, setProgramType] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        unique_id: '',
        admission_date: ''
    });

    useEffect(() => {
        setProgramType(localStorage.getItem('selectedProgramType'));
    }, []);

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
                    console.error('[CommonPolicies] Fetch error:', error);
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
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-display text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl overflow-hidden rounded-xl border border-slate-200">
                <div className="p-8 border-b border-primary">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-primary font-bold">Common Policies</span>
                    </h1>
                    <div className="h-1.5 w-full bg-primary mt-4 rounded-full"></div>
                </div>

                <div className="p-8 space-y-10 text-slate-700">

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">restaurant</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Meals:</strong> TIDDLEE will provide healthy food and snack based on the package opted. A meal schedule for every week will be provided beforehand. Incase of any food Allergy please notify us in advance. Outside/home food will not be allowed.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">cake</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Birthday Celebrations:</strong> You may celebrate your child&apos;s birthday at TIDDLEE. We request for only egg less cake or cup cakes for the celebration (Cake without icing). Returns gifts of any kind are not allowed.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">checkroom</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Clothing Policy:</strong> Please dress your children appropriately. Please remember that we spend a majority of the day playing, coloring, painting, etc. and clothes may come home colorful. Please dress your children comfortably. <strong>Parents are also requested to send an extra pairs of clothes in the bag everyday.</strong></p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">label</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Clothing Label:</strong> We request you to label the clothing so as to avoid the confusion and mismatch.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">shopping_bag</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Plastic Bags:</strong> We request to provide with 2 plastic bags in the main bags duly labeled if possible, to keep the soiled clothes, which are to be taken back every day.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">toys</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Toys/Eatables Policy:</strong> We ask that children do not bring toy/any eatables from home to the facility. We are not responsible for any items brought into the facility.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">sick</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Sick Policy:</strong> For the safety of all of our children, if children are running a fever, vomiting or carrying a contagious disease they should not report to the facility for 24 hours. If your child becomes sick while in our care, under our discretion, we will notify the parent and the child must be picked up immediately.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">bug_report</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Head Lice:</strong> If Head Lice are detected on a child whilst at the Preschool/Daycare the Center will immediately contact the Parent or emergency contact person. The child will be segregated from other children until someone arrives to collect him/her. A child cannot return to the facility until treated and all head lice are removed.</p>
                            <p className="text-red-600 font-bold uppercase text-sm mt-3">ILLNESS SPREADS EASILY AMONG THIS AGE GROUP AND WE ASK FOR YOUR FULL COOPERATION REGARDING THIS POLICY.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 flex justify-between gap-4 no-print bg-white border-t border-gray-100">
                    <Link href={programType === 'preschool' ? '/detailed-preschool-policies' : programType === 'daycare' ? '/detailed-daycare-policies' : '/detailed-daycare-policies'} className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2">
                        Back
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/biting-policy" className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
                            Save &amp; Continue <span className="material-icons text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
