type SectionHeadingProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-10 text-center">
      <div className="mb-4 flex justify-center">
        <span className="eyebrow">Five Rings Robotics</span>
      </div>
      <h1 className="heading-display mb-4 text-4xl font-black text-white lg:text-5xl">{title}</h1>
      {subtitle ? <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[var(--color-muted)] lg:text-xl">{subtitle}</p> : null}
    </div>
  );
}
