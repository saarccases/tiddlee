'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BitingPolicy() {
    const router = useRouter();
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

                    <div className="flex justify-center items-center gap-6 mb-6">
                        <img alt="Child care" className="w-24 h-24 rounded-full border-2 border-primary/20 object-cover" src="/images/home-1.png" />
                        <img alt="Children" className="w-24 h-24 rounded-full border-2 border-primary/20 object-cover" src="/images/home-2.png" />
                        <img alt="Child behavior" className="w-24 h-24 rounded-full border-2 border-primary/20 object-cover" src="/images/home-3.png" />
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
                            Biting is unfortunately not unexpected behavior for toddlers. Some children and many toddlers communicate through this behavior. However, biting can be harmful to other children and to staff. This biting policy has been developed with both of these ideas in mind and is a part of our care setting. Our goal is to help identify what is causing the biting and resolve these issues.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm">circle</span> For the child that bit
                        </h3>
                        <p className="text-slate-600 leading-relaxed pl-6 font-medium">
                            She will firmly tell the child &ldquo;NO! DO NOT BITE!&rdquo;
                        </p>
                        <p className="text-slate-600 leading-relaxed pl-6 font-medium mt-2">
                            The child will be placed in time out for no longer than five minutes. The Parents are notified.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm">circle</span> When biting continues
                        </h3>
                        <p className="text-slate-600 leading-relaxed pl-6 font-medium">
                            The child will be shadowed to help prevent any biting incidents. The child will be observed by the classroom staff to determine what is causing.
                        </p>
                    </section>

                    {/* When biting becomes excessive - detailed section */}
                    <div className="pt-8 border-t-4 border-primary space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Biting Policy</h2>

                        <section>
                            <h3 className="font-bold text-slate-800 mb-3">When biting becomes excessive:</h3>
                            <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                                <p>
                                    If a child inflicts 3 bites in a one week period (5 weekdays) in which the skin of another child or staff member is broken or bruised or the bite leaves a significant mark, a conference will be held with the parents to discuss the child&apos;s behaviour and how the behaviour may be modified.
                                </p>
                                <p>
                                    If the child again inflicts 3 bites in a one week period (5 weekdays) in which the skin of another child or staff member is broken or bruised or the bite leaves a significant mark, the child will be suspended for 2 days.
                                </p>
                                <p>
                                    If a child, who has been through steps 1 and/or 2, goes 3 weeks (15 business days) without biting, we will go back to step 1 if the child bites again.
                                </p>
                                <p>
                                    If a child bites twice in a 4 hour period, the child will be required to be picked up from day care for the remainder of the day.
                                </p>
                                <p>
                                    We may have to look at strict action and even dismissal in case we are unable to control biting incidents and it persists. This step will only be taken after all remedial action has failed and after repeated incidents or parents non-support to help reduce biting as we have to think of safety of all other students.
                                </p>
                            </div>
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



                <div className="p-4 bg-slate-100 flex justify-between items-center px-8 border-t border-slate-200 font-quicksand">
                    <button
                        onClick={() => {
                            const programType = localStorage.getItem('selectedProgramType');
                            if (programType === 'daycare') {
                                router.push('/daycare-policies');
                            } else {
                                router.push('/detailed-preschool-policies');
                            }
                        }}
                        className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-full hover:bg-white transition-colors"
                    >
                        Back
                    </button>
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
