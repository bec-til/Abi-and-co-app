import { Urbanist } from 'next/font/google';

const urbanist = Urbanist({ 
  subsets: ['latin'],
  variable: '--font-urbanist',
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${urbanist.className} min-h-screen bg-gray-50`}>
      {children}
    </div>
  );
}