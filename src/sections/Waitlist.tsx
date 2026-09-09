import { Brand } from '../components/Brand';
import { Forms } from '../components/Forms';
import { SectionHeading } from '../components/SectionHeading';
import { config, externalUrl } from '../config';
import { content } from '../content';
import { useMobile } from '../useMobile';
export function Waitlist({ onJoined }: { onJoined: () => void }) {
  const mobile = useMobile();
  const links = [
    ['Privacy', config.privacyUrl],
    ['Terms', config.termsUrl],
    ['Community Guidelines', config.communityUrl],
  ];
  return (
    <section
      id="waitlist"
      className="section waitlist"
      aria-labelledby="waitlist-title"
    >
      <div className="waitlist-area container">
        <div className="waitlist-card reveal">
          <div>
            <SectionHeading id="waitlist-title" {...content.waitlist} />
          </div>
          <Forms kind="waitlist" onJoined={onJoined} />
        </div>
      </div>
      <footer>
        <div className="footer-inner container">
          <Brand footer />
          <nav className="legal-links" aria-label="Legal">
            {links.map(([label, url]) =>
              externalUrl(url) ? (
                <a key={label} href={externalUrl(url)}>
                  {label}
                </a>
              ) : (
                <span key={label} title="Link will be available at launch">
                  {label}
                </span>
              ),
            )}
          </nav>
          <p className="copyright">
            © 2026 FanArena{mobile ? <br /> : ' · '}Made for fans who watch
            everything.
          </p>
        </div>
      </footer>
    </section>
  );
}
