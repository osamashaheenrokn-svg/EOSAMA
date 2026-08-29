import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");
  const isSetPasswordRoute = request.nextUrl.pathname.startsWith("/set-password");
  const isAuthConfirmRoute = request.nextUrl.pathname.startsWith("/auth/confirm");
  const isManifestRoute = request.nextUrl.pathname === "/manifest.webmanifest";

  // /set-password is reached via an invite link whose session token lives in the
  // URL hash, which the server never sees — so it must stay reachable both before
  // the client establishes the session (no user yet) and right after (user set,
  // password not yet). /auth/confirm is reached signed-out, before the invite
  // token has even been exchanged for a session. The manifest must always be
  // servable as plain JSON (not redirected to /login) for the browser to treat
  // the site as installable, even on the signed-out /login page.
  if (isSetPasswordRoute || isAuthConfirmRoute || isManifestRoute) return response;

  if (!user && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
