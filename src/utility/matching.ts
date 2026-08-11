import { type Job,type User } from "./state.js";

export const MatchingService = {
    calculateMatch(user: User | null, job: Job): number {
        if (!user || !user.skills || user.skills.length === 0) {
            return 50; // Default baseline match if no user skills specified
        }

        const userSkills = user.skills.map(s => s.toLowerCase().trim());
        const jobSkills = job.skills.map(s => s.toLowerCase().trim());

        if (jobSkills.length === 0) return 60;

        let matchCount = 0;
        for (const skill of jobSkills) {
            if (userSkills.some(us => us.includes(skill) || skill.includes(us))) {
                matchCount++;
            }
        }

        // Calculate score percentage
        const score = Math.round((matchCount / jobSkills.length) * 100);
        
        // Ensure score stays within a realistic bounds (e.g., 40% to 99%)
        return Math.min(Math.max(score, 40), 99);
    }
};