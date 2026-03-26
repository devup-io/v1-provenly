import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Zap,
  BookOpen,
  BarChart3,
  Github,
  Search,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Rocket,
  Eye,
  Cpu,
  GitCommit,
  Mail,
  Lock,
} from 'lucide-react';
interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  keywords: string[];
}

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Provenly',
      description: 'Learn the basics of creating your profile and showcasing your work',
      icon: <Rocket className="h-8 w-8 text-primary" />,
      keywords: ['getting started', 'profile', 'signup', 'setup', 'onboarding'],
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 text-heading-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Getting Your Profile Started
            </h3>
            <div className="space-y-3 text-body-sm text-muted-foreground">
              <p>
                <strong>Step 1: Create Account</strong> - Sign up with your GitHub account. This connects your work history directly to your profile.
              </p>
              <p>
                <strong>Step 2: Select Your Role</strong> - Choose your primary developer role (Frontend, Backend, Full-stack, Mobile, DevOps, Data, etc.). This helps us evaluate your projects correctly.
              </p>
              <p>
                <strong>Step 3: Import Repositories</strong> - Select at least 2 GitHub repositories that showcase your best work. Choose projects where you made significant contributions.
              </p>
              <p>
                <strong>Step 4: AI Analysis</strong> - Our system analyzes each project for complexity, your contribution level, and engineering depth.
              </p>
              <p>
                <strong>Step 5: Publish Profile</strong> - Once verified, publish your profile to be discovered by founders and hiring managers.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
            <p className="text-body-sm text-muted-foreground">
              <strong>Tip:</strong> Import projects that best represent your skills and complexity levels (L1-L3). Quality over quantity.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'analysis-explained',
      title: 'Understanding Your Analysis Results',
      description: 'Deep dive into what our AI evaluation means for your profile',
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      keywords: ['analysis', 'evaluation', 'score', 'metrics', 'complexity', 'confidence'],
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-500" />
                Repository Score
              </h4>
              <p className="text-body-sm text-muted-foreground">
                Overall quality score (0-100) based on code architecture, engineering practices, and project maturity. Higher scores indicate well-engineered projects with good patterns.
              </p>
              <div className="mt-3 text-caption text-muted-foreground space-y-1">
                <p>80+: Strong repository quality (production-ready).</p>
                <p>60-79: Good quality with room for improvement.</p>
                <p>Below 60: Needs attention or basic projects.</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-yellow-500" />
                Confidence Score
              </h4>
              <p className="text-body-sm text-muted-foreground">
                How confident our AI is in its evaluation (0-100). Based on available data signals, repository history, and code patterns.
              </p>
              <div className="mt-3 text-caption text-muted-foreground space-y-1">
                <p>80+: Very high confidence.</p>
                <p>60-79: Good confidence.</p>
                <p>Below 60: Limited signals; provide more context in your profile.</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-purple-500" />
                Contribution Percentage
              </h4>
              <p className="text-body-sm text-muted-foreground">
                Estimated share of your contribution in the repository. Helps founders understand your role and impact.
              </p>
              <div className="mt-3 text-caption text-muted-foreground space-y-1">
                <p>70%+: Primary Builder — you drove this project.</p>
                <p>40-69%: Major Contributor — significant impact.</p>
                <p>Below 40%: Minor or partial contributor role.</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Complexity Levels (L1-L3)
              </h4>
              <p className="text-body-sm text-muted-foreground">
                Categorizes your projects by technical depth and scale.
              </p>
              <div className="mt-3 text-caption text-muted-foreground space-y-1">
                <p><strong>L1 (Beginner)</strong> - Simple projects, learning phase.</p>
                <p><strong>L2 (Intermediate)</strong> - Multi-feature projects and team collaboration.</p>
                <p><strong>L3 (Advanced)</strong> - Complex architecture and higher scale.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
            <p className="text-body-sm text-muted-foreground">
              <strong>What helps analysis:</strong> Active repositories, clear commit history, diverse tech stack, and well-documented code.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'repo-selection',
      title: 'Tips for Selecting Repositories',
      description: 'Choose projects that best showcase your skills',
      icon: <Github className="h-8 w-8 text-primary" />,
      keywords: ['repository', 'repo', 'project', 'selection', 'import', 'choose'],
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 font-semibold">Do's</h3>
            <ul className="space-y-2 text-body-sm text-muted-foreground list-disc pl-5">
              <li>Import projects that align with your selected role</li>
              <li>Choose repositories where you made significant contributions</li>
              <li>Include projects with clear complexity progression (L1, L2, L3)</li>
              <li>Select projects with good documentation and commit history</li>
              <li>Include team projects to show collaboration skills</li>
              <li>Prioritize production-ready or completed projects</li>
            </ul>
          </div>

          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <h3 className="mb-4 font-semibold">Don'ts</h3>
            <ul className="space-y-2 text-body-sm text-muted-foreground list-disc pl-5">
              <li>Don't import forks unless you made significant contributions</li>
              <li>Don't select private projects without clear metadata</li>
              <li>Don't pick role-mismatched projects (e.g., Backend project for Frontend role)</li>
              <li>Don't import archived projects without notable achievements</li>
              <li>Don't select too many low-complexity projects</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 font-semibold">Quality Guidelines</h3>
            <div className="space-y-2 text-body-sm text-muted-foreground">
              <p>
                <strong>Minimum 2 repositories</strong> required for initial profile. We recommend 3-5 diverse projects.
              </p>
              <p>
                <strong>Active projects</strong> (with commits in last 6-12 months) score better than archived repos.
              </p>
              <p>
                <strong>Tech stack alignment</strong> - Select projects using the technologies you declared.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard-guide',
      title: 'Dashboard & Profile Management',
      description: 'Manage your profile and track your professional growth',
      icon: <Settings className="h-8 w-8 text-primary" />,
      keywords: ['dashboard', 'profile', 'settings', 'manage', 'edit', 'export'],
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 font-semibold">Dashboard Features</h3>
            <div className="space-y-3 text-body-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Your Projects tab</p>
                <p className="text-caption mt-1">View imported repositories with AI evaluation scores and complexity levels.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Education tab</p>
                <p className="text-caption mt-1">Add certifications, degrees, and learning achievements to your profile.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Experience tab</p>
                <p className="text-caption mt-1">Highlight your professional work history and achievements.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Run analysis</p>
                <p className="text-caption mt-1">Trigger a fresh AI evaluation of your projects at any time.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 font-semibold">Profile Settings</h3>
            <div className="space-y-3 text-body-sm text-muted-foreground">
              <p>
                <strong>Edit Profile:</strong> Update your bio, role, tech stack, and links.
              </p>
              <p>
                <strong>CV Upload:</strong> Add a PDF resume for additional context.
              </p>
              <p>
                <strong>Privacy Settings:</strong> Control visibility (public/private) and who can contact you.
              </p>
              <p>
                <strong>Import More Repos:</strong> Add additional projects to your profile once published.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
            <p className="text-body-sm text-muted-foreground">
              <strong>Tip:</strong> Regularly update your profile and re-run analysis to keep your evaluation scores fresh and accurate.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'profile-visibility',
      title: 'Profile Visibility & Discovery',
      description: 'Make your work visible to hiring managers and founders',
      icon: <Eye className="h-8 w-8 text-primary" />,
      keywords: ['visibility', 'public', 'private', 'discovery', 'publish', 'hire'],
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 font-semibold">Public vs Private Profiles</h3>
            <div className="space-y-4 text-body-sm text-muted-foreground">
              <div>
                <p className="font-medium text-green-500 flex items-center gap-2"><Eye className="h-4 w-4" />Public profile</p>
                <p className="mt-2">Your profile is visible in search results and to hiring managers. They can see projects, scores, and contact details.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-medium text-gray-500 flex items-center gap-2"><Lock className="h-4 w-4" />Private profile</p>
                <p className="mt-2">Your profile is hidden from public search. Only people with your direct link can view it.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 font-semibold">Getting Discovered</h3>
            <ul className="space-y-2 text-body-sm text-muted-foreground list-disc pl-5">
              <li><strong>Complete Profile:</strong> Higher completion leads to better visibility</li>
              <li><strong>Strong Scores:</strong> Good repository scores increase ranking</li>
              <li><strong>Verified Projects:</strong> Projects with high confidence scores rank better</li>
              <li><strong>Diverse Tech Stack:</strong> Multiple technologies increase match potential</li>
              <li><strong>Active Updates:</strong> Recently updated profiles appear higher</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-6">
            <h3 className="mb-4 font-semibold">Hiring Inquiries</h3>
            <p className="text-body-sm text-muted-foreground mb-3">
              When you enable "Allow hire requests" in settings, founders can send you direct inquiries about:
            </p>
            <ul className="space-y-2 text-body-sm text-muted-foreground list-disc pl-5">
              <li>Freelance or contract opportunities</li>
              <li>Full-time or part-time positions</li>
              <li>Consulting and advisory roles</li>
              <li>Volunteer opportunities</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting & FAQs',
      description: 'Common questions and how to solve them',
      icon: <HelpCircle className="h-8 w-8 text-primary" />,
      keywords: ['trouble', 'problem', 'error', 'faq', 'help', 'issue', 'fix'],
      content: (
        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger className="hover:no-underline">
                Why is my repository score low?
              </AccordionTrigger>
              <AccordionContent className="text-body-sm text-muted-foreground">
                Low scores usually indicate limited signals or simpler projects. To improve:
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Import more complex projects (L2-L3)</li>
                  <li>Ensure good commit history and documentation</li>
                  <li>Select projects aligned with your role</li>
                  <li>Re-run analysis after making improvements</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2">
              <AccordionTrigger className="hover:no-underline">
                What does "role mismatch" warning mean?
              </AccordionTrigger>
              <AccordionContent className="text-body-sm text-muted-foreground">
                A role mismatch occurs when you import a project that doesn't align with your selected role. For example, importing a mobile app when you're a backend developer.
                <p className="mt-2">Impact: Your visibility score may decrease. We recommend only importing projects aligned with your declared role.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3">
              <AccordionTrigger className="hover:no-underline">
                Can I re-run analysis on my projects?
              </AccordionTrigger>
              <AccordionContent className="text-body-sm text-muted-foreground">
                Yes! Click "Run Analysis" from your dashboard to trigger a fresh AI evaluation. This is useful after:
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Adding new commits to your projects</li>
                  <li>Improving code quality or documentation</li>
                  <li>Completing significant project milestones</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4">
              <AccordionTrigger className="hover:no-underline">
                How do I increase my confidence score?
              </AccordionTrigger>
              <AccordionContent className="text-body-sm text-muted-foreground">
                Confidence scores improve when:
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Your repository has more commit history</li>
                  <li>You have diverse and active contributions</li>
                  <li>The project has proper documentation</li>
                  <li>Your role in the project is clear (via commits, PRs)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5">
              <AccordionTrigger className="hover:no-underline">
                Can I change my role after signup?
              </AccordionTrigger>
              <AccordionContent className="text-body-sm text-muted-foreground">
                Yes, you can update your role in profile settings. However:
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Your existing projects will be re-evaluated against the new role</li>
                  <li>Some projects might show role mismatch warnings</li>
                  <li>Overall scores may change due to alignment issues</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q6">
              <AccordionTrigger className="hover:no-underline">
                What happens to my private repositories?
              </AccordionTrigger>
              <AccordionContent className="text-body-sm text-muted-foreground">
                Provenly only analyzes public repositories. Private repos won't be analyzed or evaluated. We recommend:
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Making project portfolios public</li>
                  <li>Using sample/demo projects instead</li>
                  <li>Creating public versions of your best work</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ),
    },
  ];

  const filteredSections = !searchQuery.trim()
    ? helpSections
    : helpSections.filter((section) => {
        const query = searchQuery.toLowerCase();
        return (
          section.title.toLowerCase().includes(query) ||
          section.description.toLowerCase().includes(query) ||
          section.keywords.some((keyword) => keyword.includes(query))
        );
      });

  const sectionOrder = ['getting-started', 'repo-selection', 'analysis-explained', 'dashboard-guide', 'profile-visibility', 'troubleshooting'];
  const orderedSections = [...filteredSections].sort(
    (a, b) => sectionOrder.indexOf(a.id) - sectionOrder.indexOf(b.id)
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl px-4 pb-12 pt-24">
          <div className="mb-8 flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="text-body text-muted-foreground text-center max-w-xl">
              Find answers, tips, and support for using Provenly. Search or browse the sections below.
            </p>
          </div>
          <div className="mb-8 flex justify-center">
            <Input
              type="text"
              placeholder="Search help topics..."
              className="w-full max-w-md border px-5 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-6">
            {filteredSections.length === 0 ? (
              <div className="p-8 text-center text-body-lg text-muted-foreground border rounded">
                <HelpCircle className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                No help topics found. Try a different search!
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orderedSections.map((section) => (
                  <div key={section.id} className="flex gap-4 items-start border-b pb-6">
                    <div className="mt-1">{section.icon}</div>
                    <div>
                      <h2 className="text-lg font-semibold mb-1">{section.title}</h2>
                      <div className="text-muted-foreground mb-2 text-sm">{section.description}</div>
                      <div>{section.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <section className="py-10 border-t mt-12">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="mb-6 text-center text-xl font-semibold">Quick Links</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="outline"
                className="flex items-center gap-2 px-6 py-3"
                onClick={() => navigate('/contact')}
              >
                <Mail className="h-5 w-5" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-6 py-3"
                onClick={() => navigate('/about')}
              >
                <BookOpen className="h-5 w-5" />
                About Provenly
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-6 py-3"
                onClick={() => navigate('/dashboard')}
              >
                <Zap className="h-5 w-5" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}