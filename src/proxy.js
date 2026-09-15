import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, isValidAdminToken } from "./lib/adminAuth";

/**
 * Entrada al panel privado: /admin/...?token=<ADMIN_TOKEN>
 * Si el token es válido, se guarda en la cookie httpOnly `aquila_admin`
 * (30 días) y se redirige a la misma URL sin el token. A partir de ahí la
 * página se abre solo con la cookie. Con token inválido no se hace nada: la
 * página responderá 404.
 */
export function proxy(request) {
    const url = request.nextUrl;
    const token = url.searchParams.get("token");
    if (!token || !isValidAdminToken(token)) return NextResponse.next();

    const clean = url.clone();
    clean.searchParams.delete("token");
    const res = NextResponse.redirect(clean);
    res.cookies.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/admin",
        maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return res;
}

export const config = {
    matcher: ["/admin/:path*"],
};
