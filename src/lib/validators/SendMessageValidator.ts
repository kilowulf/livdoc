// `zod` is a schema declaration and validation library that helps define types and validate data.
import { z } from "zod";

// Define a schema called `SendMessageValidator` using `zod`.
// The schema expects an object with two string fields: `fileId` and `message`.
// - `fileId`: A string representing the ID of the file associated with the message.
// - `message`: A string representing the content of the message itself.
// This schema ensures that the inputs for sending a message are properly validated
// before proceeding with the operation, reducing the risk of errors due to invalid data.
export const SendMessageValidator = z.object({
  fileId: z.string(), // Validate that `fileId` is a string
  message: z.string() // Validate that `message` is a string
});
