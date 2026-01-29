export interface StyleTemplate {
  id: string;
  name: string;
  foregroundColor: string;
  backgroundColor: string;
}

export const styleTemplates: StyleTemplate[] = [
  { id: "classic", name: "Classique", foregroundColor: "#000000", backgroundColor: "#ffffff" },
  { id: "ocean", name: "Océan", foregroundColor: "#1e3a5f", backgroundColor: "#e0f0ff" },
  { id: "forest", name: "Forêt", foregroundColor: "#1b4332", backgroundColor: "#d8f3dc" },
  { id: "sunset", name: "Coucher de soleil", foregroundColor: "#7c2d12", backgroundColor: "#fff7ed" },
  { id: "berry", name: "Baies", foregroundColor: "#701a75", backgroundColor: "#fdf4ff" },
  { id: "midnight", name: "Minuit", foregroundColor: "#e2e8f0", backgroundColor: "#1e293b" },
  { id: "ruby", name: "Rubis", foregroundColor: "#9f1239", backgroundColor: "#fff1f2" },
  { id: "gold", name: "Or", foregroundColor: "#78350f", backgroundColor: "#fefce8" },
];
