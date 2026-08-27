import { StorageService } from "./storage.js";
class AppState {
    currentUser = null;
    apiJobs = [];
    applications = [];
    ADMIN_STORAGE_KEY = "admin_custom_jobs";
    constructor() {
        this.currentUser = StorageService.load("current_user");
        this.applications = StorageService.load("user_applications") || [];
    }
    setSession(user) {
        this.currentUser = user;
        StorageService.save("current_user", user);
    }
    getSession() {
        return this.currentUser;
    }
    clearSession() {
        this.currentUser = null;
        StorageService.remove("current_user");
    }
    setJobs(jobs) {
        this.apiJobs = jobs;
    }
    getJobs() {
        const adminJobs = StorageService.load(this.ADMIN_STORAGE_KEY) || [];
        const fallbackJobs = [
            {
                id: "default-1",
                title: "Frontend TypeScript Developer",
                company: "TechCorp",
                source: "api",
                skills: ["TypeScript", "React", "CSS"],
                salary: "$90,000 - $120,000",
                description: "Build scalable web applications using TypeScript and modern frameworks.",
                dateAdded: new Date().toISOString()
            },
            {
                id: "default-2",
                title: "Full Stack Engineer",
                company: "Innovate Ltd",
                source: "api",
                skills: ["Node.js", "TypeScript", "SQL"],
                salary: "$110,000 - $140,000",
                description: "Work on robust backend services and seamless user interfaces.",
                dateAdded: new Date().toISOString()
            }
        ];
        const activeApiJobs = this.apiJobs.length > 0 ? this.apiJobs : fallbackJobs;
        const allJobsMap = new Map();
        adminJobs.forEach(job => allJobsMap.set(job.id, job));
        activeApiJobs.forEach(job => {
            if (!allJobsMap.has(job.id)) {
                allJobsMap.set(job.id, job);
            }
        });
        return Array.from(allJobsMap.values());
    }
    getAdminJobs() {
        return StorageService.load(this.ADMIN_STORAGE_KEY) || [];
    }
    addJob(job) {
        const adminJobs = StorageService.load(this.ADMIN_STORAGE_KEY) || [];
        const filtered = adminJobs.filter(j => j.id !== job.id);
        filtered.unshift(job);
        StorageService.save(this.ADMIN_STORAGE_KEY, filtered);
    }
    deleteAdminJob(id) {
        let adminJobs = StorageService.load(this.ADMIN_STORAGE_KEY) || [];
        adminJobs = adminJobs.filter(j => j.id !== id);
        StorageService.save(this.ADMIN_STORAGE_KEY, adminJobs);
    }
    // Application Management Methods
    getApplications() {
        return this.applications;
    }
    addApplication(app) {
        this.applications.unshift(app);
        StorageService.save("user_applications", this.applications);
    }
    updateApplicationStatus(id, status) {
        const app = this.applications.find(a => a.id === id);
        if (app) {
            app.status = status;
            StorageService.save("user_applications", this.applications);
        }
    }
}
export const GlobalState = new AppState();
//# sourceMappingURL=state.js.map