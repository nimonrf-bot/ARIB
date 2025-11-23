# Development Brief: Ops Status Dashboard

This document outlines the complete requirements for building a web application called "Ops Status Dashboard". The goal is to create a tool for a logistics company to monitor shipping vessels and warehouse inventory.

## 1. Core Technology Stack

- **Framework**: Next.js with React (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: `lucide-react`
- **Backend & Database**: Firebase (Firestore for database, Firebase Authentication for users)
- **Generative AI**: Genkit for parsing unstructured text updates.

## 2. Core Features

### 2.1. Main Dashboard (Homepage: `/`)

This is the public-facing, read-only view of the operational status.

- **Layout**: A two-section layout. The top section displays vessel information, and the bottom section displays warehouse information.
- **Header**: Includes the title "ARIB Vessel Tracker" and a link to the "Admin Panel".
- **Vessel Tracking Section**:
  - Fetches and displays all documents from the `vessels` collection in Firestore.
  - Each vessel is rendered in a `VesselJourneyCard` component.
  - **`VesselJourneyCard` Component**:
    - Displays vessel name, ID, cargo, current status, and ETA date.
    - Features a visual representation of the journey:
      - An origin port icon on the right, a destination port icon on the left.
      - A series of wave icons connecting the two ports.
      - A ship icon positioned along the wave path.
      - The ship's progress is dynamically calculated based on the `departureDate` and `etaDate`.
      - If the vessel's `anchored` property is `true`, an anchor icon should appear below the ship.
- **Warehouse Status Section**:
  - Fetches and displays all documents from the `warehouses` collection in Firestore.
  - Each warehouse is rendered in a `WarehouseCard` component.
  - **`WarehouseCard` Component**:
    - Displays the warehouse name.
    - Shows a 2x2 grid representing the warehouse `bins`. Each bin cell displays its ID, commodity, tonnage, and code.
    - Includes a vertical capacity gauge that visually represents `currentStock / totalCapacity`. The gauge color changes based on fill percentage: green (<50%), yellow (50-80%), red (>80%).
    - Displays text for `Total Capacity` and `Available` capacity.
- **Loading State**: Both sections should display a loading spinner while data is being fetched from Firestore.

### 2.2. Authentication & Authorization

- **Provider**: Google Sign-In using Firebase Authentication.
- **Admin Roles**: Access to admin pages is controlled by email whitelists.
  - Create a file `src/lib/admins.ts` containing two exported arrays of strings: `WAREHOUSE_ADMINS` and `VESSEL_ADMINS`.
  - These arrays will hold the email addresses of authorized administrators.

### 2.3. Admin Hub (`/admin`)

- This page is the central entry point for administrators.
- It requires a user to be logged in. If not logged in, it prompts them to "Log in with Google".
- If the logged-in user's email is present in `WAREHOUSE_ADMINS`, it displays a card with a link to the "/admin/warehouses" page.
- If the logged-in user's email is present in `VESSEL_ADMINS`, it displays a card with a link to the "/admin/ves_adm" page.
- If the user is logged in but not in either admin list, it displays an "Access Denied" message.

### 2.4. Vessel Admin Panel (`/admin/ves_adm`)

- This page is for managing vessel data. It should be protected, only allowing access to users in the `VESSEL_ADMINS` list.
- **AI Update Feature**:
  - A textarea where a user can paste unstructured text (e.g., "Omskiy-130 has arrived at Caspian Port...").
  - An "Update with AI" button that sends this text to a Genkit flow.
  - The flow parses the text and identifies vessel properties to update.
  - The updates are reflected in the form fields on the page but are **not** saved automatically.
- **Manual Update Forms**:
  - Displays each vessel in a separate card.
  - Each card contains input fields for all vessel properties: Status, Cargo, Departure Port, Destination Port, Departure Date, ETA Date, and an "Anchored" switch.
  - Port selection should be a dropdown with a predefined list of port names.
- **Save Changes**: A master "Save Changes" button that commits all modifications (from both AI and manual edits) to the `vessels` collection in Firestore.
- **Change History**:
  - When changes are saved, a new document is created in a `vesselLogs` collection.
  - The log document records the user's email, a timestamp, and an array of strings describing each change (e.g., "Vessel 'Omskiy-130': status changed from 'In transit' to 'Arrived'.").
  - The page displays a table of these logs, sorted with the most recent first.

### 2.5. Warehouse Admin Panel (`/admin/warehouses`)

- This page is for managing warehouse data. It should be protected, only allowing access to users in the `WAREHOUSE_ADMINS` list.
- **AI Update Feature**: Similar to the vessel admin, it has a textarea and button to parse unstructured text and update the warehouse and bin form fields.
- **Inventory Management**:
  - A dialog allows users to add or remove stock (tonnage) from a specific bin in a specific warehouse.
- **Manual Update Forms**:
  - Displays each warehouse in a separate card.
  - Contains input fields for `name` and `totalCapacity`.
  - For each `bin` within a warehouse, there are inputs for `commodity`, `tonnage`, and `code`.
- **Save Changes**: A master "Save Changes" button to commit all changes to the `warehouses` collection in Firestore.
- **Change History**:
  - Similar to the vessel admin, saving changes creates a log document in a `warehouseLogs` collection.
  - The page displays a table of these warehouse change logs.

### 2.6. Database Seeding (`/seed`)

- A simple utility page to populate the Firestore database with initial data.
- The page requires the user to log in first.
- A "Seed Database" button, which, when clicked by an authenticated user, writes a predefined set of vessel and warehouse data into the respective Firestore collections.
- This is crucial for first-time setup and for use on new devices.

## 3. Data Models (Firestore)

- **`vessels` collection**:
  - Each document represents a vessel.
  - Fields: `vesselName` (string), `vesselId` (string), `cargo` (string), `status` (string), `origin` (string), `destination` (string), `departureDate` (string, `YYYY-MM-DD`), `etaDate` (string, `YYYY-MM-DD`), `anchored` (boolean), `progress` (number).
- **`warehouses` collection**:
  - Each document represents a warehouse.
  - Fields: `name` (string), `totalCapacity` (number), `bins` (array of objects).
  - `bin` object fields: `id` (string), `commodity` (string), `tonnage` (number), `code` (string).
- **`vesselLogs` & `warehouseLogs` collections**:
  - Each document is a log of a change.
  - Fields: `user` (string, email), `timestamp` (string, ISO format), `changes` (array of strings).

## 4. AI Flows (Genkit)

- **`updateVesselsFlow`**:
  - Input: A string of unstructured text.
  - Output: An array of vessel objects with fields extracted from the text.
  - The prompt should instruct the AI to act as a data entry specialist for a logistics company, parsing the text to find and structure vessel data.
- **`updateWarehousesFlow`**:
  - Input: A string of unstructured text.
  - Output: An array of warehouse objects with fields extracted from the text.
  - The prompt should instruct the AI to act as a data entry specialist, parsing text to find and structure warehouse and bin data.

## 5. Styling and UI/UX

- **Color Scheme**:
  - **Primary**: Strong Blue (`#1E90FF`)
  - **Background**: Very light blue, almost white (`#E6F3FF`)
  - **Accent**: Purple (`#9400D3`)
- **Fonts**:
  - **Body**: 'Inter', sans-serif
  - **Headline**: 'Space Grotesk'
- **General Feel**: Clean, modern, and professional. Use rounded corners and subtle shadows on cards and buttons.
- **Responsiveness**: The layout must be responsive and work well on both desktop and mobile devices.
