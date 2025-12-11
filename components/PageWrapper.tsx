"use client";

import { ReactNode } from "react";

/**
 * Provides a stable outer wrapper for all pages.
 * Useful for layout, error boundaries, personalization, etc.
 */
export default function PageWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="page-wrapper">{children}</div>;
}
