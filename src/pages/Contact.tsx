import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl px-4 pb-12 pt-28 md:pt-32">
        <h1 className="mb-4 text-display-sm">Contact</h1>
        <p className="mb-6 text-body text-muted-foreground">
          Send a message and our team will get back to you.
        </p>

        <div className="rounded-2xl border border-border bg-card p-6">
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} placeholder="How can we help?" />
            </div>
            <Button type="button">Send message</Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
