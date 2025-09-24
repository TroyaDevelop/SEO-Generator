import React from 'react';
import styles from './SharedLandingBg.module.scss';
import bg from '../../assets/svg/background.svg';

export default function SharedLandingBg({ children, className }) {
  return (
    <div className={`${styles.mainLandingBg} ${className || ''}`} style={{ background: `url(${bg}) center center/cover no-repeat` }}>
      <div className={styles.mainLandingSvgLeft}>
        <img src={require('../../assets/svg/landImg.svg').default} alt="landing illustration" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      {children}
    </div>
  );
}
