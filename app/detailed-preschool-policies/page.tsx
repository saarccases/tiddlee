'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DetailedPreschoolPolicies() {
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
                    console.error('[DetailedPreschoolPolicies] Fetch error:', error);
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
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-quicksand text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl overflow-hidden rounded-xl border border-slate-200">
                <div className="p-8 border-b border-primary">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-primary font-bold">Preschool Policies</span>
                    </h1>
                    <div className="h-1.5 w-full bg-primary mt-4 rounded-full"></div>
                </div>

                <div className="p-8 space-y-10 text-slate-700">
                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons-outlined text-4xl text-slate-400">school</span>
                        </div>
                        <div className="space-y-4">
                            <p><strong className="text-slate-900">Arrival:</strong> Prompt arrival at the given time is encouraged to ensure each class is able to begin the day as scheduled.</p>
                            <p><strong className="text-slate-900">Arrival - Grace Time:</strong> Children will be taken in till 8:45am and 12:00pm post which we will not be able to take children into the preschool class. This is a 15 minute grace which is allowed but should not be used as time for arrival.</p>
                            <p><strong className="text-slate-900">Why Late Arrival is Not Permissible?</strong> Children miss the opportunity to ease into the morning/afternoon with their peers and teachers on a common schedule. In addition, children arriving late may interrupt the flow and structure of the class, which the teacher works hard to establish. Of course, we understand the common complications of daily life but we appreciate every effort being made to have your child present by 8:30 am / 11:45 am each day of attendance.</p>
                            <p><strong className="text-slate-900">Late Arrival for Child Enrolled In Preschool And Day Care:</strong> Children who are late for Preschool and also enrolled in Day Care will not be able to attend Preschool class and will be directly sent to Day care.</p>
                            <p className="italic text-sm text-slate-500 font-medium">*Late special arrival can be availed with a special request and is limited to discretion of the Centre Manager. This can be availed only in cases where it is unavoidable and only 5 times in a year.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons-outlined text-4xl text-slate-400">schedule</span>
                        </div>
                        <div>
                            <p><strong className="text-slate-900">Departure:</strong> Children must be picked up at 11:20 AM or 2:35 PM, and no later than 11:30 AM or 2:45 pm. Please carry and present your pick-up/drop card when requested, as it ensures your child's safety. If someone else is picking up or dropping off your child, kindly share their name and contact number in advance to inform the teacher about the authorised person.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons-outlined text-4xl text-slate-400">groups</span>
                        </div>
                        <div>
                            <p><strong className="text-slate-900">Meeting with Teacher:</strong> If you would like to meet your child's teacher, please connect with the Centre In-charge to schedule an appointment usually arranged for a Saturday. In special cases, meetings may be scheduled on select weekdays between 3:00 pm and 3:30 pm. Kindly note that regular PTMs should not be missed.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons-outlined text-4xl text-slate-400">checkroom</span>
                        </div>
                        <div>
                            <p><strong className="text-slate-900">Dress Code:</strong> Children should come in TIDDLEE uniform compulsorily.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons-outlined text-4xl text-slate-400">payments</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Fee Policy:</strong> Fees once paid are non-refundable.</p>
                            <p>Registration fee for seat booking is non-refundable.</p>
                            <p>Security deposit is refundable only if the original receipt is retained and submitted.</p>
                        </div>
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



                <div className="p-8 flex justify-between gap-4 no-print bg-white border-t border-gray-100">
                    <Link href="/preschool-policies" className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        Back
                    </Link>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2">
                            <span className="material-icons-outlined text-sm">print</span> Print
                        </button>
                        <Link href="/daycare-policies" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
                            Save &amp; Continue <span className="material-icons-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
