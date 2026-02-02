/**
 * Consistent date formatter to avoid hydration mismatches
 * Server and client can have different locales, causing toLocaleDateString()
 * to produce different outputs (e.g., "2/3/2026" vs "3/2/2026")
 * 
 * This function ensures consistent formatting: "Feb 3, 2026"
 */
export const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const datePart = formatDate(date);
    const time = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    return `${datePart} at ${time}`;
};
