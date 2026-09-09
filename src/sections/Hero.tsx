import { Brand } from '../components/Brand';
import { content, sections } from '../content';
import { useMobile } from '../useMobile';

export function Hero({ total }: { total: number | null }) {
  const mobile = useMobile();
  return (
    <section id="home" className="section hero" aria-labelledby="hero-title">
      <header className="header container">
        <Brand />
        <nav className="header-links" aria-label="Main navigation">
          {sections.slice(1, 6).map(({ id, label }) => (
            <a href={`#${id}`} data-scroll={id} key={id}>
              {id === 'support' ? 'Support' : label}
            </a>
          ))}
        </nav>
        <a
          className="button header-cta"
          href="#waitlist"
          data-scroll="waitlist"
        >
          JOIN WAITLIST
        </a>
      </header>
      <div className="hero-layout container">
        <div className="hero-copy reveal">
          <p className="launch-pill">
            <span className="live-dot" aria-hidden="true" />
            {content.hero.pill}
          </p>
          <h1 id="hero-title" tabIndex={-1}>
            {mobile ? (
              <>Matchday is better with </>
            ) : (
              <>
                <span>Matchday is</span>
                <span>better with</span>
              </>
            )}
            <span className="lime">your people.</span>
          </h1>
          <p className="description">
            {mobile
              ? 'Live scores, fan talk and friend challenges. Your matchday, together.'
              : content.hero.description}
          </p>
          <a
            className="button hero-cta"
            href="#waitlist"
            data-scroll="waitlist"
          >
            GET EARLY ACCESS <span aria-hidden="true">→</span>
          </a>
          <p
            className={`waitlist-counter ${total === null ? 'count-unavailable' : ''}`}
          >
            <span className="live-dot" aria-hidden="true" />
            {total === null
              ? 'Be among the first fans'
              : `${total.toLocaleString('en-IN')} fans already waiting`}
          </p>
        </div>
        <div className="hero-art">
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/assets/mobile-hero@2x.png"
            />
            <source
              type="image/avif"
              srcSet="/assets/hero-el-clasico-crowd.avif 728w, /assets/hero-el-clasico-crowd@2x.avif 1456w"
              sizes="(min-width: 1440px) 728px, 51vw"
            />
            <source
              type="image/webp"
              srcSet="/assets/hero-el-clasico-crowd.webp 728w, /assets/hero-el-clasico-crowd@2x.webp 1456w"
              sizes="(min-width: 1440px) 728px, 51vw"
            />
            <img
              className="hero-photo"
              src="/assets/hero-el-clasico-crowd@2x.jpg"
              width={1456}
              height={1410}
              fetchPriority="high"
              alt="Real Madrid supporters celebrating at the Bernabéu."
            />
          </picture>
          <div
            className="result-card"
            aria-label="Full time: Real Madrid 2, Barcelona 1"
          >
            <div className="team">
              <img
                src="/assets/crest-real-madrid@2x.png"
                width={54}
                height={54}
                alt=""
              />
              <strong>Real Madrid</strong>
            </div>
            <div className="score">
              <strong>2 – 1</strong>
              <span>FT</span>
            </div>
            <div className="team away">
              <strong>Barcelona</strong>
              <img
                src="/assets/crest-fc-barcelona@2x.png"
                width={54}
                height={54}
                alt=""
              />
            </div>
            <span className="full-time">FULL TIME</span>
          </div>
        </div>
      </div>
      <a
        className="mobile-only scroll-hint container"
        href="#matchday"
        data-scroll="matchday"
      >
        Scroll to explore ↓
      </a>
    </section>
  );
}
