# EcoLex

**EcoLex** is an environmental law chat assistant that helps you navigate regulations.

## About the Project

This project was built for academic purposes at **Politecnico di Milano** during the **Creativity, Science and Innovation (CSI)** course.

The project objective was to build a demo useful for Polimi students that leverages LLMs technology.

## Links

- **Project Report**: [EcoLex Report on Notion](https://superficial-light-8b4.notion.site/EcoLex-Report-2c4a79e7b9b780f5929ff88a36175a08?pvs=74)
- **Live Website**: [ecolex.lovable.app](https://ecolex.lovable.app)
- **Project Presentation**: [Gamma Presentation](https://gamma.app/docs/EcoLex-cpb4f21648gh17z)

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **UI Components**: shadcn/ui + Tailwind CSS
- **AI Integration**: Lovable Gateway + Gemini 2.5 Flash. 

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun package manager
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Kinshale/ecolex.git
   cd ecolex
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables
   ```bash
   # Create .env file with:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Authors

- Alessandro Aquilini
- Asia Ratti
- Jakub Paziewski

---

Built with ❤️ 