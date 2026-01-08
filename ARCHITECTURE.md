# Architecture Documentation

**Last Verified**: January 7, 2026
**Verification Method**: Full code review of frontend and backend

## Verification Summary

This document has been thoroughly verified against the actual codebase:

✅ **Verified Accurate:**
- Storage Modes (local vs cloud)
- Backend service checks `user.settings.storageMode` before saving
- Local mode data NEVER touches cloud database (verified in `add-expense-service.js:11-25` and `sync-splitwise-data-service.js:204-269`)
- Auto-categorization flow
- Zero-knowledge encryption implementation
- CSV import flows for both modes
- Authentication & authorization
- All React contexts documented
- All backend models documented

⚠️ **Known Issues Documented:**
- **Splitwise Local Mode Bug**: Frontend code tries to fetch from database after sync, but backend doesn't save for local mode. Should use returned `synced` array instead. (Lines 268-316)
- **CSV Performance**: Duplicate transformation work (documented in Future Improvements)
- **N+1 API Problem**: Local mode CSV import makes individual API calls (documented in Future Improvements)

📝 **Completeness:**
- All major features documented (Budgets, Categories, Tags, Reconciliation)
- All contexts explained (Auth, Storage, Theme, Settings, Category)
- Backend database schemas included
- Complete file listings for both frontend and backend
- Future improvements roadmap included

## Storage Modes

This application supports two storage modes that users can switch between:

### Cloud Mode

- Expense data is stored on the cloud
- All CRUD operations directly interact with the database
- Data is automatically synced and available across devices
- Requires active internet connection

### Local Mode

- Expense data is stored locally in browser IndexedDB
- User's financial data NEVER touches the cloud database
- Data stays on the user's device for privacy
- Sync to cloud is manual and requires password (true zero-knowledge encryption)

**Important**: Local mode is NOT "offline-only" - it still uses backend services (see below).

## Backend Services

The backend provides services to BOTH storage modes:

### Auto-Categorization Service

- **Both modes use the same backend auto-categorization service**
- Backend uses ML/logic to categorize expenses based on description
- For **Cloud Mode**: Backend categorizes AND saves to database
- For **Local Mode**: Backend categorizes BUT does NOT save (acts as stateless service)
  - Returns categorized data without persisting
  - Frontend then saves to IndexedDB

### Why This Design?

