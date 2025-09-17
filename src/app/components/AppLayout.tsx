'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import StaggeredMenu from '../menu/menu';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const items = [
    { label: 'Главная', ariaLabel: 'Перейти на главную страницу', link: '/' },
    { label: 'Рецепты', ariaLabel: 'Найти рецепты', link: '/recipes' },
    { label: 'Избранное', ariaLabel: 'Мои избранные рецепты', link: '/favorites' },
    { label: 'Профиль', ariaLabel: 'Мой профиль', link: '/profile' },
  ];

  const socialItems = [
    { label: 'Instagram', link: '#' },
    { label: 'Telegram', link: '#' },
    { label: 'VK', link: '#' }
  ];

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      router.push('/profile');
    }
  };

  return (
    <>
      <Header
        logoText="RecipeMatch"
        onProfileClick={handleProfileClick}
        isAuthenticated={isAuthenticated}
      />
      <StaggeredMenu
        items={items}
        socialItems={socialItems}
        position="right"
        displaySocials={true}
      />
      {children}
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
