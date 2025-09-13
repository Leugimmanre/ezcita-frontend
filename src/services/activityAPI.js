// src/services/activityAPI.js
import axios from "@/lib/axios";

export async function getRecentActivity(limit = 8, category = "") {
  const q = new URLSearchParams();
  q.set("limit", String(limit));
  if (category) q.set("category", category);
  const { data } = await axios.get(`/activity?${q.toString()}`);
  return data; // { ok, items, lastUpdateAt }
}
