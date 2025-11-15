// Utility functions for managing member IDs in localStorage

export function getLocalMemberId(code: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`house-member-${code}`);
}

export function setLocalMemberId(code: string, id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`house-member-${code}`, id);
}

export function removeLocalMemberId(code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`house-member-${code}`);
}
