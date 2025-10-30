
import { GoogleGenAI } from "@google/genai";
import { type DataConfig } from '../types';

const buildPrompt = (config: DataConfig): string => {
  const seasonalitySpec = config.enableSeasonality
    ? `
- Apply a cyclical seasonality effect.
- The period of the seasonality should be ${config.seasonalityPeriod} data points (e.g., for daily data, 7 means weekly seasonality).
- The amplitude of the seasonal swing should be ${config.seasonalityAmplitude}.`
    : '- No seasonality should be applied.';

  const categoricalSpec = config.enableCategorical
    ? `
- Include a categorical field named '${config.categoryField}'.
- This field should be randomly assigned one of the following string values: ${config.categories.split(',').map(c => `'${c.trim()}'`).join(', ')}.`
    : '- Do not include a categorical field.';

  return `
You are an expert JavaScript developer creating data generation functions for visualization notebooks like ObservableHQ.
Your task is to write a single, self-contained JavaScript function based on the following specifications.

**Function Specifications:**

- The function must be named \`${config.functionName}\`.
- It must accept one optional argument, \`count\`, to override the default number of data points. If \`count\` is not provided, it should generate ${config.numPoints} data points.
- It must return an array of data objects.

**Data Object Specifications:**

- Each object must have a date field named '${config.dateField}'. The dates should start from '${config.startDate}' and increment by one ${config.dateIncrement} for each data point.
- Each object must have a primary numerical metric field named '${config.metricField}'. The value of this metric should be calculated based on the following rules:
  - Start with a base value of ${config.baseValue}.
  - Apply a linear trend of ${config.trend} for each data point. This can be positive or negative.
  ${seasonalitySpec}
  - Add random noise to the value, up to a maximum of ${config.noise}.
${categoricalSpec}

**Output Requirements:**

- Provide ONLY the raw JavaScript code for the function.
- Do not include any explanations, comments, markdown formatting (like \`\`\`javascript), or any other text outside of the function code itself.
- Ensure the date logic correctly handles increments of '${config.dateIncrement}'. For date manipulation, you can use helper functions within the main function if needed.
`;
};

export const generateDataFunction = async (config: DataConfig): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildPrompt(config);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });
  
  const rawCode = response.text;
  // Clean up potential markdown code block fences that Gemini might add
  return rawCode.replace(/^`{3}(javascript\n)?|`{3}$/g, '').trim();
};
   