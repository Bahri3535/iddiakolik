import './globals.css';
import { Inter, Roboto, Montserrat } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/auth/SessionProvider';
import Navbar from '@/components/Navbar';

const roboto = Roboto({ 
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'İddiakolik',
  description: 'Futbol maçları için tahmin platformu',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="tr">
      <body className={roboto.className}>
        <div className="bg-pattern flex flex-col min-h-screen">
          <SessionProvider session={session}>
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
              {children}
            </main>
            <footer className="border-t border-gray-200 py-8 mt-auto">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <p className={`text-indigo-800 font-bold text-lg ${montserrat.className}`}>İDDİAKOLİK</p>
                    <p className="text-gray-500 text-sm">Süperlig ve Avrupa maçları için tahmin platformu</p>
                  </div>
                  <div className="text-gray-400 text-xs">
                    &copy; 2025 İddiakolik - Tüm hakları saklıdır.
                  </div>
                </div>
              </div>
            </footer>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
