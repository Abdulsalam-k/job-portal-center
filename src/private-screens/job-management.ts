import { ApiService } from "../api/api-services.js";
import { GlobalState, type Job } from "../utility/state.js";
import { StorageService } from "../utility/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
    const adminUser = GlobalState.getSession();
    const adminNameEl = document.getElementById("admin-name") as HTMLElement;
    const adminJobForm = document.getElementById("admin-job-form") as HTMLFormElement;
    const adminJobListEl = document.getElementById("admin-job-list") as HTMLElement;
    const totalJobsEl = document.getElementById("total-jobs-count") as HTMLElement;
    const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;

    if (!adminUser || adminUser.role !== "admin") {
        window.location.href = "../public-screens/login.html";
        return;
    }

    if (adminNameEl) {
        adminNameEl.textContent = adminUser.name;
    }

    let editingJobId: string | null = null;

    try {
        const apiJobs = await ApiService.fetchJobs();
        GlobalState.setJobs(apiJobs);
    } catch (error) {
        console.warn("Could not fetch remote jobs for admin background sync.", error);
    }

    renderAdminDashboard();

    
    adminJobForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const titleInput = document.getElementById("job-title") as HTMLInputElement;
        const companyInput = document.getElementById("job-company") as HTMLInputElement;
        const salaryInput = document.getElementById("job-salary") as HTMLInputElement;
        const skillsInput = document.getElementById("job-skills") as HTMLInputElement;
        const descInput = document.getElementById("job-desc") as HTMLTextAreaElement;
        const submitBtn = adminJobForm.querySelector("button[type='submit']") as HTMLButtonElement;

        if (!titleInput || !companyInput || !descInput) return;

        const title = titleInput.value.trim();
        const company = companyInput.value.trim();
        const salary = salaryInput && salaryInput.value ? salaryInput.value.trim() : "Competitive";
        const skills = skillsInput && skillsInput.value ? skillsInput.value.split(",").map(s => s.trim()).filter(Boolean) : ["TypeScript", "General"];
        const description = descInput.value.trim();

        if (editingJobId) {
        
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

        
            editingJobId = null;
            if (submitBtn) submitBtn.textContent = "Publish Job Listing";
            alert("Job listing updated successfully!");
        } else {
        
            const newJob: Job = {
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

        
        adminJobForm.reset();
        renderAdminDashboard();
    });

    logoutBtn?.addEventListener("click", () => {
        GlobalState.clearSession();
        window.location.href = "../public-screens/login.html";
    });

    function renderAdminDashboard() {
        const currentJobs = GlobalState.getJobs();
        
        if (totalJobsEl) {
            totalJobsEl.textContent = currentJobs.length.toString();
        }

        if (!adminJobListEl) return;

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

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget as HTMLElement;
                const jobId = target.getAttribute("data-job-id");
                const targetJob = GlobalState.getAdminJobs().find(j => j.id === jobId);

                if (!targetJob) return;

            
                const titleInput = document.getElementById("job-title") as HTMLInputElement;
                const companyInput = document.getElementById("job-company") as HTMLInputElement;
                const salaryInput = document.getElementById("job-salary") as HTMLInputElement;
                const skillsInput = document.getElementById("job-skills") as HTMLInputElement;
                const descInput = document.getElementById("job-desc") as HTMLTextAreaElement;
                const submitBtn = adminJobForm.querySelector("button[type='submit']") as HTMLButtonElement;

                if (titleInput) titleInput.value = targetJob.title;
                if (companyInput) companyInput.value = targetJob.company;
                if (salaryInput) salaryInput.value = targetJob.salary || "";
                if (skillsInput) skillsInput.value = targetJob.skills ? targetJob.skills.join(", ") : "";
                if (descInput) descInput.value = targetJob.description || "";

                editingJobId = targetJob.id;
                if (submitBtn) submitBtn.textContent = "Update Job Listing";

            
                adminJobForm.scrollIntoView({ behavior: "smooth" });
            });
        });

    
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget as HTMLElement;
                const jobId = target.getAttribute("data-job-id");
                
                if (jobId) {
                    GlobalState.deleteAdminJob(jobId);
                }
                if (editingJobId === jobId) {
                    editingJobId = null;
                    adminJobForm.reset();
                    const submitBtn = adminJobForm.querySelector("button[type='submit']") as HTMLButtonElement;
                    if (submitBtn) submitBtn.textContent = "Publish Job Listing";
                }

                renderAdminDashboard();
            });
        });
    }
});