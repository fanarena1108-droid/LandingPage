import { SectionHeading } from '../components/SectionHeading';
import { Forms } from '../components/Forms';
import { content } from '../content';
import { config, externalUrl } from '../config';
import { ContactSheet } from '../components/ContactSheet';
import { useMobile } from '../useMobile';
export function Support() {
  const mobile = useMobile();
  const instagram = externalUrl(config.instagramUrl);
  return (
    <section
      id="support"
      className="section support"
      aria-labelledby="support-title"
    >
      <div className="support-layout container">
        <div className="support-copy reveal">
          <SectionHeading id="support-title" {...content.support} />
          <div className="platforms">
            {content.support.platforms.map((platform, i) => {
              const body = (
                <>
                  <img
                    src={`/assets/${platform.asset}@2x.png`}
                    width={42}
                    height={42}
                    alt=""
                  />
                  <div>
                    <strong>{platform.name}</strong>
                    <p>
                      {mobile
                        ? i
                          ? 'Coming soon'
                          : 'Follow our journey'
                        : platform.description}
                    </p>
                  </div>
                  <span className="platform-action">
                    {i
                      ? 'COMING SOON'
                      : instagram
                        ? 'FOLLOW →'
                        : 'UPDATES SOON'}
                  </span>
                </>
              );
              return i === 0 && instagram ? (
                <a
                  className="platform instagram"
                  key={platform.name}
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow FanArena on Instagram (opens in a new tab)"
                >
                  {body}
                </a>
              ) : (
                <div
                  className={`platform ${i === 0 ? 'instagram' : ''}`}
                  key={platform.name}
                  aria-disabled="true"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </div>
        <div className="reveal desktop-support-form">
          <Forms kind="support" />
        </div>
        <ContactSheet />
      </div>
    </section>
  );
}
