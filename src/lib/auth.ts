import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { db } from "./db";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { render } from "@react-email/render";
import { sendEmail } from "./mail";
import WelcomeEmail from "../emails/WelcomeEmail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const html = await render(WelcomeEmail({ name: user.name }));
          await sendEmail(user.email, "Welcome to Dropoff!", html);
        },
      },
    },
  },
});
