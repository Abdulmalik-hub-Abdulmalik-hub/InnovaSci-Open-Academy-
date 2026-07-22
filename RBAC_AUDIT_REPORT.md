# RBAC (Role-Based Access Control) Audit Report

## Executive Summary

The authentication bug causing ADMIN users to be redirected to `/dashboard` instead of `/admin` has been fixed by correcting the fallback logic in `auth.ts`. However, this audit reveals inconsistencies in role definitions across the codebase.

---

## 1. Roles Defined in Prisma Schema

### User.role (prisma/schema.prisma)
```prisma
role String @default("STUDENT") // SUPER_ADMIN, ADMIN, STUDENT
```

### Role.name (prisma/schema.prisma)
```prisma
model Role {
  name String @unique // SUPER_ADMIN, ADMIN, CONTENT_MANAGER, SUPPORT_STAFF, STUDENT
}
```

---

## 2. Default Roles Created by API

**File:** `src/app/api/admin/roles/route.ts`

| Role | Display Name | Description |
|------|-------------|-------------|
| SUPER_ADMIN | Super Admin | Full system access with all permissions |
| ADMIN | Super Admin | Administrative access without system settings |
| CONTENT_MANAGER | Content Manager | Manages courses and content |
| SUPPORT_STAFF | Support Staff | Handles user support requests |
| STUDENT | Student | Regular platform user |

---

## 3. Roles Used in Code (Not in Default Roles)

| Role | Location Used |
|------|--------------|
| INSTRUCTOR | login page, staff routes |
| REVIEWER | login page, staff routes |
| ACADEMIC_DIRECTOR | login page |
| ADMISSIONS | login page |
| FINANCE | login page |
| PROJECT_SUPERVISOR | staff routes |
| STUDENT_AFFAIRS | staff routes |

---

## 4. Authorization Checks by Location

### 4.1 Middleware (`src/middleware.ts`)

```typescript
const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"
```

**Allowed Admin Roles:** ADMIN, SUPER_ADMIN

---

### 4.2 Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

```typescript
const isAdmin = sessionRole === "ADMIN" || sessionRole === "SUPER_ADMIN"
```

**Allowed Admin Roles:** ADMIN, SUPER_ADMIN

---

### 4.3 Login Redirect (`src/app/auth/login/page.tsx`)

```typescript
if (role === "ADMIN") return "/admin"
if (role === "SUPER_ADMIN") return "/admin"
if (role === "CONTENT_MANAGER") return "/admin"
if (role === "FINANCE") return "/admin"
if (role === "SUPPORT_STAFF") return "/admin"
// ...
if (role === "STUDENT") return "/dashboard"
```

**Admin Redirect Roles:** ADMIN, SUPER_ADMIN, CONTENT_MANAGER, FINANCE, SUPPORT_STAFF

**Student Redirect Roles:** STUDENT, INSTRUCTOR, REVIEWER, ACADEMIC_DIRECTOR, ADMISSIONS

---

### 4.4 Admin API Routes Authorization

#### Routes Accepting "ADMIN" ONLY:
| Route | File |
|-------|------|
| certificates | `src/app/api/admin/certificates/route.ts` |
| certificate-templates | `src/app/api/admin/certificate-templates/route.ts` |
| plans | `src/app/api/admin/plans/route.ts` |
| videos | `src/app/api/admin/videos/route.ts` |
| courses | `src/app/api/admin/courses/route.ts` |
| categories | `src/app/api/admin/categories/route.ts` |
| domains | `src/app/api/admin/domains/route.ts` |
| modules | `src/app/api/admin/modules/route.ts` |
| lessons | `src/app/api/admin/lessons/route.ts` |
| materials | `src/app/api/admin/materials/route.ts` |
| storage | `src/app/api/admin/storage/files/route.ts` |
| applications | `src/app/api/admin/applications/route.ts` |
| awards | `src/app/api/admin/awards/route.ts` |
| audit-logs | `src/app/api/admin/audit-logs/route.ts` |

#### Routes Accepting "ADMIN" AND "SUPER_ADMIN":
| Route | File |
|-------|------|
| payment-gateways | `src/app/api/admin/payment-gateways/route.ts` |
| certificates/domains | `src/app/api/admin/certificates/domains/route.ts` |
| certificates/categories | `src/app/api/admin/certificates/categories/route.ts` |
| newsletter | `src/app/api/admin/newsletter/route.ts` |
| projects | `src/app/api/admin/projects/route.ts` |
| projects/rubrics | `src/app/api/admin/projects/rubrics/route.ts` |
| projects/review | `src/app/api/admin/projects/review/route.ts` |
| settings | `src/app/api/admin/settings/route.ts` |
| database | `src/app/api/admin/database/route.ts` |
| system-settings | `src/app/api/admin/system-settings/route.ts` |
| payment-settings | `src/app/api/admin/payment-settings/route.ts` |
| payment-transactions | `src/app/api/admin/payment-transactions/route.ts` |
| seed | `src/app/api/admin/seed/route.ts` |
| analytics | `src/app/api/admin/analytics/route.ts` |

