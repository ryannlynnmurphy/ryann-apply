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
    paddingTop: 72,
    paddingBottom: 72,
    paddingHorizontal: 72,
    fontFamily: "DM Sans",
  },
  name: {
    fontFamily: "Playfair Display",
    fontSize: 18,
    fontWeight: 700,
    color: "#2D2A26",
    marginBottom: 4,
  },
  contactLine: {
    fontFamily: "DM Sans",
    fontSize: 9,
    color: "#5C5852",
    marginBottom: 12,
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: "#C9A96E",
    marginBottom: 20,
  },
  paragraph: {
    fontFamily: "DM Sans",
    fontSize: 10.5,
    color: "#2D2A26",
    lineHeight: 1.6,
    marginBottom: 10,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    right: 72,
  },
  footerText: {
    fontFamily: "DM Sans",
    fontSize: 7,
    color: "#C9A96E",
    textAlign: "right",
  },
});

interface CoverLetterPDFProps {
  coverLetter: string;
  profile: {
    name: string;
    email: string;
    website: string;
    github: string;
    linkedin: string;
  };
}

export default function CoverLetterPDF({
  coverLetter,
  profile,
}: CoverLetterPDFProps) {
  const contactParts = [
    profile.email,
    profile.website,
    profile.github,
    profile.linkedin,
  ].filter(Boolean);

  const paragraphs = coverLetter
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.contactLine}>{contactParts.join("  |  ")}</Text>
        <View style={styles.rule} />

        {paragraphs.map((para, i) => (
          <Text key={i} style={styles.paragraph}>
            {para}
          </Text>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>HZL</Text>
        </View>
      </Page>
    </Document>
  );
}
