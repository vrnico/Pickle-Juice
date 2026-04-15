"use client";

import { useEffect } from "react";
import { bootDataLayer } from "@/lib/boot";

export function BootEffects() {
  useEffect(() => {
    bootDataLayer().catch(() => undefined);
  }, []);
  return null;
}
