FinArea: AI-Powered Personal Finance Tracking & Budget Planning Application
<img width="701" height="701" alt="image" src="https://github.com/user-attachments/assets/675cfa97-4de6-434a-ab39-89ed584c1431" />


🚀 Project Overview
FinArea is an AI-powered personal finance application designed to help users understand, track, and improve their spending habits. It provides intelligent solutions for individuals who want to gain full visibility over their financial behavior and make smarter decisions about their money.
By analyzing bank statements and transaction data, FinArea automatically categorizes expenses into clear and understandable groups such as groceries, dining, subscriptions, and bills. It leverages advanced natural language processing models, including Google Gemini, OpenAI GPT-4, and DeepSeek, to interpret financial data and produce personalized budget recommendations in natural language. These insights guide users on how to better manage their money from month to month.
The main purpose of FinArea is to simplify personal budgeting by eliminating manual tracking and replacing it with intelligent automation. With FinArea, users no longer need to rely on spreadsheets or generic budget templates. Instead, they receive tailored forecasts and recommendations based on their actual spending behavior. This makes budgeting more precise, relevant, and sustainable in the long term.
FinArea is especially suitable for:
•	University students who want to track daily expenses and avoid overspending,
•	Young professionals aiming to save more efficiently,
•	Families who seek a consolidated view of household expenses.
What makes FinArea unique is its clean and interactive dashboard that presents visual breakdowns of spending through bar charts, pie charts, and trend graphs. Additionally, it offers the ability to set custom budget goals and receive alerts if spending exceeds those limits. The application also supports encrypted data uploads (e.g., CSV, PDF) and ensures user privacy by following best practices in data security.
In the future, FinArea aims to integrate with live banking APIs (like Plaid) to automate statement retrieval, add debt tracking, and provide investment overviews — transforming it from a budgeting tool into a full-scale financial wellness platform.
With FinArea, personal finance becomes smarter, simpler, and more personalized than ever.

-The finarea frontend offers a user-centric interface to make personal finance management intuitive and insightful. It connects to the powerful backend API to deliver a seamless experience, allowing users to:
Register and log in securely to their personal finance dashboard.
Upload PDF bank statements for automated AI-powered analysis.
View detailed, period-based spending summaries through interactive charts and graphs.
Understand their spending habits with automatically categorized transactions.
Receive and review AI-generated budget forecasts and financial advice.

✨ Key Features
Secure Authentication: JWT-based login and registration flows with protected routes.
Interactive Dashboard: A central hub to view spending overviews, recent transactions, and budget goals.
Data Visualization: Utilizes charts (e.g., using Chart.js, Recharts, or a similar library) to display spending breakdowns by category and source.
Responsive Design: A fully responsive interface built with Tailwind CSS, ensuring a great experience on both desktop and mobile devices.
PDF Upload Interface: A simple and secure interface to upload bank statements for backend processing.
State Management: Efficiently manages application state for a smooth and reactive user experience.
Typed Codebase: Built with TypeScript for enhanced code quality, maintainability, and fewer runtime errors.

🖼️ Screenshots

<img width="1125" height="576" alt="image" src="https://github.com/user-attachments/assets/610afe37-619f-47c3-9935-c129190d50b0" />
<img width="1163" height="602" alt="image" src="https://github.com/user-attachments/assets/2e784c7a-5a69-493e-a968-0bec0006bcf3" />
<img width="1141" height="591" alt="image" src="https://github.com/user-attachments/assets/17b974d7-be6c-4471-9dfb-573aa31cf91d" />
<img width="1160" height="599" alt="image" src="https://github.com/user-attachments/assets/ab162a90-ee3b-477d-baf4-f755515a09b0" />
<img width="1073" height="496" alt="image" src="https://github.com/user-attachments/assets/7ff625ae-3ad9-45ae-b422-004e7bd1b648" />

<img width="1037" height="484" alt="image" src="https://github.com/user-attachments/assets/636e8f53-be04-41b9-8729-c9de7d854eb7" />
<img width="975" height="454" alt="image" src="https://github.com/user-attachments/assets/9d5d27e2-7c5e-4fe6-ab2d-96942526a77c" />
<img width="975" height="459" alt="image" src="https://github.com/user-attachments/assets/39c64c6e-9d03-4e73-b673-8ad791be1b9d" />
<img width="789" height="464" alt="image" src="https://github.com/user-attachments/assets/7197be87-91f8-43af-958b-c3e0a31dad39" />
<img width="884" height="719" alt="image" src="https://github.com/user-attachments/assets/c093e6ec-1551-43b4-9ba0-89000f65caf9" />
<img width="975" height="343" alt="image" src="https://github.com/user-attachments/assets/7420d6d7-9ab3-4db9-a065-0d01845d7f5a" />

<img width="974" height="461" alt="image" src="https://github.com/user-attachments/assets/0f09ff1f-0fc1-44b0-bbd7-3ab3a41ad4e4" />
<img width="961" height="461" alt="image" src="https://github.com/user-attachments/assets/86ff9d17-f38d-4abf-9f30-3ef8df69de2d" />
<img width="1023" height="67" alt="image" src="https://github.com/user-attachments/assets/53fc93db-9fd0-4701-b0fa-73464e67f4dc" />
<img width="1103" height="248" alt="image" src="https://github.com/user-attachments/assets/12f11c4f-5db0-41f5-b7a0-6ec04d4c5d31" />
<img width="1110" height="647" alt="image" src="https://github.com/user-attachments/assets/7aa52203-212a-44c6-a978-6b19451fd307" />
<img width="975" height="274" alt="image" src="https://github.com/user-attachments/assets/b00c86d3-90c5-4bac-a713-a3a1016379e4" />


🛠️ Tech Stack
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Components: Shadcn/ui, Radix UI, or similar component libraries (if used)
Data Fetching: Axios / fetch API
State Management: React Context / Zustand / Redux Toolkit (specify which one you used)
Charts: Chart.js / Recharts (specify which one you used)
Package Manager: npm / yarn / pnpm


⚙️ Setup and Installation
Follow these steps to get the frontend running on your local machine.
Prerequisites
Node.js v18.17+
npm, yarn, or pnpm
The finarea Backend must be running locally (usually on http://localhost:8080).

1. Clone the Repository
-Generated bash
git clone [FRONTEND_REPO_URL]
cd finarea-frontend
2. Install Dependencies
Choose the command corresponding to your package manager:
-Generated bash
npm install
# or
yarn install
# or
pnpm install
3. Configure Environment Variables
Create a new file named .env.local in the root of the project.
Add the backend API's base URL to this file. This ensures the frontend knows where to send API requests.
Generated env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
4. Run the Development Server
-Generated bash
npm run dev
# or
yarn dev
# or
pnpm dev

-Open http://localhost:3000 with your browser to see the result.



