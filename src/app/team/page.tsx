import teamMembers from '@/data/team.json';

type Member = {
  name: string;
  role: string;
  photo: string;
  shortBio: string;
  responsibilities: string[];
  favouriteMoment: string;
};

export default function TeamPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <h1 className="text-4xl font-bold">Meet the Team</h1>
        <p className="mt-3 max-w-3xl text-[var(--color-muted)]">
          Our team is a group of dedicated students who design, build, and compete in VEX robotics with a focus on innovation,
          teamwork, and continuous improvement.
        </p>
      </div>

      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <h2 className="text-2xl font-bold">Team Values</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Collaboration', detail: 'Work closely to solve complex problems efficiently.' },
            { title: 'Innovation', detail: 'Experiment with new ideas and learn from outcomes.' },
            { title: 'Resilience', detail: 'Persist through challenges and stay prepared for competition.' },
          ].map((value) => (
            <div key={value.title} className="card p-4">
              <h3 className="font-semibold text-white">{value.title}</h3>
              <p className="text-[var(--color-muted)] mt-1 text-sm">{value.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {(teamMembers as Member[]).map((member) => (
          <article key={member.name} className="card p-5">
            <div className="h-48 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <img src={member.photo} alt={`${member.name} photo`} className="h-full w-full object-cover" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{member.name}</h2>
                <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                  {member.role}
                </span>
              </div>
              <p className="text-[var(--color-muted)] mt-2">{member.shortBio}</p>
            </div>
            <div className="mt-4 text-sm text-[var(--color-muted)]">
              <p className="font-medium text-white">Responsibilities</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {member.responsibilities.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-[var(--color-muted)]">
              <span className="font-medium text-white">Favourite moment:</span> {member.favouriteMoment}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

