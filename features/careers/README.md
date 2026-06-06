# Careers Public Integration

This module implements the public Careers page using API endpoints:

- `GET /api/v1/jobs/header`
- `GET /api/v1/jobs/sections`
- `GET /api/v1/jobs/openings`
- `POST /api/v1/jobs/apply` (multipart)

## Environment

Uses:

- `NEXT_PUBLIC_API_URL`

If missing, falls back to `CONFIG.BACK_URL`.

## Structure

- `types/jobs.ts` - API and domain types
- `api/jobsPublicApi.ts` - API calls and normalization
- `hooks/useJobsHeader.ts`
- `hooks/useJobsSections.ts`
- `hooks/useJobOpenings.ts`
- `components/jobs-header.tsx`
- `components/jobs-section-renderer.tsx`
- `components/job-openings-grid.tsx`
- `components/apply-job-modal.tsx`

## Behavior

- Fully supports RTL/LTR via locale.
- Sends `Accept-Language: ar|en` on public calls.
- Graceful fallback for header failures.
- Loading skeletons for sections and openings.
- Retry button for failed loads.
- Apply form validation:
  - required name/email/age/cv
  - email format
  - age range 15-100
  - CV extension `pdf/doc/docx`, max 10MB
- Handles server validation errors and field-level messages.

