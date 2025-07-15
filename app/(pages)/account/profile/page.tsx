"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard } from "@/_components/common/dashboard-widgets";

const Profile = () => {
  return (
    <DashboardLayout title="Profile" showTimeFilter={false}>
      <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
        <div className="flex flex-col w-full gap-4">
          <DashboardCard title="Personal Information" className="w-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <img src="/images/vectors/profile.jpg" alt="Profile" className="w-20 h-20 rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold">John Doe</h3>
                  <p className="text-sm text-gray-600">john@example.com</p>
                  <p className="text-sm text-gray-600">Member since January 2024</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input type="text" defaultValue="John" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" defaultValue="john@example.com" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" defaultValue="+1 234 567 8900" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <button className="w-full h-12 bg-black text-white rounded-full">
                Update Profile
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
