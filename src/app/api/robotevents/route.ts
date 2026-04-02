import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder response for RobotEvents integration.
  // In the future, this route can proxy requests to the RobotEvents API
  // and apply auth, caching, and data shaping for the frontend.
  return NextResponse.json(
    {
      message: "RobotEvents API integration is not yet connected. Implement in src/lib/robotevents.ts",
      status: "unavailable",
    },
    { status: 501 },
  );
}
