export const getInitials = (name) => {
  if (!name) return "";

  // Split by spaces and filter empty strings
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    // Single word: take first two letters (or first letter if too short)
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Multiple words: take first letter of first two words
  const first = parts[0].charAt(0);
  const second = parts[1]?.charAt(0) || "";
  return (first + second).toUpperCase();
};


/**
 * Extracts initials from a full name.
 * Rules:
 * - If name is empty or falsy, returns an empty string.
 * - For a single word, takes the first two letters (or first letter if the word is too short).
 * - For multiple words, takes the first letter of the first two words.
 * Result is always uppercase.
 *
 * @param {string} name - The full name to process.
 * @returns {string} The initials.
 */