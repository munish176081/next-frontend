"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminGuard } from "@/_components/common/admin-guard";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEnquiries();
  }, [page]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/contact/enquiries?page=${page}&limit=1`,
        { credentials: "include" }
      );

      const eq_data = await res.json();
      console.log('equiry data',eq_data);

      setEnquiries(eq_data.data || []);
      setTotalPages(eq_data.total || 1);
    } catch (error) {
      console.error("Failed to fetch enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <DashboardLayout title="Enquiries" showTimeFilter={false}>
        <div className="p-4 bg-white rounded-xl shadow">
          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-xl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Name</th>
                  <th className="p-3 text-left text-sm font-medium">Email</th>
                  <th className="p-3 text-left text-sm font-medium">Phone</th>
                  <th className="p-3 text-left text-sm font-medium">Subject</th>
                  <th className="p-3 text-left text-sm font-medium">Message</th>
                  <th className="p-3 text-left text-sm font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center">
                      No enquiries found.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((e: any) => (
                    <tr key={e.id} className="border-t">
                      <td className="p-3">{e.firstName} {e.lastName}</td>
                      <td className="p-3">{e.email}</td>
                      <td className="p-3">{e.phone}</td>
                      <td className="p-3">{e.subject}</td>
                      <td className="p-3">{e.message}</td>
                      <td className="p-3">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>

            <span>
              Page <b>{page}</b> of <b>{totalPages}</b>
            </span>

            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}