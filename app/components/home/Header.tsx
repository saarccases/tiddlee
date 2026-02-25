import Link from 'next/link';

export function HomeHeader() {
    return (
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
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Preschool with Daycare Program</p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                <svg className="relative block w-full h-8" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path className="fill-background-light dark:fill-background-dark" d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C41.39,36.19,161,64.84,321.39,56.44Z"></path>
                </svg>
            </div>
        </header>
    );
}

export function ResumePrompt({ childName, onResume, onStartNew }: { childName: string, onResume: () => void, onStartNew: () => void }) {
    return (
        <div className="bg-lime-50 dark:bg-lime-900/40 border-2 border-primary/30 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="material-icons text-primary text-3xl">history</span>
                </div>
                <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Pending form detected</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        You have a partially completed form for <span className="text-primary font-bold">{childName || 'a child'}</span>.
                    </p>
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button onClick={onStartNew} className="flex-1 md:flex-none px-6 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm">
                    Start Fresh
                </button>
                <button onClick={onResume} className="flex-1 md:flex-none px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-lime-600 transition-all text-sm flex items-center justify-center gap-2">
                    Continue Previous Form
                    <span className="material-icons text-sm">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
