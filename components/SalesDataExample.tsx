import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { generateMonthlySalesData } from '../services/generateMonthlySalesData';
import { presetPatterns } from '../services/salesDataPresets';
// Generator parameter types
interface GeneratorParams {
  count: number;
  baseValue: number;
  trendPerMonth: number;
  seasonalityPeriod: number;
  seasonalityAmplitude: number;
  noiseAmount: number;
  seed: number;
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Parameter descriptions for tooltips
const parameterInfo: Record<keyof GeneratorParams, { title: string; description: string }> = {
  count: {
    title: "Number of Months",
    description: "The total number of months to generate data for. More months show longer-term patterns."
  },
  baseValue: {
    title: "Base Value",
    description: "The starting point for sales before trends and seasonality. Think of it as the 'normal' sales level."
  },
  trendPerMonth: {
    title: "Monthly Trend",
    description: "How much sales tend to grow or shrink each month. Positive values create upward trends, negative create downward trends."
  },
  seasonalityPeriod: {
    title: "Seasonality Period",
    description: "How many months make up one complete seasonal cycle. 12 for yearly patterns, 3 for quarterly, etc."
  },
  seasonalityAmplitude: {
    title: "Seasonality Amplitude",
    description: "How strong the seasonal pattern is. Higher values create bigger swings between seasonal peaks and troughs."
  },
  noiseAmount: {
    title: "Noise Amount",
    description: "Random variation added to each point. Higher values create more jagged, unpredictable patterns."
  },
  seed: {
    title: "Random Seed",
    description: "Controls the random number generation. The same seed will always produce the same 'random' pattern."
  }
};

const defaultParams: GeneratorParams = {
  count: 24,
  baseValue: 9000,
  trendPerMonth: 2500,
  seasonalityPeriod: 12,
  seasonalityAmplitude: 3600,
  noiseAmount: 800,
  seed: 42
};

/**
 * Example component demonstrating the sales data generator with visualization
 * and interactive controls
 */
export function SalesDataExample() {
  // State for all generator parameters
  const [params, setParams] = useState<GeneratorParams>(defaultParams);
  
  // Generate data based on current parameters
  const salesData = useMemo(() => {
    // Seeded RNG function
    let seed = params.seed;
    const seededRNG = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    return generateMonthlySalesData({
      count: params.count,
      baseValue: params.baseValue,
      trendPerMonth: params.trendPerMonth,
      seasonalityPeriod: params.seasonalityPeriod,
      seasonalityAmplitude: params.seasonalityAmplitude,
      noiseAmount: params.noiseAmount,
      rng: seededRNG,
    });
  }, []);

  // Group data by category for the table
  const categoryTotals = useMemo(() => {
    return salesData.reduce((acc, { category, sales }) => {
      acc[category] = (acc[category] || 0) + sales;
      return acc;
    }, {} as Record<string, number>);
  }, [salesData]);

  // Handler for parameter updates
  const handleParamChange = (key: keyof GeneratorParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    const dates = salesData.map(d => d.date);
    const salesByCategory: Record<string, number[]> = {};
    
    salesData.forEach(({ category, sales }) => {
      if (!salesByCategory[category]) {
        salesByCategory[category] = Array(dates.length).fill(0);
      }
      const index = dates.indexOf(category);
      if (index !== -1) {
        salesByCategory[category][index] = sales;
      }
    });

    return {
      labels: dates,
      datasets: Object.entries(salesByCategory).map(([category, data], index) => ({
        label: category,
        data,
        borderColor: [`rgb(255, 99, 132)`, `rgb(75, 192, 192)`, `rgb(153, 102, 255)`][index],
        tension: 0.1
      }))
    };
  }, [salesData]);

  // Chart options
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Sales by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  // Export data as CSV
  const exportToCSV = () => {
    const headers = ['date', 'category', 'sales'];
    const csvContent = [
      headers.join(','),
      ...salesData.map(row => 
        [row.date, row.category, row.sales].join(',')
      )
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sales_data.csv';
    link.click();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Interactive Sales Data Generator</h2>
      
      {/* Chart */}
      <div className="mb-8 p-4 bg-white rounded shadow">
        <Line options={chartOptions} data={chartData} />
      </div>
      
      {/* Parameter Controls */}
      <div className="mb-8 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-4">Generator Parameters</h3>
        
        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Presets:</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presetPatterns).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => setParams(preset)}
                className="px-3 py-1 text-sm bg-white hover:bg-gray-100 border rounded"
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Each parameter control gets a tooltip */}
            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">
                  {parameterInfo.count.title} ({params.count})
                </label>
                <div className="ml-2 group relative">
                  <span className="cursor-help text-gray-400">ⓘ</span>
                  <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-black text-white text-sm rounded shadow-lg">
                    {parameterInfo.count.description}
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={48}
                value={params.count}
                onChange={(e) => handleParamChange('count', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Base Value (${params.baseValue.toLocaleString()})
              </label>
              <input
                type="range"
                min={1000}
                max={20000}
                step={1000}
                value={params.baseValue}
                onChange={(e) => handleParamChange('baseValue', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Monthly Trend (${params.trendPerMonth.toLocaleString()})
              </label>
              <input
                type="range"
                min={-5000}
                max={5000}
                step={100}
                value={params.trendPerMonth}
                onChange={(e) => handleParamChange('trendPerMonth', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Seasonality Period (months) ({params.seasonalityPeriod})
              </label>
              <input
                type="range"
                min={3}
                max={24}
                value={params.seasonalityPeriod}
                onChange={(e) => handleParamChange('seasonalityPeriod', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Seasonality Amplitude (${params.seasonalityAmplitude.toLocaleString()})
              </label>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={params.seasonalityAmplitude}
                onChange={(e) => handleParamChange('seasonalityAmplitude', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Noise Amount (±${params.noiseAmount.toLocaleString()})
              </label>
              <input
                type="range"
                min={0}
                max={2000}
                step={100}
                value={params.noiseAmount}
                onChange={(e) => handleParamChange('noiseAmount', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Random Seed ({params.seed})
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={params.seed}
              onChange={(e) => handleParamChange('seed', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setParams(defaultParams)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Reset to Defaults
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
            >
              Export to CSV
            </button>
          </div>
        </div>
      </div>

      {/* Simple data grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Monthly Sales Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Date</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map(({ date, category, sales }) => (
                <tr key={`${date}-${category}`}>
                  <td className="border p-2">{date}</td>
                  <td className="border p-2">{category}</td>
                  <td className="border p-2 text-right">
                    ${sales.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category summary */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Category Totals</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <div key={category} className="p-4 border rounded">
              <div className="font-medium">{category}</div>
              <div className="text-xl">
                ${total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual pattern explanation */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">About this Example</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Shows 24 months of generated sales data (2024-2025)
          </li>
          <li>
            Uses yearly seasonality (12-month cycles) - notice the repeating pattern
          </li>
          <li>
            Includes a linear trend of $2,500 per month
          </li>
          <li>
            Uses a seeded random number generator for reproducible output
          </li>
          <li>
            Categories are randomly assigned to demonstrate the distribution
          </li>
        </ul>
      </div>
    </div>
  );
}