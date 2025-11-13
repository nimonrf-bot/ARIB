# **App Name**: Ops Status Dashboard

## Core Features:

- Google Sign-In: Authenticate users with their Google accounts for secure access to cloud data.
- Warehouse Management: Create, read, update, and delete warehouse records in Firestore (cloud mode) or localStorage (demo mode).
- Vessel Tracking: Create, read, update, and delete vessel records, including ETA and position updates in Firestore (cloud mode) or localStorage (demo mode).
- Health Checks: Perform connectivity tests with Firestore to ensure the app is connected to the backend.
- Config Persistence: Load, save, and clear Firebase configuration settings from localStorage for offline/demo use.
- Real-time Updates: Subscribe to live updates of warehouses and vessels using Firestore's onSnapshot feature.
- Mode Switching: Automatically switch between demo (local) and cloud modes based on user authentication status.

## Style Guidelines:

- Primary color: Strong Blue (#1E90FF) to reflect reliability and real-time operations.
- Background color: Very light blue (#E6F3FF), almost white, for a clean and readable UI.
- Accent color: Purple (#9400D3) for call-to-action elements and status indicators to emphasize important functionality.
- Body font: 'Inter', sans-serif, for its modern and readable qualities. Headline Font: 'Space Grotesk' to provide contrast in titles and headers.
- Use clear, minimalist icons to represent warehouse and vessel status. Color-code icons according to status (OK, Full, Critical, etc.).
- Responsive layout for optimal viewing on both desktop and mobile devices, using Tailwind CSS grid and flexbox.
- Subtle transitions and animations when data updates to provide visual feedback without being distracting.