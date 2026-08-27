import type { ReactNode } from "react";
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ResumeDoc, ResumeEntry } from "@/lib/resume";

const INK = "#111111";
const LINK = "#0f4c81";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Source Serif 4",
    fontSize: 10,
    color: INK,
    lineHeight: 1.35,
    paddingTop: 40,
    paddingBottom: 44,
    paddingHorizontal: 48,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 1.4,
    lineHeight: 1.15,
  },
  headline: {
    marginTop: 4,
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
  contact: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactSep: {
    fontSize: 10,
  },
  link: {
    color: LINK,
    textDecoration: "none",
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.8,
  },
  rule: {
    marginTop: 3,
    marginBottom: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: INK,
  },
  body: {
    fontSize: 10,
  },
  bold: {
    fontWeight: 700,
  },
  entry: {
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  left: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  right: {
    flexShrink: 0,
    textAlign: "right",
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
  },
  date: {
    fontSize: 10,
    fontWeight: 700,
  },
  sub: {
    marginTop: 1,
    fontSize: 10,
    fontStyle: "italic",
  },
  bullet: {
    marginTop: 2,
    flexDirection: "row",
    paddingLeft: 4,
  },
  bulletMark: {
    width: 12,
    fontSize: 10,
  },
  bulletText: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#666666",
    textAlign: "center",
  },
});

function Contact({ resume }: { resume: ResumeDoc }) {
  const items: { label: string; href?: string }[] = [];
  if (resume.email) {
    items.push({ label: resume.email, href: `mailto:${resume.email}` });
  }
  if (resume.location) {
    items.push({ label: resume.location });
  }
  for (const link of resume.links) {
    items.push({ label: link.label, href: link.href });
  }
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.contact}>
      {items.map((item, index) => (
        <View key={`${item.label}-${index}`} style={styles.contactItem} wrap={false}>
          {index > 0 ? <Text style={styles.contactSep}> · </Text> : null}
          {item.href ? (
            <Link src={item.href} style={styles.link}>
              <Text>{item.label}</Text>
            </Link>
          ) : (
            <Text>{item.label}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View minPresenceAhead={32} wrap={false}>
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
        <View style={styles.rule} />
      </View>
      {children}
    </View>
  );
}

function Entry({ entry, compact }: { entry: ResumeEntry; compact?: boolean }) {
  return (
    <View style={styles.entry} wrap>
      <View style={styles.row} wrap={false} minPresenceAhead={36}>
        <Text style={[styles.left, compact ? styles.body : styles.title]}>
          {entry.leftTitle}
        </Text>
        {entry.rightTitle ? (
          <Text style={[styles.right, styles.date]}>{entry.rightTitle}</Text>
        ) : null}
      </View>
      {entry.leftSubtitle || entry.rightSubtitle ? (
        <View style={styles.row} wrap={false}>
          <Text style={[styles.left, styles.sub]}>
            {entry.leftSubtitle ?? ""}
          </Text>
          {entry.rightSubtitle ? (
            <Text style={[styles.right, styles.sub]}>{entry.rightSubtitle}</Text>
          ) : null}
        </View>
      ) : null}
      {entry.items.map((item, index) => (
        <View key={`${index}-${item.slice(0, 24)}`} style={styles.bullet} wrap>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Entries({
  title,
  entries,
  compact,
}: {
  title: string;
  entries: ResumeEntry[];
  compact?: boolean;
}) {
  if (entries.length === 0) {
    return null;
  }
  return (
    <Section title={title}>
      {entries.map((entry, index) => (
        <Entry
          key={`${entry.leftTitle}-${index}`}
          entry={entry}
          compact={compact}
        />
      ))}
    </Section>
  );
}

export function ResumeDocument({ resume }: { resume: ResumeDoc }) {
  return (
    <Document
      title={`${resume.name} — Resume`}
      author={resume.name}
      producer="Builder"
    >
      <Page size="LETTER" style={styles.page} wrap>
        <View wrap={false}>
          <Text style={styles.name}>{resume.name.toUpperCase()}</Text>
          {resume.headline ? (
            <Text style={styles.headline}>{resume.headline}</Text>
          ) : null}
          <Contact resume={resume} />
        </View>

        {resume.summary ? (
          <Section title="Summary">
            <Text style={styles.body}>{resume.summary}</Text>
          </Section>
        ) : null}

        <Entries title="Experience" entries={resume.experience} />
        <Entries title="Projects" entries={resume.projects} compact />

        {resume.skills ? (
          <Section title="Technical Skills">
            <Text style={styles.body}>
              <Text style={styles.bold}>Skills: </Text>
              {resume.skills}
            </Text>
          </Section>
        ) : null}

        <Entries title="Education" entries={resume.education} />
        <Entries title="Certifications" entries={resume.certifications} />

        {resume.languages ? (
          <Section title="Languages">
            <Text style={styles.body}>{resume.languages}</Text>
          </Section>
        ) : null}

        <Entries title="Awards" entries={resume.awards} />
        <Entries title="Publications" entries={resume.publications} />
        <Entries title="Volunteer" entries={resume.volunteer} />

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
          }
        />
      </Page>
    </Document>
  );
}
