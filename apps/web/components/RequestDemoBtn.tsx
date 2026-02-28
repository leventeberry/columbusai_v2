"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  requestDemoSchema,
  type RequestDemoFormData,
  BUDGET_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/validations/request-demo";
import { submitContact } from "@/lib/api/submitContact";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function RequestDemoBtn() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_LINK ?? "https://cal.com/columbus-ai/30min";

  const {
    register,
    control,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<RequestDemoFormData>({
    resolver: zodResolver(requestDemoSchema),
    mode: "onTouched",
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      role: "",
      industry: "",
      team_size: "",
      what_automate: "",
      budget: "",
      timeline: "",
    },
  });

  // react-hook-form watch() used for field state; compatible with donor UI behavior
  // eslint-disable-next-line react-hooks/incompatible-library -- baseline form pattern
  const values = watch();
  const hasValue = (v: unknown) =>
    v != null && String(v).trim() !== "";

  const fieldState = (name: keyof RequestDemoFormData) => {
    const invalid = !!errors[name];
    const touched = !!touchedFields[name];
    const valid = touched && !invalid && hasValue(values[name]);
    return {
      invalid,
      valid,
      labelClass: cn(invalid && "text-destructive", valid && "text-green-600"),
      inputClass: cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50",
        invalid &&
          "border-destructive ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20",
        valid &&
          "border-green-600 ring-green-600/20 focus-visible:border-green-600 focus-visible:ring-green-600/50"
      ),
    };
  };

  const onSubmit = async (data: RequestDemoFormData) => {
    setServerError(null);
    let website = (data.website ?? "").trim();
    if (website && !/^https?:\/\//i.test(website)) {
      website = "https://" + website;
    }
    const payload = {
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      phone: data.phone ?? "",
      company: data.company ?? "",
      role: data.role ?? "",
      industry: data.industry ?? "",
      team_size: data.team_size ?? "",
      website,
      what_automate: data.what_automate ?? "",
      budget: data.budget ?? "",
      timeline: data.timeline ?? "",
    };
    try {
      const res = await submitContact(payload);
      if (res.ok) {
        setSuccess(true);
        return;
      }
      if (res.errors) {
        for (const [key, message] of Object.entries(res.errors)) {
          if (key === "_form") {
            setServerError(message);
          } else if (key !== "_cooldown") {
            setError(key as keyof RequestDemoFormData, {
              type: "server",
              message,
            });
          }
        }
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSuccess(false);
      setServerError(null);
    }
    setOpen(next);
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="min-h-10 shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Request a Demo
      </DialogTrigger>
      <DialogContent className="w-full max-w-md p-6">
        <DialogClose />
        {success ? (
          <div className="mt-6 space-y-6">
            <p className="text-foreground">
              Your information has been passed to our team for review. Someone
              will reach out to you shortly.
            </p>
            <p className="text-muted-foreground">
              In the meantime, you can schedule a meeting at a time that works
              for you.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Schedule a meeting
                </a>
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request a Demo</DialogTitle>
              <DialogDescription>
                Enter your details and we&apos;ll get back to you soon.
              </DialogDescription>
            </DialogHeader>
            <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col space-y-4"
        >
          <div className="flex flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="fname" className={fieldState("fname").labelClass}>
                First Name
              </Label>
              <Input
                id="fname"
                placeholder="John"
                autoComplete="given-name"
                aria-invalid={!!errors.fname}
                className={fieldState("fname").inputClass}
                {...register("fname")}
              />
              {errors.fname && (
                <p className="text-sm text-destructive">
                  {errors.fname.message}
                </p>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="lname" className={fieldState("lname").labelClass}>
                Last Name
              </Label>
              <Input
                id="lname"
                placeholder="Doe"
                autoComplete="family-name"
                aria-invalid={!!errors.lname}
                className={fieldState("lname").inputClass}
                {...register("lname")}
              />
              {errors.lname && (
                <p className="text-sm text-destructive">
                  {errors.lname.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={fieldState("email").labelClass}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className={fieldState("email").inputClass}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className={fieldState("phone").labelClass}>
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              className={fieldState("phone").inputClass}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className={fieldState("company").labelClass}>
              Company
            </Label>
            <Input
              id="company"
              placeholder="Acme Inc."
              autoComplete="organization"
              aria-invalid={!!errors.company}
              className={fieldState("company").inputClass}
              {...register("company")}
            />
            {errors.company && (
              <p className="text-sm text-destructive">
                {errors.company.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className={fieldState("website").labelClass}>
              Website
            </Label>
            <div
              className={cn(
                "flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent shadow-xs focus-within:ring-[3px] focus-within:ring-offset-0 focus-within:ring-offset-background",
                fieldState("website").invalid &&
                  "border-destructive focus-within:ring-destructive/20",
                fieldState("website").valid &&
                  "border-green-600 focus-within:ring-green-600/50"
              )}
            >
              <span className="flex h-full items-center border-r border-input bg-muted px-3 text-sm text-muted-foreground">
                https://
              </span>
              <Input
                id="website"
                type="text"
                placeholder="www.example.com"
                autoComplete="url"
                aria-invalid={!!errors.website}
                className="h-full min-w-0 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                {...register("website")}
              />
            </div>
            {errors.website && (
              <p className="text-sm text-destructive">
                {errors.website.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className={fieldState("role").labelClass}>
              Role
            </Label>
            <Input
              id="role"
              placeholder="Operations Manager"
              className={fieldState("role").inputClass}
              {...register("role")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className={fieldState("industry").labelClass}>
              Industry
            </Label>
            <Input
              id="industry"
              placeholder="Healthcare"
              className={fieldState("industry").inputClass}
              {...register("industry")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_size" className={fieldState("team_size").labelClass}>
              Team size
            </Label>
            <Controller
              name="team_size"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="team_size"
                    aria-invalid={!!errors.team_size}
                    className={cn("w-full", fieldState("team_size").inputClass)}
                  >
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.team_size && (
              <p className="text-sm text-destructive">
                {errors.team_size.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline" className={fieldState("timeline").labelClass}>
              Timeline
            </Label>
            <Controller
              name="timeline"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="timeline"
                    aria-invalid={!!errors.timeline}
                    className={cn("w-full", fieldState("timeline").inputClass)}
                  >
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.timeline && (
              <p className="text-sm text-destructive">
                {errors.timeline.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className={fieldState("budget").labelClass}>
              Budget
            </Label>
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="budget"
                    aria-invalid={!!errors.budget}
                    className={cn("w-full", fieldState("budget").inputClass)}
                  >
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.budget && (
              <p className="text-sm text-destructive">
                {errors.budget.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="what_automate"
              className={fieldState("what_automate").labelClass}
            >
              What do you want to automate?
            </Label>
            <textarea
              id="what_automate"
              className={cn(
                "min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm placeholder:text-muted-foreground",
                fieldState("what_automate").inputClass
              )}
              placeholder="e.g. Lead follow-ups, invoice processing"
              aria-invalid={!!errors.what_automate}
              {...register("what_automate")}
            />
            {errors.what_automate && (
              <p className="text-sm text-destructive">
                {errors.what_automate.message}
              </p>
            )}
          </div>


          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-muted-foreground text-xs max-w-[280px]">
              By clicking &quot;Submit&quot; you agree to receive email marketing
              and other communications from Columbus AI Automation Solutions. You
              can unsubscribe at any time.
            </p>
            <Button type="submit" className="shrink-0" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
