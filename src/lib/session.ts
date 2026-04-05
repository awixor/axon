import { cache } from "react";
import { auth } from "@/auth";

/**
 * Cached wrapper around auth() so multiple server components in the same
 * request (e.g. layout + page) share one session lookup instead of two.
 */
export const getSession = cache(auth);
