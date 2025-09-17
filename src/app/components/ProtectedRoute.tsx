'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.accessContent}>
          <h2 className={styles.accessTitle}>Доступ ограничен</h2>
          <p className={styles.accessText}>
            Для доступа к этой странице необходимо войти в аккаунт
          </p>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/')}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
