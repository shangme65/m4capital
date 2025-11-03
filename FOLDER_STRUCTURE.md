# M4Capital Folder Structure Guide

## App Router Organization

This project uses Next.js App Router with a clear separation between public and authenticated pages.

### Route Groups

#### `src/app/(dashboard)/` - Authenticated Dashboard Pages

- **Purpose**: Pages that require user authentication and include dashboard UI (sidebar, dashboard header)
- **Layout**: Automatically applies dashboard layout from `src/app/(dashboard)/layout.tsx`
- **Includes**:
  - Sidebar navigation
  - DashboardHeaderWrapper (user info, notifications, balance)
  - Authentication providers (AuthProvider, SidebarProvider, ModalProvider, etc.)
- **Examples**:
  - `/admin` - Admin dashboard
  - `/dashboard` - User dashboard
  - `/portfolio` - User portfolio management
  - `/settings` - User settings

#### `src/app/` (Root) - Public Pages

- **Purpose**: Pages accessible without authentication, using the main site header/footer
- **Layout**: Uses public site Header and Footer components
- **Examples**:
  - `/` - Landing page (Home)
  - `/press` - "In the Press" page
  - `/about` - About page
  - `/contact` - Contact page
  - `/privacy` - Privacy policy
  - `/terms` - Terms of service

## Creating New Pages

### For Authenticated Dashboard Pages

1. Create your page in `src/app/(dashboard)/your-page/page.tsx`
2. The dashboard layout (sidebar, header, providers) will be automatically applied
3. No need to import Header or layout components

### For Public Pages

1. Create your page in `src/app/your-page/page.tsx` (outside the `(dashboard)` folder)
2. Import and include the Header and Footer components:

   ```tsx
   import { Header } from "@/components/layout/Header";
   import { Footer } from "@/components/layout/Footer";

   export default function YourPage() {
     return (
       <>
         <Header />
         <div className="pt-20">
           {" "}
           {/* Account for fixed header */}
           {/* Your page content */}
         </div>
         <Footer />
       </>
     );
   }
   ```

## Key Components

### Layout Components

- `src/components/layout/Header.tsx` - Main site header (for public pages)
- `src/components/layout/Footer.tsx` - Main site footer (for public pages)
- `src/components/client/DashboardHeaderWrapper.tsx` - Dashboard header (for authenticated pages)
- `src/components/client/Sidebar.tsx` - Dashboard sidebar navigation

### Client Components

Located in `src/components/client/` - Interactive components with state management

### Server Components

Located in `src/components/layout/` - Static layout components

## Important Notes

1. **Route Groups**: Folders wrapped in parentheses like `(dashboard)` are route groups - they don't affect the URL structure but allow you to organize routes and apply shared layouts.

2. **Automatic Layout Application**: Any page created inside `src/app/(dashboard)/` will automatically have the dashboard layout applied. If you don't want this, create the page outside the route group.

3. **Authentication**: Dashboard pages automatically check for authentication via the layout. Public pages don't require authentication.

4. **Header Spacing**: When using the public Header component, add `pt-20` to your main container to account for the fixed header height.
