import { ThemeProvider } from "@/components/layout/ThemeProvider";
import ReduxProvider from "@/store/ReduxProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ScrollToTopButton from "@/components/common/scroll-top-top";
import ToastProvider from "@/components/common/ToastProvider";


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <title>AADI</title>
            <body className="custom-scroll">
                <ReduxProvider>
                    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                        {children}
                        <ScrollToTopButton />
                        <SpeedInsights />
                    </ThemeProvider>
                </ReduxProvider>
                <ToastProvider />
            </body>
        </html>
    );
}
