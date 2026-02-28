import type { ContactPayload, ContactResponse } from "@/types/contact";

export async function submitContact(
  payload: ContactPayload
): Promise<ContactResponse> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json as ContactResponse;
}
