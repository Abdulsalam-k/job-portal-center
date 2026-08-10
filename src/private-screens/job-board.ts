/**
 * Talent Command Center Dashboard Controller
 * Handles live feed matching, pipeline board stages, skill profiling, and stats computation.
 */

import { ApiService } from "../api/api-services.js";
import { GlobalState, type Job, type User } from "../utility/state.js";
import { MatchingService } from "../utility/matching.js";
import { StorageService } from "../utility/storage.js";

interface PipelineItem extends Job {
    status: "wishlist" | "applied" | "interviewing" | "offer" | "rejected" | "closed";
    movedAt: string;
}

document.addEventListener("DOMContentLoaded", async () => {
    const sessionUser = GlobalState.getSession();
    if (!sessionUser) {
        window.location.href = "../public-screens/login.html";
        return;
    }

    // Ensure user and skills are fully defined and never null/undefined
    const user: User = {
        ...sessionUser,
        skills: sessionUser.skills || []
    };

    const userNameEl = document.getElementById("user-name") as HTMLElement;
    if (userNameEl) userNameEl.textContent = user.name;

    // Fetch live API jobs first, cache them to GlobalState, then load merged jobs (API + Admin)
    try {
        const apiJobs = await ApiService.fetchJobs();
        GlobalState.setJobs(apiJobs);
    } catch (error) {
        console.warn("Could not fetch remote jobs, proceeding with fallback and admin data.", error);
    }

    let jobs = GlobalState.getJobs();
    let pipeline: PipelineItem[] = StorageService.load<PipelineItem[]>(`pipeline_${user.email}`) || [];

    // Tab Navigation Logic
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".content-section");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            sections.forEach(s => (s as HTMLElement).style.display = "none");

            link.classList.add("active");
            const targetId = link.getAttribute("data-target");
            if (targetId) {
                const targetSec = document.getElementById(targetId);
                if (targetSec) {
                    targetSec.style.display = "block";
                    // Refresh jobs and feed whenever switching tabs to pull newly created admin jobs
                    if (targetId === "discovery" || targetId === "job-board") {
                        jobs = GlobalState.getJobs();
                        renderFeed();
                    }
                }
            }
        });
    });

    // Render Discovery Feed
    const jobFeedEl = document.getElementById("job-feed") as HTMLElement;
    const searchInput = document.getElementById("search-input") as HTMLInputElement;
    const matchFilter = document.getElementById("match-filter") as HTMLSelectElement;

    function renderFeed() {
        if (!jobFeedEl) return;
        
        // Refresh jobs from GlobalState so newly added admin posts appear instantly
        jobs = GlobalState.getJobs();

        const query = searchInput?.value.toLowerCase() || "";
        const minMatch = parseInt(matchFilter?.value || "0", 10);

        const scoredJobs = jobs.map(job => ({
            job,
            score: MatchingService.calculateMatch(user, job)
        })).filter(item => item.score >= minMatch);

        scoredJobs.sort((a, b) => b.score - a.score);

        const filtered = scoredJobs.filter(item => 
            item.job.title.toLowerCase().includes(query) ||
            item.job.company.toLowerCase().includes(query) ||
            item.job.skills.some(s => s.toLowerCase().includes(query))
        );

        if (filtered.length === 0) {
            jobFeedEl.innerHTML = `<p style="color: var(--text-muted);">No matching listings found.</p>`;
            return;
        }

        jobFeedEl.innerHTML = filtered.map(({ job, score }) => {
            const isInPipeline = pipeline.some(p => p.id === job.id);
            return `
                <div class="pipeline-card" style="padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">✨ ${score}% Match</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${job.salary || 'Competitive'}</span>
                    </div>
                    <h3 class="pipeline-card-title" style="margin-top: 0.5rem;">${job.title}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${job.company}</p>
                    <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.5rem;">
                        ${job.skills.slice(0, 3).map(s => `<span style="font-size: 0.7rem; background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 4px;">${s}</span>`).join('')}
                    </div>
                    <button class="btn btn-primary add-pipeline-btn" data-job-id="${job.id}" ${isInPipeline ? 'disabled style="background:#94a3b8;"' : ''} style="margin-top: 1rem; width: 100%; padding: 0.5rem;">
                        ${isInPipeline ? 'In Pipeline ✓' : 'Add to Wishlist'}
                    </button>
                </div>
            `;
        }).join('');

        document.querySelectorAll(".add-pipeline-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const jobId = (e.currentTarget as HTMLElement).getAttribute("data-job-id");
                const targetJob = jobs.find(j => j.id === jobId);
                if (targetJob && !pipeline.some(p => p.id === jobId)) {
                    pipeline.push({ ...targetJob, status: "wishlist", movedAt: new Date().toISOString() });
                    StorageService.save(`pipeline_${user.email}`, pipeline);
                    renderFeed();
                    renderPipeline();
                    computeStats();
                }
            });
        });
    }

    searchInput?.addEventListener("input", renderFeed);
    matchFilter?.addEventListener("change", renderFeed);
    renderFeed();

    // Render Pipeline Board Columns
    function renderPipeline() {
        const statuses: ("wishlist" | "applied" | "interviewing"| "offer"| "rejected" | "closed")[] = ["wishlist", "applied", "interviewing", "offer", "rejected", "closed"];
        
        statuses.forEach(status => {
            const container = document.getElementById(`col-${status}`);
            if (!container) return;

            const items = pipeline.filter(p => p.status === status);
            if (items.length === 0) {
                container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem;">Empty</p>`;
                return;
            }

            container.innerHTML = items.map(item => {
                const daysInCol = Math.floor((Date.now() - new Date(item.movedAt).getTime()) / (1000 * 60 * 60 * 24));
                const isStale = status === "applied" && daysInCol > 14;

                return `
                    <div class="pipeline-card">
                        ${isStale ? '<span style="font-size: 0.7rem; background: #fee2e2; color: #dc2626; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: bold;">⚠️ Stale (>14 days)</span>' : ''}
                        <div class="pipeline-card-title">${item.title}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${item.company}</div>
                        <div class="pipeline-card-actions">
                            ${status !== 'wishlist' ? `<button class="move-card" data-id="${item.id}" data-dir="prev">← Prev</button>` : '<span></span>'}
                            ${status !== 'closed' ? `<button class="move-card" data-id="${item.id}" data-dir="next">Next →</button>` : '<span></span>'}
                        </div>
                    </div>
                `;
            }).join('');
        });

        document.querySelectorAll(".move-card").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget as HTMLElement;
                const id = target.getAttribute("data-id");
                const dir = target.getAttribute("data-dir");
                const flow: ("wishlist" | "applied" | "interviewing" | "offer" | "rejected" | "closed")[] = ["wishlist", "applied", "interviewing",  "offer", "rejected", "closed"];

                const item = pipeline.find(p => p.id === id);
                if (item) {
                    const currentIndex = flow.indexOf(item.status);
                    const nextIndex = dir === "next" ? currentIndex + 1 : currentIndex - 1;
                    if (nextIndex >= 0 && nextIndex < flow.length) {
                        item.status = flow[nextIndex]!;
                        item.movedAt = new Date().toISOString();
                        StorageService.save(`pipeline_${user.email}`, pipeline);
                        renderPipeline();
                        computeStats();
                    }
                }
            });
        });
    }
    renderPipeline();

    // Skills Profile & Stats
    const skillsContainer = document.getElementById("skills-container") as HTMLElement;
    const newSkillInput = document.getElementById("new-skill-input") as HTMLInputElement;
    const addSkillBtn = document.getElementById("add-skill-btn") as HTMLButtonElement;

    function renderSkills() {
        if (!skillsContainer) return;
        skillsContainer.innerHTML = (user.skills ?? []).map(skill => `
            <span class="skill-tag-badge">
                ${skill} <button class="remove-skill" data-skill="${skill}">×</button>
            </span>
        `).join('');

        document.querySelectorAll(".remove-skill").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const sk = (e.currentTarget as HTMLElement).getAttribute("data-skill");
                user.skills = (user.skills ?? []).filter(s => s !== sk);
                GlobalState.setSession(user);
                renderSkills();
                renderFeed();
            });
        });
    }
    renderSkills();

    addSkillBtn?.addEventListener("click", () => {
        const val = newSkillInput?.value.trim();
        if (val && !(user.skills ?? []).includes(val)) {
            user.skills = [...(user.skills ?? []), val];
            GlobalState.setSession(user);
            newSkillInput.value = "";
            renderSkills();
            renderFeed();
        }
    });

    function computeStats() {
        const totalApplied = pipeline.filter(p => p.status !== "wishlist").length;
        const progressed = pipeline.filter(p => p.status === "interviewing" || p.status === "closed").length;
        const responseRate = totalApplied > 0 ? Math.round((progressed / totalApplied) * 100) : 0;

        const rateEl = document.getElementById("stat-response-rate");
        const monthlyEl = document.getElementById("stat-monthly-apps");

        if (rateEl) rateEl.textContent = `${responseRate}%`;
        if (monthlyEl) monthlyEl.textContent = totalApplied.toString();
    }
    computeStats();

    document.getElementById("logout-btn")?.addEventListener("click", () => {
        GlobalState.clearSession();
        window.location.href = "../public-screens/login.html";
    });
});