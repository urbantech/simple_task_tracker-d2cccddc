import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

const mockFetch = global.fetch;

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  mockFetch.mockRestore();
});

describe('TaskCompletion Component', () => {
  it('renders correctly', () => {
    render(<TaskCompletion />);
    expect(screen.getByTestId('task_completion-container')).toBeInTheDocument();
  });

  it('handles user interactions by completing a task', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({ json: jest.fn().mockResolvedValue({ success: true }) });
    render(<TaskCompletion taskId={1} />);
    
    const completeButton = screen.getByRole('button', { name: /complete task/i });
    await user.click(completeButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('https://api.ainative.studio/tasks/1/complete', expect.any(Object));
      expect(screen.getByText(/task completed successfully/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while completing a task', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<TaskCompletion taskId={1} />);
    
    const completeButton = screen.getByRole('button', { name: /complete task/i });
    await user.click(completeButton);
    
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('handles API errors when completing a task', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new Error('API error'));
    render(<TaskCompletion taskId={1} />);
    
    const completeButton = screen.getByRole('button', { name: /complete task/i });
    await user.click(completeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to complete task/i)).toBeInTheDocument();
    });
  });

  it('is accessible', () => {
    render(<TaskCompletion />);
    expect(screen.getByRole('button', { name: /complete task/i })).toBeEnabled();
    expect(screen.getByTestId('task_completion-container')).toHaveAttribute('aria-label', 'task completion');
  });
});