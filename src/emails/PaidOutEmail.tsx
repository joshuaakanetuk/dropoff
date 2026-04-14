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

interface PaidOutEmailProps {
  name: string;
  itemTitle: string;
  amount: string;
  imageUrl: string;
}

export default function PaidOutEmail({
  name,
  itemTitle = "OWC Mercury Pro",
  amount = "$120.00",
  imageUrl = "https://placehold.co/400x400",
}: PaidOutEmailProps) {
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
          <Heading>Payment Sent, {name} 👋</Heading>
          <Text>
            Your payment has been sent! The funds should arrive in your account shortly.
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
            <Text style={{ fontSize: "20px", fontWeight: 700, color: "#16a34a", margin: "0" }}>
              {amount}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
