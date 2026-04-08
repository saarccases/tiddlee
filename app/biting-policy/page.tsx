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
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-display text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl overflow-hidden rounded-xl border border-slate-200">

                <div className="p-8 border-b border-primary">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-primary font-bold">Biting Policy</span>
                    </h1>
                    <div className="h-1.5 w-full bg-primary mt-4 rounded-full"></div>
                </div>


                <div className="p-8 space-y-10 text-slate-700">

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">psychology</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Biting Policy Tenets:</strong> Biting is unfortunately not unexpected behavior for toddlers. Some children and many toddlers communicate through this behavior. However, biting can be harmful to other children and to staff. This biting policy has been developed with both of these ideas in mind.</p>
                            <p>As a preschool and day care, we understand that biting, unfortunately, can become a part of our setting. Our goal is to help identify what is causing the biting and resolve these issues.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">schedule</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">For the child that bit:</strong> The child will be placed in time out for no longer than five minutes. The Parents are notified.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">visibility</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">When biting continues:</strong> The child will be shadowed to help prevent any biting incidents. The child will be observed by the classroom staff to determine what is causing.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">warning</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">When biting becomes excessive:</strong></p>
                            <div className="space-y-2 text-sm">
                                <p>If a child inflicts 3 bites in a one week period (5 weekdays) in which the skin of another child or staff member is broken or bruised or the bite leaves a significant mark, a conference will be held with the parents to discuss the child&apos;s behaviour and how the behaviour may be modified.</p>
                                <p>If the child again inflicts 3 bites in a one week period (5 weekdays) in which the skin of another child or staff member is broken or bruised or the bite leaves a significant mark, the child will be suspended for 2 days.</p>
                                <p>If a child, who has been through steps 1 and/or 2, goes 3 weeks (15 business days) without biting, we will go back to step 1 if the child bites again.</p>
                                <p>If a child bites twice in a 4 hour period, the child will be required to be picked up from day care for the remainder of the day.</p>
                                <p>We may have to look at strict action and even dismissal in case we are unable to control biting incidents and it persists. This step will only be taken after all remedial action has failed and after repeated incidents or parents non-support to help reduce biting as we have to think of safety of all other students.</p>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="p-4 bg-slate-100 flex justify-between items-center px-8 border-t border-slate-200 font-display">
                    <button
                        onClick={() => router.push('/common-policies')}
                        className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-full hover:bg-white transition-colors"
                    >
                        Back
                    </button>
                    <Link href="/operations-policy" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95">
                        Save &amp; Continue
                    </Link>
                </div>
            </div>
        </div>
    );
}
