import { SchemaMarkup } from '../frontend/components/SchemaMarkup';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { Languages } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../backend/lib/lovable-error-reporting";
import { generateSEO } from '../backend/lib/seo';
import { AnalyticsScripts } from "../frontend/components/AnalyticsScripts";
import { generateLocalBusinessSchema } from "../backend/lib/schema-generators";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <title>404 Not Found</title>
      <meta name="robots" content="noindex, nofollow" />
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <title>Error</title>
      <meta name="robots" content="noindex, nofollow" />
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {error && (
          <div className="mt-4 text-left bg-red-50 border border-red-100 rounded-xl p-4 max-h-60 overflow-auto text-xs text-red-700 font-mono shadow-inner">
            <p className="font-bold mb-1">{error.message || String(error)}</p>
            {error.stack && <pre className="whitespace-pre-wrap opacity-80 mt-1">{error.stack}</pre>}
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export type Language = "mr" | "en";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: (search: Record<string, unknown>): { lang?: Language } => {
    return { lang: (search.lang === 'mr' ? 'mr' : 'en') as Language };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...generateSEO({
        title: "Shailraj Travels | Pilgrimage Tour Operator Pune",
        description: "Trusted Pilgrimage Tour Operator in Pune. Book Ashtavinayak, Jyotirlinga, Pandharpur, and Char Dham yatra packages with AC travel and guided darshan.",
        canonicalUrl: "https://www.shailrajtravels.com",
      }),
      { name: "google", content: "notranslate" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Marathi&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }) as any,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <AnalyticsScripts />
        <SchemaMarkup schema={generateLocalBusinessSchema()} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export const LanguageContext = createContext<{
  lang: Language;
  toggleLang: () => void;
}>({
  lang: "en",
  toggleLang: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLang();
      }}
      className="fixed bottom-[96px] right-6 z-[9999] flex h-10 items-center gap-1.5 rounded-full bg-brand-blue-deep px-3.5 text-white shadow-[0_4px_12px_rgba(11,77,186,0.4)] transition-all hover:scale-105 active:scale-95 font-bold border-2 border-white cursor-pointer group hover:bg-brand-blue"
      aria-label="Toggle Language"
      title="Translate Website"
    >
      <Languages className="h-[16px] w-[16px] opacity-90 group-hover:opacity-100 transition-opacity" />
      <span className="text-[12px] md:text-[13px] tracking-wide mt-[1px]">
        {lang === "mr" ? "English" : "मराठी"}
      </span>
    </button>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-transform hover:scale-110 active:scale-95"
      aria-label="Chat on WhatsApp"
      onClick={() => window.dataLayer?.push({ event: 'whatsapp_click' })}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.47-1.761-1.643-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    </a>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const search = Route.useSearch();
  const [langState, setLangState] = useState<Language>("en");
  const lang = (search.lang || langState) as Language;
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const toggleLang = () => {
    const newLang = lang === "mr" ? "en" : "mr";
    setLangState(newLang);
    navigate({ search: ((old: any) => ({ ...old, lang: newLang })) as any, replace: true });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={{ lang, toggleLang }}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        {!isAdmin && (
          <>
            <LanguageToggle />
            <FloatingWhatsApp />
          </>
        )}
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
}