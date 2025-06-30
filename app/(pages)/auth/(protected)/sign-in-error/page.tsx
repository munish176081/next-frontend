"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Routes } from "@/_config/routes";
import AuthSidePanel from "@/_components/auth/AuthSidePanel";
import { LoadingButton } from "@/_components/ui/loading-button";
import React, { Suspense } from "react";

export const dynamic = 'force-dynamic';

function SignInErrorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reason = searchParams.get("reason") || "Unknown error occurred";

    return (
        <section className="flex p-4 md:p-10 h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row h-full max-h-[900px]">
                {/* Left Panel - Error Content */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 self-start bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 text-sm font-medium transition-colors mb-8"
                    >
                        <span className="flex size-6 bg-black rounded-full items-center justify-center">
                            <img 
                                src="/images/vectors/arrowLeftWhite.svg" 
                                alt="Back arrow"
                                className="w-3 h-3"
                            />
                        </span>
                        Go Back
                    </button>

                    <div className="flex flex-col flex-grow justify-center">
                        <div className="max-w-md w-full mx-auto">
                            <h1 className="text-3xl font-bold text-red-600 mb-2">Sign In Failed</h1>
                            <div className="mb-8">
                                <p className="text-gray-700 mb-1">We couldn't sign you in because:</p>
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                    <p className="text-red-700 font-medium">
                                        {decodeURIComponent(reason.replace(/\+/g, " ")).replace(/"/g, "")}
                                    </p>
                                </div>
                            </div>

                            <LoadingButton
                                className="w-full h-16 bg-black text-white text-lg rounded-full mt-7 max-md:h-12 max-md:text-base"
                                onClick={() => router.push(Routes.auth.signIn)}
                            >
                                Try Again
                            </LoadingButton>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Auth Side Panel (hidden on mobile) */}
                    <AuthSidePanel
                        title="Sign up"
                        subtitle="in seconds"
                        smallText={
                            <span>
                                <strong className="font-semibold">Start</strong> your journey{" "}
                                <strong className="font-semibold">today!</strong>
                            </span>
                        }
                        highlight="Sign up"
                    />
            </div>
        </section>
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <SignInErrorPage />
        </Suspense>
    );
}