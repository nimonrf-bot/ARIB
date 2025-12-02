import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const APP_NAME = "ARIB";
const APP_DEFAULT_TITLE = "ARIB";
const APP_TITLE_TEMPLATE = "%s - ARIB";
const APP_DESCRIPTION = "ARIB Vessel and Warehouse Tracker";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
