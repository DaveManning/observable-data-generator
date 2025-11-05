// Import module
import { generateMonthlySalesData, presets, seededRng, dataToCSV, analyzeTrends } from '../services/notebook_cells.module.js';

console.log('\n1. Basic Data Generation');
console.log('----------------------');
try {
    const defaultData = generateMonthlySalesData();
    console.log('✅ Data points:', defaultData.length);
    console.log('✅ First record:', defaultData[0]);
    console.log('✅ Categories:', [...new Set(defaultData.map(d => d.category))]);
    console.log('✅ Date range:', defaultData[0].date, 'to', defaultData[defaultData.length - 1].date);
} catch (err) {
    console.error('❌ Basic generation failed:', err);
}

console.log('\n2. Parameter Validation');
console.log('---------------------');
const invalidCases = [
    { count: -1, expected: 'count must be non-negative' },
    { count: 121, expected: 'count must be ≤ 120 months' },
    { baseValue: -100, expected: 'baseValue must be between 0 and' },
    { startDate: 'invalid', expected: 'startDate must be a valid date string or Date object' },
    { categories: [], expected: 'categories array cannot be empty' },
    { seasonalityPeriod: 0, expected: 'seasonalityPeriod must be between 1 and 24' }
];

invalidCases.forEach(({ expected, ...params }) => {
    try {
        generateMonthlySalesData(params);
        console.error('❌ Should have thrown:', expected);
    } catch (err) {
        const passed = err.message.includes(expected);
        console.log(passed ? '✅' : '❌', 'Testing:', JSON.stringify(params), '\n   ', err.message);
    }
});

console.log('\n3. Preset Testing');
console.log('----------------');
Object.entries(presets).forEach(([name, params]) => {
    try {
        const data = generateMonthlySalesData(params);
        console.log('✅', name, ':',
            data.length, 'records,',
            'sales range:', Math.min(...data.map(d => d.sales)), 'to', Math.max(...data.map(d => d.sales))
        );
    } catch (err) {
        console.error('❌', name, ':', err.message);
    }
});

console.log('\n4. Seeded RNG Testing');
console.log('--------------------');
const seed = 42;
const rng1 = seededRng(seed);
const rng2 = seededRng(seed);

const data1 = generateMonthlySalesData({ rng: rng1, count: 12 });
const data2 = generateMonthlySalesData({ rng: rng2, count: 12 });

const matches = data1.every((d1, i) => {
    const d2 = data2[i];
    return d1.sales === d2.sales && d1.category === d2.category;
});

console.log(matches ? '✅' : '❌', 'Seeded RNG produces consistent results');
console.log('First three records match:', JSON.stringify(data1.slice(0, 3)) === JSON.stringify(data2.slice(0, 3)));

console.log('\n5. Export Testing');
console.log('----------------');
const sampleData = generateMonthlySalesData({ count: 3 });
const csv = dataToCSV(sampleData);

console.log('CSV output sample:');
console.log(csv.split('\n').slice(0, 2).join('\n') + '\n...');

const lines = csv.split('\n');
const hasHeaders = lines[0] === 'date,category,sales';
const rowCount = lines.length - 1; // -1 for header
const validFormat = lines.every(line => line.split(',').length === 3);

console.log('\nCSV Validation:');
console.log(hasHeaders ? '✅' : '❌', 'Has correct headers');
console.log(rowCount === 3 ? '✅' : '❌', 'Has correct number of data rows');
console.log(validFormat ? '✅' : '❌', 'All rows have correct format');

console.log('\n6. Trend Analysis');
console.log('----------------');
const trendData = generateMonthlySalesData({
    count: 12,
    baseValue: 1000,
    trendPerMonth: 100,  // Should see ~100 units/month trend
    seasonalityAmplitude: 0,  // No seasonality
    noiseAmount: 0,  // No noise
    categories: ['test']  // Single category
});

const trends = analyzeTrends(trendData);
const expectedSlope = 100;
const actualSlope = trends.test.slope;
const slopeError = Math.abs(actualSlope - expectedSlope);
const maxError = 1; // Allow 1 unit of error due to rounding

console.log('Trend validation:');
console.log(slopeError <= maxError ? '✅' : '❌',
    `Slope (${actualSlope.toFixed(2)}) matches expected (${expectedSlope})`);
console.log(trends.test.r2 > 0.99 ? '✅' : '❌',
    `R² (${trends.test.r2.toFixed(4)}) shows strong fit`);