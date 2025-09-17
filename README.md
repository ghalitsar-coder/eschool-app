# eSchool Management System

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

eSchool is a comprehensive management system for school extracurricular activities. It supports multiple schools, each with various extracurricular programs (eschools). The system provides features for:

- Member management
- Attendance tracking
- Financial management (kas)
- Role-based access control

## System Roles

The system supports 4 distinct roles:

1. **STAFF** - School administrators (1-2 per school)
   - Manage ALL eschools in their school
   - Have the highest level of access

2. **KOORDINATOR** - Activity coordinators (1 per eschool)
   - Manage a specific eschool
   - Handle member management and attendance

3. **BENDAHARA** - Treasurers (1 per eschool)
   - Manage financial aspects of an eschool
   - Can also participate as members in other eschools

4. **MEMBER** - Students
   - Participate in multiple eschools
   - Limited access based on their participation

## Recent Updates

### Field Addition for Coordinators and Treasurers

We've recently added additional identity fields for coordinators and treasurers to provide more comprehensive user management:

#### For Coordinators:
- NIP/NIS
- Date of birth
- Gender
- Address
- Phone number

#### For Treasurers:
- NIP/NIS
- Date of birth
- Gender
- Address
- Phone number

These fields are stored in the `members` table and can be managed through the eschool creation and update interfaces.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Documentation

For more detailed documentation, see:
- [Developer Guide](src/app/dashboard/eschool/DEVELOPER_GUIDE.md)
- [API Documentation](../laravel-backend/KAS_API_DOCUMENTATION_UPDATED.md)
- [Changelog](src/app/dashboard/eschool/CHANGELOG.md)