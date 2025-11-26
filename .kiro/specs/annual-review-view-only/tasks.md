# Implementation Plan: Annual Review View-Only Interface

## Task List

- [-] 1. Set up API service and data fetching infrastructure
  - Add getAcceptorAppraisalView function to appraisalAPI service
  - Configure API endpoint with proper authentication headers
  - Test API integration with sample parameters
  - _Requirements: 2.1, 2.2_

- [ ]* 1.1 Write property test for API request construction
  - **Property 1: API Request Construction**
  - **Validates: Requirements 2.1**

- [ ] 2. Create useAnnualReviewView custom hook
  - Extract and validate URL parameters from search params and location state
  - Implement React Query integration for data fetching
  - Transform API response using existing transformAnnualAppraisalData function
  - Return data, loading state, error state, and context information
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ]* 2.1 Write property test for parameter extraction
  - **Property 16: Parameter Extraction**
  - **Validates: Requirements 8.1**

- [ ]* 2.2 Write property test for hook return structure
  - **Property 17: Hook Return Structure**
  - **Validates: Requirements 8.3**

- [ ]* 2.3 Write property test for API call validation
  - **Property 18: API Call Validation**
  - **Validates: Requirements 8.5**

- [ ]* 2.4 Write property test for error handling
  - **Property 19: Error Handling**
  - **Validates: Requirements 2.4, 2.5**

- [ ] 3. Create AnnualReviewView component structure
  - Set up main component file with imports
  - Implement loading and error state handling
  - Add page header with "View Only" indicator and back button
  - Integrate useAnnualReviewView hook
  - _Requirements: 1.1, 7.1, 7.3, 9.1_

- [ ]* 3.1 Write unit test for view-only indicator display
  - Test that "View Only" badge or banner is present
  - _Requirements: 7.1_

- [ ]* 3.2 Write unit test for page title
  - Test that title includes "View" or "Read Only" text
  - _Requirements: 7.3_

- [ ]* 3.3 Write unit test for back button presence
  - Test that back button is rendered in header
  - _Requirements: 9.1_

- [ ] 4. Implement employee context section
  - Integrate CheckInDescriptionSection component
  - Pass employee and date range data from hook context
  - Display financial year and appraisal period
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 4.1 Write property test for employee context display
  - **Property 13: Employee Context Display**
  - **Validates: Requirements 6.1**

- [ ]* 4.2 Write property test for appraisal context display
  - **Property 14: Appraisal Context Display**
  - **Validates: Requirements 6.2, 6.3**

- [ ] 5. Implement Final Score Summary section
  - Integrate FinalScoreSummaryTable component
  - Pass finalScoreSummary data from transformed response
  - Display all score categories and role columns
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 5.1 Write property test for score summary categories
  - **Property 10: Final Score Summary Categories**
  - **Validates: Requirements 5.1**

- [ ]* 5.2 Write property test for summary table columns
  - **Property 11: Summary Table Columns**
  - **Validates: Requirements 5.2**

- [ ]* 5.3 Write property test for total score calculation
  - **Property 12: Total Score Calculation**
  - **Validates: Requirements 5.3**

- [ ] 6. Implement Non-Measurable KRA display section
  - Create read-only KRA group headers
  - Display KRA name, description, and tooltips
  - Show scores from all roles as static badges
  - Implement expandable comment sections (read-only)
  - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4_

- [ ]* 6.1 Write property test for read-only input elements
  - **Property 2: Read-Only Input Elements**
  - **Validates: Requirements 1.2, 1.4**

- [ ]* 6.2 Write property test for score display format
  - **Property 3: Score Display Format**
  - **Validates: Requirements 1.3, 7.4**

- [ ]* 6.3 Write property test for multi-role score display
  - **Property 4: Multi-Role Score Display**
  - **Validates: Requirements 3.1**

- [ ]* 6.4 Write property test for comment visibility
  - **Property 5: Comment Visibility**
  - **Validates: Requirements 3.2**

- [ ]* 6.5 Write property test for KRA grouping preservation
  - **Property 6: KRA Grouping Preservation**
  - **Validates: Requirements 3.3**

- [ ]* 6.6 Write property test for score and max score display
  - **Property 7: Score and Max Score Display**
  - **Validates: Requirements 3.4**

- [ ] 7. Implement Development Inputs sections
  - Create Overall Development section with read-only appraisee responses
  - Create Reporting/Reviewing Authority section with all authority responses
  - Display authority names from metadata
  - _Requirements: 4.1, 4.2, 6.4_

- [ ]* 7.1 Write property test for development question display
  - **Property 8: Development Question Display**
  - **Validates: Requirements 4.2**

- [ ]* 7.2 Write property test for authority information display
  - **Property 15: Authority Information Display**
  - **Validates: Requirements 6.4**

- [ ] 8. Implement Option-Based Questions section
  - Display integrity assessment with static indicator
  - Display health problems and disciplinary actions (read-only)
  - Replace radio buttons with static badges or text
  - _Requirements: 4.3, 4.4, 4.5_

- [ ]* 8.1 Write property test for option question static display
  - **Property 9: Option Question Static Display**
  - **Validates: Requirements 4.3**

- [ ] 9. Implement missing data handling
  - Add placeholder text for missing scores ("N/A" or dash)
  - Add placeholder for empty comments ("No comment provided")
  - Add placeholder for missing development responses ("No response provided")
  - Handle missing authority names gracefully
  - _Requirements: 3.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 9.1 Write property test for missing data placeholders
  - **Property 20: Missing Data Placeholders**
  - **Validates: Requirements 3.5, 10.1, 10.2, 10.3**

- [ ] 10. Add styling and visual indicators
  - Create or update CSS file for view-only specific styles
  - Style disabled/read-only elements with distinct appearance
  - Add visual styling for static score badges
  - Ensure consistent spacing and layout
  - _Requirements: 7.2, 7.5_

- [ ] 11. Implement navigation and routing
  - Add route configuration for view-only page
  - Implement back button navigation using useNavigate
  - Ensure no unsaved changes prompt on navigation
  - _Requirements: 9.2, 9.3_

- [ ]* 11.1 Write unit test for back button navigation
  - Test that clicking back button navigates to previous page
  - _Requirements: 9.2_

- [ ]* 11.2 Write unit test for no unsaved changes prompt
  - Test that navigation doesn't trigger unsaved changes warning
  - _Requirements: 9.3_

- [ ] 12. Add error boundaries and error handling
  - Implement React Error Boundary for component
  - Add error message displays for API failures
  - Handle empty/invalid API responses gracefully
  - Add loading spinner during data fetch
  - _Requirements: 2.4, 2.5_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Integration testing and refinement
  - Test with real API endpoint and various data scenarios
  - Verify all existing components integrate correctly
  - Test with missing/partial data
  - Verify responsive design on different screen sizes
  - _Requirements: All_

- [ ]* 14.1 Write integration tests for component interaction
  - Test CheckInDescriptionSection integration
  - Test FinalScoreSummaryTable integration
  - Test data flow from hook to components

- [ ] 15. Accessibility and final polish
  - Add ARIA labels for read-only indicators
  - Ensure keyboard navigation works correctly
  - Verify color contrast for disabled elements
  - Test with screen reader
  - _Requirements: All_

- [ ] 16. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
