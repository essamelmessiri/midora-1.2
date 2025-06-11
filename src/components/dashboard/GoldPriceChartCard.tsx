
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { supabase } from "@/lib/supabase/client"; // Will be null if not configured
import { CandlestickChart, Loader2, AlertTriangle } from "lucide-react";
import type { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Candle {
  time: string; // ISO Timestamp string
  open: number;
  high: number;
  low: number;
  close: number;
  // volume may also be present but not directly used in candlestick y-value
}

interface ChartDataPoint {
  x: Date;
  y: [number, number, number, number];
}

const MAX_CANDLES = 100; // Max number of candles to display to keep performance

export function GoldPriceChartCard() {
  const [series, setSeries] = useState<{ data: ChartDataPoint[] }[]>([{ data: [] }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const chartOptionsRef = useRef<ApexOptions>({
    chart: {
      type: 'candlestick',
      height: 350,
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 600 // Slower speed for smoother updates
        }
      },
      background: 'transparent',
    },
    theme: {
      mode: 'dark',
    },
    title: {
      text: 'Gold (GC=F) Live Candlestick Chart',
      align: 'left',
      style: {
        color: 'hsl(var(--foreground))',
        fontSize: '16px',
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false, // Display in local time based on user's browser
        style: {
          colors: 'hsl(var(--muted-foreground))'
        }
      },
      axisBorder: {
        show: true,
        color: 'hsl(var(--border))'
      },
      axisTicks: {
        show: true,
        color: 'hsl(var(--border))'
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        formatter: (value) => `$${Number(value).toFixed(2)}`,
        style: {
          colors: 'hsl(var(--muted-foreground))'
        }
      },
      opposite: false, // Set to false to keep y-axis on the left
       axisBorder: {
        show: true,
        color: 'hsl(var(--border))'
      },
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy - HH:mm'
      },
      y: {
        formatter: undefined, // Use default formatter
        title: {
          formatter: (seriesName: string) => '', // Remove "Price" prefix from tooltip
        },
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: 'hsl(var(--chart-2))', // Accent color (Gold)
          downward: 'hsl(var(--destructive))' // Destructive color (Red)
        },
        wick: {
          useFillColor: true
        }
      }
    }
  });

  const formatCandleData = (candle: Candle): ChartDataPoint => ({
    x: new Date(candle.time), // Ensure time is parsed as Date
    y: [Number(candle.open), Number(candle.high), Number(candle.low), Number(candle.close)],
  });

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const fetchInitialData = async () => {
      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Supabase client is not configured. Please check environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).");
        setIsLoading(false);
        return;
      }
      if (!supabase) {
        setError("Supabase client failed to initialize. Check console for details.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("market_data")
          .select("time, open, high, low, close")
          .eq("symbol", "GC=F")
          .order("time", { ascending: false })
          .limit(MAX_CANDLES);

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          const formattedData = data.map(formatCandleData).sort((a, b) => a.x.getTime() - b.x.getTime());
          setSeries([{ data: formattedData }]);
        } else {
          setSeries([{ data: []}]);
        }
      } catch (e: any) {
        console.error("Error fetching initial chart data:", e);
        setError(e.message || "Failed to load initial chart data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []); // Removed supabase from dependency array as it's module-level, env vars are checked inside

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Error already handled by initial fetch logic, or will be logged by client.ts
      console.warn("Supabase real-time updates disabled due to missing configuration.");
      return;
    }
    if (!supabase) {
      console.warn("Supabase real-time updates disabled as client is not initialized.");
      return;
    }

    const channel = supabase
      .channel('market_data_gc_f_inserts_candlestick')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_data', filter: 'symbol=eq.GC=F' },
        (payload) => {
          const newCandle = payload.new as Candle;
          if (!newCandle || !newCandle.time || newCandle.open === undefined) {
            console.warn("Received incomplete candle data from Supabase:", payload.new);
            return;
          }
          const formattedNewCandle = formatCandleData(newCandle);
          
          setSeries((prevSeries) => {
            const currentData = prevSeries[0]?.data || [];
            let updatedData = [...currentData];
            
            const existingCandleIndex = updatedData.findIndex(c => c.x.getTime() === formattedNewCandle.x.getTime());

            if (existingCandleIndex !== -1) {
              updatedData[existingCandleIndex] = formattedNewCandle;
            } else {
              updatedData.push(formattedNewCandle);
            }
            
            updatedData.sort((a, b) => a.x.getTime() - b.x.getTime());

            if (updatedData.length > MAX_CANDLES) {
              updatedData = updatedData.slice(updatedData.length - MAX_CANDLES);
            }
            return [{ data: updatedData }];
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time market_data updates for GC=F.');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || err) {
          console.error('Supabase channel subscription error:', status, err);
          setError((prevError) => prevError || `Supabase subscription failed: ${status}. Real-time updates may not work.`);
        }
      });

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel).catch(err => console.error("Error removing Supabase channel:", err));
      }
    };
  }, []); // Removed supabase from dependency array, checks added inside

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center">
              <CandlestickChart className="mr-2 h-5 w-5 text-primary"/>
              Gold Price (GC=F) - Live
            </CardTitle>
            <CardDescription>
              Live 1-minute candlestick chart. Data from Supabase.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col">
        <div className="flex-1 relative min-h-[370px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading live chart data...</p>
            </div>
          )}
          {!isLoading && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive bg-card/50 z-10 p-4">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p className="text-center font-semibold">{error}</p>
              <p className="text-xs text-center text-muted-foreground mt-1">Chart may not display or update correctly.</p>
            </div>
          )}
          <div className={isLoading || error ? 'opacity-50' : ''}>
             {typeof window !== 'undefined' ? (
                <ReactApexChart
                    options={chartOptionsRef.current}
                    series={series}
                    type="candlestick"
                    height={370} 
                    width="100%"
                />
            ) : (
                 <div className="flex items-center justify-center h-[370px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Initializing chart...</p>
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

