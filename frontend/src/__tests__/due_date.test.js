import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('https://api.ainative.studio', () => ({
  fetch: jest.fn(),
}));

describe('DueDate Component', () => {
  beforeEach(() => {
    global.fetch.mockReset();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test('renders correctly', async () => {
    render(<DueDate />);
    expect(screen.getByTestId('due_date-container')).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    render(<DueDate />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '2023-12-25');
    expect(input).toHaveValue('2023-12-25');
  });

  test('shows loading state when fetching due date', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ dueDate: '2023-12-25' }),
      })
    );

    render(<DueDate />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch due date'))
    );

    render(<DueDate />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/error loading due date/i)).toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    render(<DueDate />);
    const input = screen.getByRole('textbox');
    expect(input).toBeAccessible();
    expect(input).toHaveAttribute('aria-label', 'Select due date');
  });
});