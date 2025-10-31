// src/utils/helpers.ts

/** Returns the initials of a full name (e.g., "John Doe" → "JD") */
export function initialsFromName(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Generates a consistent color from a string (e.g., employee name) */
export function colorFromString(str?: string): string {
  if (!str) return '#6b7280'; // fallback gray
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 45%)`;
}
