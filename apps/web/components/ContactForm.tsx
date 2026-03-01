"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  contactPayloadSchema,
  type ContactPayloadSchema,
} from "@/lib/validations/contact";
import { submitContact } from "@/lib/api/submitContact";
import { getGridClass } from "@/components/layout/grid";
import { HELPER_TEXT_MAX_W } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ContactPayload } from "@/types/contact";

const defaultValues: ContactPayloadSchema = {
  fname: "",
  lname: "",
  email: "",
  message: "",
};

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
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
    const payload: ContactPayload = {
      fname: data.fname.trim(),
      lname: data.lname.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
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
        <Label htmlFor="contact-message" className={fieldState("message").labelClass}>
          Message
        </Label>
        <textarea
          id="contact-message"
          className={cn(
            "min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm placeholder:text-muted-foreground",
            fieldState("message").inputClass
          )}
          placeholder="How can we help?"
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
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
