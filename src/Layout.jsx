import React from "react";

export default function Layout({ children, currentPageName }) {
  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }} className="bg-white text-[#1F2D3D] min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        :root {
          --background: 0 0% 100%;
          --foreground: 213 36% 18%;
          --card: 0 0% 100%;
          --card-foreground: 213 36% 18%;
          --primary: 207 98% 42%;
          --primary-foreground: 0 0% 100%;
          --secondary: 210 17% 96%;
          --secondary-foreground: 213 36% 18%;
          --muted: 210 17% 96%;
          --muted-foreground: 200 8% 40%;
          --accent: 207 86% 93%;
          --accent-foreground: 207 98% 42%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 0 0% 98%;
          --border: 210 14% 89%;
          --input: 210 14% 89%;
          --ring: 207 98% 42%;
        }

        @media print {
          header, nav, footer,
          section:first-of-type,
          .lg\\:col-span-2 { display: none !important; }
        }
      `}</style>

      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#B0BEC5] shadow-sm" style={{ height: 72 }}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "#0176D3" }}>
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
              </svg>
            </div>
            <div>
              <span className="text-[15px] font-bold text-[#1F2D3D] tracking-tight">Move Profile Generator</span>
              <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EAF5FE] text-[#0176D3]">Industrial</span>
            </div>
          </div>


        </div>
      </header>

      {/* Main */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#B0BEC5] bg-[#F4F6F9] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-[13px] text-[#5E6A71]">© 2026 Move Profile Generator — Industrial Motion Analysis</span>
          <span className="text-[13px] text-[#5E6A71]">Built for precision engineering</span>
        </div>
      </footer>
    </div>
  );
}