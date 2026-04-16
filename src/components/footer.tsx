
"use client";

import Link from "next/link";
import { Dictionary } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { Github, Twitter, Linkedin } from "lucide-react";
import EcosystemFooter from "@/components/ecosystem/ecosystem-footer";
import BuiltByBanner from "@/components/ecosystem/built-by-banner";

interface FooterProps {
    dict: Dictionary;
}

export function Footer({ dict }: FooterProps) {
    return (
        <footer className="bg-neutral-950 border-t border-white/10">
            {/* Ecosystem marquee */}
            <EcosystemFooter />

            <div className="container mx-auto px-4 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <Logo size={32} />
                            <span className="font-bold text-xl text-white">{dict.footer.brand}</span>
                        </div>
                        <p className="text-neutral-400 max-w-sm mb-6">
                            {dict.footer.desc}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-neutral-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-neutral-400">
                            <li><a href="#" className="hover:text-white transition-colors">{dict.footer.links.terms}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{dict.footer.links.privacy}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{dict.footer.links.contact}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 text-center text-neutral-500 text-sm">
                    {dict.footer.copyright}
                </div>

                <BuiltByBanner />
            </div>
        </footer>
    );
}
