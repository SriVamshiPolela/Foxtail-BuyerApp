# Ky-HarvestConnect-BuyerApp

A React Native / Expo buyer-facing app for **Harvest Connect** — a hyperlocal e-commerce platform connecting buyers with verified local vendors and producers across India.

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Home | `/` | Categories, local vendors, featured products |
| Explore | `/explore` | Region-filtered product grid (Mandal → National) |
| Cart | `/cart` | Shopping cart with quantity controls & price summary |
| Orders | `/orders` | Order history with delivery tracking |
| Profile | `/profile` | User profile, wallet, settings |

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   Scan the QR code with **Expo Go** (iOS / Android) or press `w` for web.

## Tech Stack

- [Expo](https://expo.dev) v56 with file-based routing via `expo-router`
- React Native 0.85 — iOS, Android, Web
- TypeScript

## Branch Strategy

```
main
└── Dev
    └── features/Vamshi/buyer-app-screens  ← active development
```
