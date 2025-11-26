# Design Document - Appraisee Add Appeal Feature

## Overview

The Appraisee Add Appeal feature provides a comprehensive interface for employees to submit formal appeals against their annual appraisal scores. The design follows the existing pattern established in the AnnualReview component, maintaining consistency with the application's UI/UX patterns while introducing appeal-specific functionality including KRA selection, justification input, and document upload capabilities.

## Architecture

### Component Structure

```
AddAppeal (Main Component)
├── useAddAppeal (Custom Hook - Data & Logic)
├── CheckInDescriptionSection (Shared Component)
├── FinalScoreSummaryTable (Shared Component)
├── AppealKRASection (New Component)
│   ├── MeasurableKRAAppealList
│   └── NonMeasurableKRAAppealList
└── FileUploadSection (New Component)
```

### Data Flow

1. **Initial Load**: Component fetches appraisal data using context (employee ID, financial year, appraisal period)
2. **User Interaction**: User selects KRAs, enters justifications, and uploads files
3. **State Management**: Local state tracks selections, text inputs, and file uploads
4. **Submission**: On submit, data is validated and sent to the backend API
5. **Navigation**: On success, user is redirected to the appeal list or dashboard

## Components and Interfaces

### 1. AddAppeal Component

**Purpose**: Main container component that orchestrates the appeal submission flow

**Props**: None (uses React Router location state for context)

**State Management**:
- Uses `useAddAppeal` custom hook for all data and logic
- Manages collapsible sections for KRA comments

**Responsibilities**:
- Render page layout and header
- Display employee information and appraisal summary
- Coordinate child components
- Handle form submission

### 2. useAddAppeal Custom Hook

**Purpose**: Encapsulates all data fetching, state management, and business logic

**Returns**:
```typescript
{
  // Data
  data: {
    finalScoreSummary: Array,
    measurableKras: Object,
    nonMeasurableKras: Object,
    totalMeasurableActual: number,
    totalMeasurableMax: number,
    totalNonMeasurableActual: number,
    totalNonMeasurableMax: number
  },
  
  // Context
  context: {
    employee: Object,
    dateRange: Object,
    financialYear: string,
    appraisalPeriod: string
  },
  
  // Form State
  formState: {
    selectedKras: Set<number>,
    appealTexts: Map<number, string>,
    uploadedFiles: Array<File>
  },
  
  // Actions
  actions: {
    handleKraSelection: (kraId: number) => void,
    handleAppealTextChange: (kraId: number, text: string) => void,
    handleFileUpload: (files: FileList) => void,
    handleFileRemove: (index: number) => void,
    handleSubmit: () => Promise<void>,
    isSubmitting: boolean
  },
  
  // Status
  isLoading: boolean,
  isError: boolean
}
```

### 3. AppealKRASection Component

**Purpose**: Displays KRAs with selection checkboxes and appeal text inputs

**Props**:
```typescript
{
  kraData: Object,
  selectedKras: Set<number>,
  appealTexts: Map<number, string>,
  onKraSelect: (kraId: number) => void,
  onAppealTextChange: (kraId: number, text: string) => void,
  type: 'measurable' | 'non-measurable'
}
```

**Features**:
- Checkbox for KRA selection
- Collapsible comment sections
- Text area for appeal justification
- Visual highlighting for selected KRAs

### 4. FileUploadSection Component

**Purpose**: Handles file selection, validation, and display

**Props**:
```typescript
{
  files: Array<File>,
  onFileUpload: (files: FileList) => void,
  onFileRemove: (index: number) => void,
  maxSize: number, // in MB
  allowedTypes: Array<string>
}
```

**Features**:
- File input with drag-and-drop support
- File type validation (.xls, .xlf, .jpeg, .jpg, .png)
- File size validation (max 5MB total)
- File list display with remove buttons
- Visual feedback for validation errors

## Data Models

### Appeal Submission Payload

```typescript
interface AppealSubmission {
  employeeId: string;
  financialYear: string;
  appraisalPeriod: string;
  appeals: Array<{
    kraId: number;
    kraName: string;
    kraType: 'MEASURABLE' | 'NON_MEASURABLE';
    currentScore: number;
    appealText: string;
  }>;
  attachments: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string; // Base64 encoded
  }>;
  submittedAt: string; // ISO timestamp
}
```

### Appraisal Data Response

