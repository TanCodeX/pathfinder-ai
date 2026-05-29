import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import { Sparkles, FileText } from "lucide-react";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Sparkles className="h-3 w-3" />
            AI Resume Engine
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground flex items-center gap-4">
                <FileText className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                Your <span className="text-gradient-primary">Professional Identity</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base font-medium mt-2">
                Craft a precision-engineered resume tailored for the modern job market.
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-1 border border-white/10 shadow-2xl overflow-hidden">
          <div className="bg-background/40 backdrop-blur-md rounded-[2.2rem] p-4 md:p-8">
            <ResumeBuilder initialContent={resume?.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
