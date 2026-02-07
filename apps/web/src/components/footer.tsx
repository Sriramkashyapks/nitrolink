'use client';

import { Zap, Github, Twitter, ExternalLink } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-zinc-900 bg-zinc-950 py-12 mt-20">
            <div className="container mx-auto px-4 md:px-6">

                <div className="pt-8 border-t border-zinc-900 flex flex-col md:row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-xs text-center md:text-left">
                        © 2026 NitroLink Protocol. All rights reserved. Built for HackMoney.
                    </p>
                </div>
            </div>
        </footer>
    );
}