```typescript
interface AppraisalDataResponse {
  employee: {
    employeeId: string;
    name: string;
    designation: string;
    department: string;
  };
  appraisalPeriod: {
    startDate: string;
    endDate: string;
    financialYear: string;
  };
  roleTimeline: Array<{
    roleName: string;
    startDate: string;
    endDate: string;
  }>;
  finalScoreSummary: Array<{
    category: string;
    weightage: number;
    score: number;
    finalScore: number;
  }>;
  measurableKras: {
    [groupName: string]: Array<MeasurableKRA>;
  };
  nonMeasurableKras: {
    [groupName: string]: Array<NonMeasurableKRA>;
  };
}

interface MeasurableKRA {
  KraId: number;
  KraName: string;
  KraDescription: string;
  Actual: number;
  Target: number;
  MaxScore: number;
  Score: number;
  CommentSelf1: string;
}

interface NonMeasurableKRA {
  KraId: number;
  KraName: string;
  KraDescription: string;
  Score: number;
  MaxScore: number;
  CommentSelf1: string;
  Tooltip: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: KRA Selection Consistency
*For any* KRA in the appeal form, when selected, it should appear in the selectedKras set, and when deselected, it should be removed from the set.
**Validates: Requirements 2.2, 2.3, 2.5**

### Property 2: Appeal Text Preservation
*For any* selected KRA with entered appeal text, if the KRA is deselected and then reselected, the previously entered text should still be available.
**Validates: Requirements 3.4, 3.5**

### Property 3: File Type Validation
*For any* file selected for upload, if the file extension is not in the allowed list (.xls, .xlf, .jpeg, .jpg, .png), the system should reject the file and display an error.
**Validates: Requirements 4.3, 4.7**

### Property 4: File Size Validation
*For any* set of uploaded files, if the total size exceeds 5MB, the system should prevent upload and display an error message.
**Validates: Requirements 4.5**

### Property 5: Submit Button State
*For any* form state, the Submit button should be enabled if and only if at least one KRA is selected and all selected KRAs have non-empty appeal text.
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 6: Submission Data Completeness
*For any* valid appeal submission, the payload should contain all selected KRAs with their appeal texts and all uploaded files with correct metadata.
**Validates: Requirements 5.5**

## Error Handling

### Client-Side Validation Errors

1. **No KRA Selected**: Display inline error message "Please select at least one KRA to appeal"
2. **Missing Appeal Text**: Highlight KRAs with missing text and display "Please provide justification for all selected KRAs"
3. **Invalid File Type**: Display error "File type not supported. Allowed: .xls, .xlf, .jpeg, .jpg, .png"
4. **File Size Exceeded**: Display error "Total file size exceeds 5MB limit"

### API Errors

1. **Network Error**: Display "Unable to submit appeal. Please check your connection and try again"
2. **Server Error (5xx)**: Display "Server error occurred. Please try again later"
3. **Validation Error (400)**: Display specific validation messages from server
4. **Unauthorized (401)**: Redirect to login page
5. **Timeout**: Display "Request timed out. Please try again"

### Loading States

1. **Initial Data Load**: Full-page spinner with "Loading appraisal data..."
2. **File Upload**: Progress indicator for each file
3. **Form Submission**: Disabled submit button with "Submitting..." text
4. **Missing Context**: Warning banner with "Required information missing. Please navigate from dashboard"

## Testing Strategy

### Unit Tests

1. **Component Rendering**:
   - Test AddAppeal renders correctly with mock data
   - Test FileUploadSection displays files correctly
   - Test AppealKRASection renders KRAs with checkboxes

2. **User Interactions**:
   - Test KRA selection toggles state correctly
   - Test appeal text input updates state
   - Test file upload adds files to state
   - Test file remove deletes correct file

3. **Validation Logic**:
   - Test file type validation rejects invalid types
   - Test file size validation prevents oversized uploads
   - Test submit button enables/disables based on form state

4. **Error Handling**:
   - Test error messages display for validation failures
   - Test API error handling shows appropriate messages

### Property-Based Tests

Property-based tests will use **fast-check** library for JavaScript/React applications. Each test should run a minimum of 100 iterations.

1. **Property 1 Test**: Generate random KRA selections and verify set consistency
2. **Property 2 Test**: Generate random text inputs and selection sequences, verify text preservation
3. **Property 3 Test**: Generate random file names with various extensions, verify rejection of invalid types
4. **Property 4 Test**: Generate random file sizes, verify total size validation
5. **Property 5 Test**: Generate random form states, verify submit button state matches validation rules
6. **Property 6 Test**: Generate random valid form data, verify payload completeness

### Integration Tests

1. Test full appeal submission flow from page load to success
2. Test navigation from dashboard to appeal page with context
3. Test file upload with actual file objects
4. Test API integration with mock server responses

## UI/UX Considerations

### Visual Design

- Follow existing green color scheme (#198754 for primary actions)
- Use Bootstrap 5 classes for consistency
- Maintain spacing and layout patterns from AnnualReview component
- Use checkboxes with clear visual feedback for selection
- Highlight selected KRAs with subtle background color

### Accessibility

- Ensure all form inputs have proper labels
- Provide ARIA labels for icon buttons
- Maintain keyboard navigation support
- Use semantic HTML elements
- Provide clear error messages associated with form fields

### Responsive Design

- Ensure layout works on tablet and desktop screens
- Stack columns appropriately on smaller screens
- Maintain readability of KRA descriptions
- Ensure file upload section is touch-friendly

## API Integration

### Endpoints

1. **GET /api/appraisal/annual/view**
   - Fetches appraisal data for appeal form
   - Query params: employeeId, financialYear, appraisalPeriod

2. **POST /api/appeals/submit**
   - Submits appeal with KRAs and attachments
   - Body: AppealSubmission payload
   - Returns: { success: boolean, appealId: string, message: string }

### Mock Implementation

For initial development, mock the API calls with:
- Simulated network delay (500-1000ms)
- Mock data matching the AppraisalDataResponse interface
- Success/error responses for testing different scenarios

## Implementation Notes

1. **File Handling**: Use FileReader API to convert files to Base64 for submission
2. **State Management**: Use React hooks (useState, useEffect) for local state
3. **Routing**: Use React Router's useLocation and useNavigate hooks
4. **Validation**: Implement client-side validation before API call
5. **Styling**: Reuse CSS from AnnualReview.css and create AddAppeal.css for specific styles
6. **Code Reuse**: Leverage existing components (CheckInDescriptionSection, FinalScoreSummaryTable)
