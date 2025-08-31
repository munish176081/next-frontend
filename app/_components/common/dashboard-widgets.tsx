"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export const DashboardCard = ({ title, icon: Icon, children, className = "" }: DashboardCardProps) => {
  return (
    <div className={`flex flex-col border border-black/20 rounded-[20px] ${className}`}>
      <div className="flex gap-4 items-center px-4 min-h-20 justify-between">
        <span className="text-[22px] font-semibold flex items-center gap-2">
          {Icon && (
            <span className="size-11 bg-[#E6E6E6] rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </span>
          )}
          {title}
        </span>
      </div>
      <div className="flex-1 min-h-[400px]">
        {children}
      </div>
    </div>
  );
};

interface DashboardTableProps {
  headers: string[];
  data: any[];
  className?: string;
}

export const DashboardTable = ({ headers, data, className = "" }: DashboardTableProps) => {
  console.log(data);
  const statusStyles: Record<string, string> = {
    Active: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E] rounded-full",
    Pending: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20] rounded-full",
    Expired: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50] rounded-full",
    Suspended: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50]",
    Normal: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E] rounded-full",
    Warning: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20] rounded-full",
    Completed: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E] rounded-full",
    Failed: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50] rounded-full",
    Tentative: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50] rounded-full",
    Deleted: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50] rounded-full px-2",
    cancelled_by_user: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50] rounded-full px-2",
    cancelled_by_seller: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50]",
    Cancelled: "text-[#EE5D50] bg-[#EE5D5033] border border-[#EE5D50]",
    Confirmed: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E] rounded-full",
  };

  const statusText = (text: string) => {
    if (text === 'cancelled_by_user') {
      return 'Buyer Cancelled';
    }
    if (text === 'cancelled_by_seller') {
      return 'Seller Cancelled';
    }
    return text;
  };

  return (
    <div className={`overflow-visible w-full px-4 relative ${className}`}>
      <table className="w-full text-left">
        <thead className="text-[#A3AED0] text-sm border-b border-[#E9EDF7]">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-3 py-3 font-medium ${header === 'ACTION' ? 'w-32 text-center' : 'text-left'
                  }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-3 py-3 text-sm font-medium text-center">
                No data found
              </td>
            </tr>
          )}
          {data.map((row, index) => (
            <tr key={index} className="border-b border-[#E9EDF7]">
              {Object.values(row).map((value: any, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-3 py-6 text-sm font-medium align-top ${cellIndex === Object.values(row).length - 1 ? 'text-center' : 'text-left'
                    }`}
                >
                  {typeof value === 'string' && statusStyles[value] ? (
                    <StatusBadge status={statusText(value)} />
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const statusStyles: Record<string, string> = {
    Active: "text-white bg-[#74D27E] border border-[#74D27E]",
    Draft: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20]",
    Expired: "text-white bg-[#EE5D50] border border-[#EE5D50]",
    Suspended: "text-white bg-[#EE5D50] border border-[#EE5D50]",
    Pending: "text-white bg-[#FFCE20] border border-[#FFCE20]",
    Normal: "text-white bg-[#74D27E] border border-[#74D27E]",
    Warning: "text-white bg-[#FFCE20] border border-[#FFCE20]",
    Completed: "text-white bg-[#74D27E] border border-[#74D27E]",
    Failed: "text-white bg-[#EE5D50] border border-[#EE5D50]",
    Tentative: "text-white bg-[#EE5D50] border border-[#EE5D50]",
    Deleted: "text-white bg-[#EE5D50] border border-[#EE5D50]",
    cancelled_by_user: "text-white bg-red-500 border border-[#EE5D50]",
    cancelled_by_seller: "text-white bg-red-500 border border-[#EE5D50]",

    Cancelled: "text-white bg-[#EE5D50] border border-[#EE5D50]",
    Confirmed: "text-white bg-[#74D27E] border border-[#74D27E]",
    Rescheduled: "text-white bg-[#FFCE20] border border-[#FFCE20]",
    no_show: "text-white bg-[#EE5D50] border border-[#EE5D50]",
  };


  return (
    <span className={`min-h-6 text-[10px] rounded-full w-14 flex items-center justify-center ${statusStyles[status] || statusStyles['Draft']} ${className}`}>
      {status}
    </span>
  );
}; 