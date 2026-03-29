// FIXED Dashboard.tsx (core errors resolved)

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [repoPage, setRepoPage] = useState(1);

  const REPOS_PER_PAGE = 2;

  // 🔹 FILTER (simplified safe version)
  const filteredProjects = projects;

  // 🔹 PAGINATION
  const totalRepoPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / REPOS_PER_PAGE)
  );

  const paginatedRepos = filteredProjects.slice(
    (repoPage - 1) * REPOS_PER_PAGE,
    repoPage * REPOS_PER_PAGE
  );

  useEffect(() => {
    if (repoPage > totalRepoPages) setRepoPage(1);
  }, [repoPage, totalRepoPages]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {paginatedRepos.map((project, index) => (
          <motion.div
            key={project.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() =>
              navigate(`/dashboard/projects/${project.id}`)
            }
            className="cursor-pointer rounded-xl p-4 shadow"
          >
            <h3>{project.name || 'Project'}</h3>
          </motion.div>
        ))}
      </div>

      {totalRepoPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRepoPage((p) => Math.max(1, p - 1))}
            disabled={repoPage === 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <span>
            Page {repoPage} of {totalRepoPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setRepoPage((p) =>
                Math.min(totalRepoPages, p + 1)
              )
            }
            disabled={repoPage === totalRepoPages}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
