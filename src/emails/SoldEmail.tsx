import {
  Html,
  Body,
  Container,
  Text,
  Heading,
} from "@react-email/components";

export default function SoldEmail({ name }: { name: string }) {
  return (
    <Html>
      <Body style={{ backgroundColor: "#f6f9fc" }}>
        <Container>
          <Heading>Item Sold, {name} 👋</Heading>
          <Text>Your item has been sold!</Text>
        </Container>
      </Body>
    </Html>
  );
}
