/**
 * Global Application State Management
 * Holds runtime data for user sessions, jobs, and filters.
 */

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
    private jobs: Job[] = [];
    private applications: Application[] = [];

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

    // Job Data Methods
    setJobs(jobs: Job[]): void {
        // Keep track of runtime jobs passed (e.g. from API)
        this.jobs = jobs;
    }

    getJobs(): Job[] {
        const customJobs = StorageService.load<Job[]>("admin_custom_jobs") || [];
        
        // Fallback default jobs if everything else is empty (prevents blank screens due to network/API issues)
        const defaultJobs: Job[] = this.jobs.length > 0 ? this.jobs : [
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

        // Combine runtime/API jobs with saved custom admin jobs dynamically
        const allJobsMap = new Map<string, Job>();
        
        // Load custom admin jobs first so they appear at the top, followed by runtime/API/default jobs
        customJobs.forEach(job => allJobsMap.set(job.id, job));
        defaultJobs.forEach(job => {
            if (!allJobsMap.has(job.id)) {
                allJobsMap.set(job.id, job);
            }
        });

        return Array.from(allJobsMap.values());
    }

    addJob(job: Job): void {
        // Add to runtime memory
        this.jobs.unshift(job);
        
        // Persist admin-created jobs immediately to storage
        const customJobs = StorageService.load<Job[]>("admin_custom_jobs") || [];
        // Prevent duplicate entries in storage
        const filtered = customJobs.filter(j => j.id !== job.id);
        filtered.unshift(job);
        StorageService.save("admin_custom_jobs", filtered);
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