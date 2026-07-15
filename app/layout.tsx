import { Varela_Round } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const varelaRound = Varela_Round({ 
  subsets: ['hebrew', 'latin'], 
  weight: '400', 
  variable: '--font-varela', 
}); 

export const metadata: Metadata = {
  title: 'יום הולדת לשימי!',
  description: 'כותבים שיר יום הולדת לשימי',
};

export default function RootLayout({ 
  children, 
}: { 
  children: React.ReactNode; 
}) { 
  return ( 
    <html lang="he" dir="rtl">
      <body className={`${varelaRound.variable} font-sans antialiased min-h-screen bg-[#FAF6F0] text-gray-900 overflow-x-hidden`}>
        {children}
      </body>
    </html>
  ); 
}
