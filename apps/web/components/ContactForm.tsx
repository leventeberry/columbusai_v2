"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  contactPayloadSchema,
  type ContactPayloadSchema,
} from "@/lib/validations/contact";
import {
  BUDGET_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/validations/request-demo";
import { submitContact } from "@/lib/api/submitContact";
import { getGridClass } from "@/components/layout/grid";
import { HELPER_TEXT_MAX_W } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

const defaultValues: ContactPayloadSchema = {
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
};

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ContactPayloadSchema>({
    resolver: zodResolver(contactPayloadSchema),
    mode: "onTouched",
    defaultValues,
  });

  const values = watch();
  const hasValue = (v: unknown) => v != null && String(v).trim() !== "";

  const fieldState = (name: keyof ContactPayloadSchema) => {
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

  const onSubmit = async (data: ContactPayloadSchema) => {
    setServerError(null);
    let website = (data.website ?? "").trim();
    if (website && !/^https?:\/\//i.test(website)) {
      website = "https://" + website;
    }
    const payload = {
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      what_automate: data.what_automate ?? "",
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
            setError(key as keyof ContactPayloadSchema, {
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

  if (success) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Thank you for reaching out
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your message has been sent. We&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className={getGridClass("form")}>
        <div className="space-y-2">
          <Label htmlFor="contact-fname" className={fieldState("fname").labelClass}>
            First Name
          </Label>
          <Input
            id="contact-fname"
            placeholder="John"
            autoComplete="given-name"
            aria-invalid={!!errors.fname}
            className={fieldState("fname").inputClass}
            {...register("fname")}
          />
          {errors.fname && (
            <p className="text-sm text-destructive">{errors.fname.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-lname" className={fieldState("lname").labelClass}>
            Last Name
          </Label>
          <Input
            id="contact-lname"
            placeholder="Doe"
            autoComplete="family-name"
            aria-invalid={!!errors.lname}
            className={fieldState("lname").inputClass}
            {...register("lname")}
          />
          {errors.lname && (
            <p className="text-sm text-destructive">{errors.lname.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email" className={fieldState("email").labelClass}>
          Email
        </Label>
        <Input
          id="contact-email"
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
        <Label htmlFor="contact-phone" className={fieldState("phone").labelClass}>
          Phone
        </Label>
        <Input
          id="contact-phone"
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
        <Label htmlFor="contact-company" className={fieldState("company").labelClass}>
          Company
        </Label>
        <Input
          id="contact-company"
          placeholder="Acme Inc."
          autoComplete="organization"
          aria-invalid={!!errors.company}
          className={fieldState("company").inputClass}
          {...register("company")}
        />
        {errors.company && (
          <p className="text-sm text-destructive">{errors.company.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-what_automate" className={fieldState("what_automate").labelClass}>
          What do you want to automate?
        </Label>
        <textarea
          id="contact-what_automate"
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

      <div className="space-y-2">
        <Label htmlFor="contact-website" className={fieldState("website").labelClass}>
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
            id="contact-website"
            type="text"
            placeholder="www.example.com"
            autoComplete="url"
            aria-invalid={!!errors.website}
            className="h-full min-w-0 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            {...register("website")}
          />
        </div>
        {errors.website && (
          <p className="text-sm text-destructive">{errors.website.message}</p>
        )}
      </div>

      <div className={getGridClass("form")}>
        <div className="space-y-2">
          <Label htmlFor="contact-role" className={fieldState("role").labelClass}>
            Role
          </Label>
          <Input
            id="contact-role"
            placeholder="Operations Manager"
            className={fieldState("role").inputClass}
            {...register("role")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-industry" className={fieldState("industry").labelClass}>
            Industry
          </Label>
          <Input
            id="contact-industry"
            placeholder="Healthcare"
            className={fieldState("industry").inputClass}
            {...register("industry")}
          />
        </div>
      </div>

      <div className={getGridClass("form")}>
        <div className="space-y-2">
          <Label htmlFor="contact-team_size" className={fieldState("team_size").labelClass}>
            Team size
          </Label>
          <Controller
            name="team_size"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="contact-team_size"
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-timeline" className={fieldState("timeline").labelClass}>
            Timeline
          </Label>
          <Controller
            name="timeline"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="contact-timeline"
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-budget" className={fieldState("budget").labelClass}>
          Budget
        </Label>
        <Controller
          name="budget"
          control={control}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger
                id="contact-budget"
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
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <p className={cn(HELPER_TEXT_MAX_W, "text-xs text-muted-foreground")}>
          By submitting you agree to receive communications from Columbus AI
          Automation Solutions. You can unsubscribe at any time.
        </p>
        <Button type="submit" className="shrink-0" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
