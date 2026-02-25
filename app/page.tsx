'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdmissionEntry() {
    const router = useRouter();
    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

    const handleProgramSelection = (program: 'both' | 'preschool' | 'daycare') => {
        setSelectedProgram(program);
        // Store the selection in localStorage for later use
        localStorage.setItem('selectedProgramType', program);
        // Navigate to the main admission form
        router.push('/admission-form');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* Decorative Doodles Wrapper */}
            <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(55, 178, 74, 0.05) 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Floating Icons */}
            <div className="fixed top-20 left-10 text-primary opacity-30">
                <span className="material-icons text-6xl">wb_sunny</span>
            </div>
            <div className="fixed bottom-20 right-10 text-primary opacity-30">
                <span className="material-icons text-6xl">cloud</span>
            </div>
            <div className="fixed top-1/2 left-5 text-primary opacity-20">
                <span className="material-icons text-4xl">star</span>
            </div>

            {/* Main Content Container */}
            <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-start min-h-screen pt-20 md:pt-32">
                {/* Top Character Brand Section */}
                <div className="flex items-center justify-center gap-6 mb-12">
                    <div className="relative">
                        <div className="absolute -top-4 -left-4 text-yellow-400">
                            <span className="material-icons text-2xl">auto_awesome</span>
                        </div>
                        <img
                            alt="Tiddlee Character 1"
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKKQ_-RLNKYFvZdZjz4rTRKlJPdN_S64DrXqUH-1kemjP4ARS39j43awrHHQ_OrVxZajbnq95klaOtC6cEBl1FwVg-lgZmeNeF6Poe6C1Y3IlHY-C_7AJh0YWKlghDI50zO_2xVSapM1b70KNsUOnXQux8IpW10YMqYzHgAhd22OsYai0ayrlfVGkBqYsUTBNSlX4xwaBqylip1vYdjwGivFHoX5JkPFCXFxt2GMYfQV2CzwszN8RgYUJkeoQwEqUgFiG9f4RULzY"
                        />
                    </div>
                    <div className="relative">
                        <img
                            alt="Tiddlee Character 2"
                            className="w-32 h-32 rounded-full border-4 border-primary shadow-xl object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrJVJkI2y1HmM_pfqWlUS3bCWyntT-3WZBoqgwMcSZdEd5rE1H8_LIj2lJwh3VOeXjTmlz9m5EVguaOH1x_JM2tbdQ2vRkJW5bGtGtVJgXDxbPPjuSPLWs9QfeUwYdLYPnWYI2bFAP1Dygh6sBtoUQSikYSmwUVIHGS4cwTYlylu9ZYcaXFn7akCwn52PNpONHlDGpXxroOgi-6Ta8_t8Coknsfed0zMlGdIYACyHL9L7J1oTVVNFaLu34eS6KAKRMAuaC35pleUI"
                        />
                        <div className="absolute -bottom-2 -right-2 text-yellow-400">
                            <span className="material-icons text-3xl">star</span>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -top-4 -right-4 text-yellow-400">
                            <span className="material-icons text-2xl">auto_awesome</span>
                        </div>
                        <img
                            alt="Tiddlee Character 3"
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5FQG61Un2r7ffDzxXi0Al7CTc5QdftSVD9Zfc918dUZxDveNBd16FoQ_N1fzre_J2xIVgIEHLlVu6buq6tN9jPsWKOwmVNHztUZ3rsc3ytWTQ_0pPKAuvKq_44tzaTl_XL9D1-ARL22EjU3Ug_SHGJ0i40sKjrreMlpKFn3BvE6xKLT1D6S4-0oVymmi9xh-uFN921RnsMEzWqtZKwZJNw45d7MgaiXZfOjtM_DJ8TVKAUy7b-L3C2HzgP1nqYxifBkwidOaSE0M"
                        />
                    </div>
                </div>

                {/* Headline Section */}
                <div className="text-center mb-16 max-w-4xl">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight flex flex-col md:flex-row items-center md:items-end justify-center gap-x-4 gap-y-2 flex-wrap">
                        <span className="md:mb-2">Welcome to</span>
                        <img
                            src="/logo.svg"
                            alt="TIDDLEE"
                            className="h-20 md:h-28 object-contain md:mb-2"
                        />
                        <span className="md:mb-2">Admission Portal</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Begin your child's journey of discovery and growth. Please select a program to start the admission process.
                    </p>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                    {/* Card 1: Preschool & Daycare */}
                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center group shadow-sm hover:shadow-xl hover:-translate-y-2">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <div className="flex gap-1 items-center">
                                <span className="material-icons text-primary text-4xl">auto_stories</span>
                                <span className="material-icons text-primary/60 text-2xl">dark_mode</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 dark:text-white">Preschool & Daycare</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 flex-grow">
                            The complete experience. Full-day engagement, early learning, and nurturing care for your little one.
                        </p>
                        <button
                            onClick={() => handleProgramSelection('both')}
                            className="w-full bg-primary hover:bg-opacity-90 text-slate-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <span>Start Admission</span>
                            <span className="material-icons text-xl">arrow_forward</span>
                        </button>
                    </div>

                    {/* Card 2: Pre-school */}
                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center group shadow-sm hover:shadow-xl hover:-translate-y-2">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <span className="material-icons text-primary text-4xl">school</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 dark:text-white">Pre-school</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 flex-grow">
                            Focused early education focusing on social development, literacy, and foundational learning skills.
                        </p>
                        <button
                            onClick={() => handleProgramSelection('preschool')}
                            className="w-full bg-primary hover:bg-opacity-90 text-slate-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <span>Start Admission</span>
                            <span className="material-icons text-xl">arrow_forward</span>
                        </button>
                    </div>

                    {/* Card 3: Daycare */}
                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center group shadow-sm hover:shadow-xl hover:-translate-y-2">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <span className="material-icons text-primary text-4xl">extension</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 dark:text-white">Daycare</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 flex-grow">
                            A safe, nurturing, and home-like environment for children while parents are at work.
                        </p>
                        <button
                            onClick={() => handleProgramSelection('daycare')}
                            className="w-full bg-primary hover:bg-opacity-90 text-slate-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <span>Start Admission</span>
                            <span className="material-icons text-xl">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-20 flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500 text-sm">
                    <div className="flex items-center gap-6">
                        <a className="hover:text-primary transition-colors cursor-pointer" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors cursor-pointer" href="#">Terms of Service</a>
                        <a className="hover:text-primary transition-colors cursor-pointer" href="#">Contact Support</a>
                    </div>
                    <p>© {new Date().getFullYear()} TIDDLEE Learning Centers. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}
