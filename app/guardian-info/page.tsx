'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GuardianInfo() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Application Submitted! (This is a demo)");
        router.push('/');
    };

    return (
        <main className="font-body text-slate-800 dark:text-slate-200 transition-colors duration-200 bg-slate-50 dark:bg-zinc-950 min-h-screen">
            <div className="max-w-4xl mx-auto my-8 bg-background-light dark:bg-zinc-900 shadow-xl overflow-hidden min-h-screen flex flex-col">
                <div className="p-8 pb-0 text-center">
                    <div className="flex justify-center gap-8 mb-6">
                        <img alt="Child eating illustration" className="h-24 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlAJZ78IYskKQd1GlSG_3WvGQSTVON5RdjeiMQwn7i2rCZxR7JdKiVLLMvTDa3KYj1PcA6xEJJ-sJxfKMOYFb26K9DoP0ddUUMXyV9ckUNDDqULAefSRgD2D6YpDzpusx6OzDDyI73s33_AiCBVVQ3s8Hx3MobFSo3s_dcwN4G8ReHPhe4Zf0QDOEkJE-lQBRqU2NjHaATaSNSXzlVrMlDlj5YYQX30KV5k-1r7fhrz3vVrrK2pwQ9j5gVDuixlYtdM3JJpcUSmD4" />
                        <img alt="Child playing with blocks" className="h-24 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLOYnvYkgAWy_0OXm43uC-ULQYMSSSbCd8sszuLpvF9Psug7dAxKw-Qz9rKFHDw-iK0NgvhS2dKB8ks8KNc-dP6FFjiCPMoT6DlUUdVerKqb8s9gKn09o4GyzcQYc5_g5tFrlcwggPxiPIUoHeQZ5HjBiHIDr0uK0SAfDEdNyTqGsq3AiYMInA4wes_80AogLCrSIOPx9gH-jGT4CyMqVwvipvB6xRvt8ikglEDB2ZR8EUqIVU7MKrAs-5hh7kIdkIScSmuxyjgIU" />
                        <img alt="Child jumping" className="h-24 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFTPFzN6Hmia1Md8Twcv1UfItviB8zWeMgVsp9u4F0XT6dNuAV11ykgB9fnNY-K-aw8AexNeSr89E1LUnmoXiMdlGp6uPn3gsCxyQF1c8qgP1zjnkinp7grFYEOwTx-A745NhBKuZEm_EGpMeGtrgBA5H9xU7DkSIytzZn8BMvqSZaSpNcI8T2L73I5PqE6__8zS0GyeZHAWQ_EM9os6OhYpyiL3aGfgt_tMwMAqkScvKFzaaTu_1WpE2Shga5SRXOJQ9-25QCJkc" />
                    </div>
                    <div className="bg-primary text-white py-3 px-6 rounded-sm mb-8">
                        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">Application (For TIDDLEE Parent)</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                    <div className="px-12 py-6 flex-grow">
                        <h2 className="font-display text-xl font-bold border-b-2 border-primary pb-2 mb-8 text-slate-900 dark:text-white">Father’s or Guardian 2 Information</h2>
                        <div className="space-y-8">
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Name :</label>
                                <input className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white" type="text" />
                            </div>
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Employed by :</label>
                                <input className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white" type="text" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-end">
                                    <label className="font-semibold whitespace-nowrap">Address of Employment :</label>
                                    <input className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white" type="text" />
                                </div>
                                <div className="flex items-end pl-0 md:pl-4">
                                    <input className="form-input-clean focus:ring-0 focus:border-primary dark:text-white" placeholder="(Street, City, State, ZIP)" type="text" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-end">
                                    <label className="font-semibold whitespace-nowrap">Work Phone :</label>
                                    <input className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white" type="tel" />
                                </div>
                                <div className="flex items-end">
                                    <label className="font-semibold whitespace-nowrap">Cell Phone :</label>
                                    <input className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white" type="tel" />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Email :</label>
                                <input className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white" type="email" />
                            </div>
                            <div className="flex items-end">
                                <label className="font-semibold whitespace-nowrap">Relationship to child :</label>
                                <input className="form-input-clean ml-2 focus:ring-0 focus:border-primary dark:text-white" type="text" />
                            </div>
                        </div>

                        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="flex items-end">
                                <label className="font-semibold text-primary whitespace-nowrap">Unique ID :</label>
                                <input className="form-input-clean ml-2 border-slate-300 dark:text-white" type="text" />
                            </div>
                            <div className="flex items-end">
                                <label className="font-semibold text-primary whitespace-nowrap">Date of Admission :</label>
                                <input className="form-input-clean ml-2 border-slate-300 dark:text-white" type="date" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto bg-[#fffde0] dark:bg-zinc-800 p-12 border-t-4 border-primary">
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-12 italic">
                            By signing below the parent or guardian fully understands and agrees to the entire content of the facility’s policies and Terms & Conditions. The Parent / Guardian ensures that the data provided by them is accurate.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-4">
                                <div className="border-b border-dotted border-slate-400 pb-2">
                                    <div className="h-12 flex items-end px-2">
                                        <span className="text-slate-400 text-xs italic">Digital Signature 1</span>
                                    </div>
                                </div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400">Mother's/Guardian 1 Signature</label>
                                <div className="flex items-end mt-4">
                                    <label className="text-sm font-medium mr-2">Date:</label>
                                    <input className="form-input-clean text-sm py-0 dark:text-white" type="text" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="border-b border-dotted border-slate-400 pb-2">
                                    <div className="h-12 flex items-end px-2">
                                        <span className="text-slate-400 text-xs italic">Digital Signature 2</span>
                                    </div>
                                </div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400">Father's/Guardian 2 Signature</label>
                                <div className="flex items-end mt-4">
                                    <label className="text-sm font-medium mr-2">Date:</label>
                                    <input className="form-input-clean text-sm py-0 dark:text-white" type="text" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end gap-4 print:hidden">
                            <Link href="/parent-info" className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                                Back
                            </Link>
                            <button type="button" className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all">
                                Save Draft
                            </button>
                            <button type="submit" className="px-10 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Submit Application
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
