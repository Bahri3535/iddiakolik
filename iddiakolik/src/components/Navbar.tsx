'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaFutbol, FaUserAlt, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTrophy, FaList, FaUserCog } from 'react-icons/fa';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className={`${scrolled ? 'bg-gradient-to-r from-indigo-900 to-purple-700 shadow-lg' : 'bg-gradient-to-r from-indigo-800 to-purple-600'} transition-all duration-300 sticky top-0 z-50 w-full`}>
      <div className="w-full flex items-center justify-between h-16">
        <Link href="/" className="flex items-center text-white font-bold text-xl pl-4 md:pl-8">
          <FaFutbol className="mr-2 text-2xl" />
          <span className="font-black">İDDİA</span>
          <span className="font-light">KOLİK</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-1 pr-4 md:pr-8">
          <Link
            href="/matches"
            className={`text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/matches')}`}
          >
            <FaList className="mr-1" /> Maçlar
          </Link>
          <Link
            href="/leaderboard"
            className={`text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/leaderboard')}`}
          >
            <FaTrophy className="mr-1" /> Sıralama
          </Link>
          {status === 'authenticated' && session ? (
            <>
              <Link
                href="/profile"
                className={`text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/profile')}`}
              >
                <FaUserAlt className="mr-1" /> Profilim
              </Link>
              {session.user?.isAdmin && (
                <Link
                  href="/admin"
                  className={`text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/admin')}`}
                >
                  <FaUserCog className="mr-1" /> Admin Paneli
                </Link>
              )}
              <div className="relative ml-3">
                <div className="flex items-center">
                  <button
                    onClick={() => signOut()}
                    className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    <FaSignOutAlt className="mr-1" /> Çıkış Yap
                  </button>
                </div>
              </div>
            </>
          ) : status === 'unauthenticated' ? (
            <>
              <Link
                href="/auth/login"
                className={`text-white hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/auth/login')}`}
              >
                <FaSignInAlt className="mr-1" /> Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className={`text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive('/auth/register')}`}
              >
                <FaUserPlus className="mr-1" /> Kayıt Ol
              </Link>
            </>
          ) : (
            <div className="text-white px-3 py-2">Yükleniyor...</div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center pr-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-600 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/matches"
              className={`text-white hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/matches')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaList className="mr-2" /> Maçlar
            </Link>
            <Link
              href="/leaderboard"
              className={`text-white hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/leaderboard')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTrophy className="mr-2" /> Sıralama
            </Link>
            {status === 'authenticated' && session ? (
              <>
                <Link
                  href="/profile"
                  className={`text-white hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/profile')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserAlt className="mr-2" /> Profilim
                </Link>
                {session.user?.isAdmin && (
                  <Link
                    href="/admin"
                    className={`text-white hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/admin')}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserCog className="mr-2" /> Admin Paneli
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:bg-indigo-800 block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Çıkış Yap
                </button>
              </>
            ) : status === 'unauthenticated' ? (
              <>
                <Link
                  href="/auth/login"
                  className={`text-white hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/auth/login')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaSignInAlt className="mr-2" /> Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className={`text-white hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium flex items-center ${isActive('/auth/register')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserPlus className="mr-2" /> Kayıt Ol
                </Link>
              </>
            ) : (
              <div className="text-white px-3 py-2">Yükleniyor...</div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 