import "./globals.css";

export const metadata = {
  title: "TwinFit — AI Injury Prevention Platform",
  description:
    "TwinFit uses predictive analytics and a real-time digital twin model to forecast athlete injury risks, enabling data-driven coaching decisions.",
  keywords: ["sports analytics", "injury prevention", "digital twin", "soccer", "AI"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
