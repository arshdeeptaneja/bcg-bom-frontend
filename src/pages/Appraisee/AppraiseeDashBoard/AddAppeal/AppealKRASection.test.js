import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppealKRASection from './AppealKRASection';

describe('AppealKRASection Component', () => {
  const mockMeasurableKras = [
    {
      KraId: 1,
      KraName: 'CASA Account Growth',
      KraDescription: 'Achieve target for new CASA accounts',
      Actual: 145,
      Target: 150,
      MaxScore: 25,
      Score: 24,
      CommentSelf1: 'Achieved 96.67% of target'
    },
    {
      KraId: 2,
      KraName: 'Loan Disbursement',
      KraDescription: 'Monthly loan disbursement targets',
      Actual: 48,
      Target: 50,
      MaxScore: 25,
      Score: 24,
      CommentSelf1: 'Near target achievement'
    }
  ];

  const mockNonMeasurableKras = [
    {
      KraId: 101,
      KraName: 'Team Leadership',
      KraDescription: 'Demonstrates effective leadership',
      Score: 4,
      MaxScore: 5,
      CommentSelf1: 'Led team effectively',
      Tooltip: 'Rate from 1-5'
    }
  ];

  const mockOnKraSelect = jest.fn();
  const mockOnAppealTextChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Measurable KRAs', () => {
    test('renders measurable KRAs table correctly', () => {
      render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
          groupName="Business Performance"
        />
      );

      expect(screen.getByText('Business Performance')).toBeInTheDocument();
      expect(screen.getByText('CASA Account Growth')).toBeInTheDocument();
      expect(screen.getByText('Loan Disbursement')).toBeInTheDocument();
      expect(screen.getByText('145')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    test('handles KRA selection for measurable KRAs', () => {
      render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnKraSelect).toHaveBeenCalledWith(1);
    });

    test('displays appeal text input when KRA is selected', () => {
      const selectedKras = new Set([1]);
      const appealTexts = new Map();

      render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={selectedKras}
          appealTexts={appealTexts}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      expect(screen.getByPlaceholderText(/Please provide detailed justification/)).toBeInTheDocument();
    });

    test('highlights selected KRA row', () => {
      const selectedKras = new Set([1]);

      const { container } = render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={selectedKras}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      const selectedRow = container.querySelector('.table-active');
      expect(selectedRow).toBeInTheDocument();
    });

    test('handles appeal text change', () => {
      const selectedKras = new Set([1]);

      render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={selectedKras}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      const textarea = screen.getByPlaceholderText(/Please provide detailed justification/);
      fireEvent.change(textarea, { target: { value: 'Test appeal text' } });

      expect(mockOnAppealTextChange).toHaveBeenCalledWith(1, 'Test appeal text');
    });

    test('displays validation error when appeal text is empty', () => {
      const selectedKras = new Set([1]);
      const appealTexts = new Map([[1, '']]);

      render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={selectedKras}
          appealTexts={appealTexts}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      expect(screen.getByText(/Appeal justification is required/)).toBeInTheDocument();
    });

    test('toggles comment visibility', () => {
      render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      const commentButtons = screen.getAllByRole('button');
      fireEvent.click(commentButtons[0]);

      expect(screen.getByText(/Your previous comment/)).toBeInTheDocument();
      expect(screen.getByText('Achieved 96.67% of target')).toBeInTheDocument();
    });
  });

  describe('Non-Measurable KRAs', () => {
    test('renders non-measurable KRAs table correctly', () => {
      render(
        <AppealKRASection
          kras={mockNonMeasurableKras}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="non-measurable"
          groupName="Behavioral Competencies"
        />
      );

      expect(screen.getByText('Behavioral Competencies')).toBeInTheDocument();
      expect(screen.getByText('Team Leadership')).toBeInTheDocument();
      expect(screen.getByText('Demonstrates effective leadership')).toBeInTheDocument();
      expect(screen.getByText('Rate from 1-5')).toBeInTheDocument();
    });

    test('handles KRA selection for non-measurable KRAs', () => {
      render(
        <AppealKRASection
          kras={mockNonMeasurableKras}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="non-measurable"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnKraSelect).toHaveBeenCalledWith(101);
    });

    test('displays tooltip for non-measurable KRAs', () => {
      render(
        <AppealKRASection
          kras={mockNonMeasurableKras}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="non-measurable"
        />
      );

      expect(screen.getByText(/Rate from 1-5/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('renders nothing when kras array is empty', () => {
      const { container } = render(
        <AppealKRASection
          kras={[]}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('renders nothing when kras is null', () => {
      const { container } = render(
        <AppealKRASection
          kras={null}
          selectedKras={new Set()}
          appealTexts={new Map()}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('preserves appeal text when KRA is selected/deselected/reselected', () => {
      const selectedKras = new Set([1]);
      const appealTexts = new Map([[1, 'Preserved text']]);

      render(
        <AppealKRASection
          kras={mockMeasurableKras}
          selectedKras={selectedKras}
          appealTexts={appealTexts}
          onKraSelect={mockOnKraSelect}
          onAppealTextChange={mockOnAppealTextChange}
          type="measurable"
        />
      );

      const textarea = screen.getByPlaceholderText(/Please provide detailed justification/);
      expect(textarea.value).toBe('Preserved text');
    });
  });
});
