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

interface PickedUpEmailProps {
  name: string;
  itemTitle: string;
  imageUrl: string;
}

export default function PickedUpEmail({
  name,
  itemTitle = "OWC Mercury Pro",
  imageUrl = "https://placehold.co/400x400",
}: PickedUpEmailProps) {
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
          <Heading>Item Picked Up, {name} 👋</Heading>
          <Text>
            Your item has been picked up and is now in our hands.
            We'll get it listed for sale and notify you once it sells.
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
