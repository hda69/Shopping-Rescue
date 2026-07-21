'use client';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  highlight: string;
}

interface TestimonialsMarqueeProps {
  title: string;
  subtitle: string;
  items: Testimonial[];
}

export function TestimonialsMarquee({ title, subtitle, items }: TestimonialsMarqueeProps) {
  const loop = [...items, ...items];

  return (
    <section id="reviews" className="section-muted overflow-hidden py-24">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#111]">{title}</h2>
          <p className="mt-4 text-[#6e6e73]">{subtitle}</p>
        </div>
      </div>

      <div className="testimonials-marquee mt-14" aria-label={title}>
        <div className="testimonials-marquee__track">
          {loop.map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className="testimonials-marquee__card"
              aria-hidden={index >= items.length}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0a84ff]">
                {item.highlight}
              </p>
              <blockquote className="mt-3 text-[15px] leading-relaxed text-[#333]">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-black/5 pt-4">
                <p className="text-sm font-semibold text-[#111]">{item.name}</p>
                <p className="mt-0.5 text-xs text-[#98989d]">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
