import { motion } from 'framer-motion';
import { Github, Plus, GitBranch, RefreshCw, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/landing/Header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import type { AggregateEvaluation, DeveloperProfile, Project } from '@/types/api';

const mockDeveloper: DeveloperProfile = {
	id: 'mock-dev',
	github_id: 123456,
	github_username: 'devspak-s8',
	name: 'Apatira Sulayman',
	github_avatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
	primary_role: 'Frontend Developer',
	primary_stack: ['React', 'TypeScript', 'Tailwind', 'Vite', 'Recharts'],
	bio: 'Building delightful frontend experiences with solid engineering and attention to detail.',
	profile_complete: true,
	verified_projects: 8,
	average_confidence: 92,
	experience_signal: 'Senior',
	contribution_breakdown: {
		'Primary Builder': 12,
		'Major Contributor': 4,
		'Minor Contributor': 2,
	},
	is_published: true,
};

const mockProjects: Project[] = [
	{
		id: 'proj-1',
		developer_id: mockDeveloper.id,
		name: 'Provenly Frontend',
		description: 'The main Provenly web portal with onboarding and dashboard features.',
		github_url: 'https://github.com/devup-io/v1-provenly',
		language: 'TypeScript',
		stars: 120,
		forks: 24,
		commits_count: 384,
		ai_evaluation: {
			confidence_score: 90,
			id: 'proj-1',
			project_id: 'proj-1',
			developer_id: mockDeveloper.id,
			ai_status: 'completed',
			difficulty_tier: 'Advanced',
			repo_score: 87,
			engineering_depth_score: 88,
			architecture_score: 85,
			code_quality_score: 90,
			production_readiness_score: 82,
			commit_quality_score: 84,
			estimated_developer_level: 'Senior',
			primary_role_alignment: 'Frontend',
			summary: 'Well-structured frontend with strong component architecture and good testing.',
		},
	},
	{
		id: 'proj-2',
		developer_id: mockDeveloper.id,
		name: 'UI Component Library',
		description: 'A reusable design system with accessible components and theming support.',
		github_url: 'https://github.com/devup-io/ui-library',
		language: 'TypeScript',
		stars: 56,
		forks: 12,
		commits_count: 210,
		ai_evaluation: {
			confidence_score: 80,
			id: 'proj-2',
			project_id: 'proj-2',
			developer_id: mockDeveloper.id,
			ai_status: 'completed',
			difficulty_tier: 'Intermediate',
			repo_score: 78,
			engineering_depth_score: 79,
			architecture_score: 80,
			code_quality_score: 75,
			production_readiness_score: 70,
			commit_quality_score: 76,
			estimated_developer_level: 'Mid-level',
			primary_role_alignment: 'Frontend',
			summary: 'Solid component foundation with strong theming and documentation.',
		},
	},
	{
		id: 'proj-3',
		developer_id: mockDeveloper.id,
		name: 'Developer Portfolio',
		description: 'A portfolio site showcasing projects, blog posts, and achievements.',
		github_url: 'https://github.com/devup-io/portfolio',
		language: 'JavaScript',
		stars: 32,
		forks: 5,
		commits_count: 112,
		ai_evaluation: {
			confidence_score: 70,
			id: 'proj-3',
			project_id: 'proj-3',
			developer_id: mockDeveloper.id,
			ai_status: 'completed',
			difficulty_tier: 'Beginner',
			repo_score: 72,
			engineering_depth_score: 70,
			architecture_score: 68,
			code_quality_score: 74,
			production_readiness_score: 66,
			commit_quality_score: 71,
			estimated_developer_level: 'Junior',
			primary_role_alignment: 'Frontend',
			summary: 'A clean portfolio site with responsive layout and simple data fetching.',
		},
	},
];

const mockStats: AggregateEvaluation = {
	developer_id: mockDeveloper.id,
	total_projects: mockProjects.length,
	overall_skill_level: 'Advanced',
	difficulty_distribution: { Beginner: 1, Intermediate: 1, Advanced: 1 },
	primary_technologies: ['TypeScript', 'React', 'Tailwind'],
	total_commits: mockProjects.reduce((sum, p) => sum + (p.commits_count || 0), 0),
	strongest_areas: ['code_quality', 'architecture_quality'],
	projects: mockProjects,
	repository_quality: 88,
	collaborative_development: 82,
	evaluation_profile_counts: { frontend: 3 },
	detected_project_type_counts: { frontend: 2, ui: 1 },
};

const techBadgeClasses: Record<string, string> = {
	React: 'border border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
	TypeScript: 'border border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300',
	Tailwind: 'border border-teal-500/30 bg-teal-500/15 text-teal-700 dark:text-teal-300',
	Vite: 'border border-violet-500/30 bg-violet-500/15 text-violet-700 dark:text-violet-300',
	Recharts: 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

const getTechBadgeClass = (tech: string) =>
	techBadgeClasses[tech] || 'border border-border bg-secondary text-secondary-foreground';

export default function MockDashboard() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-hero">
			<Header />

			<div className="mx-auto max-w-6xl px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:px-8 md:pb-8 md:pt-28">
				<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-2">
						<p className="text-body text-muted-foreground">Welcome back,</p>
						<h1 className="text-display-sm font-bold">{mockDeveloper.name}</h1>
						<p className="text-body-sm text-muted-foreground">Here's your mock dashboard view</p>
					</div>
					<Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full lg:w-auto gap-2">
						Back to Real Dashboard
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						whileHover={{ y: -4 }}
						className="rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-lg transition-all hover:shadow-xl sm:p-6"
					>
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-4">
								{mockDeveloper.github_avatar && (
									<img
										src={mockDeveloper.github_avatar}
										alt={mockDeveloper.name || mockDeveloper.github_username}
										className="h-20 w-20 rounded-full object-cover"
									/>
								)}
								<div>
									<div className="flex items-baseline gap-2">
										<h2 className="text-heading-lg font-bold">{mockDeveloper.name}</h2>
										<span className="text-body-sm text-muted-foreground">@{mockDeveloper.github_username}</span>
									</div>
									<div className="mt-1">
										<span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-body-sm font-medium text-primary">
											{mockDeveloper.primary_role}
										</span>
									</div>
								</div>
							</div>

								<div className="mt-3 space-y-3 px-4">
									<div className="flex items-center gap-2 text-body-sm font-medium text-muted-foreground">
										<Cpu className="h-4 w-4 text-primary" />
										<span>Tech Stack</span>
									</div>

									<div className="flex flex-wrap gap-2">
									{mockDeveloper.primary_stack?.slice(0, 5).map((tech) => (
										<span
											key={tech}
											className={`rounded-full px-2.5 py-1 text-caption font-medium ${getTechBadgeClass(tech)}`}
										>
											{tech}
										</span>
									))}
									</div>
								</div>

								<div className="mt-4 grid grid-cols-2 gap-3 text-body-sm">
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
												<span className="text-caption uppercase tracking-wide text-muted-foreground">Experience</span>
												<span className="font-medium text-foreground">{mockDeveloper.experience_signal}</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>Estimated seniority from project history and code depth.</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
												<span className="text-caption uppercase tracking-wide text-muted-foreground">Verified Projects</span>
												<span className="font-medium text-foreground">
													{mockDeveloper.verified_projects}/{mockProjects.length}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>Projects where ownership/contribution has been verified.</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
												<span className="text-caption uppercase tracking-wide text-muted-foreground">Avg Confidence</span>
												<span className="font-medium text-foreground">{mockDeveloper.average_confidence}%</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>Average confidence score across all analyzed repositories.</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3">
												<span className="text-caption uppercase tracking-wide text-muted-foreground">Contribution</span>
												<span className="font-medium text-foreground">
													Primary {mockDeveloper.contribution_breakdown?.['Primary Builder'] || 0} | Major{' '}
													{mockDeveloper.contribution_breakdown?.['Major Contributor'] || 0} | Minor{' '}
													{mockDeveloper.contribution_breakdown?.['Minor Contributor'] || 0}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>How often this developer was the primary/major/minor contributor.</TooltipContent>
									</Tooltip>
								</div>

								<p className="mt-4 text-body-sm text-muted-foreground">{mockDeveloper.bio}</p>

								<div className="mt-6 flex justify-center">
									<a
										href={`https://github.com/${mockDeveloper.github_username}`}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-body-sm font-medium text-primary transition-colors hover:bg-primary/10"
									>
										<Github className="h-4 w-4" />
										View on GitHub
									</a>
								</div>
							</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						whileHover={{ y: -4 }}
						className="rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-lg transition-all hover:shadow-xl sm:p-6"
					>
						<h3 className="mb-4 text-heading-sm">Statistics</h3>
						<div className="space-y-4">
							<div className="bg-primary/10 p-3 rounded-lg">
								<p className="text-body-sm text-muted-foreground">Repository Quality</p>
								<div className="w-full bg-muted/20 rounded-full h-2">
									<div className="bg-primary h-2 rounded-full w-[88%]" />
								</div>
								<p className="mt-1 text-caption">88%</p>
							</div>
							<div className="bg-primary/10 p-3 rounded-lg">
								<p className="text-body-sm text-muted-foreground">Collaborative Development</p>
								<div className="w-full bg-muted/20 rounded-full h-2">
									<div className="bg-primary h-2 rounded-full w-[82%]" />
								</div>
								<p className="mt-1 text-caption">82%</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="rounded-2xl border border-border bg-card p-4">
									<p className="text-body-sm text-muted-foreground">Total Projects</p>
									<p className="text-heading-md">{mockStats.total_projects}</p>
								</div>
								<div className="rounded-2xl border border-border bg-card p-4">
									<p className="text-body-sm text-muted-foreground">Overall Level</p>
									<p className="text-heading-md capitalize">{mockStats.overall_skill_level}</p>
								</div>
								<div className="rounded-2xl border border-border bg-card p-4">
									<p className="text-body-sm text-muted-foreground">Total Commits</p>
									<p className="text-heading-md">{mockStats.total_commits}</p>
								</div>
								<div className="rounded-2xl border border-border bg-card p-4">
									<p className="text-body-sm text-muted-foreground mb-2">Top Technologies</p>
									<div className="flex flex-wrap gap-2">
										{mockStats.primary_technologies.map((tech) => (
											<span
												key={tech}
												className={`rounded-full px-2.5 py-1 text-caption font-medium ${getTechBadgeClass(tech)}`}
											>
												{tech}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						whileHover={{ y: -4 }}
						className="rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-lg transition-all hover:shadow-xl sm:col-span-2 sm:p-6 xl:col-span-1"
					>
						<h3 className="mb-4 text-heading-sm">Actions</h3>
						<div className="space-y-3">
							<Button className="w-full gap-2">
								<Plus className="h-4 w-4" />
								Import More Repos
							</Button>
							<Button variant="outline" className="w-full gap-2">
								<RefreshCw className="h-4 w-4" />
								Run Analysis
							</Button>
							<Button variant="outline" onClick={() => navigate('/profile/edit')} className="mt-2 w-full">
								Edit Profile
							</Button>
							<Button variant="outline" onClick={() => navigate('/settings')} className="mt-2 w-full">
								Go to Settings
							</Button>
							<Button variant="secondary" className="mt-2 w-full">
								Make Profile Private
							</Button>
						</div>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="mt-8"
				>
					<Tabs defaultValue="projects" className="space-y-6">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<h2 className="text-heading-md">Profile Details</h2>
							<TabsList className="grid w-full grid-cols-3 sm:w-auto">
								<TabsTrigger value="projects">Projects</TabsTrigger>
								<TabsTrigger value="education">Education</TabsTrigger>
								<TabsTrigger value="experience">Experience</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="projects" className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-heading-sm">Your Repositories</h3>
								<p className="text-body-sm text-muted-foreground">{mockProjects.length} repositories</p>
							</div>

							<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
								{mockProjects.map((project, index) => (
									<motion.div
										key={project.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.4 + index * 0.05 }}
										whileHover={{ y: -4 }}
										className="group rounded-[24px] bg-gradient-to-br from-card to-card/80 p-4 shadow-lg transition-all hover:shadow-xl sm:p-6"
									>
										<div className="grid grid-cols-1 gap-4">
											<div>
												<div className="mb-3 flex flex-wrap items-start justify-between gap-2">
													<div className="min-w-0 flex-1">
														<h3 className="text-heading-sm mb-2 break-words">{project.name}</h3>
														<div className="flex flex-wrap items-center gap-2 mb-2">
															<span className="inline-flex items-center rounded-full px-3 py-1 text-body-sm font-semibold text-white bg-blue-600 shadow-sm">
																{project.ai_evaluation?.difficulty_tier} complexity
															</span>
															{project.language && (
																<span className="inline-flex items-center rounded-full px-3 py-1 text-body-sm font-medium bg-secondary text-secondary-foreground">
																	{project.language}
																</span>
															)}
														</div>
														<div className="mb-1 flex flex-wrap items-center gap-3 text-body-sm">
															{project.ai_evaluation?.repo_score !== undefined && (
																<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 font-semibold text-primary">
																	{Math.round(project.ai_evaluation.repo_score)}% score
																</span>
															)}
															{project.commits_count !== undefined && (
																<span className="inline-flex items-center gap-1 rounded-full bg-muted/20 px-3 py-0.5 text-muted-foreground">
																	<GitBranch className="h-3 w-3" />
																	{project.commits_count} commits
																</span>
															)}
														</div>
													</div>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
														Active
													</div>
												</div>
												<p className="text-body-sm text-muted-foreground">{project.description}</p>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</TabsContent>

						<TabsContent value="education" className="space-y-4">
							<div className="rounded-2xl border border-border bg-card p-5 shadow-card">
								<p className="text-caption uppercase tracking-wide text-muted-foreground">2020 — 2024</p>
								<h3 className="mt-1 text-heading-sm">B.Sc. Computer Science</h3>
								<p className="text-body-sm text-muted-foreground">University of Lagos</p>
								<p className="mt-3 text-body-sm text-muted-foreground">
									Focused on software engineering, UI systems, distributed applications, and practical product delivery.
								</p>
								<div className="mt-4 flex flex-wrap gap-2">
									<span className="rounded-full bg-secondary px-3 py-1 text-caption">Algorithms</span>
									<span className="rounded-full bg-secondary px-3 py-1 text-caption">Databases</span>
									<span className="rounded-full bg-secondary px-3 py-1 text-caption">Human-Computer Interaction</span>
								</div>
							</div>

							<div className="rounded-2xl border border-border bg-card p-5 shadow-card">
								<p className="text-caption uppercase tracking-wide text-muted-foreground">Certifications</p>
								<ul className="mt-3 space-y-2 text-body-sm text-muted-foreground">
									<li>• Frontend Performance Optimization — Advanced</li>
									<li>• TypeScript for Scalable Applications</li>
									<li>• GitHub Actions & CI/CD Fundamentals</li>
								</ul>
							</div>
						</TabsContent>

						<TabsContent value="experience" className="space-y-4">
							<div className="rounded-2xl border border-border bg-card p-5 shadow-card">
								<p className="text-caption uppercase tracking-wide text-muted-foreground">2024 — Present</p>
								<h3 className="mt-1 text-heading-sm">Frontend Engineer • Provenly</h3>
								<p className="mt-3 text-body-sm text-muted-foreground">
									Built role-aware onboarding, repository intelligence screens, and evaluator dashboards used by technical founders.
								</p>
								<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
									<div className="rounded-lg bg-muted/40 px-3 py-2 text-caption">Improved onboarding completion rate</div>
									<div className="rounded-lg bg-muted/40 px-3 py-2 text-caption">Integrated real-time analyzer logs</div>
									<div className="rounded-lg bg-muted/40 px-3 py-2 text-caption">Shipped publishable profile links</div>
									<div className="rounded-lg bg-muted/40 px-3 py-2 text-caption">Implemented production CI/CD workflow</div>
								</div>
							</div>

							<div className="rounded-2xl border border-border bg-card p-5 shadow-card">
								<p className="text-caption uppercase tracking-wide text-muted-foreground">2022 — 2024</p>
								<h3 className="mt-1 text-heading-sm">Frontend Developer • Freelance</h3>
								<p className="mt-3 text-body-sm text-muted-foreground">
									Delivered responsive interfaces for startups with a focus on performance, accessibility, and maintainable component architecture.
								</p>
							</div>
						</TabsContent>
					</Tabs>
				</motion.div>
			</div>
		</div>
	);
}
