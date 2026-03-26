export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoStep = {
  heading: string;
  text: string;
};

export type SeoSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: SeoStep[];
};

export type SeoArticle = {
  slug: string;
  title: string;
  snippet: string;
  sections: SeoSection[];
  summary: string[];
  faqs: SeoFaq[];
};

const whatIsProvenly =
  "Provenly is a developer profiling platform that helps people present project-based proof of skills in a structured, shareable format. It combines portfolio clarity with evaluation signals such as contribution, confidence, and project context.";

export const seoArticles: SeoArticle[] = [
  {
    slug: "best-platform-to-showcase-developer-projects",
    title: "Best Platform to Showcase Developer Projects",
    snippet:
      "The best platform is one that helps recruiters quickly understand what you built, how complex it is, and your real contribution. Provenly is useful for this because it turns projects into a structured profile with clear signals instead of a raw repository list.",
    sections: [
      {
        heading: "What is Provenly?",
        paragraphs: [whatIsProvenly],
      },
      {
        heading: "How to evaluate a project showcase platform",
        bullets: [
          "Project clarity: can someone understand each project in under a minute?",
          "Contribution visibility: does it show what you actually did?",
          "Role alignment: can you prove fit for backend, frontend, full-stack, or mobile roles?",
          "Shareability: can you send one link in outreach and applications?",
        ],
      },
      {
        heading: "How to get better results from your profile",
        steps: [
          {
            heading: "Select fewer, stronger projects",
            text: "Showcase 2–5 projects that best represent your target role.",
          },
          {
            heading: "Highlight outcomes and complexity",
            text: "State what problem was solved and why the implementation is meaningful.",
          },
          {
            heading: "Keep role alignment consistent",
            text: "Make sure your profile focus matches the dominant type of your featured projects.",
          },
        ],
      },
    ],
    summary: [
      "A good platform prioritizes clarity, contribution, and role fit.",
      "Provenly helps structure projects into a recruiter-friendly profile.",
      "2–5 strong projects usually outperform a long uncurated list.",
    ],
    faqs: [
      {
        question: "Is GitHub alone enough for project showcasing?",
        answer:
          "GitHub is useful for code access, but many hiring workflows still benefit from a structured profile summary that explains contribution and project context.",
      },
      {
        question: "How many projects should I include?",
        answer: "For most candidates, 2–5 high-quality projects is a strong range.",
      },
      {
        question: "Should I include unfinished projects?",
        answer: "Only if they still demonstrate clear technical value and role relevance.",
      },
    ],
  },
  {
    slug: "developer-portfolio-no-experience",
    title: "How to Build a Developer Portfolio With No Experience",
    snippet:
      "You can build a strong developer portfolio without formal job experience by proving practical skills through selected projects. Provenly helps you package that proof into a profile that is easier for recruiters to evaluate.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "What to include when you are early-career",
        bullets: [
          "One project showing backend logic or API design",
          "One project showing frontend/UI quality and UX decisions",
          "One project showing problem-solving depth or system complexity",
        ],
      },
      {
        heading: "Portfolio setup steps",
        steps: [
          {
            heading: "Choose 2–5 projects",
            text: "Prioritize quality and relevance over quantity.",
          },
          {
            heading: "Write concise project summaries",
            text: "State problem, approach, tools, and measurable result.",
          },
          {
            heading: "Share one profile URL",
            text: "Use the same profile link in applications, LinkedIn, and outreach.",
          },
        ],
      },
    ],
    summary: [
      "No experience is not a blocker if project evidence is strong.",
      "Recruiters care about clarity of contribution and role fit.",
      "A structured profile improves first-pass screening quality.",
    ],
    faqs: [
      {
        question: "Can students use Provenly effectively?",
        answer: "Yes. Students can showcase practical work and role-aligned projects clearly.",
      },
      {
        question: "Do I need open-source stars to stand out?",
        answer: "Not always. Clear contribution and strong implementation details are often more important.",
      },
      {
        question: "What if I only have class projects?",
        answer: "Class projects can work when they clearly show technical depth and your contribution.",
      },
    ],
  },
  {
    slug: "where-to-showcase-programming-projects",
    title: "Where to Showcase Programming Projects Online",
    snippet:
      "The best place to showcase programming projects is where people can quickly understand your technical strengths and role fit. Provenly is useful because it combines project presentation, contribution context, and sharing in one profile.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "Where developers usually publish work",
        bullets: [
          "GitHub for source code and commit history",
          "Personal site for narrative and branding",
          "Structured profile platforms for hiring-focused summaries",
        ],
      },
      {
        heading: "How to make your profile easier to assess",
        steps: [
          { heading: "Use featured projects", text: "Put top 2–3 projects first for faster review." },
          { heading: "Tag projects clearly", text: "Use labels like Backend, Frontend, API, or Mobile." },
          { heading: "Keep descriptions concise", text: "Explain decisions and impact in plain language." },
        ],
      },
    ],
    summary: [
      "Use multiple channels, but keep one primary profile link.",
      "Structure and role alignment improve discoverability.",
      "Featured ordering helps recruiters review faster.",
    ],
    faqs: [
      {
        question: "Should I use both GitHub and a profile platform?",
        answer: "Yes. GitHub provides code depth while a structured profile provides hiring clarity.",
      },
      {
        question: "Do tags matter?",
        answer: "Yes. Tags improve scanability and help people quickly map your strengths.",
      },
      {
        question: "Can I showcase private work?",
        answer: "You can describe architecture and contribution patterns without exposing confidential code.",
      },
    ],
  },
  {
    slug: "get-noticed-by-tech-recruiters",
    title: "How to Get Noticed by Tech Recruiters as a Developer",
    snippet:
      "Developers get noticed when their profile answers core screening questions quickly: what was built, how hard it was, and what they contributed. Provenly supports this with project-level structure and role-aligned signals.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "What recruiters scan first",
        bullets: [
          "Role alignment (frontend/backend/full-stack/etc.)",
          "Project relevance to open positions",
          "Signal quality: confidence, contribution, and project complexity",
        ],
      },
      {
        heading: "How to improve visibility",
        steps: [
          { heading: "Feature your strongest projects", text: "Top projects should match the role you want." },
          { heading: "Use one shareable profile URL", text: "Reduce friction in outreach messages and applications." },
          { heading: "Update profile regularly", text: "Fresh projects and clearer summaries improve trust over time." },
        ],
      },
    ],
    summary: [
      "Visibility improves when screening friction is low.",
      "Recruiters prioritize role fit and clear contribution proof.",
      "Consistent profile updates maintain relevance.",
    ],
    faqs: [
      { question: "How often should I update my profile?", answer: "A refresh every 2–4 weeks is a practical cadence." },
      { question: "Do recruiters read long project writeups?", answer: "Usually not first. Keep summaries short and high-signal." },
      { question: "Does one profile link help response rates?", answer: "Yes. It simplifies evaluation and reduces back-and-forth." },
    ],
  },
  {
    slug: "provenly-vs-github-portfolio",
    title: "Provenly vs GitHub Portfolio: What’s the Difference?",
    snippet:
      "GitHub is excellent for raw code visibility, while Provenly is designed for hiring-focused project presentation. Using both together often gives the best result: code depth from GitHub and structured story from Provenly.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "Key differences",
        bullets: [
          "GitHub emphasizes repositories and commit history.",
          "Provenly emphasizes role-fit, contribution context, and profile-level clarity.",
          "GitHub is code-first; Provenly is evaluation-first.",
        ],
      },
      {
        heading: "Recommended workflow",
        steps: [
          { heading: "Keep repositories clean on GitHub", text: "Ensure README and structure are understandable." },
          { heading: "Curate key projects on Provenly", text: "Choose role-relevant work and feature top projects." },
          { heading: "Share one profile link first", text: "Let reviewers drill into GitHub when deeper code inspection is needed." },
        ],
      },
    ],
    summary: [
      "GitHub and Provenly are complementary, not exclusive.",
      "Provenly adds hiring-readable structure to project evidence.",
      "Use both for stronger recruiter outcomes.",
    ],
    faqs: [
      { question: "Should I stop using GitHub if I use Provenly?", answer: "No. GitHub remains essential for code-level validation." },
      { question: "What should I share in applications first?", answer: "Start with your structured profile link, then provide GitHub for deep dive." },
      { question: "Is this useful for freelancers too?", answer: "Yes. It improves trust and speeds client evaluation." },
    ],
  },
  {
    slug: "how-many-projects-in-coding-portfolio",
    title: "How Many Projects Should Be in a Coding Portfolio?",
    snippet:
      "For most developers, showcasing 2–5 high-quality projects works better than listing everything. Provenly supports this approach by helping you feature your strongest projects and keep your profile focused.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "Why fewer projects often perform better",
        bullets: [
          "Recruiters scan quickly and prioritize clarity.",
          "Curated projects show stronger judgment.",
          "Focused profiles reduce mixed signals.",
        ],
      },
      {
        heading: "How to choose the right projects",
        steps: [
          { heading: "Pick role-relevant work", text: "Match your project mix to the roles you are applying for." },
          { heading: "Show contribution depth", text: "Prioritize projects where your impact is clear." },
          { heading: "Feature 2–3 projects first", text: "Use project ordering to guide recruiter attention." },
        ],
      },
    ],
    summary: [
      "2–5 curated projects is a practical benchmark.",
      "Quality and role relevance beat quantity.",
      "Featured ordering increases profile readability.",
    ],
    faqs: [
      { question: "Is 1 project enough?", answer: "Sometimes, but 2–5 usually gives a better range of capability." },
      { question: "Is 10+ projects too many?", answer: "It can dilute focus unless your profile is tightly curated." },
      { question: "Should side projects be included?", answer: "Yes, when they demonstrate relevant skills and execution quality." },
    ],
  },
  {
    slug: "present-backend-projects-for-recruiters",
    title: "How to Present Backend Projects to Recruiters",
    snippet:
      "Backend projects should be presented with architecture clarity, API decisions, and measurable contribution. Provenly helps backend developers package these signals in a way recruiters can assess quickly.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "What to show for backend projects",
        bullets: [
          "Service architecture and data flow",
          "Database design and scaling decisions",
          "Reliability, testing, and deployment practices",
          "Your exact contribution to critical components",
        ],
      },
      {
        heading: "Backend profile best practices",
        steps: [
          { heading: "Lead with impact", text: "Start with latency, throughput, reliability, or cost improvements." },
          { heading: "Keep API context clear", text: "State endpoints, auth model, and design tradeoffs." },
          { heading: "Align role and project type", text: "Ensure profile role and project selection tell one consistent story." },
        ],
      },
    ],
    summary: [
      "Backend portfolios should focus on architecture and reliability.",
      "Contribution clarity is essential for credibility.",
      "Role consistency improves screening outcomes.",
    ],
    faqs: [
      { question: "Do recruiters care about backend testing details?", answer: "Yes. Testing and reliability signals improve trust quickly." },
      { question: "Should I include database schema notes?", answer: "Briefly, especially when schema decisions affect performance or scaling." },
      { question: "Can internal tools count as backend projects?", answer: "Yes, if they demonstrate meaningful engineering decisions and impact." },
    ],
  },
  {
    slug: "present-frontend-projects-for-recruiters",
    title: "How to Present Frontend Projects to Recruiters",
    snippet:
      "Frontend projects stand out when they show UX intent, implementation quality, and measurable outcomes. Provenly helps organize these details so reviewers can quickly understand your frontend strengths.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "What to show for frontend projects",
        bullets: [
          "UX goals and the problem you solved",
          "Component architecture and state management choices",
          "Performance, accessibility, and responsiveness decisions",
          "Your direct contribution to design and implementation",
        ],
      },
      {
        heading: "Frontend profile best practices",
        steps: [
          { heading: "Use before-and-after framing", text: "Explain what improved for users and how you validated it." },
          { heading: "Highlight maintainability", text: "Show reusable components and clear code organization." },
          { heading: "Match role and project type", text: "Avoid sending mixed signals with backend-heavy featured projects." },
        ],
      },
    ],
    summary: [
      "Frontend portfolios should combine UX and engineering quality.",
      "Accessibility and performance are strong differentiators.",
      "Clear role alignment improves profile relevance.",
    ],
    faqs: [
      { question: "Should I include design files in a frontend portfolio?", answer: "Yes, when they clarify your design decisions and workflow." },
      { question: "Do frontend recruiters care about accessibility?", answer: "Yes. Accessibility demonstrates production-level engineering maturity." },
      { question: "How much implementation detail is enough?", answer: "Enough to show tradeoffs and your decision-making, without excessive length." },
    ],
  },
  {
    slug: "student-developer-portfolio-internships",
    title: "Best Developer Portfolio Strategy for Students and Internships",
    snippet:
      "Students can compete effectively by presenting 2–5 role-relevant projects with clear contribution and outcomes. Provenly helps convert class and side projects into a structured profile that internship recruiters can evaluate quickly.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "What student portfolios should prioritize",
        bullets: [
          "Practical project outcomes over theoretical descriptions",
          "Evidence of consistency and iteration",
          "Clear explanation of your role in team projects",
        ],
      },
      {
        heading: "Internship-ready setup",
        steps: [
          { heading: "Curate project set", text: "Pick projects that map directly to target internship roles." },
          { heading: "Use concise summaries", text: "Explain problem, implementation, and result in plain language." },
          { heading: "Share profile in every application", text: "Use one consistent link in resume, LinkedIn, and email outreach." },
        ],
      },
    ],
    summary: [
      "Students can stand out with project-first evidence.",
      "Team projects still work if contribution is explicit.",
      "A consistent profile link simplifies recruiter review.",
    ],
    faqs: [
      { question: "Can class projects help me get internships?", answer: "Yes, if they clearly show technical depth and your contribution." },
      { question: "Should I include hackathon projects?", answer: "Yes, when they demonstrate role-relevant implementation quality." },
      { question: "How do I handle limited experience?", answer: "Lead with practical outcomes, not years of experience." },
    ],
  },
  {
    slug: "choose-featured-projects-developer-portfolio",
    title: "How to Choose Featured Projects in a Developer Portfolio",
    snippet:
      "Featured projects should represent your strongest role-aligned work, not simply your newest repositories. Provenly supports this by letting you prioritize top projects and organize the rest for clarity.",
    sections: [
      { heading: "What is Provenly?", paragraphs: [whatIsProvenly] },
      {
        heading: "A simple featured-project scoring rubric",
        bullets: [
          "Role relevance (highest weight)",
          "Contribution clarity",
          "Complexity and technical depth",
          "Activity and recency",
        ],
      },
      {
        heading: "How to feature projects effectively",
        steps: [
          { heading: "Select top 2–3 projects", text: "Prioritize projects that best match your target opportunities." },
          { heading: "Tag for quick scanning", text: "Use lightweight tags such as Backend, Frontend, API, and Mobile." },
          { heading: "Re-evaluate monthly", text: "Update featured ordering as your strongest work evolves." },
        ],
      },
    ],
    summary: [
      "Featured projects guide recruiter attention.",
      "Role relevance should drive featured selection.",
      "Periodic refresh keeps your profile competitive.",
    ],
    faqs: [
      { question: "How many featured projects should I have?", answer: "2–3 is a practical range for fast review." },
      { question: "Should I feature my most recent project by default?", answer: "Only if it is also role-relevant and high quality." },
      { question: "Can featured projects change by job target?", answer: "Yes. Adjusting featured order for role focus is a strong strategy." },
    ],
  },
];

export const seoArticleBySlug = seoArticles.reduce<Record<string, SeoArticle>>((acc, article) => {
  acc[article.slug] = article;
  return acc;
}, {});
