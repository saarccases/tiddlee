'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    savedSignatureUrl?: string;
    label?: string;
}

export default function SignaturePad({ onSave, savedSignatureUrl, label }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#0f172a'; // slate-900
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }

        // Handle window resize
        const handleResize = () => {
            if (canvas && containerRef.current && !savedSignatureUrl) {
                const containerWidth = containerRef.current.clientWidth;
                // Don't clear if width hasn't changed much to avoid clearing on mobile scroll
                if (Math.abs(canvas.width - containerWidth) > 10) {
                    // Note: resizing canvas clears it. We might want to save and restore, 
                    // but for signatures, it's usually okay to just let them redraw or use a fixed size.
                    // canvas.width = containerWidth;
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [savedSignatureUrl]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { x, y } = getCoordinates(e);
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const { x, y } = getCoordinates(e);
                ctx.lineTo(x, y);
                ctx.stroke();
                setHasSignature(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        // Handle touch events
        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        }

        // Handle mouse events
        return {
            x: (e as React.MouseEvent).clientX - rect.left,
            y: (e as React.MouseEvent).clientY - rect.top,
        };
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setHasSignature(false);
            }
        }
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (canvas && hasSignature) {
            setIsSaving(true);
            try {
                const dataUrl = canvas.toDataURL('image/png');
                await onSave(dataUrl);
            } catch (error) {
                console.error('Error saving signature:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleClearSaved = () => {
        onSave('');
    };

    return (
        <div className="flex flex-col space-y-2 w-full" ref={containerRef}>
            <div className="relative border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 rounded-t-lg group overflow-hidden h-32">
                {savedSignatureUrl ? (
                    <div className="h-full w-full flex items-center justify-center bg-white dark:bg-slate-800 p-4 relative">
                        <img
                            src={savedSignatureUrl}
                            alt="Signature"
                            className="max-h-full max-w-full object-contain filter dark:invert dark:brightness-200"
                        />
                        <button
                            type="button"
                            onClick={handleClearSaved}
                            className="absolute top-2 right-2 p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 rounded-full transition-all shadow-sm flex items-center justify-center"
                            title="Clear Signature"
                        >
                            <span className="material-icons text-base">close</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={128}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-full cursor-crosshair touch-none"
                        />
                        <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${hasSignature ? 'opacity-0' : 'opacity-60'}`}>
                            <span className="material-icons text-slate-300 text-3xl mb-1">gesture</span>
                            <span className="italic text-slate-400 text-xs">Draw your signature here</span>
                        </div>
                        {isSaving && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center z-10 transition-opacity">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {!savedSignatureUrl && (
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</span>
                    <div className="flex gap-4 text-[10px] uppercase font-bold tracking-tight">
                        <button
                            type="button"
                            onClick={clear}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                        >
                            <span className="material-icons text-[12px]">refresh</span> Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!hasSignature || isSaving}
                            className="text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                            <span className="material-icons text-[12px]">done</span> Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
