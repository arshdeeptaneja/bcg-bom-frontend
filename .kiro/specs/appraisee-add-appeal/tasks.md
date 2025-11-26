# Implementation Plan - Appraisee Add Appeal Feature

- [ ] 1. Set up component structure and routing
  - Create AddAppeal component file at `src/pages/Appraisee/AppraiseeDashBoard/AddAppeal/AddAppeal.js`
  - Create AddAppeal CSS file at `src/pages/Appraisee/AppraiseeDashBoard/AddAppeal/AddAppeal.css`
  - Add route configuration in the main routing file
  - Set up basic component skeleton with imports
  - _Requirements: 1.1_

- [ ] 2. Create useAddAppeal custom hook with mock data
  - Create `useAddAppeal.js` hook file in the same directory
  - Implement mock API call for fetching appraisal data
  - Set up state management for selectedKras (Set), appealTexts (Map), and uploadedFiles (Array)
  - Implement data transformation logic to match the data model
  - Add loading and error states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Implement employee information and summary sections
  - Integrate CheckInDescriptionSection component to display employee info and date range
  - Integrate FinalScoreSummaryTable component to display score summary
  - Add role timeline display
  - Style sections to match existing patterns
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Create AppealKRASection component for Measurable KRAs
  - Create new component file `AppealKRASection.js`
  - Implement KRA list rendering with checkboxes
  - Add selection handler to toggle KRA selection
  - Display KRA details (name, description, actual, target, max score, score)
  - Add visual highlighting for selected KRAs
  - Implement collapsible comment sections
  - Add text area for appeal justification
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

- [ ] 5. Extend AppealKRASection for Non-Measurable KRAs
  - Add support for non-measurable KRA data structure
  - Display non-measurable specific fields (score without actual/target)
  - Ensure checkbox and text area functionality works for both types
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

- [ ] 6. Create FileUploadSection component
  - Create new component file `FileUploadSection.js`
  - Implement file input with "Select a File" button
  - Add file type validation (.xls, .xlf, .jpeg, .jpg, .png)
  - Add file size validation (5MB total limit)
  - Display selected files list with file names
  - Add remove button for each file
  - Display validation error messages
  - Show "Allowable Formats" and "Allowable Upload Size" information
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 7. Implement form validation logic
  - Add validation to check at least one KRA is selected
  - Add validation to ensure all selected KRAs have appeal text
  - Implement submit button enable/disable logic based on validation
  - Add inline error messages for validation failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implement appeal submission flow
  - Create mock API call for appeal submission
  - Build AppealSubmission payload from form state
  - Convert uploaded files to Base64 encoding
  - Add submission loading state
  - Handle successful submission with success message and navigation
  - Handle submission errors with error messages
  - _Requirements: 5.5, 5.6, 5.7, 5.8_

- [ ] 9. Add loading states and error handling
  - Implement full-page loading spinner for initial data load
  - Add error boundary for component errors
  - Display warning message when context data is missing
  - Add retry mechanism for failed data loads
  - Implement user-friendly error messages for all error scenarios
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Style components and ensure responsive design
  - Create AddAppeal.css with component-specific styles
  - Ensure consistency with existing AnnualReview styles
  - Add visual feedback for selected KRAs (background highlight)
  - Style file upload section with proper spacing
  - Ensure responsive layout for different screen sizes
  - Add hover states and transitions for interactive elements
  - _Requirements: All UI-related requirements_

- [ ]* 11. Write unit tests for components
  - Write tests for AddAppeal component rendering
  - Write tests for useAddAppeal hook state management
  - Write tests for AppealKRASection selection and text input
  - Write tests for FileUploadSection file handling
  - Write tests for validation logic
  - Write tests for error handling scenarios
  - _Requirements: All_

- [ ]* 12. Write property-based tests
  - [ ]* 12.1 Write property test for KRA selection consistency
    - **Property 1: KRA Selection Consistency**
    - **Validates: Requirements 2.2, 2.3, 2.5**
  
  - [ ]* 12.2 Write property test for appeal text preservation
    - **Property 2: Appeal Text Preservation**
    - **Validates: Requirements 3.4, 3.5**
  
  - [ ]* 12.3 Write property test for file type validation
    - **Property 3: File Type Validation**
    - **Validates: Requirements 4.3, 4.7**
  
  - [ ]* 12.4 Write property test for file size validation
    - **Property 4: File Size Validation**
    - **Validates: Requirements 4.5**
  
  - [ ]* 12.5 Write property test for submit button state
    - **Property 5: Submit Button State**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ]* 12.6 Write property test for submission data completeness
    - **Property 6: Submission Data Completeness**
    - **Validates: Requirements 5.5**

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Integration and final testing
  - Test navigation from dashboard to AddAppeal page
  - Test full appeal submission flow end-to-end
  - Verify all error scenarios display correct messages
  - Test with various file types and sizes
  - Verify form state persistence during user interactions
  - _Requirements: All_
