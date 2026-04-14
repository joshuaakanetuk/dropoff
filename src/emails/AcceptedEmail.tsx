import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Img,
  Section,
  Font,
} from "@react-email/components";

interface AcceptedEmailProps {
  name: string;
  itemTitle: string;
  imageUrl: string;
}

export default function AcceptedEmail({
  name,
  itemTitle = "OWC Mercury Pro",
  imageUrl = "https://placehold.co/400x400",
}: AcceptedEmailProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "Inter, Helvetica, sans-serif" }}>
        <Container>
          <Heading>Item Accepted, {name} 👋</Heading>
          <Text>
            Great news! Your item has been accepted and is now listed for sale.
            We'll let you know as soon as it sells.
          </Text>
          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center" as const,
            }}
          >
            <Img
              src={imageUrl}
              alt={itemTitle}
              width={200}
              height={200}
              style={{
                borderRadius: "12px",
                objectFit: "cover",
                margin: "0 auto",
              }}
            />
            <Text style={{ fontSize: "18px", fontWeight: 600, margin: "12px 0 4px" }}>
              {itemTitle}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
