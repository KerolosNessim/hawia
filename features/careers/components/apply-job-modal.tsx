"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyToJobPublic } from "@/features/careers/api/jobsPublicApi";
import type { ApplyJobPayload, JobOpening, ValidationErrors } from "@/features/careers/types/jobs";
import { ApiError } from "@/lib/api";

type Props = {
  opening: JobOpening | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function ApplyJobModal({ opening, open, onOpenChange }: Props) {
  const locale = useLocale();
  const isAr = locale.startsWith("ar");
  const normalizedLocale = isAr ? "ar" : "en";

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [form, setForm] = useState<ApplyJobPayload>({
    job_opening_id: opening?.id ?? 0,
    name: "",
    email: "",
    age: "",
    cv_file: null,
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, job_opening_id: opening?.id ?? 0 }));
    setErrors({});
  }, [opening?.id]);

  const fieldError = (field: string) => {
    const value = errors[field];
    if (!value || !value.length) return null;
    return <p className="text-xs text-destructive">{value[0]}</p>;
  };

  function resetAndClose() {
    setForm({
      job_opening_id: opening?.id ?? 0,
      name: "",
      email: "",
      age: "",
      cv_file: null,
    });
    setErrors({});
    onOpenChange(false);
  }

  function validate(): ValidationErrors {
    const nextErrors: ValidationErrors = {};

    if (!form.name.trim()) nextErrors.name = [isAr ? "الاسم مطلوب" : "Name is required"];

    const email = form.email.trim();
    if (!email) {
      nextErrors.email = [isAr ? "البريد الإلكتروني مطلوب" : "Email is required"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = [isAr ? "صيغة البريد غير صحيحة" : "Invalid email format"];
    }

    const ageNumber = Number(form.age);
    if (!form.age.trim()) {
      nextErrors.age = [isAr ? "العمر مطلوب" : "Age is required"];
    } else if (!Number.isFinite(ageNumber) || ageNumber < 15 || ageNumber > 100) {
      nextErrors.age = [isAr ? "العمر يجب أن يكون بين 15 و 100" : "Age must be between 15 and 100"];
    }

    if (!form.cv_file) {
      nextErrors.cv_file = [isAr ? "ملف السيرة الذاتية مطلوب" : "CV file is required"];
    } else {
      const fileName = form.cv_file.name.toLowerCase();
      const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
      if (!hasValidExtension) {
        nextErrors.cv_file = [isAr ? "الملف يجب أن يكون PDF أو DOC أو DOCX" : "File must be PDF, DOC, or DOCX"];
      } else if (form.cv_file.size > MAX_FILE_BYTES) {
        nextErrors.cv_file = [isAr ? "الحد الأقصى لحجم الملف 10MB" : "Maximum file size is 10MB"];
      }
    }
    return nextErrors;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!opening?.id) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(isAr ? "يرجى تصحيح الحقول المطلوبة" : "Please fix form errors");
      return;
    }

    try {
      setSubmitting(true);
      await applyToJobPublic(
        {
          ...form,
          job_opening_id: opening.id,
        },
        normalizedLocale
      );
      toast.success(isAr ? "تم إرسال طلبك بنجاح" : "Application submitted successfully");
      resetAndClose();
    } catch (error) {
      if (error instanceof ApiError) {
        const apiErrors = (error.validationErrors || {}) as ValidationErrors;
        setErrors(apiErrors);
        toast.error(error.message || (isAr ? "فشل إرسال الطلب" : "Failed to submit"));
      } else {
        toast.error(isAr ? "حدث خطأ غير متوقع" : "Unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isAr ? "التقديم على الوظيفة" : "Apply for this job"}</DialogTitle>
          <DialogDescription>
            {opening?.title || (isAr ? "يرجى تعبئة البيانات التالية" : "Please fill in your details")}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={onSubmit}>
          <input type="hidden" name="job_opening_id" value={opening?.id || ""} />

          <div className="space-y-1">
            <Label htmlFor="apply-name">{isAr ? "الاسم" : "Name"}</Label>
            <Input
              id="apply-name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              aria-invalid={Boolean(errors.name?.length)}
            />
            {fieldError("name")}
          </div>

          <div className="space-y-1">
            <Label htmlFor="apply-email">{isAr ? "البريد الإلكتروني" : "Email"}</Label>
            <Input
              id="apply-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              aria-invalid={Boolean(errors.email?.length)}
            />
            {fieldError("email")}
          </div>

          <div className="space-y-1">
            <Label htmlFor="apply-age">{isAr ? "العمر" : "Age"}</Label>
            <Input
              id="apply-age"
              name="age"
              type="number"
              min={15}
              max={100}
              value={form.age}
              onChange={(e) => setForm((s) => ({ ...s, age: e.target.value }))}
              aria-invalid={Boolean(errors.age?.length)}
            />
            {fieldError("age")}
          </div>

          <div className="space-y-1">
            <Label htmlFor="apply-cv">{isAr ? "السيرة الذاتية" : "CV File"}</Label>
            <Input
              id="apply-cv"
              name="cv_file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setForm((s) => ({ ...s, cv_file: e.target.files?.[0] || null }))}
              aria-invalid={Boolean(errors.cv_file?.length)}
            />
            {fieldError("cv_file")}
          </div>

          <Button
            type="submit"
            className="w-full bg-brand text-white hover:bg-brand/90"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isAr ? "إرسال الطلب" : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

