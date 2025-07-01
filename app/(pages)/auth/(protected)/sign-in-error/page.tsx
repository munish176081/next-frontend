"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Routes } from "@/_config/routes";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { LoadingButton } from "@/_components/ui/loading-button";
import React, { Suspense } from "react";
import GoBackButton from "@/_components/common/go-back-button";

export const dynamic = 'force-dynamic';

function SignInErrorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reason = searchParams.get("reason") || "An unknown error occurred during sign in";

    // Format the error message
    const formattedReason = decodeURIComponent(reason.replace(/\+/g, " ")).replace(/"/g, "");
    const isLongMessage = formattedReason.length > 120;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                {/* Left Panel - Illustration */}
                <div className="hidden md:block md:w-2/5 bg-gradient-to-b from-red-50 to-red-100 p-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                            <AlertCircle size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Authentication Error</h2>
                        <p className="text-gray-600">We encountered an issue while signing you in</p>
                    </div>
                </div>

                {/* Right Panel - Error Content */}
                <div className="w-full md:w-3/5 p-8 md:p-10">
                    <div className="mb-6">
                        <GoBackButton />
                    </div>

                    <div className="flex flex-col h-full justify-center">
                        <div className="max-w-md mx-auto">
                            <div className="mb-2 flex items-center gap-2 md:hidden">
                                <AlertCircle className="text-red-500" size={20} />
                                <span className="text-sm font-medium text-red-500">Sign In Error</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Couldn't Sign You In</h1>
                            
                            <div className={`mb-8 ${isLongMessage ? 'space-y-3' : 'space-y-4'}`}>
                                <p className="text-gray-600">The following error occurred:</p>
                                <div className={`bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 ${isLongMessage ? 'text-sm' : 'text-base'}`}>
                                    <p className="text-red-700 font-medium">
                                        {formattedReason}
                                    </p>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Please check your details and try again. If the problem persists, contact support.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <LoadingButton
                                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                    onClick={() => router.push(Routes.auth.signIn)}
                                >
                                    Return to Sign In
                                </LoadingButton>

                                <button 
                                    onClick={() => router.push(Routes.public.home)}
                                    className="w-full h-12 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <SignInErrorPage />
        </Suspense>
    );
}