

import React from 'react';
import styles from './MainLanding.module.scss';
import bg from '../../assets/svg/background.svg';

export default function MainLanding({ keyword, setKeyword, onStart }) {
  return (
    <div
      className={styles.mainLandingBg}
      style={{ background: `url(${bg}) center center/cover no-repeat` }}
    >
      <div className={styles.mainLandingSvgLeft}>
  <img src={require('../../assets/svg/landImg.svg').default} alt="landing illustration" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className={styles.mainLandingCenter}>
        <div className={styles.mainLandingTitle}>
          <span className={styles.seoPurple}>SEO</span> <span className={styles.seoBlack}>Generator</span>
        </div>
        <div className={styles.mainLandingInputWrap}>
          <div className={styles.inputSvgSearch}>
            <img src={require('../../assets/svg/glass.svg').default} alt="search" style={{ width: 22, height: 22, display: 'block' }} />
          </div>
          <input
            className={styles.mainLandingInput}
            type="text"
            placeholder="введите ключевое слово"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <button className={styles.mainLandingBtn} onClick={onStart} disabled={!keyword}>
          ГЕНЕРАЦИЯ
        </button>
        <div className={styles.mainLandingDesc}>
          Генератор SEO-контента для сайтов.<br />
          Быстро создаёт тексты, повышающие видимость и привлекающие трафик.
        </div>
      </div>
    </div>
  );
}
