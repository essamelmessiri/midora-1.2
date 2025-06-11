"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useRef, useMemo } from "react";
import dynamic from 'next/dynamic';
import { useMarketData } from "@/hooks/useMarketData";
import { CandlestickChart, Loader2, AlertTriangle, ZoomIn, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartDataPoint {
  x: Date;
  y: [number, number, number, number];
}

interface AILevel {
  price: number;
  type: 'order_block' | 'value_gap' | 'pivot';
  label: string;
  color: string;
}

// Mock AI-detected levels - in production, these would come from your AI analysis
const mockAILevels: AILevel[] = [
  { price: 1955.20, type: 'order_block', label: 'OB H4', color: '#4169E1' },
  { price: 1948.50, type: 'order_block', label: 'OB H1', color: '#4169E1' },
  { price: 1961.25, type: 'value_gap', label: 'FVG', color: '#FFD700' },
  { price: 1945.60, type: 'pivot', label: 'Daily Pivot', color: '#FF6B6B' },
];

export function GoldPriceChartCard() {
  const { candles, isLoading, error } = useMarketData({ 
    symbol: 'GC=F', 
    limit: 100,
    enableRealtime: true 
  });
  
  const [showAILevels, setShowAILevels] = useState(true);
  const [enableCrosshair, setEnableCrosshair] = useState(true);
  const chartRef = useRef<any>(null);

  const chartData = useMemo(() => {
    return candles.map(candle => ({
      x: new Date(candle.time),
      y: [Number(candle.open), Number(candle.high), Number(candle.low), Number(candle.close)],
    }));
  }, [candles]);

  const chartOptions = useMemo<ApexOptions>(() => {
    const annotations: ApexOptions['annotations'] = {
      yaxis: showAILevels ? mockAILevels.map(level => ({
        y: level.price,
        borderColor: level.color,
        borderWidth: 2,
        strokeDashArray: level.type === 'value_gap' ? 5 : 0,
        label: {
          text: level.label,
          style: {
            color: '#fff',
            background: level.color,
            fontSize: '12px',
          },
          position: 'left',
        }
      })) : []
    };

    return {
      chart: {
        type: 'candlestick',
        height: 400,
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 600
          }
        },
        background: 'transparent',
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true,
        },
        pan: {
          enabled: true,
          type: 'x'
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          }
        }
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
          datetimeUTC: false,
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
        },
        crosshairs: {
          show: enableCrosshair,
          width: 1,
          position: 'back',
          opacity: 0.9,
          stroke: {
            color: 'hsl(var(--primary))',
            width: 1,
            dashArray: 3,
          },
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
        opposite: false,
        axisBorder: {
          show: true,
          color: 'hsl(var(--border))'
        },
        crosshairs: {
          show: enableCrosshair,
          width: 1,
          position: 'back',
          opacity: 0.9,
          stroke: {
            color: 'hsl(var(--primary))',
            width: 1,
            dashArray: 3,
          },
        }
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
          formatter: undefined,
          title: {
            formatter: () => '',
          },
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: 'hsl(var(--chart-2))',
            downward: 'hsl(var(--destructive))'
          },
          wick: {
            useFillColor: true
          }
        }
      },
      annotations
    };
  }, [showAILevels, enableCrosshair]);

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.chart.resetSeries();
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center">
              <CandlestickChart className="mr-2 h-5 w-5 text-primary"/>
              Gold Price (GC=F) - Live
            </CardTitle>
            <CardDescription>
              Live 1-minute candlestick chart with AI-detected levels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAILevels(!showAILevels)}
              className="text-xs"
            >
              {showAILevels ? 'Hide' : 'Show'} AI Levels
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnableCrosshair(!enableCrosshair)}
              className="text-xs"
            >
              <Crosshair className="h-3 w-3 mr-1" />
              {enableCrosshair ? 'Hide' : 'Show'} Crosshair
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
              className="text-xs"
            >
              <ZoomIn className="h-3 w-3 mr-1" />
              Reset Zoom
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col">
        <div className="flex-1 relative min-h-[400px]">
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
            {typeof window !== 'undefined' && chartData.length > 0 ? (
              <ReactApexChart
                ref={chartRef}
                options={chartOptions}
                series={[{ data: chartData }]}
                type="candlestick"
                height={400} 
                width="100%"
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Initializing chart...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Levels Legend */}
        {showAILevels && (
          <div className="mt-4 p-3 bg-muted/30 rounded-md">
            <h4 className="text-sm font-medium mb-2">AI-Detected Levels</h4>
            <div className="flex flex-wrap gap-4 text-xs">
              {mockAILevels.map((level, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-0.5" 
                    style={{ 
                      backgroundColor: level.color,
                      borderStyle: level.type === 'value_gap' ? 'dashed' : 'solid'
                    }}
                  />
                  <span>{level.label}: ${level.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}