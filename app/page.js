"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  Quote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";

import HeroSection from "@/components/Herosection";
import HeroStats from "@/components/HeroStats";
import ScrollToTop from "@/components/ui/Scrolltotop";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  viewport: { once: true, margin: "-50px" },
});

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">

      <HeroSection />

      {/* ─────────────  FEATURES SECTION  ───────────── */}
      <section id="features" className="relative py-24 md:py-32 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Features</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Built for the <span className="text-gradient-primary">Modern Professional</span>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience a suite of AI tools meticulously designed to accelerate your career growth and streamline your success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} {...fadeUp(i * 0.1)} className="group h-full">
                  <div className="relative h-full p-8 rounded-[2rem] glass border border-white/20 dark:border-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden">
                    {/* Hover Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-xl font-bold tracking-tight text-foreground">{f.title}</h4>
                        <p className="text-muted-foreground leading-relaxed text-sm">{f.description}</p>
                      </div>

                      <div className="pt-4 flex items-center text-xs font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore Feature <ChevronRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────  STATS SECTION  ────────────── */}
      <section id="stats" className="py-24 md:py-32 scroll-mt-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div {...fadeUp()}>
            <HeroStats />
          </motion.div>
        </div>
      </section>

      {/* ────────────  HOW IT WORKS SECTION  ────────── */}
      <section id="how-it-works" className="py-24 md:py-32 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div {...fadeUp()} className="max-w-3xl mx-auto text-center mb-20 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Process</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Four Steps to <span className="text-gradient-primary">Elevate Your Career</span>
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 -z-10" />

            {howItWorks.map((step, i) => (
              <motion.div key={step.title} {...fadeUp(i * 0.15)} className="relative flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-[2.5rem] bg-background border border-border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <div className="text-primary">{step.icon}</div>
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg border-2 border-background">
                    {i + 1}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-lg font-bold tracking-tight">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────  TESTIMONIALS SECTION  ───────────── */}
      <section id="feedback" className="py-24 md:py-32 bg-muted/30 overflow-hidden relative">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Loved by Professionals</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonial.map((t, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}>
                <Card className="h-full rounded-3xl border-border bg-background shadow-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 space-y-6 flex flex-col h-full">
                    <Quote className="h-10 w-10 text-primary/20" />
                    <p className="text-muted-foreground leading-relaxed flex-grow italic">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <Image
                        src={t.image}
                        alt={t.author}
                        width={48}
                        height={48}
                        className="rounded-full ring-2 ring-primary/20 object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground leading-none mb-1">{t.author}</p>
                        <p className="text-xs text-muted-foreground font-medium">{t.role} @ {t.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────  FAQ SECTION  ─────────────── */}
      <section id="question" className="py-24 md:py-32 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div {...fadeUp()} className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Got Questions?</h2>
            <p className="text-muted-foreground">Everything you need to know about PathFinder AI</p>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-2xl px-6 bg-background/50 backdrop-blur-sm">
                  <AccordionTrigger className="text-left font-bold py-5 hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ───────────────  CTA SECTION  ─────────────── */}
      <section id="contact" className="py-24 px-4 md:px-6">
        <motion.div
          {...fadeUp()}
          className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden bg-primary p-12 md:p-24 text-center text-primary-foreground shadow-2xl shadow-primary/20"
        >
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none grid-background" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Ready to Accelerate <br /> Your Career Journey?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Join thousands of ambitious professionals using AI to land their dream jobs and master their industry.
            </p>
            <div className="pt-6">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16 px-10 rounded-2xl text-lg font-bold shadow-xl hover:scale-105 transition-transform duration-300 group"
                >
                  Start Your Journey Today
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <ScrollToTop />
    </div>
  );
}
