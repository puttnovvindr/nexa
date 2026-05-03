export function parseErrorMessage(error?: string): string {
  if (!error) return "Failed to process. Please try again."

  if (error.includes("Can't reach database") || error.includes("ECONNREFUSED"))
    return "Unable to connect to the server. Please check your connection and try again."

  if (error.includes("Unique constraint") || error.includes("unique constraint"))
    return "Some records already exist. Please check for duplicate Employee IDs or emails."

  if (error.includes("Foreign key constraint") || error.includes("foreign key"))
    return "Some data references are invalid. Please check department or job title values."

  if (error.includes("timeout") || error.includes("Timeout"))
    return "Request timed out. Please try again with a smaller file."

  return "Something went wrong. Please try again."
}