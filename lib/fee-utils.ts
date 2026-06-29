export function matchTemplate(templates: any[], programName: string): any | null {
    if (!programName) return null;
    const name = programName.toLowerCase().trim();
    for (const t of templates) {
        try {
            const keywords: string[] = JSON.parse(t.match_keywords || '[]');
            if (keywords.some(k => name.includes(k.toLowerCase().trim()) || k.toLowerCase().trim().includes(name))) return t;
        } catch {}
    }
    return null;
}
