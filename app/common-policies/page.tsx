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
                    <div className="flex justify-center items-end space-x-8 mb-6">
                        {/* Illustrations placeholder */}
                        <div className="h-44 w-full bg-slate-50 flex items-center justify-center rounded-lg">
                            <span className="text-slate-400 italic">Students & Teacher Illustration Group</span>
                        </div>
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
                            <span className="font-bold">TIDDLEE</span> will provide healthy food and snack based on the time of the day the child is with us. A meal schedule for every week will be provided beforehand. In case of any food Allergy please notify us in advance. Outside/home food will not be allowed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <span className="material-icons text-primary">cake</span>
                            Birthday Celebrations
                        </h2>
                        <p className="text-gray-700 leading-relaxed font-medium">
                            You may celebrate your child's birthday at <span className="font-bold">TIDDLEE</span>. We request for only egg less cake or cup cakes for the celebration (Cake without icing). Teachers and children will sing for your child. They cut the cake during snack time. Parents are requested to inform the teacher 2-3 days in advance. The cake should be sent before the given timing. Returns gifts of any kind are not allowed.
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
                    <Link href="/health-hygiene-policies" className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Save &amp; Next
                    </Link>
                </div>
            </div>
        </div>
    );
}
