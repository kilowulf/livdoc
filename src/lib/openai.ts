import OpenAI from "openai";

// OpenAI hook: validation for api usage
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
