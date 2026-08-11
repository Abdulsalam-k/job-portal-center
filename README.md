# Talent Command Center & Job Board Portal

A modern, frontend-focused career management platform and job board application built with TypeScript, Vite, and Modular CSS. 
It bridges the gap between raw job discovery and personal career tracking, featuring a custom skill-matching engine, a multi-stage Kanban pipeline,
real-time analytics, and persistent state management using browser local storage.

---

## 🚀 Key Features

* **Live Job Discovery & Search Feed:** Aggregates job listings from external APIs and custom admin-created posts with instant keyword filtering (title, company, skills).
* **Dynamic Skill-Matching Algorithm:** Cross-references a user's live skill profile against job requirements in real-time,
*  calculating a precise compatibility percentage score and automatically sorting the feed from highest to lowest match.
* **Match Threshold Filtering:** Allows job seekers to filter out low-probability listings by setting minimum match percentage thresholds (e.g., 50%+).
* **Multi-Stage Career Pipeline (Kanban Board):** A fully interactive 6-stage tracker (Wishlist $\rightarrow$ Applied $\rightarrow$ Interviewing $\rightarrow$ Offer $\rightarrow$ Rejected $\rightarrow$ Closed)
*  allowing talents to manage their application journey.
* **Exact Timestamps & Relative Tracking:** Automatically logs precise application dates and times alongside friendly relative time displays for every stage transition.
* **Real-Time Job Analytics Dashboard:** Dynamically calculates and displays performance metrics including **Response Rate**, **Monthly Application Volume**, and **Average Time-to-First-Response**.
* **Smart Stale Application Detection:** Automatically flags applications stuck in the "Applied" stage for more than 14 days using a custom date utility.
* **Pipeline Notes & Reminders:** Enables users to attach, edit, and persist interview notes and follow-up reminders directly onto individual pipeline cards.
* **Admin Management Portal:** Dedicated administrative views for publishing, editing, and overseeing job postings across the system.

---

## 🛠️ Tech Stack

* **Language:** TypeScript (Strict typing for robust state and data safety)
* **Build Tool:** Vite (Lightning-fast development and bundling)
* **Styling:** Custom Modular CSS / Responsive Layouts
* **Persistence:** Browser localStorage abstraction layer via a custom `StorageService`
* **Architecture:** Modular component/service pattern with clear separation of concerns (API services, state management, match calculation utilities, analytics computation, and date formatters).

---

## 📁 Project Architecture

Plaintext
src/
├── api/             # External job API integrations and fetch handlers
├── admin/           # Admin panel management logic and controllers
├── talent/          # Talent dashboard controller (job-board.ts)
└── utility/         # Core helper modules
    ├── matching.ts     # Skill intersection and percentage calculation engine
    ├── date-formatter.ts # Precise timestamps, relative time parsing, and staleness checks
    ├── pipeline-notes.ts # Note state persistence handlers
    ├── state.ts        # Global session and application state management
    └── storage.ts      # LocalStorage wrapper service

---

## ⚙️ Getting Started & Installation

To run this project locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
