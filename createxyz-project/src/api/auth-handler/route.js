async function handler({ userId, pin, action }) {
  try {
    switch (action) {
      case "getNextUserId": {
        const result = await sql`SELECT get_next_user_id() as next_id`;
        return { userId: result[0].next_id };
      }

      case "checkUserId": {
        if (!userId) {
          return { error: "Missing userId" };
        }

        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
          return { error: "Invalid userId format" };
        }

        const existingUser = await sql`
          SELECT user_id FROM users 
          WHERE user_id = ${userIdInt}
        `;

        return { available: !existingUser || existingUser.length === 0 };
      }

      case "login": {
        if (!userId || !pin) {
          return { error: "Missing userId or pin" };
        }

        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
          return { error: "Invalid userId format" };
        }

        // Verify user exists with correct pin
        const users = await sql`
          SELECT user_id FROM users 
          WHERE user_id = ${userIdInt} AND pin = ${pin}
        `;

        if (!users || users.length === 0) {
          return { error: "Invalid credentials" };
        }

        return { success: true };
      }

      case "signup":
      case "createUser": {
        if (!userId || !pin) {
          return { error: "Missing userId or pin" };
        }

        const userIdInt = parseInt(userId, 10);
        if (isNaN(userIdInt)) {
          return { error: "Invalid userId format" };
        }

        // Check if user ID already exists
        const existingUser = await sql`
          SELECT user_id FROM users 
          WHERE user_id = ${userIdInt}
        `;

        if (existingUser && existingUser.length > 0) {
          return { error: "User ID already exists" };
        }

        // Create new user
        await sql`
          INSERT INTO users (user_id, pin)
          VALUES (${userIdInt}, ${pin})
        `;

        return { success: true };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Auth error:", error);
    return { error: "Authentication failed: " + error.message };
  }
}
export async function POST(request) {
  return handler(await request.json());
}