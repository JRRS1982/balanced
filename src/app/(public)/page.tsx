'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Header with login button */}
      <header className={styles.header}>
        <Link href="/login" className={styles.loginButton}>
          Login
        </Link>
      </header>

      {/* Hero Section with background image */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Take Control of Your Finances</h1>
          <p>Join thousands of users who have transformed their financial lives with Balanced.</p>

          {/* Email signup form */}
          <div className={styles.signupForm}>
            <input type="email" placeholder="Email address" className={styles.emailInput} />
            <button className={styles.signupButton}>Sign Up</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <div className={styles.featureCard}>
            <h3>Smart Budgeting</h3>
            <p>Automatically categorize your expenses and track your spending in real-time.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Transaction Management</h3>
            <p>Organize and analyze all your financial transactions in one place.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Goal Tracking</h3>
            <p>Set and achieve your financial goals with personalized insights.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Secure & Private</h3>
            <p>Your financial data is protected with bank-level security.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
