import type { NavLink } from "@/types";
import { categories, categoryNavIds } from "./categories";

export const site = {
  "name": "Pearl Electric Solutions",
  "shortName": "PES",
  "shopName": "Pearl Electric",
  "tagline": "Bringing Light to Every Home",
  "description": "Your trusted electrical supply shop in Peshawar. Quality products at affordable prices.",
  "logo": "/logo.png",
  "shopFront": "https://api.pespeshawar.pk/storage/images/product-1784356708071.jpg",
  "phone": "+92 323 5677090",
  "contactPhone": "+92 300 1234567",
  "whatsapp": "923001234567",
  "email": "info@pearlectrics.pk",
  "salesEmail": "pespearlelectricsolutions@gmail.com",
  "address": "Shop No. 01 Haroon Market, Karkhano Bazar Peshawar.",
  "contactAddress": "Shop #5, Khyber Bazaar, Peshawar, Pakistan",
  "hours": "Mon-Sat: 9:00 AM - 8:00 PM, Sun: Closed",
  "hoursWeekdays": "9:00 AM - 7:00 PM",
  "hoursSunday": "09:00 AM -7:00 PM",
  "hoursFriday": "Closed",
  "social": {
    "facebook": "https://www.facebook.com/share/18sHhMnFha/?mibextid=wwXIfr",
    "instagram": "",
    "whatsapp": "https://wa.me/923235677090",
    "youtube": "",
    "linkedin": "",
    "twitter": ""
  },
  "socialLinks": [
    {
      "name": "Whatsapp",
      "url": "https://wa.me/923235677090"
    },
    {
      "name": "whatsapp channel",
      "url": "https://whatsapp.com/channel/0029VbCNSWsLNSa8tyMEFD3W"
    },
    {
      "name": "facebook",
      "url": "https://www.facebook.com/share/18sHhMnFha/?mibextid=wwXIfr"
    }
  ],
  "about": {
    "heading": "Peshawar's Most",
    "headingHighlight": "Trusted Electric Shop",
    "short": "Pearl Electric Solutions has been serving Peshawar since 2015. We provide high-quality electrical products ranging from wires and cables to smart home solutions.",
    "p1": "Pearl Electric Solutions has been serving the people of Peshawar for over a decade from our location at Shop No. 1, Haroon Market, Karkhano Bazar. We are approved distributors of Pakistan Cables, AGE Cables, and Fast Cables, and stock premium brands including Philips, Schneider, ABB, Opal, Royal Fans, Voldam Fan, Lahore Fan, Pak Fan, BlueDot Smart Home, and more.",
    "p2": "Whether you're an electrician, contractor, or homeowner, we provide expert advice and genuine products at the best prices in town. Now you can also shop online - browse our catalog, place your order, and get same-day delivery across Peshawar."
  },
  "returnPolicy": "7-day return policy for defective items. Original packaging required.",
  "deliveryInfo": "Free delivery within Peshawar city. Nationwide shipping via Courier.",
  "whatsappMessage": "Hi, I am interested in your products.",
  "mapEmbed": "https://www.google.com/maps?q=Karkhano%20Bazar%2C%20Peshawar%2C%20Pakistan&output=embed",
  "promoBanners": [
    {
      "title": "Smart Switches",
      "subtitle": "Bluedot Switches",
      "image": "https://api.pespeshawar.pk/storage/images/product-1785863117230.png",
      "link": "/products"
    },
    {
      "title": "Distribution Boards",
      "subtitle": "All Type of Dbs",
      "image": "https://api.pespeshawar.pk/storage/images/product-1785863056430.png",
      "link": "/products"
    },
    {
      "title": "Fans",
      "subtitle": "Cieling Fans, Bracket Fans",
      "image": "https://api.pespeshawar.pk/storage/images/product-1785862216713.png",
      "link": "/products/?category=fan"
    },
    {
      "title": "Switch & Sockets",
      "subtitle": "All Type of Switch & Sockets",
      "image": "https://api.pespeshawar.pk/storage/images/product-1785568143216.PNG",
      "link": "/products/?category=switches-sockets"
    }
  ]
} as const;

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
];

/** Primary categories surfaced in the navbar dropdown. */
export const categoryNavLinks: NavLink[] = categories
  .filter((c) => categoryNavIds.includes(c.id))
  .map((c) => ({ label: c.shortName, href: `/products?category=${c.id}` }));
