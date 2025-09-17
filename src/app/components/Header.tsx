"use client";

import React from 'react';
import styles from './Header.module.css';
import { GiCakeSlice } from 'react-icons/gi';
import { HiUser } from 'react-icons/hi2';

interface HeaderProps {
  logoText?: string;
  onProfileClick?: () => void;
  isAuthenticated?: boolean;
}

export default function Header({ 
  logoText = "RecipeMatch",
  onProfileClick = () => console.log('Profile clicked'),
  isAuthenticated = false
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo Section */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <GiCakeSlice 
              size={24}
              className={styles.logoImage}
            />
          </div>
          <span className={styles.logoText}>{logoText}</span>
        </div>

        {/* Profile Icon */}
        <button 
          className={`${styles.profileIcon} ${isAuthenticated ? styles.profileAuthenticated : ''}`}
          onClick={onProfileClick}
          aria-label="Profile"
          title={isAuthenticated ? "Профиль пользователя" : "Войти в аккаунт"}
        >
          <HiUser size={20} />
        </button>
      </div>
    </header>
  );
}
