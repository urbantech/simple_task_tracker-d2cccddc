import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

const mockFetch = global.fetch;

describe('TaskCreation Component', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('renders correctly', () => {
    render(<TaskCreation />);
    expect(screen.getByTestId('task_creation-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<TaskCreation />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/task name/i), 'Sample Task');
    await user.type(screen.getByLabelText(/due date/i), '2023-12-31');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.ainative.studio',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-API-Key': expect.any(String),
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ name: 'Sample Task', dueDate: '2023-12-31' }),
      })
    );
  });

  it('shows loading state while creating a task', async () => {
    mockFetch.mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<TaskCreation />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/task name/i), 'Sample Task');
    await user.type(screen.getByLabelText(/due date/i), '2023-12-31');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByRole('button', { name: /creating task/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to create task'))
    );

    render(<TaskCreation />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/task name/i), 'Sample Task');
    await user.type(screen.getByLabelText(/due date/i), '2023-12-31');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
    });
  });

  it('is accessible', () => {
    render(<TaskCreation />);
    expect(screen.getByLabelText(/task name/i)).toHaveAccessibleName(/task name/i);
    expect(screen.getByLabelText(/due date/i)).toHaveAccessibleName(/due date/i);
    expect(screen.getByRole('button', { name: /create task/i })).toHaveAttribute('aria-label', /create task/i);
  });
});