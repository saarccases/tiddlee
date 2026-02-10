'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OperationsPolicy() {
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
        <div className="bg-gray-50 min-h-screen py-8 font-inter text-gray-800">
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                <div className="p-8 pb-0 flex justify-center bg-white">
                    {/* Illustration Placeholder */}
                    <div className="h-48 w-full bg-slate-50 flex items-center justify-center rounded-lg mb-6">
                        <span className="text-slate-400 italic">Teacher interacting with child & parent illustration</span>
                    </div>
                </div>

                <div className="bg-primary px-8 py-4">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white text-center tracking-tight">
                        Preschool and Daycare Operations Policy
                    </h1>
                </div>

                <div className="p-8 md:p-12 space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-primary mt-1">assignment_ind</span>
                            <div>
                                <h2 className="text-xl font-bold font-display text-gray-900">Attendance Policy</h2>
                                <p className="mt-2 text-gray-600 leading-relaxed">
                                    Children must be signed in and out before they can enter or leave the facility. Only approved parents or guardians can sign the children in or out. There is no refund for late arrival, early pickup or absence.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-primary mt-1">verified_user</span>
                            <div>
                                <h2 className="text-xl font-bold font-display text-gray-900">Discipline Policy</h2>
                                <p className="mt-2 text-gray-600 leading-relaxed">
                                    <span className="font-semibold text-gray-800">TIDDLEE</span> enforces a positive reinforcement disciplinary policy which may consist of a time out or redirection. We want to ensure the safety of all our children. You will receive information regarding your Child. We encourage parent/guardian - caregiver communication and we believe that communication is the key to be sure your child is properly taken care off. A PTM day shall be fixed quarterly for discussion and feedback purpose.
                                </p>
                                <p className="mt-3 text-gray-600 italic">
                                    As a special case it can be scheduled on certain days with prior appointment.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-primary mt-1">payments</span>
                            <div>
                                <h2 className="text-xl font-bold font-display text-gray-900">Payment Policy</h2>
                                <p className="mt-2 text-gray-600 leading-relaxed">
                                    All payments are due by the fifth of each month. Any Payments after the fifth will be assessed a late payment fee of Rs.100 per day. Any cheque bounce will attract an extra charge.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-primary mt-1">contact_page</span>
                            <div>
                                <h2 className="text-xl font-bold font-display text-gray-900">Contact Information Policy</h2>
                                <p className="mt-2 text-gray-600 leading-relaxed">
                                    Parents and guardians are responsible for keeping all their contact information updated. This includes phone numbers, address, email addresses, etc.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-primary mt-1">cancel_presentation</span>
                            <div>
                                <h2 className="text-xl font-bold font-display text-gray-900">Termination Policy</h2>
                                <div className="mt-2 text-gray-600 space-y-3 leading-relaxed">
                                    <p>
                                        <span className="font-semibold text-gray-800">TIDDLEE</span> reserves the right to deny service or terminate care for your child without notice for any reasons including, but not limited to, non-payment, excessive late payment, child unruliness, or any unforeseen problems.
                                    </p>
                                    <p>
                                        Parents or guardians may withdraw their Child for any reason with 2 weeks written notice. All payments due shall be paid within next 2 weeks. Failure to provide the facility with 2 weeks notice shall require you to pay your regular rate to the termination date as well as 2 additional weeks at your regular rate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-primary mt-1">event_busy</span>
                            <div>
                                <h2 className="text-xl font-bold font-display text-gray-900">Holidays</h2>
                                <p className="mt-2 text-gray-600 leading-relaxed">
                                    <span className="font-bold text-gray-900">TIDDLEE will remain closed on the days shared in the holiday list (Separate for preschool &amp; Daycare)</span>
                                </p>
                                <p className="mt-2 text-gray-600">
                                    Services for children are closed on the 4th Saturday of every month
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col md:flex-row gap-8 pt-8 border-t border-gray-100">
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



                <footer className="py-6 bg-white px-8 flex justify-between items-center border-t border-gray-200">
                    <Link href="/biting-policy" className="px-6 py-2 border border-gray-300 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition-colors">
                        Back
                    </Link>
                    <span className="text-gray-400 text-sm hidden md:block">© {new Date().getFullYear()} Preschool & Daycare Policies</span>
                    <Link href="/common-policies" className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Save &amp; Continue
                    </Link>
                </footer>
            </div>
        </div>
    );
}
