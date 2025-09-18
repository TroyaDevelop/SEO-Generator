
import React from 'react';
import './MainLanding.css';
import bg from '../assets/svg/background.svg';

export default function MainLanding({ keyword, setKeyword, onStart }) {
  return (
    <div
      className="main-landing-bg"
      style={{
        background: `url(${bg}) center center/cover no-repeat`
      }}
    >
      <div className="main-landing-svg-left">
        <img src={require('../assets/svg/landImg.svg').default} alt="landing illustration" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="main-landing-center">
        <div className="main-landing-title">
          <span className="seo-purple">SEO</span> <span className="seo-black">Generator</span>
        </div>
        <div className="main-landing-input-wrap">
          <div className="input-svg-search">
            <img src={require('../assets/svg/glass.svg').default} alt="search" style={{ width: 22, height: 22, display: 'block' }} />
          </div>
          <input
            className="main-landing-input"
            type="text"
            placeholder="введите ключевое слово"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <button className="main-landing-btn" onClick={onStart} disabled={!keyword}>
          ГЕНЕРАЦИЯ
        </button>
        <div className="main-landing-desc">
          Генератор SEO-контента для сайтов.<br />
          Быстро создаёт тексты, повышающие видимость и привлекающие трафик.
        </div>
      </div>
    </div>
  );
}
