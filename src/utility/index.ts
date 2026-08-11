import { ApiService } from "../api/api-services.js";
import { type Job, GlobalState } from "../utility/state.js";

document.addEventListener("DOMContentLoaded", async () => {
    const jobGrid = document.getElementById("job-grid") as HTMLElement;
    const jobCounter = document.getElementById("job-counter") as HTMLElement;
    const searchInput = document.getElementById("search-input") as HTMLInputElement;
    const sourceFilter = document.getElementById("source-filter") as HTMLSelectElement;

    if (!jobGrid || !jobCounter) return;

    jobCounter.textContent = "Fetching live listings...";
    
    // Fetch and store global jobs
    const fetchedJobs = await ApiService.fetchJobs();
    GlobalState.setJobs(fetchedJobs);

    renderJobs(fetchedJobs);

    // Filter Listeners
    function filterAndRender() {
        const query = searchInput?.value.toLowerCase() || "";
        const sourceVal = sourceFilter?.value || "all";
        const allJobs = GlobalState.getJobs();

        const filtered = allJobs.filter(job => {
            const matchesSearch = 
                job.title.toLowerCase().includes(query) || 
                job.company.toLowerCase().includes(query) ||
                job.skills.some(skill => skill.toLowerCase().includes(query));
            
            const matchesSource = sourceVal === "all" || job.source === sourceVal;

            return matchesSearch && matchesSource;
        });

        renderJobs(filtered);
    }

    searchInput?.addEventListener("input", filterAndRender);
    sourceFilter?.addEventListener("change", filterAndRender);

    function renderJobs(jobsToRender: Job[]) {
        jobCounter.textContent = `${jobsToRender.length} Jobs Available`;

        if (jobsToRender.length === 0) {
            jobGrid.innerHTML = `
                <div class="job-card-skeleton">
                    <h3>No matching jobs found</h3>
                    <p>Try adjusting your search criteria or filter options.</p>
                </div>
            `;
            return;
        }

        jobGrid.innerHTML = jobsToRender.map(job => `
            <div class="job-card" style="background: var(--card-bg); border: 1px solid var(--border); padding: 1.5rem; border-radius: var(--radius); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s ease;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        <span style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--primary); background: rgba(59, 130, 246, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">${job.source}</span>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${job.salary || 'Competitive'}</span>
                    </div>
                    <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.3rem; color: var(--text-main);">${job.title}</h3>
                    <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1rem;">${job.company}</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.2rem;">
                        ${job.skills.slice(0, 4).map(skill => `<span style="font-size: 0.75rem; background: var(--bg-color); color: var(--text-muted); border: 1px solid var(--border); padding: 0.2rem 0.5rem; border-radius: 4px;">${skill}</span>`).join('')}
                    </div>
                </div>
                <a href="src/public-screens/login.html" class="btn btn-outline" style="text-align: center; display: block; margin-top: 1rem;">View Details & Apply</a>
            </div>
        `).join('');
    }
});