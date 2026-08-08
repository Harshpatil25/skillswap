# SkillSwap Connect

You are an expert senior full-stack software engineer, UX designer, and product architect.

Your task is to build a complete production-ready web application called SkillSwap – Hyperlocal Skill Exchange Marketplace.

Do NOT build a prototype or MVP. Build a polished application that is ready for deployment.

Product Vision

SkillSwap connects students, professionals, mentors, and nearby MSMEs to exchange practical skills, conduct workshops, provide mentorship, and discover internship opportunities.

The platform focuses on hyperlocal learning instead of generic online courses.

The goal is to bridge the gap between education and industry through AI-powered recommendations and local networking.

Tech Stack (Must Use)

Frontend

 React.js

 Vite

 Tailwind CSS

 shadcn/ui

 React Router DOM

 TanStack Query

 React Hook Form

 Zod

Backend

 Supabase only (No Node.js server)

 Supabase Authentication

 PostgreSQL

 Row Level Security

 Supabase Storage

 Supabase Realtime where useful

Deployment

 GitHub

 Vercel

Icons

 Lucide React

Maps

 Leaflet + OpenStreetMap

Charts

 Recharts

Animations

 Framer Motion

UI Inspiration

Use the following Dribbble design ONLY as inspiration.

https://dribbble.com/shots/27330773-SkillSwap-Platform-for-Skill-Exchange-Mentorship

DO NOT copy it pixel-for-pixel.

Instead recreate the same design language.

Requirements

Modern

Minimal

Clean

Rounded cards

Lots of white space

Blue accent color

Soft shadows

Professional typography

Smooth animations

Responsive

Beautiful dashboard

Premium SaaS look

Color Palette

Primary
#2563EB

Primary Hover
#1D4ED8

Background
#F8FAFC

Cards
#FFFFFF

Text
#0F172A

Secondary Text
#64748B

Borders
#E2E8F0

Success
#22C55E

Warning
#F59E0B

Error
#EF4444

Fonts

Use

Inter

or

Plus Jakarta Sans

User Roles

Student

Mentor

MSME

Administrator

Each role must have its own dashboard.

Authentication

Implement

Signup

Login

Forgot Password

Email Verification

Protected Routes

Role Based Access

Persistent Login

Profile Creation

Landing Page

Beautiful hero section

Search bar

Popular Skills

Top Mentors

Featured Workshops

How SkillSwap Works

Statistics

Testimonials

Call To Action

Footer

Student Dashboard

Welcome Banner

Learning Progress

Upcoming Workshops

Recommended Skills

Nearby Workshops

Saved Mentors

Certificates

Notifications

Profile

Settings

Mentor Dashboard

Create Workshop

Manage Workshops

Attendance

Participants

Ratings

Certificates

Revenue (optional)

Profile

MSME Dashboard

Company Profile

Create Workshop

Post Internship

View Applicants

Search Students

Analytics

Notifications

Admin Dashboard

Dashboard Overview

Manage Users

Manage Workshops

Manage Companies

Reports

Analytics

Role Management

Platform Settings

Explore Page

Exactly the same experience as modern marketplaces.

Top search bar.

Filter sidebar.

Search suggestions.

Cards.

Infinite scroll.

Sorting.

Filters include

Category

Skill

Location

Distance

Availability

Language

Rating

Experience

Workshop Type

Online

Offline

Hybrid

Workshop Details

Banner

Instructor

Description

Schedule

Location

Map

Reviews

Related Workshops

Enroll Button

Mentor Profile

Avatar

Bio

Experience

Skills

Upcoming Sessions

Ratings

Reviews

Book Workshop

Internship Module

Browse internships

Filter

Apply

Save

Recommended Internships

AI Features

Create intelligent JavaScript algorithms.

Do NOT call OpenAI.

Use JavaScript logic.

Implement

Skill Match Score

Career Roadmap

Workshop Recommendation

Nearby Recommendation

Trending Skills

Internship Recommendation

Popularity Ranking

Recommendation Score

Example

Recommendation Score

40% Skill Match

25% Distance

20% Rating

15% Popularity

Search

Fast search

Debouncing

Filters

Sorting

Pagination

Bookmarks

Recent Searches

Notifications

Workshop Approved

Workshop Reminder

New Mentor

New Internship

Certificate Ready

Database

Design normalized Supabase tables for

profiles

companies

skills

user_skills

workshops

workshop_registrations

mentor_reviews

internships

internship_applications

certificates

notifications

favorites

messages

Include foreign keys and indexes.

Enable Row Level Security.

Generate SQL migrations.

Storage

Profile Pictures

Workshop Images

Company Logos

Certificates

Resume Uploads

Security

Supabase Auth

Row Level Security

Protected Routes

Role Based Permissions

Input Validation

Secure Forms

Responsive Design

Desktop

Tablet

Mobile

Use responsive layouts throughout.

Components

Navbar

Sidebar

Footer

Hero

Search Bar

Filter Sidebar

Cards

Modal

Drawer

Avatar

Badge

Table

Tabs

Accordion

Charts

Calendar

Skeleton Loaders

Toast Notifications

Empty States

Error States

UX

Loading skeletons

Smooth page transitions

Hover effects

Animations

Micro interactions

Optimistic UI

Search suggestions

Infinite scrolling

Keyboard accessibility

Code Quality

Use reusable components.

Separate pages.

Separate hooks.

Separate services.

Use clean folder structure.

Avoid duplicated code.

Use TypeScript only if necessary.

Otherwise use JSX.

Use environment variables.

Deliverables

Generate the complete application.

Create every page.

Create reusable components.

Create Supabase schema.

Generate SQL.

Generate authentication.

Generate routing.

Generate dashboards.

Generate responsive UI.

Generate sample data.

Generate README.

Generate deployment instructions.

Generate GitHub-ready project.

The final result should look like a premium SaaS product suitable for a national-level hackathon and production deployment.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aa74f545-af97-4ad1-aefc-1fbcc28119e2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
