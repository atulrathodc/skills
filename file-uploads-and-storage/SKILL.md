---
name: file-uploads-and-storage
description: Implement secure, scalable file uploads and object storage (S3, R2, GCS) — presigned URLs, multipart streaming, magic-byte validation, path traversal defense, private vs public buckets, CDN caching, and orphan cleanup.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# File Uploads and Storage

Never store user uploads on the application server's local disk in production — containers and serverless instances have ephemeral filesystems, and proxying large files through your API server exhausts memory and bandwidth.

1. **Use direct-to-object-storage presigned URLs for anything beyond tiny payloads** — API authenticates the user, validates metadata (size, allowed MIME type, quota), creates a `pending` DB record, and returns a short-lived (60–300s) presigned `PUT`/`POST` URL scoped to a server-generated object key, exact `Content-Type`, and `Content-Length` limit. The client uploads directly to S3/R2/GCS, then confirms completion.
2. **Never trust client filenames, extensions, or `Content-Type` headers** — generate opaque server-side object keys (`tenants/<tenant_id>/uploads/<uuid>`) and store the original filename only as display metadata (sanitized on download). Never concatenate user input into a filesystem or bucket path (`../../etc/passwd`).
3. **Validate actual file bytes (magic numbers), not just extensions** — inspect leading bytes (e.g., `file-type` in Node, `python-magic` in Python) or re-encode uploaded images (Sharp/Pillow) to strip EXIF metadata, polyglot payloads, and embedded scripts. Reject or sandbox active content like `image/svg+xml` and `text/html` — serving user SVG inline on your app origin is instant stored XSS.
4. **Enforce strict size limits at every layer** — configure body/multipart limits at the reverse proxy (Nginx `client_max_body_size`), the web framework, AND the presigned policy (`content-length-range`). Stream uploads when proxying through a backend; never buffer entire files into RAM with `await req.arrayBuffer()` without a cap.
5. **Keep buckets private by default** — serve private user files via short-lived presigned `GET` URLs or signed CDN cookies after checking object-level authorization (`authorization-and-multitenancy`). Only put genuinely public, immutable assets in a public bucket behind a CDN, and serve user uploads from a separate domain/subdomain (not your app's cookie origin).
6. **Set safe download and cache headers** — set `Content-Disposition: attachment; filename="..."` and `X-Content-Type-Options: nosniff` on untrusted user downloads so browsers do not execute uploaded HTML/JS. For immutable content-addressed assets (hash in key), set `Cache-Control: public, max-age=31536000, immutable`.
7. **Configure bucket CORS explicitly for direct browser uploads** — allow `PUT`/`POST` from your exact app origin(s), expose `ETag` (required for S3 multipart upload completion), and keep `AllowedHeaders` explicit. A missing `ExposeHeaders: ["ETag"]` silently breaks multipart uploads in the browser.
8. **Use multipart uploads for large files (>50–100 MB)** — initiate multipart upload, sign per-part URLs, upload chunks with retry/resume, and call `CompleteMultipartUpload`. Configure a bucket lifecycle rule to abort incomplete multipart uploads after 1–7 days so abandoned chunks do not silently rack up storage bills.
9. **Clean up orphaned blobs reliably** — mark uploads `pending` before issuing the presigned URL and `ready` after confirmation; run a periodic lifecycle or cleanup job to delete `pending` records older than 24h and soft-deleted objects from storage.
10. **Test failure and abuse cases** — verify oversized upload rejection (`413`), mismatched MIME/extension rejection (`400`), cross-tenant download denial (`404`/`403`), and that a redeployed container still serves previously uploaded files.

## Related skills

- `authorization-and-multitenancy` — scoping storage keys and signed URLs per tenant.
- `security-review` — XSS, path traversal, and untrusted file handling.
- `aws-deployment` — S3, IAM policies, and CloudFront distribution setup.
- `deployment-strategy` — recognizing ephemeral filesystem limits before deploying.
- `background-jobs` — async thumbnailing, transcoding, virus scanning, and orphan cleanup.
