import { createStart, createMiddleware, createCsrfMiddleware } from '@tanstack/react-start';

import { renderErrorPage } from '@/backend/shared/error-page';

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    // If it's a server function (RPC) request, let TanStack Start handle the error serialization
    if (request) {
      try {
        const url = new URL(request.url);
        if (url.pathname.startsWith("/_server-fn")) {
          throw error;
        }
      } catch (e) {}
    }

    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, errorMiddleware],
}));
