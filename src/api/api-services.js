/**
 * API Service Layer
 * Handles fetching live jobs or returning robust local datasets.
 */
export const ApiService = {
    async fetchJobs() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const baseUrl = import.meta.env?.VITE_API_BASE_URL || "https://remotive.com/api/remote-jobs";
            const response = await fetch(`${baseUrl}?`, {
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
                return data.jobs.map((item, index) => ({
                    id: `api-${item.id || index}`,
                    title: item.title,
                    company: item.company_name,
                    source: "api",
                    skills: [item.category || "Software Engineering", item.job_type || "Remote"],
                    salary: item.salary || "Competitive",
                    description: item.description || "No description provided.",
                    dateAdded: item.publication_date || new Date().toISOString()
                }));
            }
            throw new Error("No jobs found in API response.");
        }
        catch (error) {
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
