"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { WeeklyUserData } from "@/_services/hooks/admin/use-admin-dashboard";

interface WeeklyUsersChartProps {
  data: WeeklyUserData[];
  isLoading?: boolean;
  className?: string;
}

export const WeeklyUsersChart = ({ data, isLoading = false, className = "" }: WeeklyUsersChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !canvasRef.current) return;

    // Dynamically import Chart.js to avoid SSR issues
    const initChart = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Format dates for display
      const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      });

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'New Users',
              data: data.map(item => item.newUsers),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y',
            },
            {
              label: 'Active Users',
              data: data.map(item => item.activeUsers),
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index' as const,
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Date',
                color: '#6b7280',
                font: {
                  size: 12,
                }
              },
              grid: {
                display: false,
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 11,
                }
              }
            },
            y: {
              type: 'linear' as const,
              display: true,
              position: 'left' as const,
              title: {
                display: true,
                text: 'New Users',
                color: '#6b7280',
                font: {
                  size: 12,
                }
              },
              grid: {
                color: 'rgba(107, 114, 128, 0.1)',
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 11,
                }
              }
            },
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              title: {
                display: true,
                text: 'Active Users',
                color: '#6b7280',
                font: {
                  size: 12,
                }
              },
              grid: {
                drawOnChartArea: false,
                color: 'rgba(107, 114, 128, 0.1)',
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 11,
                }
              }
            }
          }
        }
      });
    };

    initChart();

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Weekly User Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Loading chart...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Weekly User Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Weekly User Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={canvasRef} />
        </div>
      </CardContent>
    </Card>
  );
}; 