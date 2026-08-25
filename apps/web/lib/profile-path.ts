export function decodeProfileId(profileId: string) {
  try {
    return decodeURIComponent(profileId).trim().toLowerCase();
  } catch {
    return profileId.trim().toLowerCase();
  }
}

export function profileHref(email: string) {
  return `/${encodeURIComponent(email.trim().toLowerCase())}`;
}
