# ISL VEX Robotics handoff

All three team sites are in [cturland/FiveRingsRoboticsVexWebsite](https://github.com/cturland/FiveRingsRoboticsVexWebsite). Choose the branch that matches the work you want to continue. The commit IDs below record the local Git snapshot for this handoff.

| Branch | Commit | Sites in the branch |
| --- | --- | --- |
| `master` | `5c7ee3f` | Five Rings Robotics (21052A), including the latest Five Rings search indexing changes in this snapshot |
| `feature/cool-runnings-site` | `33fa252` | Five Rings and Cool Runnings (21052B), including Cool Runnings school Google sign-in |
| `feature/byte-me-robotics-site` | `58de3f8` | Five Rings, Cool Runnings, and ByteMe Robotics (21052X) in one configurable Next.js app |

The three-team branch and `master` have diverged. The three-team branch does not include the Five Rings Google sign-in commit or the three later search indexing commits on `master`. Use the three-team branch for work across the sites, and compare it with `origin/master` before combining changes. Git branch contents describe the source code. Check the deployment settings separately to see what each live site runs.

## Resume on a Windows PC

Install Git and Node.js 24 LTS. To start with all three teams in a fresh checkout, run this in PowerShell:

```powershell
git clone --branch feature/byte-me-robotics-site https://github.com/cturland/FiveRingsRoboticsVexWebsite.git
Set-Location FiveRingsRoboticsVexWebsite
npm ci
```

If the repo is already cloned, run `git fetch origin` and switch to the relevant branch. Read the `README.md` and `.env.example` on that branch. Create `.env.local` from the example and obtain any required values through your existing project access. Keep credentials out of Git. Live data, school sign-in, and protected features depend on the environment and project configuration described in the README.

On the three-team branch, use `NEXT_PUBLIC_TEAM_SITE` in `.env.local` to choose a team. Leave it blank for Five Rings, use `cool-runnings` for Cool Runnings, or use `byte-me` for ByteMe. Run `npm run dev` and open `http://localhost:3000`. Restart the dev server after changing teams. Use `npm run lint` to check code changes.

Open the cloned folder in Codex on the home PC. A starting prompt is: “Read this handoff and the current branch’s README. Check the branch and recent commits, then help me continue work on [team and task].”
