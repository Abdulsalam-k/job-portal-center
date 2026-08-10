/**
 * API Service Layer
 * Handles fetching live jobs or returning robust local datasets.
 */

import { type Job } from "../utility/state.js";

export const ApiService = {
    async fetchJobs(): Promise<Job[]> {
        try {
            // Attempting fetch with a safe timeout or fallback mechanism
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // Timeout after 4s if blocked/slow

            // Read the API URL safely from Vite's env variables, falling back to Remotive if undefined
            const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "https://remotive.com/api/remote-jobs";

            const response = await fetch(`${baseUrl}?limit=15`, {
                method: "GET",
                signal: controller.signal,
                headers: {
                    "Accept": "application/json"
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Network response failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.jobs && data.jobs.length > 0) {
                return data.jobs.map((item: any, index: number) => ({
                    id: `api-${item.id || index}`,
                    title: item.title,
                    company: item.company_name,
                    source: "api" as const,
                    skills: [item.category || "Software Engineering", item.job_type || "Remote"],
                    salary: item.salary || "Competitive",
                    description: item.description || "No description provided.",
                    dateAdded: item.publication_date || new Date().toISOString()
                }));
            }
            
            throw new Error("No jobs found in API response.");
        } catch (error) {
            // This catches CORS blocks, network drops, timeouts, or empty payloads instantly
            console.warn("External API blocked or unavailable. Switching to platform seed listings:", error);
            
            return [
                {
                    id: "admin-1",
                    title: "Senior Full Stack TypeScript Engineer",
                    company: "Vercel Systems",
                    source: "admin",
                    skills: ["TypeScript", "React", "Node.js", "GraphQL"],
                    salary: "$120k - $150k",
                    description: "Build next-generation developer tooling and cloud infrastructures.",
                    dateAdded: new Date().toISOString()
                },
                {
                    id: "admin-2",
                    title: "Frontend Architect",
                    company: "Linear UI",
                    source: "admin",
                    skills: ["TypeScript", "CSS", "UI/UX", "React"],
                    salary: "$130k - $160k",
                    description: "Craft buttery-smooth user interfaces with elite performance standards.",
                    dateAdded: new Date().toISOString()
                }
            ];
        }
    }
};