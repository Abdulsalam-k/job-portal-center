/**
 * Global Application State Management
 * Holds runtime data for user sessions, jobs, and filters.
 */
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
declare class AppState {
    private currentUser;
    private jobs;
    private applications;
    constructor();
    setSession(user: User): void;
    getSession(): User | null;
    clearSession(): void;
    setJobs(jobs: Job[]): void;
    getJobs(): Job[];
    addJob(job: Job): void;
    getApplications(): Application[];
    addApplication(app: Application): void;
    updateApplicationStatus(id: string, status: Application["status"]): void;
}
export declare const GlobalState: AppState;
export {};
//# sourceMappingURL=state.d.ts.map