#### Routes Accepting "ADMIN", "SUPER_ADMIN", "SUPPORT_STAFF":
| Route | File |
|-------|------|
| tickets | `src/app/api/admin/tickets/route.ts` |
| tickets/[id] | `src/app/api/admin/tickets/[id]/route.ts` |

#### Staff Routes (Specific Roles):
| Route | Roles |
|-------|-------|
| staff/[id] | INSTRUCTOR, REVIEWER, PROJECT_SUPERVISOR |

---

### 4.5 Permission System (`src/lib/permissions.ts`)

**DEFAULT_ROLE_PERMISSIONS defines:**
```typescript
SUPER_ADMIN: Object.values(PERMISSIONS),  // All permissions
ADMIN: [...],                              // Most permissions
CONTENT_MANAGER: [...],                   // Course/content permissions
SUPPORT_STAFF: [...],                     // Support permissions
STUDENT: []                               // No permissions
```

**Missing from DEFAULT_ROLE_PERMISSIONS:**
- INSTRUCTOR
- REVIEWER
- ACADEMIC_DIRECTOR
- ADMISSIONS
- FINANCE
- PROJECT_SUPERVISOR
- STUDENT_AFFAIRS

---

## 5. Inconsistencies Found

### Issue #1: Missing Roles in DEFAULT_ROLE_PERMISSIONS

The `hasPermission()` function in `permissions.ts` will return `false` for roles not in `DEFAULT_ROLE_PERMISSIONS`.

```typescript
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = DEFAULT_ROLE_PERMISSIONS[role]
  if (!permissions) return false  // Role not found = no permissions
  return permissions.includes(permission)
}
```

**Impact:** Roles like INSTRUCTOR, REVIEWER, FINANCE, etc. have no permissions via the permission system.

### Issue #2: Roles Not Created by Default

The `DEFAULT_ROLES` array in `src/app/api/admin/roles/route.ts` only creates 5 roles, but the code references many more:
- INSTRUCTOR
- REVIEWER
- ACADEMIC_DIRECTOR
- ADMISSIONS
- FINANCE
- PROJECT_SUPERVISOR
- STUDENT_AFFAIRS

These roles may not exist in the database if not explicitly created.

### Issue #3: Inconsistent Authorization Checks

Some routes only check for "ADMIN":
```typescript
if (user.role === "ADMIN")  // Missing SUPER_ADMIN
```

Other routes check for both:
```typescript
if (user.role === "ADMIN" || user.role === "SUPER_ADMIN")
```

---

## 6. Recommendations

### For the Current Bug (ADMIN user going to /dashboard):

**Root Cause:** Already fixed - was caused by fallback to STUDENT role when Prisma lookup failed.

**Verification:** User `abdulmalikmusba@gmail.com` with `role: ADMIN` in Prisma should now redirect to `/admin`.

### For Role Inconsistencies:

1. **Option A:** Expand DEFAULT_ROLE_PERMISSIONS to include all roles used in the codebase.

2. **Option B:** Create all roles in database initialization.

3. **Option C:** Use the Role table from Prisma to dynamically load permissions.

---

## 7. Test Matrix

| Prisma User.role | Middleware Access | Dashboard Layout | Login Redirect |
|------------------|------------------|-----------------|---------------|
| ADMIN | ✅ /admin | ✅ isAdmin=true | ✅ /admin |
| SUPER_ADMIN | ✅ /admin | ✅ isAdmin=true | ✅ /admin |
| CONTENT_MANAGER | ❌ blocked | ❌ isAdmin=false | ✅ /admin |
| SUPPORT_STAFF | ❌ blocked | ❌ isAdmin=false | ✅ /admin |
| FINANCE | ❌ blocked | ❌ isAdmin=false | ✅ /admin |
| STUDENT | ❌ blocked | ❌ isAdmin=false | ✅ /dashboard |
| INSTRUCTOR | ❌ blocked | ❌ isAdmin=false | ✅ /dashboard |
| REVIEWER | ❌ blocked | ❌ isAdmin=false | ✅ /dashboard |

**Note:** Middleware only allows ADMIN and SUPER_ADMIN to access `/admin/*` routes. Other staff roles can only be used for login redirect but cannot access admin pages.

---

## 8. Conclusion

The critical bug has been fixed. The RBAC system has inconsistencies that should be addressed, but they do not affect the core authentication flow for ADMIN users.

**For the user `abdulmalikmusba@gmail.com`:**
- Prisma role: ADMIN ✅
- Middleware: grants access ✅
- Dashboard layout: renders admin ✅
- Login redirect: /admin ✅

The fix ensures that Prisma role is always used and the fallback to STUDENT has been removed.
