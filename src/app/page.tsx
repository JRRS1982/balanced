'use client';

import Link from 'next/link';
import styles from './page.module.css';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.header__container}>
          <Logo />
          <Link href="/login" className={styles.header__loginButton}>
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.hero__container}>
          <div className={styles.hero__content}>
            <h1 className={styles.hero__title}>Take Control of Your Finances</h1>
            <p className={styles.hero__subtitle}>
              Transform your financial life and balance your budget with balanced.money
            </p>
            <form className={styles.hero__form}>
              <input
                type="email"
                placeholder="Email address"
                className={styles.hero__input}
                required
              />
              <button type="submit" className={styles.hero__button}>
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.features__container}>
          {[
            {
              title: 'Helpful Budgeting',
              description:
                'Categorize your expected expenses and compare your expectations to reality with guide rails.',
            },
            {
              title: 'Transaction Management',
              description: 'Organize and analyze all your financial transactions in one place.',
            },
            {
              title: 'Investment Performance',
              description:
                'Set targets and track how your investments perform against the wider market.',
            },
            {
              title: 'Secure & Private',
              description: 'Your financial data is encrypted and never shared with third parties.',
            },
          ].map((feature, index) => (
            <div key={index} className={styles.feature}>
              <h3 className={styles.feature__title}>{feature.title}</h3>
              <p className={styles.feature__description}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
