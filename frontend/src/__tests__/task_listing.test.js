import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskListing from '../components/TaskListing';

jest.mock('node-fetch', () => jest.fn());

describe('TaskListing Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly with tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', dueDate: '2023-12-01', completed: false },
      { id: 2, title: 'Task 2', dueDate: '2023-12-02', completed: true },
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTasks),
    });

    render(<TaskListing />);
    await waitFor(() => {
      expect(screen.getByTestId('task_listing-container')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching tasks', () => {
    render(<TaskListing />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles API errors and displays error message', async () => {
    global.fetch.mockResolvedValue({ ok: false, statusText: 'API Error' });

    render(<TaskListing />);
    await waitFor(() => {
      expect(screen.getByText(/error loading tasks/i)).toBeInTheDocument();
    });
  });

  it('allows marking a task as completed', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', dueDate: '2023-12-01', completed: false },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTasks),
    }).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });

    render(<TaskListing />);
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', { name: /task 1/i });
    userEvent.click(checkbox);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.ainative.studio/task/complete/1',
        expect.any(Object)
      );
    });
  });

  it('is accessible', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', dueDate: '2023-12-01', completed: false },
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTasks),
    });

    render(<TaskListing />);
    await waitFor(() => {
      expect(screen.getByTestId('task_listing-container')).toHaveAttribute('role', 'list');
      expect(screen.getByText('Task 1')).toHaveAttribute('role', 'listitem');
      expect(screen.getByRole('checkbox', { name: /task 1/i })).toBeEnabled();
    });
  });
});