import type { Dealer, ServiceCenter } from "@/types";

/**
 * Real Respak Express locations (Peshawar) — imported from www.pespeshawar.pk
 * settings: main shop at Haroon Market, Karkhano Bazar + Khyber Bazaar branch.
 */
export const dealers: Dealer[] = [
  {
    id: "d1",
    name: "Respak Express — Main Shop",
    city: "Peshawar",
    area: "Haroon Market, Karkhano Bazar",
    address: "Shop No. 01, Haroon Market, Karkhano Bazar, Peshawar",
    phone: "+92 345 9398834",
    timing: "Mon – Sat: 9 AM – 8 PM · Sun: Closed",
    isServiceCenter: true,
    isHeadOffice: true,
  },
  {
    id: "d2",
    name: "Respak Express — Khyber Bazaar",
    city: "Peshawar",
    area: "Khyber Bazaar",
    address: "Shop #5, Khyber Bazaar, Peshawar",
    phone: "+92 345 9398834",
    timing: "Mon – Sat: 9 AM – 7 PM · Sun: Closed",
    isServiceCenter: true,
    isHeadOffice: false,
  },
];

export const serviceCenters: ServiceCenter[] = [
  {
    id: "s1",
    city: "Peshawar",
    name: "Respak Express (Main Shop)",
    address: "Shop No. 01, Haroon Market, Karkhano Bazar, Peshawar",
    phone: "+92 345 9398834",
    timing: "Mon – Sat: 9 AM – 8 PM · Sun: Closed",
  },
  {
    id: "s2",
    city: "Peshawar",
    name: "Respak Express (Khyber Bazaar)",
    address: "Shop #5, Khyber Bazaar, Peshawar",
    phone: "+92 345 9398834",
    timing: "Mon – Sat: 9 AM – 7 PM · Sun: Closed",
  },
];

