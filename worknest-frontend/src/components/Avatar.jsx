import React, { useState } from 'react';        // Import React and useState hook
import { useInitials } from '../hooks/useInitials'; // Import custom hook for initials

/**
 * Simple hash function that generates a consistent hex color from a string.
 * Used to assign a deterministic background color for the initials fallback.
 * @param {string} str - The input string (e.g., the name)
 * @returns {string} A CSS color string in hex format (e.g., "#a3f4c2")
 */
const stringToColor = (str) => {
  let hash = 0;
  // Loop through each character to build a hash value
  for (let i = 0; i < str.length; i++) {
    // Combine character code with previous hash using bitwise operations
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Convert hash to a valid color: use sine to get a pseudo‑random number,
  // then scale to a 24‑bit integer (0–16777215), and finally convert to hex.
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215) % 16777215).toString(16);
  // Pad with leading zeros to ensure 6 digits (e.g., "a3f4c2")
  return `#${'0'.repeat(6 - color.length)}${color}`;
};

/**
 * Avatar component that displays either an image or initials fallback.
 * Props:
 * - src: image source URL (optional)
 * - name: full name used for initials and fallback color
 * - alt: alternative text for the image (falls back to name)
 * - size: width/height in pixels (default 40)
 * - ...props: any additional props are passed to the underlying img or div
 */
const Avatar = ({ src, name, alt, size = 40, ...props }) => {
  // State to track image loading error; if true, we show the fallback
  const [error, setError] = useState(false);

  // Get initials from the custom hook (memoized)
  const initials = useInitials(name);
  // Generate a deterministic background color from the name (or empty string)
  const bgColor = stringToColor(name || '');

  // If there's no image source OR an error occurred while loading,
  // render the initials fallback.
  if (!src || error) {
    return (
      <div
        style={{
          width: size,                // dynamic size
          height: size,
          borderRadius: '50%',         // circular avatar
          backgroundColor: bgColor,     // generated color
          display: 'flex',              // center content
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',                // white text
          fontWeight: 'bold',
          fontSize: size * 0.4,          // scale font with size
          textTransform: 'uppercase',     // ensure initials are uppercase
        }}
        {...props}                      // pass any extra props to the div
      >
        {initials}
      </div>
    );
  }

  // If src exists and no error, render the image
  return (
    <img
      src={src}
      alt={alt || name}                 // use alt prop or fallback to name
      onError={() => setError(true)}    // if image fails, set error state
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',              // ensure image covers the circle
      }}
      {...props}                         // pass extra props to the img
    />
  );
};

export default Avatar; // Export component as default