import { useState } from "react";
import { Mail, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { submitContact } from "@/lib/api/contact.functions";
import { CONTACT_EMAIL, BOOKING_LINK } from "@/lib/env";
import { SectionHeading } from "./SectionHeading";

const requestSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().min(1, "Company is required").max(120),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  teamSize: z.string().max(40).optional().or(z.literal("")),
  timeline: z.string().max(40).optional().or(z.literal("")),
  budget: z.string().max(40).optional().or(z.literal("")),
  automate: z.string().trim().min(1, "Tell us what you want to automate").max(2000),
});

type RequestData = z.infer<typeof requestSchema>;
type Errors = Partial<Record<keyof RequestData, string>>;

const teamSizes = ["1–10", "11–50", "51–200", "201–500", "500+"];
const timelines = ["ASAP", "1–3 months", "3–6 months", "6+ months", "Just exploring"];
const budgets = ["< $5k", "$5k–$15k", "$15k–$50k", "$50k+", "Not sure yet"];

const initialState: RequestData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  role: "",
  industry: "",
  teamSize: "",
  timeline: "",
  budget: "",
  automate: "",
};

export function ContactSection() {
  const [values, setValues] = useState<RequestData>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof RequestData>(key: K, v: RequestData[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = requestSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Errors = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof RequestData;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setLoading(true);
    try {
      const res = await submitContact({ data: result.data });
      if (!res.ok) {
        const formErrors = res.errors ?? {};
        if (formErrors._form) {
          toast.error(formErrors._form);
        } else {
          setErrors(formErrors as Errors);
          toast.error("Please fix the highlighted fields");
        }
        return;
      }
      setSubmitted(true);
      toast.success("Demo request received", {
        description: "We'll respond within 1 business day.",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 border-t border-subtle">
      <div
        className="absolute inset-x-0 top-0 h-[400px] opacity-50 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Ready to automate the busywork?"
          description="Tell us what you're trying to fix. We'll show you how Columbus AI would run it."
        />
        <div className="mt-12 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-subtle surface-1 p-5">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[color:var(--brand-cyan)]" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-foreground hover:text-gradient">
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Clock className="h-4 w-4 text-[color:var(--brand-cyan)]" />
                <span className="text-sm text-muted-foreground">Response within 1 business day</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every request gets a real reply from someone who can scope and build. No bots, no chains of forms.
            </p>
          </div>

          <div className="lg:col-span-3">
            {submitted ? (
              <Confirmation values={values} onReset={reset} />
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-strong surface-1 p-6 sm:p-8 space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="First Name" id="firstName" required
                    value={values.firstName} onChange={(v) => set("firstName", v)}
                    placeholder="John" error={errors.firstName} maxLength={80}
                  />
                  <TextField
                    label="Last Name" id="lastName" required
                    value={values.lastName} onChange={(v) => set("lastName", v)}
                    placeholder="Doe" error={errors.lastName} maxLength={80}
                  />
                </div>
                <TextField
                  label="Email" id="email" type="email" required
                  value={values.email} onChange={(v) => set("email", v)}
                  placeholder="john@company.com" error={errors.email} maxLength={255}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Phone" id="phone" type="tel"
                    value={values.phone ?? ""} onChange={(v) => set("phone", v)}
                    placeholder="(555) 123-4567" error={errors.phone} maxLength={40}
                  />
                  <TextField
                    label="Company" id="company" required
                    value={values.company} onChange={(v) => set("company", v)}
                    placeholder="Acme Inc." error={errors.company} maxLength={120}
                  />
                </div>
                <TextField
                  label="Website" id="website" optional
                  value={values.website ?? ""} onChange={(v) => set("website", v)}
                  placeholder="example.com or https://example.com" error={errors.website} maxLength={255}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Role" id="role"
                    value={values.role ?? ""} onChange={(v) => set("role", v)}
                    placeholder="Operations Manager" error={errors.role} maxLength={120}
                  />
                  <TextField
                    label="Industry" id="industry"
                    value={values.industry ?? ""} onChange={(v) => set("industry", v)}
                    placeholder="Healthcare" error={errors.industry} maxLength={120}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField
                    label="Team size" value={values.teamSize ?? ""}
                    onChange={(v) => set("teamSize", v)} placeholder="Select team size" options={teamSizes}
                  />
                  <SelectField
                    label="Timeline" value={values.timeline ?? ""}
                    onChange={(v) => set("timeline", v)} placeholder="Select timeline" options={timelines}
                  />
                  <SelectField
                    label="Budget" value={values.budget ?? ""}
                    onChange={(v) => set("budget", v)} placeholder="Select budget range" options={budgets}
                  />
                </div>
                <div>
                  <Label htmlFor="automate" className="text-sm">
                    What do you want to automate? <span className="text-[color:var(--destructive)]">*</span>
                  </Label>
                  <Textarea
                    id="automate"
                    rows={4}
                    value={values.automate}
                    onChange={(e) => set("automate", e.target.value)}
                    maxLength={2000}
                    placeholder="e.g. Lead follow-ups, invoice processing"
                    className="mt-1.5 surface-2 border-subtle"
                    aria-invalid={!!errors.automate}
                  />
                  {errors.automate && (
                    <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.automate}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By clicking "Request Demo" you agree to receive email communications from Columbus AI
                  Automation Solutions. You can unsubscribe at any time.
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                >
                  {loading ? "Sending…" : "Request Demo"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TextField({
  label, id, type = "text", required, optional, placeholder, value, onChange, error, maxLength,
}: {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm flex items-center gap-1.5">
        {label}
        {required && <span className="text-[color:var(--destructive)]">*</span>}
        {optional && <span className="text-xs text-muted-foreground font-normal">(optional)</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        className="mt-1.5 surface-2 border-subtle"
      />
      {error && <p className="mt-1 text-xs text-[color:var(--destructive)]">{error}</p>}
    </div>
  );
}

function SelectField({
  label, value, onChange, placeholder, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5 surface-2 border-subtle h-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Confirmation({
  values,
  onReset,
}: {
  values: RequestData;
  onReset: () => void;
}) {
  const bookingHref = BOOKING_LINK;
  return (
    <div className="rounded-2xl border border-strong surface-1 p-8 sm:p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
      <div className="relative">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold tracking-tight">Request received</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Thanks, {values.firstName}. A confirmation is on its way to{" "}
          <span className="text-foreground">{values.email}</span>. We'll respond within 1 business day.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
          <Summary label="Name" value={`${values.firstName} ${values.lastName}`} />
          <Summary label="Company" value={values.company} />
          {values.role && <Summary label="Role" value={values.role} />}
          {values.industry && <Summary label="Industry" value={values.industry} />}
          {values.teamSize && <Summary label="Team size" value={values.teamSize} />}
          {values.timeline && <Summary label="Timeline" value={values.timeline} />}
          {values.budget && <Summary label="Budget" value={values.budget} />}
        </div>

        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Button onClick={onReset} variant="outline" className="border-strong">
            Submit another request
          </Button>
          {bookingHref ? (
            <Button asChild className="bg-gradient-primary text-primary-foreground">
              <a href={bookingHref} target="_blank" rel="noopener noreferrer">
                Book a call <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="border-strong">
            <a href={`mailto:${CONTACT_EMAIL}`}>
              Email us directly <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-subtle surface-2 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground mt-0.5 truncate">{value}</div>
    </div>
  );
}