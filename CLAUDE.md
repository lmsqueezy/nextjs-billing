# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application for creating AI-generated short video content with subscription billing. The app generates video scripts using OpenAI API and processes them through Remotion for video creation. It includes a complete SaaS billing system powered by Lemon Squeezy.

**Key Technologies:**
- Next.js 14 (App Router)
- TypeScript
- Drizzle ORM with PostgreSQL (Neon)
- Auth.js v5 (Google OAuth)
- Lemon Squeezy for billing
- Remotion for video processing
- OpenAI API for script generation
- Cloudflare R2 for file storage (S3-compatible)
- Tailwind CSS + shadcn/ui

## Development Commands

```bash
# Development
pnpm dev                # Start dev server on port 3030
pnpm build              # Build for production
pnpm start              # Start production server

# Database
pnpm db:push            # Push schema changes to database
pnpm db:studio          # Open Drizzle Studio at https://local.drizzle.studio

# Code Quality
pnpm lint               # Run ESLint
pnpm typecheck          # Run TypeScript compiler check
pnpm format             # Check Prettier formatting
pnpm format:fix         # Fix Prettier formatting

# Remotion Video Development
pnpm remotion:studio    # Launch Remotion Studio for video composition development
pnpm remotion:create    # Create Remotion Lambda deployment site
pnpm remotion:render    # Render videos using Remotion Lambda

# Testing Utilities
npx tsx src/scripts/test-r2-connection.ts  # Test Cloudflare R2 storage connection
node test-voice-column.js                   # Test database voice column functionality
```

## Architecture

### Video Generation Workflow
The video generation follows a multi-stage pipeline:
1. **Script Generation** (`POST /api/generate-script`) - OpenAI generates scripts based on style templates
2. **Script Processing** (`POST /api/break-script`) - Breaks scripts into segments for processing
3. **Video Creation** (`POST /api/create-video`) - Creates project record with background processing
4. **Asset Generation** - Per segment: image generation (DALL-E), text-to-speech, file storage (R2)
5. **Video Composition** - Remotion renders final video with segments, captions, and effects

### Authentication & Authorization
- Uses Auth.js v5 with Google OAuth provider
- Database adapter connects to Drizzle ORM
- Protected dashboard routes require authentication
- Auth configuration in `src/auth.ts`
- Middleware protection in `src/middleware.ts`

### Database Schema
- **Users**: Standard Auth.js user table
- **Accounts/Sessions**: OAuth account linking and session management
- **Plans**: Lemon Squeezy subscription plans
- **Subscriptions**: User subscription records
- **WebhookEvents**: Lemon Squeezy webhook event processing
- **Projects**: Main video project records with metadata
- **ProjectSegments**: Video segments with timing and content
- **ProjectFiles**: File storage references (R2/S3)
- **ProjectLayers**: Video layers (captions, audio, overlays)

### Video Script Generation
- AI-powered script generation using OpenAI API
- Script styles configuration in `src/lib/script-config.ts`
- Currently supports "Dark & Eerie Survival rule" style with fine-tuned GPT model
- Duration-aware generation (10-300 seconds)
- Service layer in `src/lib/openai-service.ts`

### Billing Integration
- Lemon Squeezy integration for subscription management
- Webhook processing for subscription events (`subscription_created`, `subscription_updated`)
- Webhook endpoint: `/api/webhook` with HMAC verification
- Customer billing dashboard with plan management
- Business logic in `src/app/actions.ts`

### Video Processing
- Remotion integration for video composition and rendering
- Video editor components in `src/components/video-editor/`
- Custom webpack configuration for Remotion compatibility
- Word-level caption synchronization
- Composition structure in `src/remotion/Root.tsx`

### State Management
- Video editor uses Context Provider pattern (`src/components/video-editor/providers/`)
- Custom hooks for specific domains (player, sidebar, operations, modals)
- React Query for data fetching with optimistic updates

## Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature
- `src/lib/` - Utility functions and service integrations
- `src/db/` - Database schema and configuration
- `src/types/` - TypeScript type definitions
- `src/config/` - Configuration files (Lemon Squeezy)
- `src/remotion/` - Remotion video composition setup
- `src/scripts/` - Utility scripts for testing and development

## Environment Setup

Critical environment variables (see .env.example for complete list):
- `POSTGRES_URL` - Neon database connection
- `LEMONSQUEEZY_API_KEY` - Billing integration
- `LEMONSQUEEZY_STORE_ID` - Store identifier
- `LEMONSQUEEZY_WEBHOOK_SECRET` - Webhook HMAC secret
- `OPENAI_API_KEY` - Script and image generation
- `AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET` - Google OAuth authentication
- `NEXTAUTH_SECRET` - Auth.js encryption key
- `NEXTAUTH_URL` - Application URL
- `WEBHOOK_URL` - For local development tunneling
- `R2_BUCKET_NAME` - Cloudflare R2 bucket name
- `R2_ENDPOINT` - R2 endpoint URL
- `R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY` - R2 credentials
- `R2_PUBLIC_URL` - Public URL for R2 bucket
- `AWS_REGION/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY` - AWS credentials for Remotion Lambda

## Testing & Deployment

- Run `pnpm typecheck` before commits to ensure TypeScript compliance
- Database changes require `pnpm db:push` to sync schema
- Webhooks require accessible URL for local development (use ngrok/LocalCan)
- Production deployment requires switching Lemon Squeezy from test mode to live mode
- Test R2 storage configuration with `npx tsx src/scripts/test-r2-connection.ts`
- Use `pnpm remotion:studio` for interactive video composition development

## Important Implementation Patterns

### Service Layer Architecture
- Clean separation between API routes and business logic
- Service classes: `OpenAIService`, `VideoGenerationService`, `ProjectService`
- All services handle their own error logging and recovery

### File Storage Strategy
- Cloudflare R2 for S3-compatible storage
- Database records track file metadata with R2 keys
- Temporary URLs generated for client access

### Video Editor State
- Centralized state management via VideoEditorProvider
- Database-backed persistence with optimistic UI updates
- Real-time synchronization between player and editor

### Webhook Processing
- HMAC signature verification for security
- Event storage followed by asynchronous processing
- Idempotent handling of duplicate events

## Critical API Endpoints

- `POST /api/generate-script` - Generate AI scripts
- `POST /api/create-video` - Create video project
- `POST /api/break-script` - Segment script for processing
- `POST /api/generate-images` - Batch image generation
- `POST /api/text-to-speech` - Audio synthesis
- `POST /api/export-video` - Final video rendering
- `POST /api/webhook` - Lemon Squeezy webhooks
- `GET/POST /api/projects/*` - Project CRUD operations