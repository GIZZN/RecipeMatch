'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import Iridescence from './bg/Iridescence';
import CardSwap, { Card } from './CardSwap/CardSwap';
import PastaIcon from './components/icons/PastaIcon';
import SoupIcon from './components/icons/SoupIcon';
import CakeIcon from './components/icons/CakeIcon';
import SaladIcon from './components/icons/SaladIcon';
import { HiRocketLaunch, HiStar, HiFire } from 'react-icons/hi2';
import { MdRestaurantMenu } from 'react-icons/md';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import Image from 'next/image';

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <Iridescence
            color={[1, 1, 1]}
            mouseReact={false}
            amplitude={0.1}
            speed={1.0}
          />
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              <span className={styles.brandName}>RecipeMatch</span>
              <span className={styles.subtitle}>Найди свой идеальный рецепт</span>
            </h1>
            <p className={styles.description}>
              Персональный сервис подбора рецептов на основе ваших предпочтений, 
              диетических ограничений и доступных продуктов
            </p>
            
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresInfoBlock}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardBadge}>Новое</span>
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>RecipeMatch</h2>
                <p className={styles.cardSubtitle}>
                  Умный подбор рецептов на основе ваших предпочтений
                </p>
                <div className={styles.cardTags}>
                  <span className={styles.cardTag}>Персонализация</span>
                  <span className={styles.cardTag}>ИИ-поиск</span>
                  <span className={styles.cardTag}>Тренды</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cardSwapContainer}>
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={5000}
              pauseOnHover={false}
            >
              <Card className={styles.recipeCard}>
                <div className={styles.titleBar}>
                  <div className={styles.titleBarButtons}>
                    <span className={styles.titleBarButton}>
                      <PastaIcon size={12} />
                    </span>
                  </div>
                  <div className={styles.titleBarText}>Паста Карбонара</div>
                </div>
                <div className={styles.recipeImage}>
                  <Image 
                    src="/images (1).jpg" 
                    alt="Паста Карбонара"
                    width={300}
                    height={200}
                    className={styles.recipeImg}
                  />
                </div>
                <div className={styles.recipeContent}>
                  <h3>макароны с мясом</h3>
                  <p>макароны с мясом и сыром</p>
                </div>
              </Card>
              <Card className={styles.recipeCard}>
                <div className={styles.titleBar}>
                  <div className={styles.titleBarButtons}>
                    <span className={styles.titleBarButton}>
                      <SoupIcon size={12} />
                    </span>
                  </div>
                  <div className={styles.titleBarText}>Борщ украинский</div>
                </div>
                <div className={styles.recipeImage}>
                  <Image 
                    src="/images.jpg" 
                    alt="Борщ украинский"
                    width={300}
                    height={200}
                    className={styles.recipeImg}
                  />
                </div>
                <div className={styles.recipeContent}>
                  <h3>🍲 Борщ украинский</h3>
                  <p>Традиционный украинский суп с капустой, свеклой и мясом</p>
                </div>
              </Card>
              <Card className={styles.recipeCard}>
                <div className={styles.titleBar}>
                  <div className={styles.titleBarButtons}>
                    <span className={styles.titleBarButton}>
                      <CakeIcon size={12} />
                    </span>
                  </div>
                  <div className={styles.titleBarText}>Тирамису</div>
                </div>
                <div className={styles.recipeImage}>
                  <Image 
                    src="/maxresdefault.jpg" 
                    alt="Тирамису"
                    width={300}
                    height={200}
                    className={styles.recipeImg}
                  />
                </div>
                <div className={styles.recipeContent}>
                  <h3>🍰 Тирамису</h3>
                  <p>Нежный итальянский десерт с кофе, маскарпоне и какао</p>
                </div>
              </Card>
              <Card className={styles.recipeCard}>
                <div className={styles.titleBar}>
                  <div className={styles.titleBarButtons}>
                    <span className={styles.titleBarButton}>
                      <SaladIcon size={12} />
                    </span>
                  </div>
                  <div className={styles.titleBarText}>Цезарь салат</div>
                </div>
                <div className={styles.recipeImage}>
                  <Image 
                    src="/5a71adf5-3716-49f3-843e-001880cb3a49.jpg" 
                    alt="Цезарь салат"
                    width={300}
                    height={200}
                    className={styles.recipeImg}
                  />
                </div>
                <div className={styles.recipeContent}>
                  <h3>🥗 Цезарь салат</h3>
                  <p>Свежий салат с курицей, сухариками и соусом цезарь</p>
                </div>
              </Card>
            </CardSwap>
          </div>
        </section>

        <section className={styles.howItWorks}>
          <div className={styles.workflowContainer}>
            <div className={styles.workflowCard}>
              <div className={styles.workflowHeader}>
                <span className={styles.workflowBadge}>Процесс</span>
                <h2 className={styles.workflowTitle}>Как работает RecipeMatch</h2>
                <p className={styles.workflowDescription}>
                  Умная система подбора рецептов в несколько простых шагов
                </p>
              </div>
              <div className={styles.workflowSteps}>
                <div className={styles.workflowStep}>
                  <span className={styles.stepNumber}>01</span>
                  <div className={styles.stepInfo}>
                    <h4>Настройка профиля</h4>
                    <p>Укажите предпочтения и ограничения</p>
                  </div>
                </div>
                <div className={styles.workflowStep}>
                  <span className={styles.stepNumber}>02</span>
                  <div className={styles.stepInfo}>
                    <h4>Анализ продуктов</h4>
                    <p>Загрузите список доступных ингредиентов</p>
                  </div>
                </div>
                <div className={styles.workflowStep}>
                  <span className={styles.stepNumber}>03</span>
                  <div className={styles.stepInfo}>
                    <h4>Подбор рецептов</h4>
                    <p>Получите персональные рекомендации</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaBackground}>
            <div className={styles.ctaOrb}></div>
            <div className={styles.ctaOrb}></div>
            <div className={styles.ctaOrb}></div>
          </div>
          <div className={styles.ctaLayout}>
            <div className={styles.ctaLeftPanel}>
              <div className={styles.ctaFloatingCard}>
                <div className={styles.floatingCardIcon}>
                  <HiRocketLaunch />
                </div>
                <div className={styles.floatingCardText}>
                  <span>Быстрый старт</span>
                  <small>За 2 минуты</small>
                </div>
              </div>
              <div className={styles.ctaFloatingCard} style={{marginTop: '40px', marginLeft: '60px'}}>
                <div className={styles.floatingCardIcon}>
                  <HiStar />
                </div>
                <div className={styles.floatingCardText}>
                  <span>5.0 рейтинг</span>
                  <small>От пользователей</small>
                </div>
              </div>
            </div>
            <div className={styles.ctaMainContent}>
              <span className={styles.ctaBadge}>✨ Начните сейчас</span>
              <h2 className={styles.ctaTitle}>Готовы начать кулинарное путешествие?</h2>
              <p className={styles.ctaDescription}>
                Присоединяйтесь к тысячам пользователей, которые уже открыли для себя новые вкусы
              </p>
              <div className={styles.ctaActions}>
                {isAuthenticated ? (
                  <Link href="/recipes" className={styles.ctaButton}>
                    <span>Начать подбор рецептов</span>
                    <span className={styles.buttonIcon}>→</span>
                  </Link>
                ) : (
                  <button 
                    className={styles.ctaButton}
                    onClick={() => setShowAuthModal(true)}
                  >
                    <span>Войти и начать готовить</span>
                    <span className={styles.buttonIcon}>→</span>
                  </button>
                )}
                <div className={styles.ctaQuickStats}>
                  <span>50K+ рецептов • 98% довольных • Бесплатно</span>
                </div>
              </div>
            </div>
            <div className={styles.ctaRightPanel}>
              <div className={styles.ctaFloatingCard} style={{marginTop: '20px'}}>
                <div className={styles.floatingCardIcon}>
                  <MdRestaurantMenu />
                </div>
                <div className={styles.floatingCardText}>
                  <span>15+ диет</span>
                  <small>Поддерживаем</small>
                </div>
              </div>
              <div className={styles.ctaFloatingCard} style={{marginTop: '60px', marginRight: '40px'}}>
                <div className={styles.floatingCardIcon}>
                  <HiFire />
                </div>
                <div className={styles.floatingCardText}>
                  <span>Тренды</span>
                  <small>Каждый день</small>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
