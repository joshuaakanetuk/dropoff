// emails/WelcomeEmail.tsx
import {
  Html,
  Body,
  Container,
  Text,
  Heading,
} from "@react-email/components";

export default function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Body style={{ backgroundColor: "#f6f9fc" }}>
        <Container>
          <Heading>Welcome, {name} 👋</Heading>
          <Text>Thanks for signing up!</Text>
        </Container>
      </Body>
    </Html>
  );
}