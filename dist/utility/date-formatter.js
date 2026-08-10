/**
 * Date Formatter Utility
 * Handles relative time parsing and human-readable dates.
 */
export const DateFormatter = {
    formatRelative(isoDateString) {
        const date = new Date(isoDateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0)
            return "Today";
        if (diffDays === 1)
            return "Yesterday";
        if (diffDays < 7)
            return `${diffDays} days ago`;
        if (diffDays < 30)
            return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    },
    isOlderThanDays(isoDateString, days) {
        const date = new Date(isoDateString);
        const now = new Date();
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > days;
    }
};
//# sourceMappingURL=date-formatter.js.map