import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "DM Sans",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAkJxh.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxh.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAXJth.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Playfair Display",
  src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vXDXbtU.ttf",
  fontWeight: 700,
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 56,
    fontFamily: "DM Sans",
  },
  name: {
    fontFamily: "Playfair Display",
    fontSize: 20,
    fontWeight: 700,
    color: "#2D2A26",
    textAlign: "center",
    marginBottom: 4,
  },
  contactLine: {
    fontFamily: "DM Sans",
    fontSize: 9,
    color: "#5C5852",
    textAlign: "center",
    marginBottom: 2,
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: "#C9A96E",
    marginTop: 10,
    marginBottom: 14,
  },
  sectionHeader: {
    fontFamily: "DM Sans",
    fontSize: 10,
    fontWeight: 700,
    color: "#2D2A26",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#5C5852",
    marginBottom: 8,
  },
  sectionContent: {
    fontFamily: "DM Sans",
    fontSize: 9.5,
    color: "#2D2A26",
    lineHeight: 1.5,
    marginBottom: 4,
  },
  sectionWrap: {
    marginBottom: 12,
  },
  entryTitle: {
    fontFamily: "DM Sans",
    fontSize: 9.5,
    fontWeight: 700,
    color: "#2D2A26",
    marginBottom: 2,
  },
  entryBody: {
    fontFamily: "DM Sans",
    fontSize: 9.5,
    color: "#2D2A26",
    lineHeight: 1.5,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletChar: {
    fontFamily: "DM Sans",
    fontSize: 9.5,
    color: "#C9A96E",
    width: 12,
  },
  bulletText: {
    fontFamily: "DM Sans",
    fontSize: 9.5,
    color: "#2D2A26",
    lineHeight: 1.5,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    right: 56,
  },
  footerText: {
    fontFamily: "DM Sans",
    fontSize: 7,
    color: "#C9A96E",
    textAlign: "right",
  },
});

interface ResumePDFProps {
  resume: string;
  profile: {
    name: string;
    email: string;
    website: string;
    github: string;
    linkedin: string;
    location: string;
    languages: string[];
  };
}

interface ResumeSection {
  title: string;
  content: string;
}

const SECTION_HEADERS = [
  "SUMMARY",
  "EXPERIENCE",
  "PROJECTS",
  "EDUCATION",
  "SKILLS",
];

function parseResume(text: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const regex = new RegExp(
    `^(${SECTION_HEADERS.join("|")})\\s*$`,
    "gm"
  );

  const matches: { header: string; index: number }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ header: match[1], index: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].header.length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const content = text.slice(start, end).trim();
    sections.push({ title: matches[i].header, content });
  }

  return sections;
}

function renderSectionContent(title: string, content: string) {
  const lines = content.split("\n").filter((l) => l.trim());

  if (title === "EXPERIENCE" || title === "PROJECTS") {
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletChar}>{"\u2022"}</Text>
            <Text style={styles.bulletText}>{trimmed.slice(2)}</Text>
          </View>
        );
      }
      // Lines with | or -- are likely entry titles
      if (trimmed.includes("|") || trimmed.includes(" -- ")) {
        return (
          <Text key={i} style={styles.entryTitle}>
            {trimmed}
          </Text>
        );
      }
      return (
        <Text key={i} style={styles.entryBody}>
          {trimmed}
        </Text>
      );
    });
  }

  if (title === "SKILLS") {
    return (
      <Text style={styles.sectionContent}>{content.replace(/\n/g, ", ").replace(/, , /g, ", ")}</Text>
    );
  }

  return lines.map((line, i) => (
    <Text key={i} style={styles.sectionContent}>
      {line.trim()}
    </Text>
  ));
}

export default function ResumePDF({ resume, profile }: ResumePDFProps) {
  const contactParts = [
    profile.email,
    profile.website,
    profile.github,
    profile.linkedin,
  ].filter(Boolean);

  const metaParts = [
    profile.location,
    profile.languages.length > 0 ? profile.languages.join(", ") : "",
  ].filter(Boolean);

  const sections = parseResume(resume);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.contactLine}>{contactParts.join("  |  ")}</Text>
        {metaParts.length > 0 && (
          <Text style={styles.contactLine}>{metaParts.join("  |  ")}</Text>
        )}
        <View style={styles.rule} />

        {sections.map((section, i) => (
          <View key={i} style={styles.sectionWrap}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <View style={styles.sectionRule} />
            {renderSectionContent(section.title, section.content)}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>HZL</Text>
        </View>
      </Page>
    </Document>
  );
}
