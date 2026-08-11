import { StorageService } from "./storage.js";

export interface User {
    email: string;
    role: "talent" | "admin";
    name: string;
    skills?: string[];
}

export interface Job {
    id: string;
    title: string;
    company: string;
    source: "api" | "admin";
    skills: string[];
    salary?: string;
    description: string;
    dateAdded: string;
}

export interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: "applied" | "interview" | "offer" | "rejected";
    appliedDate: string;
}

class AppState {
    private currentUser: User | null = null;
    private apiJobs: Job[] = [];
    private applications: Application[] = [];
    private readonly ADMIN_STORAGE_KEY = "admin_custom_jobs";

    constructor() {
        // Load initial user session and applications from storage if available
        this.currentUser = StorageService.load<User>("current_user");
        this.applications = StorageService.load<Application[]>("user_applications") || [];
    }

    // User Session Methods
    setSession(user: User): void {
        this.currentUser = user;
        StorageService.save("current_user", user);
    }

    getSession(): User | null {
        return this.currentUser;
    }

    clearSession(): void {
        this.currentUser = null;
        StorageService.remove("current_user");
    }

    // Job Data Methods (Separated API vs Admin Architecture)
    
    /**
     * Set or update jobs successfully fetched from the external API
     */
    setJobs(jobs: Job[]): void {
        this.apiJobs = jobs;
    }

    /**
     * Get combined jobs for UI display (Admin Custom Jobs + API Jobs + Fallbacks)
     * Neither data source affects or blocks the other.
     */
    getJobs(): Job[] {
        const adminJobs = StorageService.load<Job[]>(this.ADMIN_STORAGE_KEY) || [];
        
        // Fallback default jobs used only if both API and Admin lists are completely empty
        const fallbackJobs: Job[] = [
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

        // Determine active API source: use runtime fetched apiJobs if available, otherwise fall back
        const activeApiJobs = this.apiJobs.length > 0 ? this.apiJobs : fallbackJobs;

        // Combine them cleanly using a Map to ensure unique IDs (Admin jobs prioritized first)
        const allJobsMap = new Map<string, Job>();
        
        adminJobs.forEach(job => allJobsMap.set(job.id, job));
        activeApiJobs.forEach(job => {
            if (!allJobsMap.has(job.id)) {
                allJobsMap.set(job.id, job);
            }
        });

        return Array.from(allJobsMap.values());
    }

    /**
     * Get strictly admin-created jobs for the Admin Management panel
     */
    getAdminJobs(): Job[] {
        return StorageService.load<Job[]>(this.ADMIN_STORAGE_KEY) || [];
    }

    /**
     * Add a new job created explicitly from the Admin panel
     */
    addJob(job: Job): void {
        const adminJobs = StorageService.load<Job[]>(this.ADMIN_STORAGE_KEY) || [];
        
        // Prevent duplicate entries in storage and add to the top
        const filtered = adminJobs.filter(j => j.id !== job.id);
        filtered.unshift(job);
        
        StorageService.save(this.ADMIN_STORAGE_KEY, filtered);
    }

    /**
     * Delete an admin-created job by ID
     */
    deleteAdminJob(id: string): void {
        let adminJobs = StorageService.load<Job[]>(this.ADMIN_STORAGE_KEY) || [];
        adminJobs = adminJobs.filter(j => j.id !== id);
        StorageService.save(this.ADMIN_STORAGE_KEY, adminJobs);
    }

    // Application Management Methods
    getApplications(): Application[] {
        return this.applications;
    }

    addApplication(app: Application): void {
        this.applications.unshift(app);
        StorageService.save("user_applications", this.applications);
    }

    updateApplicationStatus(id: string, status: Application["status"]): void {
        const app = this.applications.find(a => a.id === id);
        if (app) {
            app.status = status;
            StorageService.save("user_applications", this.applications);
        }
    }
}

// Export a single shared instance (Singleton pattern)
export const GlobalState = new AppState();