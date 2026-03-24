import { useMemo } from "react";
import { getInitials } from "../utils/stringUtils";

/**
 * Custom React hook that returns the initials of a given name.
 * It uses useMemo to avoid recalculating the initials on every render
 * unless the 'name' argument changes.
 *
 * @param {string} name - The full name from which to extract initials.
 * @returns {string} The initials of the name.
 */
export const useInitials = (name) => {
  return useMemo(() => getInitials(name), [name]);
};
