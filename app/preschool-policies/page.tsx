'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PreschoolPolicies() {
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
                    console.error('[PreschoolPolicies] Fetch error:', error);
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
        <div className="bg-gray-100 min-h-screen py-10 px-4 font-quicksand text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden rounded-xl border border-gray-200">

                {/* Header Illustration Area */}
                <div className="w-full bg-white flex items-center justify-center gap-6 md:gap-12 py-8 px-8 border-b border-gray-100">
                    <img alt="Children at preschool" className="h-28 md:h-40 object-contain" src="/images/home-1.png" />
                    <img alt="Children learning" className="h-32 md:h-44 object-contain" src="/images/home-2.png" />
                    <img alt="Children playing" className="h-28 md:h-40 object-contain" src="/images/home-3.png" />
                </div>

                <div className="bg-primary py-4 px-8 text-center">
                    <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Preschool Policies</h1>
                </div>

                <div className="p-10 space-y-8">
                    <p className="text-gray-700 font-medium text-lg leading-relaxed">
                        Below is a list of our policies. These policies are put in effect in order to make the facility run smoothly as well as to ensure the safety of your children.
                    </p>

                    <div className="space-y-10">
                        <div className="flex items-start gap-5">
                            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                                <span className="material-icons text-primary text-4xl">schedule</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Hours of Operation</h2>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    Our hours of operation are from <span className="font-semibold">8:00 am to 8:00 pm, Monday to Saturday</span>. Children must not arrive before opening time.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                                <span className="material-icons text-primary text-4xl">transfer_within_a_station</span>
                            </div>
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Arrival &amp; Departure</h2>
                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="font-bold text-primary mb-1">Morning Batch</h3>
                                        <p className="text-2xl font-semibold text-gray-800">8:30 AM to 11:20 AM</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="font-bold text-primary mb-1">Afternoon Batch</h3>
                                        <p className="text-2xl font-semibold text-gray-800">11:45 AM to 2:35 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="px-8 py-6 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                    <Link href="/care-routines" className="px-6 py-2 border border-gray-300 text-gray-600 font-semibold rounded-full hover:bg-gray-100 transition-colors">
                        Back
                    </Link>
                    <Link href="/detailed-preschool-policies" className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Next: Detailed Policies
                    </Link>
                </div>
            </div>
        </div>
    );
}
