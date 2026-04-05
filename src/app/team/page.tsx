import Card from "../../components/Card";
import SectionHeading from "../../components/SectionHeading";
import TeamMemberCard from "../../components/TeamMemberCard";
import { getPublicTeamProfiles } from "../../lib/teamProfiles";

export default async function TeamPage() {
  const profiles = await getPublicTeamProfiles();
  const currentMembers = profiles.filter((member) => member.isCurrentMember);
  const alumniMembers = profiles.filter((member) => !member.isCurrentMember);

  return (
    <section className="space-y-8">
      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <SectionHeading
          title="Meet the Team"
          subtitle="Meet the students behind Five Rings Robotics, with current members featured first and alumni celebrated in the Hall of Fame."
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

      <section className="space-y-5">
        <div className="rounded-xl bg-[linear-gradient(180deg,rgba(18,34,56,0.96),rgba(11,20,33,0.96))] border border-red-500/20 p-8">
          <SectionHeading
            title="Current Members"
            subtitle="These are the students actively building, programming, driving, and scouting for the team right now."
          />
        </div>

        {currentMembers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {currentMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={{
                  email: member.email,
                  name: member.name,
                  roles: member.roles,
                  photo: member.photoUrl || '',
                  shortBio: member.bio,
                  isCurrentMember: true,
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-lg font-semibold text-white">No current member profiles yet.</p>
            <p className="mt-3 text-[var(--color-muted)]">
              Once signed-in team members create their profiles, they will appear here automatically.
            </p>
          </Card>
        )}
      </section>

      <section className="space-y-5">
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
          <SectionHeading
            title="Five Rings Hall of Fame"
            subtitle="A place to recognize former members who helped shape the team."
          />
        </div>

        {alumniMembers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {alumniMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={{
                  email: member.email,
                  name: member.name,
                  roles: member.roles,
                  photo: member.photoUrl || '',
                  shortBio: member.bio,
                  isCurrentMember: false,
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-lg font-semibold text-white">No Hall of Fame profiles yet.</p>
            <p className="mt-3 text-[var(--color-muted)]">
              Former members will appear here once their profile is marked as an ex-member.
            </p>
          </Card>
        )}
      </section>
    </section>
  );
}
