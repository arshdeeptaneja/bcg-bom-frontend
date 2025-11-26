import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUploadSection from './FileUploadSection';

describe('FileUploadSection Component', () => {
  const mockOnFileUpload = jest.fn();
  const mockOnFileRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders file upload section with instructions', () => {
    render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    expect(screen.getByText('Supporting Documents')).toBeInTheDocument();
    expect(screen.getByText(/Click to select files/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum Total Size: 5MB/)).toBeInTheDocument();
  });

  test('accepts valid file types', () => {
    render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    expect(mockOnFileUpload).toHaveBeenCalledWith(fileInput.files);
  });

  test('displays uploaded files', () => {
    const mockFiles = [
      new File(['content'], 'test1.jpg', { type: 'image/jpeg', size: 1024 }),
      new File(['content'], 'test2.png', { type: 'image/png', size: 2048 })
    ];

    render(
      <FileUploadSection
        files={mockFiles}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByText('test2.png')).toBeInTheDocument();
    expect(screen.getByText(/Uploaded Files \(2\)/)).toBeInTheDocument();
  });

  test('displays file sizes correctly', () => {
    const mockFiles = [
      new File(['content'], 'test.jpg', { type: 'image/jpeg', size: 1024 })
    ];

    render(
      <FileUploadSection
        files={mockFiles}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  test('handles file removal', () => {
    const mockFiles = [
      new File(['content'], 'test.jpg', { type: 'image/jpeg', size: 1024 })
    ];

    render(
      <FileUploadSection
        files={mockFiles}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: /Remove file/ });
    fireEvent.click(removeButton);

    expect(mockOnFileRemove).toHaveBeenCalledWith(0);
  });

  test('validates file types and shows error for invalid types', () => {
    render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const invalidFile = new File(['content'], 'test.exe', { type: 'application/exe' });

    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false
    });

    fireEvent.change(fileInput);

    // Should not call onFileUpload for invalid files
    expect(mockOnFileUpload).not.toHaveBeenCalled();
    expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
  });

  test('validates total file size', () => {
    const existingFiles = [
      new File(['x'.repeat(3 * 1024 * 1024)], 'existing.jpg', { 
        type: 'image/jpeg', 
        size: 3 * 1024 * 1024 
      })
    ];

    render(
      <FileUploadSection
        files={existingFiles}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        maxSize={5}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const newFile = new File(['x'.repeat(3 * 1024 * 1024)], 'new.jpg', { 
      type: 'image/jpeg',
      size: 3 * 1024 * 1024 
    });

    Object.defineProperty(fileInput, 'files', {
      value: [newFile],
      writable: false
    });

    fireEvent.change(fileInput);

    expect(mockOnFileUpload).not.toHaveBeenCalled();
    expect(screen.getByText(/Total file size would exceed/)).toBeInTheDocument();
  });

  test('displays correct file icons based on type', () => {
    const mockFiles = [
      new File(['content'], 'image.jpg', { type: 'image/jpeg' }),
      new File(['content'], 'spreadsheet.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    ];

    const { container } = render(
      <FileUploadSection
        files={mockFiles}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const imageIcon = container.querySelector('.bi-file-earmark-image');
    const spreadsheetIcon = container.querySelector('.bi-file-earmark-spreadsheet');

    expect(imageIcon).toBeInTheDocument();
    expect(spreadsheetIcon).toBeInTheDocument();
  });

  test('displays total size of all files', () => {
    const mockFiles = [
      new File(['content'], 'test1.jpg', { type: 'image/jpeg', size: 1024 }),
      new File(['content'], 'test2.png', { type: 'image/png', size: 2048 })
    ];

    render(
      <FileUploadSection
        files={mockFiles}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    expect(screen.getByText(/Total Size: 3 KB \/ 5MB/)).toBeInTheDocument();
  });

  test('error message can be dismissed', () => {
    render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const invalidFile = new File(['content'], 'test.exe', { type: 'application/exe' });

    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false
    });

    fireEvent.change(fileInput);

    const errorAlert = screen.getByText(/Invalid file type/);
    expect(errorAlert).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Invalid file type/)).not.toBeInTheDocument();
  });

  test('drag and drop shows active state', () => {
    const { container } = render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const dropArea = container.querySelector('.file-drop-area');
    
    fireEvent.dragEnter(dropArea);
    expect(dropArea).toHaveClass('border-primary');

    fireEvent.dragLeave(dropArea);
    expect(dropArea).not.toHaveClass('border-primary');
  });

  test('handles drag and drop file upload', () => {
    const { container } = render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    const dropArea = container.querySelector('.file-drop-area');
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [file]
      }
    });

    fireEvent(dropArea, dropEvent);

    expect(mockOnFileUpload).toHaveBeenCalled();
  });

  test('respects custom maxSize prop', () => {
    render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        maxSize={10}
      />
    );

    expect(screen.getByText(/Maximum Total Size: 10MB/)).toBeInTheDocument();
  });

  test('respects custom allowedTypes prop', () => {
    render(
      <FileUploadSection
        files={[]}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
        allowedTypes={['.pdf', '.doc']}
      />
    );

    expect(screen.getByText(/Allowable Formats: \.pdf, \.doc/)).toBeInTheDocument();
  });

  test('formats file sizes correctly for different units', () => {
    const mockFiles = [
      new File(['x'], 'bytes.txt', { size: 500 }),
      new File(['x'.repeat(1024)], 'kb.txt', { size: 1024 }),
      new File(['x'.repeat(1024 * 1024)], 'mb.txt', { size: 1024 * 1024 })
    ];

    render(
      <FileUploadSection
        files={mockFiles}
        onFileUpload={mockOnFileUpload}
        onFileRemove={mockOnFileRemove}
      />
    );

    expect(screen.getByText('500 Bytes')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });
});
