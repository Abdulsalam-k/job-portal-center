import { StorageService } from "./storage.js";
export const PipelineNotes = {
    /**
     * Open a prompt or handle note editing for a specific job in the pipeline
     */
    editNote(email, jobId, currentNote = "", onUpdate) {
        const newNote = prompt("Add interview notes or follow-up reminders:", currentNote);
        if (newNote !== null) {
            const storageKey = `pipeline_${email}`;
            const pipeline = StorageService.load(storageKey) || [];
            const item = pipeline.find(p => p.id === jobId);
            if (item) {
                item.note = newNote.trim();
                StorageService.save(storageKey, pipeline);
                onUpdate(); // Callback to re-render the pipeline UI
            }
        }
    }
};
