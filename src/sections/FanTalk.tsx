import { SectionHeading } from '../components/SectionHeading';
import { Phone } from '../components/Phone';
import { content } from '../content';
export function FanTalk() {
  return (
    <section
      id="fan-talk"
      className="section feature fan-talk"
      aria-labelledby="talk-title"
    >
      <div className="feature-layout container">
        <div className="feature-copy reveal">
          <SectionHeading id="talk-title" {...content.talk} />
          <div className="comments">
            {content.talk.comments.map((text) => (
              <p className="comment reveal" key={text}>
                {text}
              </p>
            ))}
          </div>
        </div>
        <Phone variant="talk" />
      </div>
    </section>
  );
}
