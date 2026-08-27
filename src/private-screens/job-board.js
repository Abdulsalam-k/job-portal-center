import { ApiService } from "../api/api-services.js";
import { GlobalState } from "../utility/state.js";
import { MatchingService } from "../utility/matching.js";
import { StorageService } from "../utility/storage.js";
import { DateFormatter } from "../utility/date-formatter.js";
document.addEventListener("DOMContentLoaded", async () => {
    const sessionUser = GlobalState.getSession();
    if (!sessionUser) {
        window.location.href = "../public-screens/login.html";
        return;
    }
    const user = {
        ...sessionUser,
        skills: sessionUser.skills || []
    };
    const userNameEl = document.getElementById("user-name");
    if (userNameEl)
        userNameEl.textContent = user.name;
    try {
        const apiJobs = await ApiService.fetchJobs();
        GlobalState.setJobs(apiJobs);
    }
    catch (error) {
        console.warn("Could not fetch remote jobs, proceeding with fallback and admin data.", error);
    }
    let jobs = GlobalState.getJobs();
    let pipeline = StorageService.load(`pipeline_${user.email}`) || [];
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".content-section");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            sections.forEach(s => s.style.display = "none");
            link.classList.add("active");
            const targetId = link.getAttribute("data-target");
            if (targetId) {
                const targetSec = document.getElementById(targetId);
                if (targetSec) {
                    targetSec.style.display = "block";
                    if (targetId === "discovery" || targetId === "job-board") {
                        jobs = GlobalState.getJobs();
                        renderFeed();
                    }
                }
            }
        });
    });
    const jobFeedEl = document.getElementById("job-feed");
    const searchInput = document.getElementById("search-input");
    const matchFilter = document.getElementById("match-filter");
    function renderFeed() {
        if (!jobFeedEl)
            return;
        jobs = GlobalState.getJobs();
        const query = searchInput?.value.toLowerCase() || "";
        const minMatch = parseInt(matchFilter?.value || "0", 10);
        const scoredJobs = jobs.map(job => ({
            job,
            score: MatchingService.calculateMatch(user, job)
        })).filter(item => item.score >= minMatch);
        scoredJobs.sort((a, b) => b.score - a.score);
        const filtered = scoredJobs.filter(item => item.job.title.toLowerCase().includes(query) ||
            item.job.company.toLowerCase().includes(query) ||
            item.job.skills.some(s => s.toLowerCase().includes(query)));
        if (filtered.length === 0) {
            jobFeedEl.innerHTML = `<p style="color: var(--text-muted);">No matching listings found.</p>`;
            return;
        }
        jobFeedEl.innerHTML = filtered.map(({ job, score }) => {
            const isInPipeline = pipeline.some(p => p.id === job.id);
            const jobUrl = job.url || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company)}`;
            return `
                <div class="pipeline-card" style="padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">✨ ${score}% Match</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${job.salary || 'Competitive'}</span>
                    </div>
                    <h3 style="margin-top: 0.5rem;">
                        <a href="${jobUrl}" target="_blank" rel="noopener noreferrer" class="job-title-link" style="color: var(--text-main); text-decoration: none; font-size: 0.95rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">
                            ${job.title} <span style="font-size: 0.75rem; opacity: 0.7;">↗</span>
                        </a>
                    </h3>
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
                const jobId = e.currentTarget.getAttribute("data-job-id");
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
    function renderPipeline() {
        const statuses = ["wishlist", "applied", "interviewing", "offer", "rejected", "closed"];
        statuses.forEach(status => {
            const container = document.getElementById(`col-${status}`);
            if (!container)
                return;
            const items = pipeline.filter(p => p.status === status);
            if (items.length === 0) {
                container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem;">Empty</p>`;
                return;
            }
            container.innerHTML = items.map(item => {
                const isStale = DateFormatter.isOlderThanDays(item.movedAt, 14) && status === "applied";
                const timeAgo = DateFormatter.formatRelative(item.movedAt);
                const exactTime = DateFormatter.formatExact(item.movedAt);
                const jobUrl = item.url || `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + item.company)}`;
                return `
                    <div class="pipeline-card" style="position: relative; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                            <span style="font-size: 0.65rem; color: var(--text-muted);" title="Exact: ${exactTime}">📅 ${timeAgo}</span>
                            <div style="display: flex; gap: 0.4rem; align-items: center;">
                                ${isStale ? '<span style="font-size: 0.65rem; background: #fee2e2; color: #dc2626; padding: 0.1rem 0.3rem; border-radius: 4px; font-weight: bold;">⚠️ Stale</span>' : ''}
                                <button class="remove-pipeline-btn" data-id="${item.id}" style="background: none; border: none; cursor: pointer; font-size: 0.85rem;" title="Remove from Pipeline">🗑️</button>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 0.3rem;">
                            <div style="font-weight: 600; font-size: 0.95rem;">
                                <a href="${jobUrl}" target="_blank" rel="noopener noreferrer" class="job-title-link" style="color: #0f172a; text-decoration: none; display: inline-flex; align-items: center; gap: 0.2rem;">
                                    ${item.title} <span style="font-size: 0.7rem; opacity: 0.7;">↗</span>
                                </a>
                            </div>
                            <button class="note-btn" data-id="${item.id}" data-note="${item.note || ''}" style="background: none; border: none; cursor: pointer; font-size: 0.9rem;" title="Add/Edit Note">
                                ${item.note ? '📝' : '➕📝'}
                            </button>
                        </div>
                        
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem;">${item.company}</div>
                        
                        ${item.note ? `<div style="font-size: 0.75rem; background: #f8fafc; border-left: 3px solid var(--primary); padding: 0.3rem 0.5rem; margin-top: 0.4rem; border-radius: 4px; color: var(--text-main);"><strong>Note:</strong> ${item.note}</div>` : ''}

                        <div class="pipeline-card-actions" style="margin-top: 0.75rem; display: flex; justify-content: space-between; gap: 0.5rem;">
                            ${status !== 'wishlist' ? `<button class="move-card btn-sm" data-id="${item.id}" data-dir="prev" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 4px;">← Prev</button>` : '<span></span>'}
                            ${status !== 'closed' ? `<button class="move-card btn-sm" data-id="${item.id}" data-dir="next" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 4px;">Next →</button>` : '<span></span>'}
                        </div>
                    </div>
                `;
            }).join('');
        });
        document.querySelectorAll(".remove-pipeline-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const id = target.getAttribute("data-id");
                if (confirm("Are you sure you want to remove this job from your pipeline? It will be returned to your job discovery feed.")) {
                    pipeline = pipeline.filter(p => p.id !== id);
                    StorageService.save(`pipeline_${user.email}`, pipeline);
                    renderPipeline();
                    renderFeed();
                    computeStats();
                }
            });
        });
        document.querySelectorAll(".note-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const id = target.getAttribute("data-id");
                const currentNote = target.getAttribute("data-note") || "";
                const newNote = prompt("Add interview notes or follow-up reminders:", currentNote);
                if (newNote !== null) {
                    const item = pipeline.find(p => p.id === id);
                    if (item) {
                        item.note = newNote.trim();
                        StorageService.save(`pipeline_${user.email}`, pipeline);
                        renderPipeline();
                    }
                }
            });
        });
        document.querySelectorAll(".move-card").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const id = target.getAttribute("data-id");
                const dir = target.getAttribute("data-dir");
                const flow = ["wishlist", "applied", "interviewing", "offer", "rejected", "closed"];
                const item = pipeline.find(p => p.id === id);
                if (item) {
                    const currentIndex = flow.indexOf(item.status);
                    const nextIndex = dir === "next" ? currentIndex + 1 : currentIndex - 1;
                    if (nextIndex >= 0 && nextIndex < flow.length) {
                        item.status = flow[nextIndex];
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
    const skillsContainer = document.getElementById("skills-container");
    const newSkillInput = document.getElementById("new-skill-input");
    const addSkillBtn = document.getElementById("add-skill-btn");
    function renderSkills() {
        if (!skillsContainer)
            return;
        skillsContainer.innerHTML = (user.skills ?? []).map(skill => `
            <span class="skill-tag-badge">
                ${skill} <button class="remove-skill" data-skill="${skill}">×</button>
            </span>
        `).join('');
        document.querySelectorAll(".remove-skill").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const sk = e.currentTarget.getAttribute("data-skill");
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
        const progressed = pipeline.filter(p => p.status === "interviewing" || p.status === "offer" || p.status === "closed").length;
        const responseRate = totalApplied > 0 ? Math.round((progressed / totalApplied) * 100) : 0;
        const respondedItems = pipeline.filter(p => p.status === "interviewing" || p.status === "offer");
        let avgDays = "N/A";
        if (respondedItems.length > 0) {
            const totalDays = respondedItems.reduce((acc, item) => {
                const appliedDate = new Date(item.movedAt).getTime();
                const now = Date.now();
                const diffTime = Math.abs(now - appliedDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return acc + diffDays;
            }, 0);
            const average = Math.round(totalDays / respondedItems.length);
            avgDays = `${average} days`;
        }
        const rateEl = document.getElementById("stat-response-rate");
        const monthlyEl = document.getElementById("stat-monthly-apps");
        const timeEl = document.getElementById("stat-avg-time");
        if (rateEl)
            rateEl.textContent = `${responseRate}%`;
        if (monthlyEl)
            monthlyEl.textContent = totalApplied.toString();
        if (timeEl)
            timeEl.textContent = avgDays;
    }
    computeStats();
    document.getElementById("logout-btn")?.addEventListener("click", () => {
        GlobalState.clearSession();
        window.location.href = "../public-screens/login.html";
    });
});
