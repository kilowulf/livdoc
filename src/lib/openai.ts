import OpenAI from "openai";

// Initialize an OpenAI instance using the API key stored in environment variables.
// The API key is retrieved from environment variables to authenticate requests made to the OpenAI API.
// This allows the application to securely interact with OpenAI's services, such as text completion, via the SDK.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Use the OpenAI API key from environment variables
});
