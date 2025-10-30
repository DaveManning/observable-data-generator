import React from 'react';
import { type DataConfig } from '../types';
import InputSlider from './InputSlider';
import ToggleSwitch from './ToggleSwitch';
import { presets } from '../presets';

interface ConfigurationPanelProps {
  config: DataConfig;
  setConfig: React.Dispatch<React.SetStateAction<DataConfig>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, setConfig, onGenerate, isLoading }) => {
  const handleConfigChange = <K extends keyof DataConfig, V extends DataConfig[K]>(
    key: K,
    value: V
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPresetName = event.target.value;
    const preset = presets.find(p => p.name === selectedPresetName);
    if (preset) {
      setConfig(preset.config);
    }
    // Reset select to placeholder so it can be re-selected
    event.target.value = "";
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400 border-b border-slate-700 pb-3 mb-4">Configuration</h2>

      {/* Presets */}
      <div className="space-y-2 pb-4 border-b border-slate-700">
        <label htmlFor="preset-select" className="block text-sm font-medium text-slate-300">Load Example</label>
        <select 
          id="preset-select" 
          onChange={handlePresetChange}
          value="" // Uncontrolled component to act as a trigger
          className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2"
          aria-label="Load an example preset configuration"
        >
          <option value="" disabled>Select a preset...</option>
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>


      {/* General Settings */}
      <div className="space-y-4 p-4 bg-slate-900/40 rounded-md">
        <h3 className="font-semibold text-slate-300">General</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-400">Function Name</span>
            <input type="text" value={config.functionName} onChange={(e) => handleConfigChange('functionName', e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-400">Number of Points</span>
            <input type="number" value={config.numPoints} onChange={(e) => handleConfigChange('numPoints', parseInt(e.target.value, 10))} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2" />
          </label>
        </div>
      </div>

      {/* Field Settings */}
      <div className="space-y-4 p-4 bg-slate-900/40 rounded-md">
        <h3 className="font-semibold text-slate-300">Fields &amp; Time Series</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-400">Date Field Name</span>
            <input type="text" value={config.dateField} onChange={(e) => handleConfigChange('dateField', e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-400">Metric Field Name</span>
            <input type="text" value={config.metricField} onChange={(e) => handleConfigChange('metricField', e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-400">Start Date</span>
            <input type="date" value={config.startDate} onChange={(e) => handleConfigChange('startDate', e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-400">Date Increment</span>
            <select value={config.dateIncrement} onChange={(e) => handleConfigChange('dateIncrement', e.target.value as DataConfig['dateIncrement'])} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2">
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </label>
        </div>
      </div>
      
      {/* Metric Behavior */}
      <div className="space-y-4 p-4 bg-slate-900/40 rounded-md">
        <h3 className="font-semibold text-slate-300">Metric Behavior</h3>
        <InputSlider label="Base Value" value={config.baseValue} onChange={(v) => handleConfigChange('baseValue', v)} min={0} max={10000} step={100} />
        <InputSlider label="Trend" value={config.trend} onChange={(v) => handleConfigChange('trend', v)} min={-100} max={100} step={1} />
        <InputSlider label="Noise" value={config.noise} onChange={(v) => handleConfigChange('noise', v)} min={0} max={1000} step={10} />
      </div>

      {/* Seasonality */}
      <div className="space-y-4 p-4 bg-slate-900/40 rounded-md">
         <div className="flex justify-between items-center">
             <h3 className="font-semibold text-slate-300">Seasonality</h3>
             <ToggleSwitch checked={config.enableSeasonality} onChange={(c) => handleConfigChange('enableSeasonality', c)} />
        </div>
        {config.enableSeasonality && (
          <div className="space-y-4 pt-2 border-t border-slate-700/50">
            <InputSlider label="Period (days)" value={config.seasonalityPeriod} onChange={(v) => handleConfigChange('seasonalityPeriod', v)} min={2} max={365} step={1} />
            <InputSlider label="Amplitude" value={config.seasonalityAmplitude} onChange={(v) => handleConfigChange('seasonalityAmplitude', v)} min={0} max={5000} step={50} />
          </div>
        )}
      </div>

      {/* Categorical Data */}
      <div className="space-y-4 p-4 bg-slate-900/40 rounded-md">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-300">Categorical Data</h3>
            <ToggleSwitch checked={config.enableCategorical} onChange={(c) => handleConfigChange('enableCategorical', c)} />
        </div>
        {config.enableCategorical && (
          <div className="space-y-4 pt-2 border-t border-slate-700/50">
              <label className="block">
                <span className="text-sm font-medium text-slate-400">Category Field Name</span>
                <input type="text" value={config.categoryField} onChange={(e) => handleConfigChange('categoryField', e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-400">Categories (comma-separated)</span>
                <input type="text" value={config.categories} onChange={(e) => handleConfigChange('categories', e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 px-3 py-2" />
              </label>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-900/50"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 12-8.5 8.5"></path><path d="m15 12 8.5 8.5"></path><path d="M15 12V3.5A2.5 2.5 0 0 0 12.5 1h-5A2.5 2.5 0 0 0 5 3.5V12"></path><path d="m15 12-8.5-8.5"></path><path d="m15 12 8.5-8.5"></path></svg>
          )}
          <span>{isLoading ? 'Generating...' : 'Generate Function'}</span>
        </button>
      </div>
    </div>
  );
};

export default ConfigurationPanel;