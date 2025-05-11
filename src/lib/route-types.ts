/**
 * This file provides proper typings for Next.js 15 route handlers in the App Router.
 * It defines the correct parameter structure to avoid TypeScript errors during build.
 */

import { NextResponse } from "next/server";

export type RouteHandlerParams<P extends object = Record<string, string>> = {
  params: P;
};

export { NextResponse };
