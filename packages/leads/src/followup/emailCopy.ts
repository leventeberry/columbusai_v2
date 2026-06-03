import type { FollowupObjective } from "./templates.js";

export type FollowupEmailCopy = {
  subject: string;
  headline: string;
};

export const FOLLOWUP_EMAIL_COPY: Record<FollowupObjective, FollowupEmailCopy> = {
  reminder: {
    subject: "Quick follow-up on your demo request",
    headline: "Quick follow-up",
  },
  value: {
    subject: "How automation could help your team",
    headline: "Automation that fits your goals",
  },
  social_proof: {
    subject: "How teams like yours use Columbus AI",
    headline: "Results from similar teams",
  },
  objection_handling: {
    subject: "Common questions about getting started",
    headline: "A few things we hear often",
  },
  re_engagement: {
    subject: "Still thinking about automation?",
    headline: "Checking back in",
  },
  final_close: {
    subject: "Should we close the loop?",
    headline: "Should we close the loop?",
  },
};
