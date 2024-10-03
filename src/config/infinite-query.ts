// Define a constant `INFINITE_QUERY_LIMIT` that sets the default number of items to be fetched in an infinite query.
// This value limits how many items are returned in one batch when using infinite scroll or pagination, helping to
// improve performance by fetching a manageable number of records at a time.
// By setting this value, you ensure consistency in how many items are fetched in queries throughout the application.
export const INFINITE_QUERY_LIMIT = 10; // Default limit is 10 items per query.
