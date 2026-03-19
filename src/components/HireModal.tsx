import { useState } from "react";
import { Mail, Send, MessageSquare, Briefcase, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import type { HireDeveloperPayload } from "@/types/api";

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerName: string;
  developerUsername: string;
  onSubmit?: (payload: HireDeveloperPayload) => Promise<void>;
}

export function HireModal({ isOpen, onClose, developerName, developerUsername, onSubmit }: HireModalProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    founder_name: "",
    founder_email: "",
    company: "",
    role_type: "paid" as "volunteer" | "paid",
    charges_per: "month" as "hour" | "day" | "week" | "month" | "project" | "milestone",
    compensation_amount: "",
    compensation_currency: "USD",
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
        // Build payload with only required fields to avoid 422 errors
        // Backend uses extra="forbid" so only send what's needed
        const payload: HireDeveloperPayload = {
          founder_name: formData.founder_name,
          founder_email: formData.founder_email,
          role_type: formData.role_type,
          message: formData.message,
        };

        // Add optional fields only if they have values
        if (formData.company.trim()) {
          payload.company = formData.company;
        }

        if (formData.role_type === 'paid') {
          payload.charges_per = formData.charges_per;
          
          if (formData.compensation_amount.trim()) {
            payload.compensation_amount = Number(formData.compensation_amount);
          }
          
          if (formData.compensation_currency.trim()) {
            payload.compensation_currency = formData.compensation_currency;
          }
        }

        await onSubmit(payload);
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
      setFormData({
        founder_name: "",
        founder_email: "",
        company: "",
        role_type: "paid",
        charges_per: "month",
        compensation_amount: "",
        compensation_currency: "USD",
        message: "",
      });
      setIsSubmitted(false);
      setSubmitError(null);
    }, 300);
  };

  const content = isSubmitted ? (
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
              value={formData.founder_name}
              onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
              placeholder="John Doe"
              required
              className="pl-10 w-full"
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
              value={formData.founder_email}
              onChange={(e) => setFormData({ ...formData, founder_email: e.target.value })}
              placeholder="john@company.com"
              required
              className="pl-10 w-full"
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
            className="pl-10 w-full"
          />
          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role_type">Engagement Type</Label>
        <Select
          value={formData.role_type}
          onValueChange={(value: "volunteer" | "paid") => setFormData({ ...formData, role_type: value })}
        >
          <SelectTrigger id="role_type" className="w-full">
            <SelectValue placeholder="Select role type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.role_type === 'paid' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="charges_per">Charges Per</Label>
            <Select
              value={formData.charges_per}
              onValueChange={(value: "hour" | "day" | "week" | "month" | "project" | "milestone") =>
                setFormData({ ...formData, charges_per: value })
              }
            >
              <SelectTrigger id="charges_per" className="w-full">
                <SelectValue placeholder="Charges per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compensation_amount">Amount</Label>
            <Input
              id="compensation_amount"
              inputMode="decimal"
              value={formData.compensation_amount}
              onChange={(e) => setFormData({ ...formData, compensation_amount: e.target.value })}
              placeholder="5000"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compensation_currency">Currency</Label>
            <Input
              id="compensation_currency"
              value={formData.compensation_currency}
              onChange={(e) => setFormData({ ...formData, compensation_currency: e.target.value.toUpperCase() })}
              placeholder="USD"
              maxLength={8}
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder={`Hi ${developerName.split(" ")[0]}, I came across your profile and would love to discuss...`}
          rows={4}
          required
          className="w-full"
        />
      </div>

      {submitError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2 sm:order-first">
          {isSubmitting ? (
            "Sending..."
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto sm:order-last">
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto px-4 pb-6">
          <DrawerHeader>
            <DrawerTitle>Contact {developerName}</DrawerTitle>
            <DrawerDescription>@{developerUsername}</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {developerName}</DialogTitle>
          <DialogDescription>@{developerUsername}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
