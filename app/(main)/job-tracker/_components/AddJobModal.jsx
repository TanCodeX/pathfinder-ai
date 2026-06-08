"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Briefcase, MapPin, DollarSign, Link as LinkIcon, Calendar } from "lucide-react";
import { createJobApplication } from "@/actions/job-tracker";
import { getATSAnalyses } from "@/actions/ats";
import { getCoverLetters } from "@/actions/cover-letter";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddJobModal({ isOpen, onClose, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [atsAnalyses, setAtsAnalyses] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    status: "Wishlist",
    location: "",
    salary: "",
    url: "",
    atsAnalysisId: "",
    coverLetterId: "",
    interviewDate: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    try {
      const [atsRes, clRes] = await Promise.all([
        getATSAnalyses(),
        getCoverLetters(),
      ]);
      if (atsRes.success) {
        setAtsAnalyses(atsRes.data);
      }
      if (clRes) {
        setCoverLetters(clRes);
      }
    } catch (err) {
      console.error("Failed to load modal details:", err);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (payload.status !== "Interviewing") {
        delete payload.interviewDate;
      }
      const res = await createJobApplication(payload);
      if (res.success) {
        toast.success("Application added successfully!");
        onAdd(res.data);
        setFormData({
          companyName: "",
          jobTitle: "",
          status: "Wishlist",
          location: "",
          salary: "",
          url: "",
          atsAnalysisId: "",
          coverLetterId: "",
          interviewDate: "",
        });
        onClose();
      } else {
        toast.error(res.errors?._form?.[0] || "Failed to add application");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/30">
            <h2 className="text-xl font-bold text-foreground">Add Application</h2>
            <button
              onClick={onClose}
              className="p-2 bg-background rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  placeholder="Job Title"
                  className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary"
                  value={formData.jobTitle}
                  onChange={e => setFormData(p => ({ ...p, jobTitle: e.target.value }))}
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  placeholder="Company Name"
                  className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary"
                  value={formData.companyName}
                  onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary"
                    value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Salary"
                    className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary"
                    value={formData.salary}
                    onChange={e => setFormData(p => ({ ...p, salary: e.target.value }))}
                  />
                </div>
              </div>

              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Job Posting URL"
                  className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary"
                  value={formData.url}
                  onChange={e => setFormData(p => ({ ...p, url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["Wishlist", "Applied", "Interviewing", "Offer Received", "Archived"].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, status: s }))}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        formData.status === s 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {formData.status === "Interviewing" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Interview Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary"
                      value={formData.interviewDate}
                      onChange={e => setFormData(p => ({ ...p, interviewDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {coverLetters.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Link Cover Letter (Optional)
                  </label>
                  <select
                    className="w-full h-12 px-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.coverLetterId}
                    onChange={e => setFormData(p => ({ ...p, coverLetterId: e.target.value }))}
                  >
                    <option value="">-- None --</option>
                    {coverLetters.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.jobTitle} @ {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {atsAnalyses.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Link ATS Analysis (Optional)
                  </label>
                  <select
                    className="w-full h-12 px-3 rounded-xl bg-background border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.atsAnalysisId}
                    onChange={e => setFormData(p => ({ ...p, atsAnalysisId: e.target.value }))}
                  >
                    <option value="">-- None --</option>
                    {atsAnalyses.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.jobTitle || "Untitled"} @ {a.companyName || "Unknown"} (Score: {a.atsScore})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-md"
              >
                {loading ? "Adding..." : "Add to Tracker"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
