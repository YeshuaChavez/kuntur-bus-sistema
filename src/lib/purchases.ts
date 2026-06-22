export interface PurchaseRecord {
  id: string;
  purchaseDate: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  seats: string[];
  passengers: { dni: string; name: string }[];
  total: number;
  tripClass: string;
}

const key = (email: string) => `kuntur_hist_${email}`;

export function getPurchases(email: string): PurchaseRecord[] {
  try {
    return JSON.parse(localStorage.getItem(key(email)) ?? "[]");
  } catch { return []; }
}

export function savePurchase(email: string, record: PurchaseRecord): void {
  const prev = getPurchases(email);
  localStorage.setItem(key(email), JSON.stringify([record, ...prev]));
}
