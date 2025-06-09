\# Joana's Portfolio & Blog Dashboard

\<p align="center"\>  
  \<img src="https://raw.githubusercontent.com/minixlip/joana-dashboard/main/app/icon.svg" width="100" alt="Project Icon"\>  
\</p\>

\<p align="center"\>  
  A custom-built, secure dashboard for managing the content of Joana Agostinho's personal portfolio and blog.  
\</p\>

\---

\#\# 🚀 Features

This dashboard provides a complete content management system (CMS) tailored to the client's needs, allowing for easy updates to their public-facing website.

\-   \*\*📊 Stats Overview\*\*: An at-a-glance homepage displaying key metrics like total posts, unread messages, and post status (published vs. draft).  
\-   \*\*✍️ Full Post Management\*\*: A complete CRUD (Create, Read, Update, Delete) interface for blog posts.  
\-   \*\*📝 Rich Markdown Editor\*\*: A modern, \`dark-mode\` compatible Markdown editor for writing and formatting blog content.  
\-   \*\*📬 Message Center\*\*: View and manage messages sent from the portfolio's contact form, with a "read/unread" status system.  
\-   \*\*🔒 Secure Authentication\*\*: A secure login system powered by Supabase Auth, ensuring only authorized users can access the dashboard.  
\-   \*\*🎨 Custom Theming\*\*: A unique, academic-inspired dark theme that is consistent across all components.

\---

\#\# 🛠️ Tech Stack

This project is built with a modern, robust, and scalable technology stack.

| Tech                               | Description                                    |  
| \---------------------------------- | \---------------------------------------------- |  
| \*\*\[Next.js\](https://nextjs.org/)\*\* | Full-stack React framework (App Router).       |  
| \*\*\[React\](https://react.dev/)\*\* | UI library for building components.            |  
| \*\*\[TypeScript\](https://www.typescriptlang.org/)\*\* | Strongly typed language for robust code.       |  
| \*\*\[Supabase\](https://supabase.com/)\*\* | Backend-as-a-Service (Database, Auth, Storage).|  
| \*\*\[Tailwind CSS\](https://tailwindcss.com/)\*\* | Utility-first CSS framework for rapid styling. |  
| \*\*\[React Hook Form\](https://react-hook-form.com/)\*\* | Performant form handling and validation.   |  
| \*\*\[Zod\](https://zod.dev/)\*\* | TypeScript-first schema validation.            |  
| \*\*\[Framer Motion\](https://www.framer.com/motion/)\*\* | Animation library for fluid UI transitions.    |

\---

\#\# ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

\#\#\# Prerequisites

\-   Node.js (v18 or later recommended)  
\-   npm, yarn, or pnpm package manager

\#\#\# Installation

1\.  \*\*Clone the repository:\*\*  
    \`\`\`sh  
    git clone \[https://github.com/your-username/joana-dashboard.git\](https://github.com/your-username/joana-dashboard.git)  
    cd joana-dashboard  
    \`\`\`

2\.  \*\*Install dependencies:\*\*  
    \`\`\`sh  
    npm install  
    \`\`\`

3\.  \*\*Set up environment variables:\*\*  
    \-   Create a file named \`.env.local\` in the root of your project.  
    \-   Get your \*\*Project URL\*\* and \*\*\`anon\` key\*\* from your Supabase project dashboard (Settings \> API).  
    \-   Add them to the \`.env.local\` file:  
        \`\`\`  
        NEXT\_PUBLIC\_SUPABASE\_URL=YOUR\_SUPABASE\_URL  
        NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=YOUR\_SUPABASE\_ANON\_KEY  
        \`\`\`

4\.  \*\*Run the development server:\*\*  
    \`\`\`sh  
    npm run dev  
    \`\`\`

The application will be available at \`http://localhost:3000\`. The homepage will automatically redirect to the \`/dashboard\`.

\#\#\# Supabase Setup

For the application to function correctly, your Supabase project should have:  
\- A \`posts\` table with columns like \`title\`, \`slug\`, \`content\`, \`is\_published\`, etc.  
\- A \`messages\` table with columns like \`name\`, \`email\`, \`message\`, and a boolean \`read\` column.  
\- \*\*Row Level Security (RLS)\*\* policies enabled to ensure that only authenticated users can access and manage data.  
