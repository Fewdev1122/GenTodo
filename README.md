# MindBalance: The Neuro-Inclusive Productivity Shield (Hackthon Demo) 

**MindBalance** is a smart, empathy-driven task management ecosystem designed specifically to support neurodivergent individuals (ADHD, Autism) and anyone prone to burnout. By integrating directly with Google Calendar and using our custom **Weighted Cognitive Load Algorithm**, we transform abstract stress into visual clarity.

---

## Features

- **The Burnout Shield:** A dynamic visual meter that calculates your real-time mental load.      
- **Google Calendar Sync:** Seamless bi-directional synchronization with your existing schedule.  
- **Galaxy View:** A spatial, interconnected task visualization to help with "Time Blindness."
- **Neuro-inclusive UI:** A distraction-free, high-contrast interface designed for focus.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Google OAuth 2.0 & Supabase Auth
- **APIs:** Google Calendar API (v3)
- **Deployment:** Vercel

## The Algorithm

We measure mental load using a weighted approach to ensure users don't overcommit:

```text
Load % = (Sum of Active Task Hours / Weekly Capacity) * 100

1. Installation & Setup
Clone the repository:
git clone [https://github.com/your-username/mindbalance.git](https://github.com/your-username/mindbalance.git)
cd mindbalance

2. Install dependencies:
npm install

3. Environment Variables: Create a .env file in the root directory and add your credentials
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
REACT_APP_GOOGLE_API_KEY=your_api_key
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key

4. Run the app:
npm run dev

Hackathon Achievements
Built with passion for the [MindBalance]. Our goal was to create "Digital Empathy"—technology that understands the human mind's limits.
