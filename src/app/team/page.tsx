import Card from "../../components/Card";
import SectionHeading from "../../components/SectionHeading";
import TeamMemberCard from "../../components/TeamMemberCard";
import { getPublicTeamProfiles } from "../../lib/teamProfiles";
import type { TeamProfileRecord } from "../../lib/teamProfiles";
import type { TeamProfileRole } from "../../lib/teamProfileConstants";

const TEAM_ROLE_PRIORITY: Record<TeamProfileRole, number> = {
  'Lead Engineer': 0,
  Driver: 1,
  'Lead Programmer': 2,
  'Support Engineer': 3,
  'Support Programmer': 4,
  'Backup Driver': 5,
  'Lead Scout/Strategist': 6,
};

function sortRolesByPriority(roles: TeamProfileRole[]) {
  return [...roles].sort((a, b) => TEAM_ROLE_PRIORITY[a] - TEAM_ROLE_PRIORITY[b] || a.localeCompare(b));
}

function sortMembersByRolePriority(members: TeamProfileRecord[]) {
  return [...members].sort((a, b) => {
    const aRoles = sortRolesByPriority(a.roles);
    const bRoles = sortRolesByPriority(b.roles);
    const aPriority = aRoles[0] ? TEAM_ROLE_PRIORITY[aRoles[0]] : Number.MAX_SAFE_INTEGER;
    const bPriority = bRoles[0] ? TEAM_ROLE_PRIORITY[bRoles[0]] : Number.MAX_SAFE_INTEGER;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.name.localeCompare(b.name);
  });
}

export default async function TeamPage() {
  const profiles = await getPublicTeamProfiles();
  const currentMembers = sortMembersByRolePriority(profiles.filter((member) => member.isCurrentMember));
  const alumniMembers = sortMembersByRolePriority(profiles.filter((member) => !member.isCurrentMember));

  return (
    <section className="space-y-8">
      <section className="space-y-5">
        <div className="rounded-xl bg-[linear-gradient(180deg,rgba(18,34,56,0.96),rgba(11,20,33,0.96))] border border-red-500/20 p-8">
          <SectionHeading
            title="Meet the Team"
            subtitle="Meet the students actively building, programming, driving, and scouting for Five Rings Robotics right now."
          />
        </div>

        {currentMembers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {currentMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={{
                  name: member.name,
                  roles: sortRolesByPriority(member.roles),
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
                  name: member.name,
                  roles: sortRolesByPriority(member.roles),
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
