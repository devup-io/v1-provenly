import { motion, AnimatePresence } from "framer-motion";
import { X, Star, GitBranch, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface CompareDeveloper {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  roles: string[];
  techStack: string[];
  maxComplexity: string;
  totalStars: number;
  projectCount: number;
  complexityCounts: { L1: number; L2: number; L3: number };
}

interface CompareDrawerProps {
  selectedDevelopers: CompareDeveloper[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareDrawer({ selectedDevelopers, onRemove, onClear, onCompare }: CompareDrawerProps) {
  const navigate = useNavigate();
  
  if (selectedDevelopers.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card shadow-lg"
    >
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-body-sm font-medium">
              Compare ({selectedDevelopers.length}/3)
            </span>
            
            {/* Selected developers */}
            <div className="flex gap-2">
              {selectedDevelopers.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center gap-2 rounded-full bg-secondary py-1 pl-1 pr-3"
                >
                  <img
                    src={dev.avatarUrl}
                    alt={dev.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-caption font-medium">{dev.name.split(" ")[0]}</span>
                  <button
                    onClick={() => onRemove(dev.id)}
                    className="rounded-full p-0.5 hover:bg-muted transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={onCompare}
              disabled={selectedDevelopers.length < 2}
              className="gap-1.5"
            >
              Compare
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
