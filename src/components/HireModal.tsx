 import { useState } from "react";
 import { Mail, Send, MessageSquare, Briefcase, CheckCircle2 } from "lucide-react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerName: string;
  developerUsername: string;
  onSubmit?: (payload: { name: string; email: string; company?: string; message: string }) => Promise<void>;
}

export function HireModal({ isOpen, onClose, developerName, developerUsername, onSubmit }: HireModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit({
          name: formData.name,
          email: formData.email,
          company: formData.company || undefined,
          message: formData.message,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setFormData({ name: "", email: "", company: "", message: "" });
      setIsSubmitted(false);
      setSubmitError(null);
    }, 300);
  };

  return (
     <Dialog open={isOpen} onOpenChange={handleClose}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Contact {developerName}</DialogTitle>
           <DialogDescription>@{developerUsername}</DialogDescription>
         </DialogHeader>
 
         {isSubmitted ? (
           <div className="py-8 text-center">
             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
               <CheckCircle2 className="h-8 w-8 text-primary" />
             </div>
             <h3 className="mb-2 text-lg font-semibold">Message Sent!</h3>
             <p className="mb-6 text-sm text-muted-foreground">
               {developerName} will receive your inquiry and get back to you soon.
             </p>
             <Button onClick={handleClose}>Close</Button>
           </div>
         ) : (
           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <Label htmlFor="name">Your Name</Label>
                 <div className="relative">
                   <Input
                     id="name"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     placeholder="John Doe"
                     required
                     className="pl-10"
                   />
                   <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <div className="relative">
                   <Input
                     id="email"
                     type="email"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     placeholder="john@company.com"
                     required
                     className="pl-10"
                   />
                   <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 </div>
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="company">Company (Optional)</Label>
               <div className="relative">
                 <Input
                   id="company"
                   value={formData.company}
                   onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                   placeholder="Acme Inc."
                   className="pl-10"
                 />
                 <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="message">Message</Label>
               <Textarea
                 id="message"
                 value={formData.message}
                 onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                 placeholder={`Hi ${developerName.split(" ")[0]}, I came across your profile and would love to discuss...`}
                 rows={4}
                 required
               />
             </div>
 
             {submitError && (
               <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                 {submitError}
               </div>
             )}

             <div className="flex gap-3 pt-2">
               <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                 Cancel
               </Button>
               <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
                 {isSubmitting ? (
                   "Sending..."
                 ) : (
                   <>
                     <Send className="h-4 w-4" />
                     Send Message
                   </>
                 )}
               </Button>
             </div>
           </form>
         )}
       </DialogContent>
     </Dialog>
  );
}