- Centralized auto-categorization logic (one place to maintain/improve)
- Same categorization quality for all users
- Local data stays local (database never stores local mode users' expense data)
- Backend acts as a "stateless service" for local mode users

## Storage Adapter Pattern

`src/services/storageAdapter.js` implements the adapter pattern to abstract storage mode:

```javascript
// Automatically routes to correct storage based on mode
import { createExpense } from "./storageAdapter";

// In local mode: calls backend for categorization, then saves to IndexedDB
// In cloud mode: calls backend which categorizes and saves to DB
await createExpense(expenseData);
```

## Zero-Knowledge Encryption

For local mode users who want to sync encrypted backups to cloud:

1. Data is encrypted locally with user's password
2. Only encrypted blobs are sent to backend
3. Backend cannot decrypt the data (true zero-knowledge)
4. Sync is manual and requires password entry
5. Auto-sync is disabled for security

## Data Flow

### Creating an Expense (Cloud Mode)

```
User Input → storageAdapter → expenseService (API) → Backend
                                                      ↓
                                             Categorize + Save to DB
                                                      ↓
                                               Return saved expense
```

### Creating an Expense (Local Mode)

```
User Input → storageAdapter → expenseService (API) → Backend
                    ↓                                    ↓
                    ↓                            Categorize (NO save)
                    ↓                                    ↓
                    ↓                        Return categorized data
                    ↓                                    ↓
                    └──────→ localStorageService → Save to IndexedDB
```

## CSV Import Processing

Both storage modes use the **same backend CSV parsing service**:

### How CSV Import Works

The CSV import uses a 4-step wizard that **BOTH modes** go through:

#### Step 1: Upload (Same for both modes)
```
User uploads CSV → POST /api/v1/csv/upload → Backend
                                               ↓
                                      Parse and validate CSV
                                               ↓
                                      Auto-detect column types
                                               ↓
                                      Suggest column mappings
                                               ↓
                                      Create temp session
                                               ↓
                         Return sessionId + headers + preview + suggestions
```

#### Step 2: Mapping (Same for both modes)
- User reviews suggested column mappings
- Can manually adjust mappings (date → amount, description, type, etc.)
- Can set custom source/payment type

#### Step 3: Preview - Cloud Mode
```
User clicks Next → POST /api/v1/csv/preview → Backend
                                                 ↓
                                        Transform CSV rows using mapping
                                                 ↓
                                        Auto-categorize expenses
                                                 ↓
                                        Check duplicates (MongoDB)
                                                 ↓
                                        Mark duplicates
                                                 ↓
                                   Return preview + statistics
                                                 ↓
                              Frontend displays data table ←┘
                                                 ↓
                              User reviews and chooses options:
                              - Skip duplicates
                              - Select specific rows
```

#### Step 3: Preview - Local Mode
```
User clicks Next → POST /api/v1/csv/preview → Backend
                         ↓                        ↓
                         ↓              Transform CSV rows using mapping
                         ↓                        ↓
                         ↓              Auto-categorize expenses
                         ↓                        ↓
                         ↓              Return preview (NO duplicate check)
                         ↓                        ↓
               Receive preview data ←─────────────┘
                         ↓
            Fetch all expenses from IndexedDB
                         ↓
            Client-side duplicate detection
                         ↓
            Mark duplicates in preview
                         ↓
            Display data table
                         ↓
            User reviews and chooses options:
            - Skip duplicates
            - Select specific rows
```

#### Step 4: Import - Cloud Mode
```
User clicks Import → POST /api/v1/csv/import → Backend
                                                 ↓
                                        Use cached session data
                                                 ↓
                                        Apply filters (skip duplicates, selected rows)
                                                 ↓
                                        Save expenses to MongoDB
                                                 ↓
                                   Return import result (count, duplicates skipped)
```

#### Step 4: Import - Local Mode
```
User clicks Import → POST /api/v1/csv/preview → Backend
                         ↓                          ↓
    (Why refetch preview?)                   Fetch cached session data
    - Preview data NOT passed                      ↓
      between wizard steps                   Return transformed data
    - Only sessionId passed                        ↓
    - Backend has it cached      Receive all data ←┘
                         ↓
            Fetch expenses from IndexedDB
                         ↓
            Client-side duplicate detection
                         ↓
            Apply filters (skip duplicates, selected rows)
                         ↓
            For EACH expense in filtered list:
              ↓
              createExpense(expense) → storageAdapter
                                           ↓
                                    POST /api/v1/expense (with category already set)
                                           ↓
                                    Backend categorizes (if category = 'Other')
                                           ↓
                                    Return categorized expense (NO save)
                                           ↓
                                    Save to IndexedDB ←┘
                         ↓
            Return import result (count, duplicates skipped)
```

**Why refetch preview in Step 4 (Local Mode)?**
- Preview data array is NOT passed between wizard steps (avoids storing large datasets in React state)
- Only `sessionId` is passed to ImportStep component
- Backend re-transforms the CSV on demand (not cached)

**Backend Session Storage:**
- **In-memory Map** (`sessions = new Map()`): Stores lightweight session metadata
  - `sessionId`: UUID
  - `filePath`: Path to uploaded CSV file on disk
  - `headers`: Array of column names
  - `totalRows`: Count of data rows
  - `createdAt`, `expiresAt`: Timestamps
- **Filesystem**: Uploaded CSV files saved to `uploads/` directory
- **Session timeout**: 30 minutes (auto-cleanup every 5 minutes)
- **Production note**: Code suggests using Redis instead of in-memory Map for multi-server deployments
- **Transform on demand**: Each preview/import request:
  1. Gets session metadata from Map
  2. Re-reads CSV file from disk: `fs.createReadStream(session.filePath)`
  3. Re-parses with column mapping
  4. Re-categorizes each row: `autoCategorizationService.categorize(description)`

**Current Performance Issue (Local Mode):**
- Preview: Transform + auto-categorize ALL rows
- Import: Transform + auto-categorize ALL rows AGAIN
- Then for each expense: Call `createExpense()` → backend categorization → IndexedDB
- **Result**: For 1000 rows = 1 preview call + 1000 individual expense calls + duplicate categorization work

### Why Backend Parses CSV for Both Modes?

- **Consistent parsing logic**: One CSV parser for all bank formats
- **Complex transformations**: Date parsing, amount normalization, multi-currency support
- **Auto-detection**: Smart column mapping based on header names
- **Auto-categorization**: Each row is automatically categorized during transformation
- **No data persistence**: For local mode, backend only transforms and returns data
- **Performance**: Server-side parsing is faster for large CSV files

**Privacy Note**: In local mode, CSV data is processed server-side but NEVER persisted to the database. The backend acts as a stateless transformation service.

## Splitwise Integration

Both storage modes integrate with Splitwise for shared expense tracking:

### Splitwise Sync - Cloud Mode

```
User triggers sync → POST /api/v1/splitwise/sync → Backend
                                                      ↓
                                              Fetch from Splitwise API
                                                      ↓
                                              Transform Splitwise data
                                                      ↓
                                              Auto-categorize expenses
                                                      ↓
                                              Check duplicates (MongoDB)
                                                      ↓
                                              Save new expenses to MongoDB
                                                      ↓
                                              Return sync result
```

### Splitwise Sync - Local Mode

```
User triggers sync → syncSplitwiseToLocal() → POST /api/v1/splitwise/sync
                           ↓                              ↓
                           ↓                   Fetch from Splitwise API
                           ↓                              ↓
                           ↓                   Transform & categorize each expense
                           ↓                              ↓
                           ↓                   Check user's storageMode
                           ↓                              ↓
                           ↓                   Return processed expenses (NO DATABASE SAVE)
                           ↓                              ↓
                    Receive synced expenses ←───────────┘
                           ↓
          ⚠️ BUG: Current code tries to fetch from
          /api/v1/expense?source=Splitwise (will be empty!)

          CORRECT FLOW SHOULD BE:
                           ↓
                  Use returned 'synced' array directly
                           ↓
                  Check duplicates (IndexedDB)
                           ↓
                  Filter out existing expenses
                           ↓
                  Bulk save to IndexedDB
```

### How Splitwise Stores Data

- **Cloud Mode**: Splitwise expenses are stored directly in MongoDB with `source: "Splitwise"`
- **Local Mode**:
  - ✅ Backend checks `user.settings.storageMode`
  - ✅ Backend processes and categorizes Splitwise expenses
  - ✅ Backend does NOT save to database (returns processed data)
  - ❌ **BUG**: Frontend currently ignores returned data and tries to fetch from database
  - **Intended behavior**: Frontend should use returned `synced` array from backend response

### Why Backend Handles Splitwise for Both Modes?

- **API credentials**: Splitwise API keys are stored securely on backend
- **Rate limiting**: Backend manages API rate limits centrally
- **Complex API**: Splitwise API requires OAuth and complex transformations
- **Consistent data**: Same Splitwise transformation logic for all users

**Privacy Note**: For local mode, Splitwise data does NOT touch the database. Backend processes and returns data, but never persists it. Frontend stores in IndexedDB only.

**Known Issue**: Current implementation has a bug in local mode Splitwise sync (see flow diagram above). Backend correctly doesn't save for local mode, but frontend tries to fetch from database which will be empty. Fix needed: Use the `synced` array returned in the backend response directly.

## Authentication & Authorization

### JWT-Based Authentication
- **Frontend**: Stores JWT token in `localStorage` after login/signup
- **Backend**: Validates JWT token using middleware for protected routes
- **Token payload**: Contains `userId`, `email`, and other user data

### Authentication Flow
```
User Login → POST /api/v1/auth/login → Backend
                                          ↓
                                   Validate credentials
                                          ↓
                                   Generate JWT token
                                          ↓
                           Return token + user data ←┘
                                          ↓
               Frontend stores in localStorage
                                          ↓
               All API calls include: Authorization: Bearer <token>
```

### AuthContext (`src/contexts/AuthContext.js`)
- Manages authentication state globally
- Provides: `user`, `login()`, `logout()`, `signup()`, `isAuthenticated`
- Persists auth state across page refreshes
- Handles token expiration

### Protected Routes
- `ProtectedRoute` component wraps authenticated pages
- Redirects to login if not authenticated
- Checks token validity

## React Context Architecture

The frontend uses React Context API for state management:

### 1. **AuthContext** (`src/contexts/AuthContext.js`)
- Global authentication state
- User profile data
- Login/logout functionality

### 2. **StorageContext** (`src/contexts/StorageContext.js`)
- Storage mode state (local vs cloud)
- Sync settings
- Mode switching logic

### 3. **CategoryContext** (`src/contexts/CategoryContext.js`)
- Categories list
- CRUD operations for categories
- Caches categories to avoid repeated API calls

### 4. **SettingsContext** (`src/contexts/SettingsContext.js`)
- User preferences
- App settings
- Display options

### 5. **ThemeContext** (`src/contexts/ThemeContext.js`)
- Dark/light mode toggle
- Theme preferences
- CSS variables for theming

## Features

### 1. Budget Tracking
- **Monthly budgets**: Set overall and per-category budgets
- **Budget alerts**: Visual indicators when exceeding budget
- **Progress tracking**: Real-time budget vs actual spending
- **Files**:
  - `src/pages/Budgets.js`: Budget management UI
  - `src/services/budgetService.js`: Budget API calls
  - `backend/services/budget-service.js`: Budget logic
  - `backend/models/budget.js`: Budget schema

### 2. Category Management
- **Custom categories**: Users can create/edit/delete categories
- **Category icons**: Emoji/icon support for visual identification
- **Auto-categorization rules**: Keywords mapped to categories
- **Files**:
  - `src/pages/Categories.js`: Category management UI
  - `src/services/categoryService.js`: Category API
  - `backend/models/category.js`: Category schema

### 3. Expense Reconciliation
- **Manual reconciliation**: Mark expenses as reconciled
- **Reconciliation status tracking**: Separate reconciled from active expenses
- **Use case**: Bank statement reconciliation
- **Files**:
  - `src/pages/Reconciliation.js`: Reconciliation UI
  - `src/services/reconciliationService.js`: Reconciliation logic

### 4. Tags System
- **Custom tags**: Add multiple tags to expenses
- **Tag filtering**: Filter expenses by tags
- **Tag management**: Create/edit/delete tags
- **Backend model**: `backend/models/tags.js`

### 5. Dashboard & Analytics
- **Charts**: Spending trends, category breakdown
- **Monthly summaries**: Income vs expenses
- **Date range filtering**: Custom date ranges
- **Export functionality**: Export filtered data

## Backend Database Models

### MongoDB Collections

#### 1. **users** (`backend/models/user.js`)
```javascript
{
  id: Number (auto-increment),
  email: String (unique),
  password: String (hashed),
  settings: {
    storageMode: 'cloud' | 'local',
    syncEnabled: Boolean,
    theme: String
  },
  splitwiseAccessToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **expense_data** (`backend/models/expense_data.js`)
```javascript
{
  _id: ObjectId,
  userId: Number,
  date: String (YYYY-MM-DD),
  amount: Number,
  description: String,
  type: 'Expense' | 'Income' | 'Investment' | 'Transfer',
  category: String,
  source: String (e.g., 'Manual Entry', 'Splitwise', 'CSV Import'),
  paymentType: String,
  tags: [String],
  import_id: String (for CSV bulk imports),
  splitwise_id: Number (if from Splitwise),
  splitwise_paid_share: Number,
  splitwise_net_balance: Number,
  reconciliation_status: String,
  manuallyEdited: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **categories** (`backend/models/category.js`)
```javascript
{
  _id: ObjectId,
  userId: Number,
  name: String,
  icon: String,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **budgets** (`backend/models/budget.js`)
```javascript
{
  _id: ObjectId,
  userId: Number,
  month: Number (1-12),
  year: Number,
  overallBudget: Number,
  categoryBudgets: [{
    category: String,
    amount: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. **sync_status** (`backend/models/sync_status.js`)
```javascript
{
  _id: ObjectId,
  userId: Number,
  service: 'splitwise',
  status: 'in_progress' | 'success' | 'failed' | 'cancelled',
  lastSyncedAt: Date,
  recordsProcessed: Number,
  errorMessage: String,
  shouldStop: Boolean (for cancellation)
}
```

#### 6. **syncs** (`backend/models/sync.js`)
```javascript
{
  _id: ObjectId,
  userId: Number,
  encryptedData: String (encrypted IndexedDB export),
  timestamp: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. **tags** (`backend/models/tags.js`)
```javascript
{
  _id: ObjectId,
  userId: Number,
  name: String,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Files

### Frontend (`/Users/parthlakhani/Projects/expenses/src/`)

**Contexts:**
- `contexts/AuthContext.js` - Authentication state management
- `contexts/StorageContext.js` - Storage mode state (local vs cloud)
- `contexts/CategoryContext.js` - Categories management
- `contexts/SettingsContext.js` - User settings
- `contexts/ThemeContext.js` - Theme management (dark/light mode)

**Services:**
- `services/storageAdapter.js` - Routes operations based on storage mode (ADAPTER PATTERN)
- `services/localStorageService.js` - IndexedDB operations for local mode
- `services/expenseService.js` - Backend API calls for expenses
- `services/budgetService.js` - Budget API calls
- `services/categoryService.js` - Category API calls
- `services/encryptionService.js` - Client-side encryption (zero-knowledge)
- `services/syncService.js` - Encrypted backup sync for local mode
- `services/splitwiseSyncService.js` - Splitwise integration
- `services/reconciliationService.js` - Reconciliation logic

**Components:**
- `components/CsvImportWizard/` - Multi-step CSV import wizard
- `components/ProtectedRoute.js` - Authentication guard for routes
- `components/PasswordPromptModal.js` - Password prompt for encrypted syncs
- `components/SplitwiseSyncModal.js` - Splitwise sync UI

**Pages:**
- `pages/Dashboard.js` - Main expense dashboard
- `pages/Budgets.js` - Budget management
- `pages/Categories.js` - Category management
- `pages/Reconciliation.js` - Bank reconciliation
- `pages/Settings.js` - User settings
- `pages/Login.js` / `pages/Signup.js` - Authentication

**Utils:**
- `utils/duplicateDetection.js` - Client-side duplicate detection
- `utils/chartDataProcessing.js` - Data transformation for charts
- `utils/apiClient.js` - API client configuration
- `utils/axiosConfig.js` - Axios interceptors

### Backend (`/Users/parthlakhani/Projects/expense-tracker/`)

**Controllers:**
- `controllers/add-expense-controller.js` - Create expense (checks storageMode!)
- `controllers/get-expense-controller.js` - Fetch expenses
- `controllers/update-expense-controller.js` - Update expense
- `controllers/remove-expense-controller.js` - Delete expense
- `controllers/csv-upload-controller.js` - CSV file upload
- `controllers/csv-preview-controller.js` - CSV preview generation
- `controllers/csv-import-controller.js` - CSV import (cloud mode)
- `controllers/budget-controller.js` - Budget CRUD
- `controllers/category-controller.js` - Category CRUD
- `controllers/sync-splitwise-data-controller.js` - Splitwise sync
- `controllers/auth-controller.js` - Authentication
- `controllers/user-settings-controller.js` - User settings
- `controllers/sync-controller.js` - Encrypted sync upload/download
- `controllers/reconciliation-controller.js` - Reconciliation

**Services:**
- `services/add-expense-service.js` - Expense creation logic (**checks storageMode**)
- `services/get-expense-service.js` - Expense retrieval
- `services/update-expense-service.js` - Expense update
- `services/remove-expense-service.js` - Expense deletion
- `services/csv-upload-service.js` - CSV parsing & session management
- `services/csv-transform-service.js` - CSV transformation & categorization
- `services/csv-import-service.js` - CSV database import (cloud mode)
- `services/auto-categorization-service.js` - ML/keyword-based categorization
- `services/duplicate-detection-service.js` - Server-side duplicate detection
- `services/sync-splitwise-data-service.js` - Splitwise API integration (**checks storageMode**)
- `services/budget-service.js` - Budget logic
- `services/budget-tracking-service.js` - Budget tracking calculations
- `services/category-service.js` - Category management
- `services/auth-service.js` - Authentication & JWT
- `services/user-settings-service.js` - User settings

**Models:**
- `models/user.js` - User schema (includes `settings.storageMode`)
- `models/expense_data.js` - Expense schema
- `models/budget.js` - Budget schema
- `models/category.js` - Category schema
- `models/sync_status.js` - Splitwise sync status
- `models/sync.js` - Encrypted backup storage
- `models/tags.js` - Tags schema

**Utils:**
- `utils/splitwiseHelpers.js` - Splitwise data transformation
- `utils/commonHelpers.js` - Common utility functions
- `utils/transactionTypeDetector.js` - Detect transaction type from description

## Technology Decisions

### Why IndexedDB for Local Storage?

- Large storage capacity (much larger than localStorage)
- Can handle complex objects without serialization
- Asynchronous API (doesn't block UI)
- Indexed queries for better performance

### Why Manual Sync Only?

- True zero-knowledge requires password for decryption
- Auto-sync would require storing password in memory (security risk)
- User has full control over when data leaves their device

### Why Not Pure Offline?

- Centralized services (auto-categorization) improve user experience
- Maintaining two separate categorization services would be redundant
- Backend acts as stateless processor, not data store for local mode

## Future Improvements

### Priority 1: Cache Transformed CSV Data (Optimization)

**Problem:**
- Currently, CSV is transformed twice: once for preview, again for import
- Each transformation re-reads file, re-parses, and re-categorizes all rows
- Wasteful for large CSV files

**Solution:**
Add transformed data caching to session storage:

```javascript
// In csv-upload-service.js
const sessionData = {
  sessionId,
  filePath,
  headers,
  totalRows,
  transformedCache: null,        // NEW: Cache transformed data
  transformedCacheKey: null,     // NEW: Hash of columnMapping
  transformedAt: null,           // NEW: Timestamp
  cacheTTL: 15 * 60 * 1000,      // NEW: 15 minute cache
  createdAt,
  expiresAt
};
```

**Implementation Plan:**
1. After first transformation in preview, cache the result
2. Store a hash of columnMapping as cache key
3. In import, check if:
   - Cache exists
   - Cache is not expired (< 15 mins old)
   - Column mapping hasn't changed (hash matches)
4. If cache valid, use it; otherwise re-transform
5. Clear cache on column mapping change or timeout

**Benefits:**
- Eliminates duplicate transformation work
- Faster import for large CSVs
- Reduced backend CPU usage

**Trade-offs:**
- Increased memory usage (limit cache to reasonable size, e.g., 10k rows max)
- Need cache invalidation logic
- More complex session management

**File Changes:**
- `services/csv-upload-service.js`: Add cache fields to session
- `services/csv-transform-service.js`: Add cache check/set logic
- `controllers/csv-preview-controller.js`: Set cache after transform
- `controllers/csv-import-controller.js`: Check cache before transform

### Priority 2: Bulk Import API for Local Mode (Architecture Fix)

**Problem:**
- Local mode makes N+1 API calls for N expenses (1 preview + N createExpense calls)
- For 1000 rows: 1001 API calls
- Each createExpense call re-categorizes even though category already exists

**Solution:**
Create bulk endpoints and optimize local mode import flow:

#### New Backend Endpoints:

```javascript
// POST /api/v1/expense/bulk-categorize
// Categorize multiple expenses at once (only for 'Other' category)
Body: [
  { description, category },
  ...
]
Response: [
  { description, category: "Food & Dining" },
  ...
]
```

```javascript
// POST /api/v1/expense/bulk-validate
// Validate expense data without saving (for local mode)
Body: [{ date, amount, description, type, category }, ...]
Response: { valid: true, errors: [] }
```

#### Updated Local Mode Import Flow:

```javascript
// Step 1: Get transformed data (already categorized)
const transformed = await POST /api/v1/csv/preview

// Step 2: Filter based on options
const filtered = applyFilters(transformed)

// Step 3: Re-categorize only 'Other' categories (optional optimization)
const needsRecategorization = filtered.filter(e => e.category === 'Other')
if (needsRecategorization.length > 0) {
  const recategorized = await POST /api/v1/expense/bulk-categorize
  // Merge back into filtered
}

// Step 4: Bulk save to IndexedDB (NO API calls)
await localStorageService.bulkAddExpenses(filtered)
```

**Benefits:**
- Local mode: 1-2 API calls instead of N+1
- Much faster imports (10x-100x for large CSVs)
- Reduced backend load
- Cleaner architecture

**Implementation Plan:**

1. **Backend Changes:**
   - Create `POST /api/v1/expense/bulk-categorize` endpoint
   - Create `expenseBulkController.js`
   - Add bulk categorization service method
   - Reuse existing `autoCategorizationService.categorize()`

2. **Frontend Changes:**
   - Update `ImportStep.jsx` to NOT loop `createExpense()`
   - Call bulk categorize only for 'Other' categories
   - Use existing `localStorageService.bulkAddExpenses()` (already exists!)
   - Remove N individual API calls

3. **Optimization:**
   - Skip categorization if category !== 'Other'
   - Batch categorization requests (max 1000 per batch)
   - Show progress indicator for large imports

**File Changes:**
- **Backend:**
  - `controllers/expense-bulk-controller.js` (NEW)
  - `routes/expense-routes.js`: Add bulk routes
  - `services/auto-categorization-service.js`: Add `bulkCategorize()` method

- **Frontend:**
  - `src/components/CsvImportWizard/ImportStep.jsx`: Refactor import logic
  - `src/services/expenseService.js`: Add `bulkCategorize()` API call
  - `src/services/localStorageService.js`: Already has `bulkAddExpenses()` ✅

### Priority 3: Production Readiness (Infrastructure)

**Current Issues:**
- In-memory session storage lost on server restart
- Single-server limitation (can't scale horizontally)
- No distributed lock for duplicate detection

**Solution:**
1. **Redis for session storage**: Replace in-memory Map with Redis
2. **S3/Cloud Storage for CSV files**: Store uploaded CSVs in cloud storage instead of local disk
3. **Background jobs**: Use queue (Bull/BullMQ) for large CSV imports
4. **Streaming import**: Process CSVs in chunks for huge files (100k+ rows)

**Implementation:**
- Add Redis adapter for session storage
- Add S3 adapter for file storage
- Add job queue for async imports
- Add progress tracking for long-running imports

### Priority 4: Enhanced Duplicate Detection

**Current Issue:**
- Duplicate detection is basic (date + amount + description match)
- Can miss similar transactions with slight variations

**Future Enhancements:**
- Fuzzy matching for descriptions (Levenshtein distance)
- Smart duplicate detection (±1 day date tolerance, ±$0.01 amount tolerance)
- Machine learning for duplicate detection
- User feedback loop to improve detection

---

**Implementation Timeline:**
- **Short term** (1-2 weeks): Priority 1 - Cache transformed data
- **Medium term** (2-4 weeks): Priority 2 - Bulk import API
- **Long term** (1-2 months): Priority 3 - Production readiness
- **Future** (3+ months): Priority 4 - Enhanced duplicate detection
