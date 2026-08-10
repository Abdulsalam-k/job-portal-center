/**
 * Admin Job Management Dashboard Controller
 * Handles administrator session verification, live job posting, editing, and listing deletion.
 */
import { ApiService } from "../api/api-services.js";
import { GlobalState } from "../utility/state.js";
import { StorageService } from "../utility/storage.js";
document.addEventListener("DOMContentLoaded", async () => {
    const adminUser = GlobalState.getSession();
    const adminNameEl = document.getElementById("admin-name");
    const adminJobForm = document.getElementById("admin-job-form");
    const adminJobListEl = document.getElementById("admin-job-list");
    const totalJobsEl = document.getElementById("total-jobs-count");
    const logoutBtn = document.getElementById("logout-btn");
    // Security check: Verify admin role privileges
    if (!adminUser || adminUser.role !== "admin") {
        window.location.href = "../public-screens/login.html";
        return;
    }
    if (adminNameEl) {
        adminNameEl.textContent = adminUser.name;
    }
    // Track editing state: holds the ID of the job currently being edited (if any)
    let editingJobId = null;
    // Fetch live API jobs first, then render admin control panel
    try {
        const apiJobs = await ApiService.fetchJobs();
        GlobalState.setJobs(apiJobs);
    }
    catch (error) {
        console.warn("Could not fetch remote jobs for admin background sync.", error);
    }
    renderAdminDashboard();
    // Handle posting or updating a job
    adminJobForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const titleInput = document.getElementById("job-title");
        const companyInput = document.getElementById("job-company");
        const salaryInput = document.getElementById("job-salary");
        const skillsInput = document.getElementById("job-skills");
        const descInput = document.getElementById("job-desc");
        const submitBtn = adminJobForm.querySelector("button[type='submit']");
        if (!titleInput || !companyInput || !descInput)
            return;
        const title = titleInput.value.trim();
        const company = companyInput.value.trim();
        const salary = salaryInput && salaryInput.value ? salaryInput.value.trim() : "Competitive";
        const skills = skillsInput && skillsInput.value ? skillsInput.value.split(",").map(s => s.trim()).filter(Boolean) : ["TypeScript", "General"];
        const description = descInput.value.trim();
        if (editingJobId) {
            // EDIT MODE: Update existing admin job safely through storage
            const adminJobs = GlobalState.getAdminJobs();
            const updatedAdminJobs = adminJobs.map(job => {
                if (job.id === editingJobId) {
                    return {
                        ...job,
                        title,
                        company,
                        salary,
                        skills,
                        description
                    };
                }
                return job;
            });
            StorageService.save("admin_custom_jobs", updatedAdminJobs);
            // Reset editing state and button text
            editingJobId = null;
            if (submitBtn)
                submitBtn.textContent = "Publish Job Listing";
            alert("Job listing updated successfully!");
        }
        else {
            // CREATE MODE: Add new admin job
            const newJob = {
                id: `admin-${Date.now()}`,
                title,
                company,
                source: "admin",
                skills,
                salary,
                description,
                dateAdded: new Date().toISOString()
            };
            GlobalState.addJob(newJob);
            alert("Job successfully published to the talent portal!");
        }
        // Reset form and re-render dashboard
        adminJobForm.reset();
        renderAdminDashboard();
    });
    // Logout handler
    logoutBtn?.addEventListener("click", () => {
        GlobalState.clearSession();
        window.location.href = "../public-screens/login.html";
    });
    function renderAdminDashboard() {
        const currentJobs = GlobalState.getJobs();
        if (totalJobsEl) {
            totalJobsEl.textContent = currentJobs.length.toString();
        }
        if (!adminJobListEl)
            return;
        if (currentJobs.length === 0) {
            adminJobListEl.innerHTML = `<p style="color: var(--text-muted); padding: 1rem;">No listings currently active on the portal.</p>`;
            return;
        }
        adminJobListEl.innerHTML = currentJobs.map(job => `
            <div style="background: var(--card-bg, #ffffff); border: 1px solid var(--border, #e2e8f0); border-radius: 10px; padding: 1.25rem; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: rgba(16, 185, 129, 0.1); color: #059669; padding: 0.2rem 0.5rem; border-radius: 4px;">${job.source}</span>
                        <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">${job.title}</h3>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${job.company} • ${job.salary || 'Competitive'}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    ${job.source === 'admin' ? `
                        <button class="btn edit-btn" data-job-id="${job.id}" style="background: rgba(37, 99, 235, 0.1); color: var(--primary, #2563eb); border: 1px solid #93c5fd; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: background 0.2s;">
                            Edit
                        </button>
                        <button class="btn delete-btn" data-job-id="${job.id}" style="background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid #f87171; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: background 0.2s;">
                            Remove
                        </button>
                    ` : '<span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">API Feed Item</span>'}
                </div>
            </div>
        `).join('');
        // Attach edit handlers for admin jobs only
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const jobId = target.getAttribute("data-job-id");
                const targetJob = GlobalState.getAdminJobs().find(j => j.id === jobId);
                if (!targetJob)
                    return;
                // Populate form fields with existing job data
                const titleInput = document.getElementById("job-title");
                const companyInput = document.getElementById("job-company");
                const salaryInput = document.getElementById("job-salary");
                const skillsInput = document.getElementById("job-skills");
                const descInput = document.getElementById("job-desc");
                const submitBtn = adminJobForm.querySelector("button[type='submit']");
                if (titleInput)
                    titleInput.value = targetJob.title;
                if (companyInput)
                    companyInput.value = targetJob.company;
                if (salaryInput)
                    salaryInput.value = targetJob.salary || "";
                if (skillsInput)
                    skillsInput.value = targetJob.skills ? targetJob.skills.join(", ") : "";
                if (descInput)
                    descInput.value = targetJob.description || "";
                // Set editing state and change submit button text to indicate update mode
                editingJobId = targetJob.id;
                if (submitBtn)
                    submitBtn.textContent = "Update Job Listing";
                // Scroll smoothly back up to the form
                adminJobForm.scrollIntoView({ behavior: "smooth" });
            });
        });
        // Attach delete handlers for admin jobs
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget;
                const jobId = target.getAttribute("data-job-id");
                if (jobId) {
                    GlobalState.deleteAdminJob(jobId);
                }
                // If user was editing this exact job and decided to delete it, reset the form
                if (editingJobId === jobId) {
                    editingJobId = null;
                    adminJobForm.reset();
                    const submitBtn = adminJobForm.querySelector("button[type='submit']");
                    if (submitBtn)
                        submitBtn.textContent = "Publish Job Listing";
                }
                renderAdminDashboard();
            });
        });
    }
});
//# sourceMappingURL=job-management.js.map