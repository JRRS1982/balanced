import React from 'react';
import Link from 'next/link';
import styles from './Logo.module.css';

const Logo = () => (
  <div className={styles.logoContainer}>
    <Link href="/" className={styles.logoLink}>
      <span className={styles.logoText}>BALANCED</span>
      <span className={styles.logoSuffix}>.money</span>
    </Link>
  </div>
);

export default Logo;
