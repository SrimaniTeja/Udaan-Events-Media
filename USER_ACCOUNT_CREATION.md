# How to Create User Accounts (Admin, Cameraman, Editor)

## Overview

User accounts in this system are stored in PostgreSQL using Prisma. You can create accounts in multiple ways depending on your needs.

---

## Method 1: Using Prisma Studio (Easiest for Manual Creation)

### Steps:

1. **Start Prisma Studio** (locally or connect to your production DB):
   ```bash
   npm run prisma:studio
   ```
   This opens a GUI at `http://localhost:5555`

2. **Navigate to User table** and click "Add record"

3. **Fill in the fields**:
   - `id`: Leave empty (auto-generated)
   - `name`: Full name (e.g., "John Smith")
   - `email`: Unique email address (e.g., "john.smith@company.com")
   - `passwordHash`: You need to hash the password first (see below)
   - `role`: One of: `"ADMIN"`, `"CAMERAMAN"`, `"EDITOR"`
   - `isFree`: `true` (for editors, indicates availability)
   - `createdAt`: Leave empty (auto-generated)

4. **Generate password hash** (run this in Node.js or terminal):
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password-here', 10).then(h => console.log(h))"
   ```
   Copy the output and paste it as `passwordHash`

5. **Save the record**

---

## Method 2: Using Seed Script (For Bulk Creation)

### Create a seed script or modify `prisma/seed.js`:

```javascript
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordPlain = "temporary-password-123"; // Change this
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  // Create Admin
  await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: { name: "Admin User", role: "ADMIN", passwordHash },
    create: {
      name: "Admin User",
      email: "admin@company.com",
      role: "ADMIN",
      passwordHash,
      isFree: true,
    },
  });

  // Create Cameraman
  await prisma.user.upsert({
    where: { email: "cameraman1@company.com" },
    update: { name: "Camera Person", role: "CAMERAMAN", passwordHash },
    create: {
      name: "Camera Person",
      email: "cameraman1@company.com",
      role: "CAMERAMAN",
      passwordHash,
      isFree: true,
    },
  });

  // Create Editor
  await prisma.user.upsert({
    where: { email: "editor1@company.com" },
    update: { name: "Editor Person", role: "EDITOR", passwordHash, isFree: true },
    create: {
      name: "Editor Person",
      email: "editor1@company.com",
      role: "EDITOR",
      passwordHash,
      isFree: true,
    },
  });

  console.log("Users created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Then run:
```bash
npm run prisma:seed
```

---

## Method 3: Using SQL Directly (Advanced)

Connect to your PostgreSQL database and run:

```sql
INSERT INTO "User" (id, name, email, "passwordHash", role, "isFree", "createdAt")
VALUES (
  'user-id-here',  -- Generate a unique ID (or use gen_random_uuid() in Postgres)
  'User Name',
  'user@company.com',
  '$2a$10$hashedpasswordhere',  -- Must be bcrypt hash
  'CAMERAMAN',  -- or 'ADMIN' or 'EDITOR'
  true,
  NOW()
);
```

**To generate bcrypt hash in SQL**, you'll need a PostgreSQL extension or do it via Node.js first.

---

## Method 4: Create an Admin Panel Endpoint (Best for Production)

### Create a new API route: `app/api/admin/users/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!["ADMIN", "CAMERAMAN", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isFree: role === "EDITOR", // Editors start as free
      },
    });

    return NextResponse.json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
```

Then create a UI form in your admin dashboard to call this endpoint.

---

## Important Notes

### Password Security

- **Never store plain text passwords**
- Always use `bcryptjs` with salt rounds of 10
- Users can change their password later (if you implement that feature)

### Roles

- **ADMIN**: Full access, can create events, view all, manage assignments
- **CAMERAMAN**: Can view assigned events, upload RAW media
- **EDITOR**: Can view assigned events, download RAW, upload FINAL

### Email Uniqueness

- Emails must be unique across all users
- The system converts emails to lowercase before storing

### Editor `isFree` Flag

- `isFree: true` means the editor is available for auto-assignment
- When an editor is assigned to an event, set `isFree: false`
- When event is completed, set back to `true`

---

## Recommended Approach for Production

1. **Create initial admin** using seed script or SQL
2. **Build a user management UI** in admin dashboard (Method 4)
3. **Use that UI** to create all other users
4. **Optionally**: Implement email verification and password reset flows

---

## Quick Test After Creation

1. Go to `/login`
2. Use the email and password you set
3. You should be redirected to the appropriate dashboard based on role

