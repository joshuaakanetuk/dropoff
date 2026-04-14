// emails/WelcomeEmail.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Font,
} from "@react-email/components";

export default function WelcomeEmail({ name }: { name: string }) {
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
          <Heading>Welcome, {name} 👋</Heading>
          <Text>
            Thanks for signing up for codename: dropoff! This is a service to help you get rid of the stuff you don't need and make a little bit of money on the side. This app is still in development, so expect some weirdness and rapid changes. If you have any questions, please don't hesitate to text me.
          </Text>
          <br />
          <Text>Thanks,<br />Josh</Text>
        </Container>
      </Body>
    </Html>
  );
}