import teamMembers from "../../../data/team.json";
import SectionHeading from "../../components/SectionHeading";
import TeamMemberCard from "../../components/TeamMemberCard";
import Card from "../../components/Card";

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
      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <SectionHeading
          title="Meet the Team"
          subtitle="Our team is a group of dedicated students who design, build, and compete in VEX robotics with a focus on innovation, teamwork, and continuous improvement."
        />
      </section>

      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <SectionHeading title="Team Values" />
        <div className="mt-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Collaboration', detail: 'Work closely to solve complex problems efficiently.' },
            { title: 'Innovation', detail: 'Experiment with new ideas and learn from outcomes.' },
            { title: 'Resilience', detail: 'Persist through challenges and stay prepared for competition.' },
          ].map((value) => (
            <Card key={value.title}>
              <h3 className="font-semibold text-[var(--color-text)]">{value.title}</h3>
              <p className="text-[var(--color-muted)] mt-1 text-sm">{value.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(teamMembers) && teamMembers.length > 0 ? (
          (teamMembers as Member[]).map((member) => (
            <TeamMemberCard key={member.name || member.role || Math.random()} member={member} />
          ))
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-muted)]">
            No team members configured yet. Add members to `data/team.json`.
          </div>
        )}
      </div>
    </section>
  );
}


