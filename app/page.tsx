'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <main className="font-display">
            <header className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4 mb-6 md:mb-0">
                        <div className="bg-white p-2 rounded-xl shadow-md">
                            <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-lg text-white">
                                <span className="material-icons text-4xl">flutter_dash</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">TIDDLEE</h1>
                            <p className="text-sm font-medium text-primary mt-1">Technology unplugged, Childhood plugged-in</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admission Form & Policy</h2>
                        <p className="text-slate-500 dark:text-slate-400">Preschool with Daycare Program</p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                    <svg className="relative block w-full h-8" data-name="Layer 1" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                        <path className="fill-background-light dark:fill-background-dark" d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C41.39,36.19,161,64.84,321.39,56.44Z"></path>
                    </svg>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 mt-8">
                <div className="flex justify-center space-x-8 mb-8">
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                            <img alt="Cute boy cartoon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKDc-46ZYKifEmrTfmzILDma3UgR82cCouJChL6IAi2xrH1UD-yQHsSDMosTaXjxUHoAYbvT1UBtOz_upbDEHA-vpm_l4FLWDIn-2VlAd89x3kDDgeIwyLQEQLzxm4Q-ruulwjmxNybyMguXED5CrHTcU6Jy-CgFr65LY2jvefD2JDTeOVytA1_OSiwrWIJQj3WTZLGtrl8TYR3HnA7WWB8tSU9KsakKtOPx0xtjYK1L9j9qLpxhQ-LmTYscJ4dhE_yW0Hjp83XlA" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                            <img alt="Cute girl cartoon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqh3CI7aiEhZTt9XWKsSwxVj8KqofC_RgJUzXxkgc4s-BDb70mPxxhYjkGbLo-KLSeqx6SMmGjTRCWdry-VXqQs7fFww9qbFi7ssh4ilPfug-JM0J64-FCSgGc4QWs5WIQmEwITBW_1j46obulzaT2hLOuTFC14xLBYQFNQSRCm1ZSlT9yk2ERyc12EkO63lDSQSrU1-zveZSkTU4Z1vqQVfSCdOwuNvhyc-DOmkz-R8srBQSOiYJDZcClV-4tbavoqTBFbZQNM3k" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                            <img alt="Cute kid cartoon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwdFFeCqYKpUsVXET_Y9Z5JryunkLmAA0g0osMl11PEGUAeVLvtwNH8E-2fN-nRQYY8ootdepMFSYdQbInam42W3dgjHHen16zJtz97Gb1uqUkrCod53hfAdPXC7N10XjwxNdohkizL0jVVVcsVgGha0WpsUH1GU2g4yEfAPHujM9RXdyFVw_yC3EKzmp6J3Zb9wDtyB_RKmoV-UVIpR6054VgNi5IvRQi56ZvA4lzNDEvaBr1lb5-cZ2IoEfNv6MYoDklLGqYrgU" />
                        </div>
                    </div>
                </div>

                <form className="space-y-8">
                    <div className="bg-primary px-6 py-4 rounded-xl shadow-md text-center">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Application (For TIDDLEE)</h3>
                    </div>
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Name of the Child</label>
                                        <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all" placeholder="Full name" type="text" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Nickname</label>
                                        <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all" placeholder="Preferred name" type="text" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Birth Date</label>
                                        <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all" type="date" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Age</label>
                                        <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all" placeholder="Years/Months" type="text" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                                        <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all">
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Residence Address</label>
                                    <textarea className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all" placeholder="Complete home address" rows={3}></textarea>
                                </div>
                            </div>
                            <div className="w-full lg:w-48 flex flex-col items-center">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Child's Photo</label>
                                <div className="w-40 h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-pointer hover:border-primary transition-all">
                                    <span className="material-icons text-4xl mb-2">add_a_photo</span>
                                    <span className="text-xs font-medium px-2 text-center">TIDDLEE Photo</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                            <span className="material-icons text-red-500 mr-2">contact_emergency</span>
                            Emergency Contact Information
                        </h4>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg" placeholder="Contact 1 Name" type="text" />
                                <input className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg" placeholder="Phone Number" type="tel" />
                                <input className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg" placeholder="Relation (e.g. Aunt)" type="text" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg" placeholder="Contact 2 Name" type="text" />
                                <input className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg" placeholder="Phone Number" type="tel" />
                                <input className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg" placeholder="Relation (e.g. Neighbor)" type="text" />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                            <span className="material-icons text-primary mr-2">school</span>
                            Program Selection
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input className="w-5 h-5 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary" type="checkbox" />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Toddlers</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input className="w-5 h-5 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary" type="checkbox" />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Kamblee</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input className="w-5 h-5 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary" type="checkbox" />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Pupalee</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input className="w-5 h-5 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary" type="checkbox" />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Tiddlee</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input className="w-5 h-5 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary" type="checkbox" />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Daycare</span>
                            </label>
                        </div>
                        <div className="mt-8 space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Languages spoken and understood</label>
                            <input className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg" placeholder="e.g. English, Spanish" type="text" />
                        </div>
                    </section>

                    <section className="bg-accent-yellow/30 dark:bg-slate-900/50 p-8 rounded-2xl border-2 border-primary/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-primary">Unique ID (Official Use)</label>
                                <div className="dashed-underline py-2 h-10"></div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-primary">Date of Admission</label>
                                <div className="dashed-underline py-2 h-10"></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed italic">
                            By signing below the parent or guardian fully understands and agrees to the entire content of the facility's policies and Terms & Conditions. The Parent / Guardian ensures that the data provided by them is accurate.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="dashed-underline pb-2 h-12 flex items-end">
                                    <span className="text-slate-400 text-xs italic">Digital Signature Area</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span>Mother's/Guardian 1 Signature</span>
                                    <span className="text-slate-400">Date: ____________</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="dashed-underline pb-2 h-12 flex items-end">
                                    <span className="text-slate-400 text-xs italic">Digital Signature Area</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span>Father's/Guardian 2 Signature</span>
                                    <span className="text-slate-400">Date: ____________</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
                        <button className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" type="button">
                            <span className="material-icons">print</span>
                            <span className="font-semibold">Print Form for Manual Fill</span>
                        </button>
                        <div className="flex space-x-4">
                            <button className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" type="reset">Clear Form</button>
                            <Link href="/parent-info" className="bg-primary hover:bg-lime-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transform active:scale-95 transition-all text-center">
                                Next Step
                            </Link>
                        </div>
                    </div>
                </form>
            </div>

            <footer className="max-w-5xl mx-auto px-4 mt-16 text-center text-slate-400 text-sm pb-12">
                <p>© 2024 TIDDLEE Learning Center. All rights reserved.</p>
                <p className="mt-1">Nurturing curiosity, one step at a time.</p>
            </footer>

            <button
                className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 z-50 transition-colors"
                onClick={toggleDarkMode}
            >
                <span className="material-icons dark:hidden text-yellow-500">dark_mode</span>
                <span className="material-icons hidden dark:block text-yellow-300">light_mode</span>
            </button>
        </main>
    );
}
