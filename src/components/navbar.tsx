"use client";

import * as React from "react";
import { Globe, LogOut, User, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dictionary, Language } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
    lang: Language;
    dict: Dictionary;
    onToggleLang?: () => void;
}

export function Navbar({ lang, dict, onToggleLang }: NavbarProps) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md"
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-3">
                    <Logo size={32} />
                    <span className="font-bold text-lg tracking-tight text-white">{dict.nav.brand}</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Link href="/blog">
                        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                            Blog
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleLang}
                        className="text-muted-foreground hover:text-white"
                    >
                        <Globe className="mr-2 h-4 w-4" />
                        {lang === "en" ? "ES" : "EN"}
                    </Button>

                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <Link href="/pricing">
                                        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                                            Pricing
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard">
                                        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                                            <LayoutDashboard className="mr-1.5 h-4 w-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                                        {profile?.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt=""
                                                className="h-7 w-7 rounded-full ring-1 ring-white/20"
                                            />
                                        ) : (
                                            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                                {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="text-neutral-400 hover:text-white h-8 w-8 p-0"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/pricing">
                                        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                                            Pricing
                                        </Button>
                                    </Link>
                                    <Link href="/auth/login">
                                        <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href="/auth/signup">
                                        <Button
                                            size="sm"
                                            className="bg-[#0079da] hover:bg-[#0069c0] text-white font-medium rounded-lg"
                                        >
                                            Sign up free
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
