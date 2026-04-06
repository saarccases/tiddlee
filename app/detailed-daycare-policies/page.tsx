'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DetailedDaycarePolicies() {
    const [programType, setProgramType] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        unique_id: '',
        admission_date: ''
    });

    useEffect(() => {
        setProgramType(localStorage.getItem('selectedProgramType'));
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
                    console.error('[DetailedDaycarePolicies] Fetch error:', error);
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
                        <span className="text-primary font-bold">Daycare Policies</span>
                    </h1>
                    <div className="h-1.5 w-full bg-primary mt-4 rounded-full"></div>
                </div>

                <div className="p-8 space-y-10 text-slate-700">
                    <p className="text-lg font-medium text-slate-600">
                        Below is a list of our policies. These policies are put in effect in order to make the facility run smoothly as well as to ensure the safety of your children.
                    </p>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">schedule</span>
                        </div>
                        <div>
                            <p><strong className="text-slate-900">Hours of Operation:</strong> Our hours of operation are from <strong>8:00 am to 8:00 pm</strong>, Monday to Saturday. Children must not arrive before opening time.</p>
                            <p className="text-primary font-semibold mt-2">Services for children are closed on the 4th Saturday of every month.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">directions_walk</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Arrival:</strong> Prompt arrival at the given/selected time is encouraged.</p>
                            <p><strong className="text-slate-900">Early drop/Late Pick up Policy:</strong> The Child needs to be picked up at the allotted time based on the time selected. <span className="text-red-500 font-bold">Rs. 50 will be charged for every 15 minute delay in pick up or 15 min early drop.</span></p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">child_care</span>
                        </div>
                        <div className="space-y-3">
                            <p><strong className="text-slate-900">Settling Time:</strong> It is very important that children settle down in a new environment with minimum discomfort. We settle children into the daily routine in small steps to make them comfortable in a new environment reduce stranger anxiety as well as reduce settling issues.</p>
                            <div className="bg-primary/5 border-l-4 border-primary p-4 my-4">
                                <p className="font-bold text-slate-800 mb-2 underline">First Three Days</p>
                                <p>Children will be kept at the center for Minimum one hour and maximum two hours. Parents should share contact numbers and in case the child is distressed, we will call the parents to pick up the child. This helps reassure child that parents are near and are away only for some time.</p>
                            </div>
                            <p><strong className="text-slate-900">Fourth &amp; Fifth Day:</strong> The time will be increased to three/four hours depending on how the child has settled on the first three days. You can speak to the Center Manager regarding the settling time of your child, depending on your child&apos;s comfort /settling in at the Center.</p>
                            <p>Please be assured that our aim is to ensure YOUR CHILD&apos;S COMFORT AND YOUR PEACE OF MIND. We have seen majority of all children settle down within two/three weeks.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">payments</span>
                        </div>
                        <div className="space-y-2">
                            <p><strong className="text-slate-900">Daycare Payment Policy:</strong></p>
                            <p><strong>Daycare services can be opted only as a Monthly Plan.</strong></p>
                            <p>Incase of daycare services less than 2 weeks &ndash; fees will be charged as emergency daycare services.*</p>
                            <p>In case of extra hours, the fee will be charged at Rs. 50 per 15 minutes. Up to 3 hours per month are exempted from the extra hours consumed.</p>
                            <p>No adjustments of hours will be made mid-month; the selected package will continue for the full month and can be changed the following month.</p>
                            <p className="italic text-sm text-slate-500 font-medium">*Kindly contact the front office to know the charges.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">local_taxi</span>
                        </div>
                        <div>
                            <p><strong className="text-slate-900">Pickup &amp; Drop:</strong> Pick-up and drop-off for children coming from other schools will be done only at designated spot. No pick-up/drop across the road will be allowed at any time.</p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <span className="material-icons text-4xl text-slate-400">restaurant</span>
                        </div>
                        <div>
                            <p><strong className="text-slate-900">Meal Time:</strong> Meals will be served during designated daycare meal timings. Exceptions will be made only for children coming directly from other schools with prior intimation from parents.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 flex justify-between gap-4 no-print bg-white border-t border-gray-100">
                    <Link href={programType === 'daycare' ? '/document-upload' : '/detailed-preschool-policies'} className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2">
                        Back
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/common-policies" className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
                            Save &amp; Continue <span className="material-icons text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
