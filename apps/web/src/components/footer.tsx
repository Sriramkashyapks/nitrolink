'use client';

import { Zap, Github, Twitter, ExternalLink } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-zinc-900 bg-zinc-950 py-8 sm:py-12 mt-12 sm:mt-20">
            <div className="container mx-auto px-3 sm:px-4 md:px-6">

                <div className="pt-6 sm:pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4">
                    <p className="text-zinc-600 text-[10px] sm:text-xs text-center md:text-center">
                        © 2026 NitroLink Protocol. All rights reserved. Built for HackMoney.
                    </p>
                </div>
            </div>
        </footer>
    );
}
