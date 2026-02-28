export type ContactPayload = {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  industry: string;
  team_size: string;
  website: string;
  what_automate: string;
  budget: string;
  timeline: string;
};

export type ContactResponse = {
  ok: boolean;
  errors?: ContactErrors;
};

export type ContactErrors = Record<string, string>;

export type Lead = {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  industry: string;
  team_size: string;
  what_automate: string;
  budget: string;
  timeline: string;
  website: string;
  created_at: string;
};
