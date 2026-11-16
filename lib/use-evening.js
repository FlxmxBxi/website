"use client";

import { useSyncExternalStore } from "react";
import { getEveningSnapshot, getServerEvening, subscribeEvening } from "@/lib/storage";

export function useEvening() {
  return useSyncExternalStore(subscribeEvening, getEveningSnapshot, getServerEvening);
}
