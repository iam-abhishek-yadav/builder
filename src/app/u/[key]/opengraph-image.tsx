import { ImageResponse } from "next/og";
import { getProfileByKey, getProfileWork } from "@/lib/profiles/queries";

export const alt = "Builder profile on Builder One Stop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card for /u/<key>: name, headline, handle and a few numbers. */
export default async function Image({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const profile = await getProfileByKey(key);
  const work = profile ? await getProfileWork(profile.id) : null;
  const name = profile?.name ?? "Builder not found";
  const handle = profile ? (profile.handle ? `@${profile.handle}` : `/u/${profile.publicId}`) : "";
  const headline = profile?.headline ?? "Building in public on Builder One Stop";
  const skills = work?.skills.slice(0, 4).map((s) => s.name) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#ffffff",
          backgroundImage: "radial-gradient(#e5e5e5 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#171717", fontWeight: 600 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#171717",
              color: "#ffffff",
              fontSize: 20,
            }}
          >
            b1
          </div>
          Builder One Stop
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 76, fontWeight: 700, color: "#0a0a0a", letterSpacing: -2 }}>{name}</div>
            {profile?.openToWork ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#047857",
                  background: "#ecfdf5",
                  border: "2px solid #a7f3d0",
                  borderRadius: 999,
                  padding: "8px 20px",
                }}
              >
                Open to work
              </div>
            ) : null}
          </div>
          <div style={{ fontSize: 36, color: "#404040", maxWidth: 1000 }}>{headline}</div>
          <div style={{ fontSize: 28, color: "#e05d1a", fontFamily: "monospace" }}>{handle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 26, color: "#525252" }}>
          {work ? <div style={{ display: "flex" }}>{`${work.launches.length} ${work.launches.length === 1 ? "launch" : "launches"} · ${work.totalVotes} ${work.totalVotes === 1 ? "upvote" : "upvotes"}`}</div> : null}
          {skills.length ? <div style={{ display: "flex", color: "#737373" }}>{skills.join("  ·  ")}</div> : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
