import test from "node:test";
import assert from "node:assert/strict";
import { validateUploadedResume } from "../src/middleware/upload.js";
import { validateUploadedImage } from "../src/middleware/uploadImage.js";
import { BadRequestError } from "../src/lib/errors.js";

const pngBuffer = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c49444154789c636001000000ffff03000006000557bfab0000000049454e44ae426082",
  "hex",
);
const pdfBuffer = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF",
  "utf8",
);

const runMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error ?? null));
  });

test("validateUploadedResume rejects spoofed resume MIME types", async () => {
  const req = {
    file: {
      mimetype: "application/pdf",
      buffer: pngBuffer,
    },
  };

  const error = await runMiddleware(validateUploadedResume, req);

  assert.ok(error instanceof BadRequestError);
  assert.equal(
    error.message,
    "Invalid file type. Only PDF, DOC, and DOCX resumes are allowed.",
  );
});

test("validateUploadedImage rejects spoofed image MIME types", async () => {
  const req = {
    file: {
      mimetype: "image/png",
      buffer: pdfBuffer,
    },
  };

  const error = await runMiddleware(validateUploadedImage, req);

  assert.ok(error instanceof BadRequestError);
  assert.equal(
    error.message,
    "Invalid file type. Only PNG, JPEG, WEBP, and GIF images are allowed.",
  );
});

test("validateUploadedImage allows valid image buffers and normalizes the MIME type", async () => {
  const req = {
    file: {
      mimetype: "image/jpg",
      buffer: pngBuffer,
    },
  };

  const error = await runMiddleware(validateUploadedImage, req);

  assert.equal(error, null);
  assert.equal(req.file.mimetype, "image/png");
});
