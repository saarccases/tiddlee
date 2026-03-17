'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CommonPolicies() {
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
        <div className="bg-slate-50 min-h-screen font-quicksand transition-colors duration-200 py-8">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden border border-gray-200">

                <div className="p-8 text-center bg-white">
                    <div className="flex justify-center items-center gap-6 md:gap-12 mb-6">
                        <img alt="Children at school" className="h-28 md:h-36 object-contain" src="/images/admission-1.png" />
                        <img alt="Children learning" className="h-28 md:h-36 object-contain" src="/images/admission-2.png" />
                        <img alt="Children playing" className="h-28 md:h-36 object-contain" src="/images/admission-3.png" />
                    </div>
                </div>

                <div className="bg-primary py-4 px-8 shadow-inner">
                    <h1 className="text-white text-2xl md:text-3xl font-bold text-center tracking-wide">
                        Preschool &amp; Daycare Common Policies
                    </h1>
                </div>

                <div className="p-10 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <span className="material-icons text-primary">restaurant</span>
                            Meals
                        </h2>
                        <p className="text-gray-700 leading-relaxed font-medium">
                            <span className="font-bold">TIDDLEE</span> will provide healthy food and snack based on the package opted. A meal schedule for every week will be provided beforehand. Incase of any food Allergy please notify us in advance. Outside/home food will not be allowed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <span className="material-icons text-primary">cake</span>
                            Birthday Celebrations
                        </h2>
                        <p className="text-gray-700 leading-relaxed font-medium">
                            You may celebrate your child&apos;s birthday at <span className="font-bold">TIDDLEE</span>. We request for only egg less cake or cup cakes for the celebration (Cake without icing). Returns gifts of any kind are not allowed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <span className="material-icons text-primary">checkroom</span>
                            Clothing Policy
                        </h2>
                        <p className="text-gray-700 leading-relaxed font-medium">
                            Please dress your children appropriately. Please remember that we spend a majority of the day playing, coloring, painting, etc. and clothes may come home colorful. Please dress your children comfortably. <span className="font-bold">Parents are also requested to send an extra pairs of clothes in the bag everyday.</span>
                        </p>
                    </section>

                    {/* Additional Common Policies */}
                    <div className="pt-8 border-t-4 border-primary space-y-8">
                        <h2 className="text-xl font-bold text-slate-800">Preschool &amp; Daycare Common Policies</h2>

                        <section>
                            <h3 className="font-bold text-slate-800 mb-2">Clothing Label:</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                We request you to label the clothing so as to avoid the confusion and mismatch.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-800 mb-2">Plastic Bags:</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                We request to provide with 2 plastic bags in the main bags duly labeled if possible, to keep the soiled clothes, which are to be taken back every day.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-800 mb-2">Toys/Eatables Policy:</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                We ask that children do not bring toy/any eatables from home to the facility. We are not responsible for any items brought into the facility.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-800 mb-2">Sick Policy:</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                For the safety of all of our children, if children are running a fever, vomiting or carrying a contagious disease should not report to the facility for 24 hours. If your child becomes sick while in our care, under our discretion, we will notify the parent and the child must be picked up immediately.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-slate-800 mb-2">Head Lice:</h3>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                If Head Lice are detected on a child whilst at the Preschool/Daycare the Center will immediately contact the Parent or emergency contact person. The child will be segregated from other children until someone arrives to collect him/her. A child cannot return to the facility until treated and all head lice are removed.
                            </p>
                            <p className="text-red-600 font-bold mt-4 uppercase text-sm">
                                ILLNESS SPREADS EASILY AMONG THIS AGE GROUP AND WE ASK FOR YOUR FULL COOPERATION REGARDING THIS POLICY.
                            </p>
                        </section>
                    </div>

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

                <div className="p-8 bg-slate-50 flex justify-between items-center border-t border-primary/20">
                    <Link href="/operations-policy" className="px-6 py-2 border border-primary/30 text-primary font-semibold rounded-full hover:bg-white transition-colors">
                        Back
                    </Link>
                    <Link href="/consent-introduction" className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Save &amp; Next
                    </Link>
                </div>
            </div>
        </div>
    );
}
