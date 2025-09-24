import styles from './MainLanding.module.scss';
import SharedLandingBg from '../SharedLandingBg/SharedLandingBg';

export default function MainLanding({ keyword, setKeyword, onStart }) {
  return (
    <SharedLandingBg>
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
    </SharedLandingBg>
  );
}
