"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Crown, Users, Target, MessageSquareQuote, ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateExecutivePresence, getExecutivePresences } from "@/actions/executive-presence";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ExecutivePresencePage() {
  const [targetAudience, setTargetAudience] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentPresence, setCurrentPresence] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getExecutivePresences();
    if (res.presences) {
      setHistory(res.presences);
      if (res.presences.length > 0) {
        setCurrentPresence(res.presences[0]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!targetAudience.trim() || !currentChallenge.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("targetAudience", targetAudience);
      formData.append("currentChallenge", currentChallenge);

      const res = await generateExecutivePresence(formData);
      if (res && res.id) {
        toast.success("Executive presence plan generated!");
        setTargetAudience("");
        setCurrentChallenge("");
        loadHistory();
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6">
      <div className="space-y-4 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500">
          <Crown className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Executive Presence Coach</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Command the <span className="text-gradient-primary">Room</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Refine your professional brand, eliminate weak language, and build the gravitas needed for high-stakes leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Your Leadership Challenge</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-indigo-500 flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Target Audience
                </label>
                <Textarea
                  placeholder="e.g., The Board of Directors, skeptical cross-functional VPs, a demotivated team..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="min-h-[80px] resize-none bg-background/50 border-indigo-500/20 rounded-2xl focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-rose-500 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Current Challenge
                </label>
                <Textarea
                  placeholder="e.g., I get interrupted in meetings, I sound too technical, I struggle to project confidence..."
                  value={currentChallenge}
                  onChange={(e) => setCurrentChallenge(e.target.value)}
                  className="min-h-[120px] resize-none bg-background/50 border-rose-500/20 rounded-2xl focus:border-rose-500"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !targetAudience.trim() || !currentChallenge.trim()}
                className="w-full h-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold mt-2 shadow-lg shadow-purple-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Forging Presence...
                  </>
                ) : (
                  <>
                    Build Executive Presence
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Coaching</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPresence(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentPresence?.id === item.id 
                        ? "bg-purple-500/10 border border-purple-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Crown className={`h-4 w-4 shrink-0 ${currentPresence?.id === item.id ? "text-purple-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.targetAudience}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {currentPresence ? (
              <motion.div
                key={currentPresence.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Persona Summary */}
                <div className="p-6 glass rounded-3xl border border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
                  <Crown className="absolute -right-4 -bottom-4 h-32 w-32 text-purple-500/10 rotate-12" />
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-500" /> Executive Brand & Positioning
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed relative z-10">
                    {currentPresence.presenceData.personaSummary}
                  </p>
                </div>

                {/* Communication Upgrades */}
                <div className="p-6 glass rounded-3xl border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquareQuote className="h-5 w-5 text-indigo-500" /> Communication Upgrades
                  </h3>
                  <div className="space-y-4">
                    {currentPresence.presenceData.communicationUpgrades.map((upgrade, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-background/50 border border-border relative overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                          <div>
                            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Stop Saying</p>
                            <p className="text-sm text-muted-foreground line-through decoration-rose-500/50">"{upgrade.from}"</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Start Saying</p>
                            <p className="text-sm text-foreground font-medium">"{upgrade.to}"</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/50 relative z-10">
                          <p className="text-xs text-muted-foreground"><span className="font-bold text-indigo-500">Why:</span> {upgrade.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategy & Gravitas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meeting Strategy */}
                  <div className="p-6 bg-card rounded-3xl border border-indigo-500/20 shadow-sm">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-500" /> Meeting Strategy
                    </h4>
                    <ul className="space-y-3">
                      {currentPresence.presenceData.meetingStrategy.map((strategy, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gravitas Builders */}
                  <div className="p-6 bg-card rounded-3xl border border-amber-500/20 shadow-sm">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-amber-500" /> Daily Gravitas Builders
                    </h4>
                    <ul className="space-y-3">
                      {currentPresence.presenceData.gravitasBuilders.map((builder, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex items-center justify-center h-5 w-5 rounded bg-amber-500/10 text-amber-500 text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                          <span className="text-sm text-muted-foreground">{builder}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-purple-500/30">
                <Crown className="h-12 w-12 text-purple-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No coaching plan generated.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Describe your audience and leadership challenges to build your executive presence.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
