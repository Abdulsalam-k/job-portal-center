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
    url?: string;
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
    private apiJobs;
    private applications;
    private readonly ADMIN_STORAGE_KEY;
    constructor();
    setSession(user: User): void;
    getSession(): User | null;
    clearSession(): void;
    setJobs(jobs: Job[]): void;
    getJobs(): Job[];
    getAdminJobs(): Job[];
    addJob(job: Job): void;
    deleteAdminJob(id: string): void;
    getApplications(): Application[];
    addApplication(app: Application): void;
    updateApplicationStatus(id: string, status: Application["status"]): void;
}
export declare const GlobalState: AppState;
export {};
//# sourceMappingURL=state.d.ts.map