import { Pinecone } from "@pinecone-database/pinecone";

// Initialize a new Pinecone client instance using the API key stored in environment variables.
// The API key is retrieved from the environment to authenticate the client with the Pinecone service.
// The exclamation mark `!` ensures TypeScript that the API key exists at runtime, avoiding type errors.
export const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY! // Use the Pinecone API key from environment variables
});
