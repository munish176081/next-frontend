'use client';
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const ProfilePage = () => {
  console.log("I am at profile page")
  return <div>ProfilePage</div>;
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfilePage />
    </Suspense>
  );
}
