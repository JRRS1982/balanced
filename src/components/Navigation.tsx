'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <Link href="/">Balanced</Link>
      </div>
      <ul className={styles.links}>
        <li>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/budget" className={pathname === '/budget' ? styles.active : ''}>
            Budget
          </Link>
        </li>
        <li>
          <Link href="/transactions" className={pathname === '/transactions' ? styles.active : ''}>
            Transactions
          </Link>
        </li>
        <li>
          <Link href="/balance" className={pathname === '/balance' ? styles.active : ''}>
            Balance
          </Link>
        </li>
      </ul>
    </nav>
  );
}
