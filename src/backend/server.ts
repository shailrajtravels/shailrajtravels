import "@/backend/shared/error-capture";

import { consumeLastCapturedError } from '@/backend/shared/error-capture';
import { renderErrorPage } from '@/backend/shared/error-page';

// We do NOT auto-start whatsapp here because it can hang Vite SSR boot.
// Instead, let the admin start it from the UI or it lazy-starts.

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import('@tanstack/react-start/server-entry').then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function withSecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net wss: ws:;",
  );
  newHeaders.set("X-Frame-Options", "SAMEORIGIN");
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  const isNullBodyStatus =
    response.status === 101 ||
    response.status === 204 ||
    response.status === 205 ||
    response.status === 304;
  const body = isNullBodyStatus ? null : response.body;

  const init: ResponseInit = {
    status: response.status,
    headers: newHeaders,
  };
  if (response.statusText) {
    init.statusText = response.statusText;
  }

  return new Response(body, init);
}

import { z } from 'zod';
import { MongoClient } from 'mongodb';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  honeypot: z.string().optional(),
});

const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_REQUESTS = 3;

import clientPromise from '@/backend/shared/db';

async function connectToDatabase() {
  return clientPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const urlString = request.url.startsWith("/")
        ? `http://localhost${request.url}`
        : request.url;
      const url = new URL(urlString);

      // Intercept /api/contact
      if (request.method === "POST" && url.pathname === "/api/contact") {
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const userLimit = rateLimit.get(ip);

        if (userLimit) {
          if (now - userLimit.timestamp < RATE_LIMIT_WINDOW) {
            if (userLimit.count >= MAX_REQUESTS) {
              return withSecurityHeaders(
                new Response(
                  JSON.stringify({ error: "Too many requests. Please try again later." }),
                  {
                    status: 429,
                    headers: { "Content-Type": "application/json" },
                  },
                ),
              );
            }
            userLimit.count++;
          } else {
            rateLimit.set(ip, { count: 1, timestamp: now });
          }
        } else {
          rateLimit.set(ip, { count: 1, timestamp: now });
        }

        const body = await request.json();
        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
          return withSecurityHeaders(
            new Response(JSON.stringify({ error: parsed.error.errors[0].message }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
        const data = parsed.data;

        if (data.honeypot && data.honeypot.length > 0) {
          return withSecurityHeaders(
            new Response(JSON.stringify({ success: true, message: "Message received" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }

        try {
          const client = await connectToDatabase();
          const db = client.db("shailraj_travels");
          await db.collection("contacts").insertOne({
            ...data,
            createdAt: new Date(),
          });
          console.log(`[DB] Saved contact submission from ${data.email}`);
        } catch (dbError) {
          console.error("[DB] Failed to save contact:", dbError);
        }

        return withSecurityHeaders(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withSecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      const errorResp = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      return withSecurityHeaders(errorResp);
    }
  },
};
