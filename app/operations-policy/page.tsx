'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OperationsPolicy() {
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
                    console.error('[OperationsPolicy] Fetch error:', error);
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
        <div className="bg-gray-50 min-h-screen py-8 font-display text-gray-800">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                <div className="p-8 border-b border-primary">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-primary font-bold">Preschool &amp; Daycare Operations Policy</span>
                    </h1>
                    <div className="h-1.5 w-full bg-primary mt-4 rounded-full"></div>
                </div>

                <div className="p-8 space-y-10 text-slate-700">

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">fact_check</span>
                        </div>
                        <div className="space-y-2">
                            {programType === 'preschool' ? (
                                <p><strong className="text-slate-900">Attendance Policy:</strong> Children must be signed in and out before they can enter or leave the facility. Only approved parents or guardians can sign the children in or out.</p>
                            ) : (
                                <p><strong className="text-slate-900">Attendance Policy:</strong> Only approved parents or guardians can sign the children in or out. There is no refund for late arrival, early pickup or absence.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">psychology</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Discipline Policy:</strong> TIDDLEE enforces a positive reinforcement disciplinary policy which may consist of a time out or redirection. We want to ensure the safety of all our children. You will receive information regarding your Child. We encourage parent/guardian - caregiver communication and we believe that communication is the key to be sure your child is properly taken care off. A PTM day shall be fixed for discussion and feedback purpose.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">payments</span>
                        </div>
                        <div className="space-y-3">
                            <p className="font-bold text-slate-900 text-lg">Payment Policy:</p>
                            {programType !== 'daycare' && (
                                <div className="bg-primary/5 border-l-4 border-primary p-4">
                                    <p className="font-bold text-slate-800 mb-1">Preschool:</p>
                                    <p>All payments are to be made by due dates, failing which a late fee of Rs. 100 per day will be levied.</p>
                                </div>
                            )}
                            {programType !== 'preschool' && (
                                <div className="bg-primary/5 border-l-4 border-primary p-4">
                                    <p className="font-bold text-slate-800 mb-1">Daycare:</p>
                                    <p>All payments are due by the fifth of each month. Any payments after the fifth will be assessed a late payment of Rs. 100 per day. Any cheque bounce will attract an extra charge.</p>
                                </div>
                            )}
                            <div className="bg-primary/5 border-l-4 border-primary p-4">
                                <p className="font-bold text-slate-800 mb-1">Refund:</p>
                                <p>All fees once paid are non-refundable and non-transferable under any circumstances.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">contact_phone</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Contact Information Policy:</strong> Parents and guardians are responsible for keeping all their contact information updated. This includes phone numbers, address, email addresses, etc.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">gavel</span>
                        </div>
                        <div className="space-y-3">
                            <p><strong className="text-slate-900">Termination Policy:</strong> TIDDLEE reserves the right to deny service or terminate care for your child without notice for any reasons including, but not limited to, non-payment, excessive late payment, child unruliness, or any unforeseen problems. This will allow us to refund any applicable security deposit and/or post-dated cheque submitted.</p>
                            <p>Parents or guardians may withdraw their Child for any reason with prior intimation. All payments due shall be paid within next 2 weeks.</p>
                            <p>This will allow us to refund any applicable security deposit and/or post-dated cheque submitted.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">event</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Holidays:</strong> TIDDLEE will remain closed on the days shared in the holiday list <strong>(Separate for Preschool &amp; Daycare)</strong>.</p>
                        </div>
                    </div>

                </div>



                <footer className="py-6 bg-white px-8 flex justify-between items-center border-t border-gray-200">
                    <Link href="/biting-policy" className="px-6 py-2 border border-gray-300 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition-colors">
                        Back
                    </Link>
                    <Link href="/consent-introduction" className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Save &amp; Continue
                    </Link>
                </footer>
            </div>
        </div>
    );
}
