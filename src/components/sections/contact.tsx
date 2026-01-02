'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useTrainerSlug } from '@/components/TrainerContext';
import { useData } from '@/lib/data-provider';
import { useAlert } from '@/components/ui/custom-alert';

export function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const slug = useTrainerSlug();
  const { addMessage } = useData();
  const { showAlert } = useAlert();

  const onSubmit = async (data: any) => {
    const btn = document.getElementById('contact-submit-btn') as HTMLButtonElement;
    let originalText = "";

    if(btn) {
        originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Sending...";
    }

    try {
        await addMessage({
            name: data.name,
            email: data.email,
            goal: data.goal,
            message: data.message
        }, slug || undefined);

        showAlert("Success", "Message sent! I'll get back to you within 24 hours.");
        reset();
    } catch (e) {
        console.error(e);
        showAlert("Error", "Failed to send message. Please try again later.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
  };

  return (
    <section id="contact" className="py-24 bg-background border-t border-border/5">
      <div className="container px-4 mx-auto max-w-4xl">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <Card className="border-border/50 shadow-2xl bg-card dark:bg-white/[0.03] dark:backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-black uppercase">Start Your Transformation</CardTitle>
              <CardDescription>
                Ready to commit? Fill out the form below and I'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="John Doe" {...register("name", { required: true })} />
                    {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" {...register("email", { required: true })} />
                    {errors.email && <span className="text-red-500 text-xs">Email is required</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Input id="goal" placeholder="e.g. Weight Loss, Muscle Gain, Competition Prep" {...register("goal")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell me about your fitness journey..." className="min-h-[120px]" {...register("message", { required: true })} />
                  {errors.message && <span className="text-red-500 text-xs">Message is required</span>}
                </div>

                <Button id="contact-submit-btn" type="submit" size="lg" className="w-full text-lg">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
