import React from 'react';
import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Ideas } from './Ideas';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

// Mock canvas-confetti
jest.mock('canvas-confetti', () => jest.fn());

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

// Mock FontAwesome to render simple spans instead of SVGs
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }) => <span data-testid="fa-icon" {...props} />,
}));

// ── Helpers for context mocks ──────────────────────────────────────────────────

const defaultUser = { $id: 'user-1', name: 'Test User' };

let mockIdeasData = [];
let mockAdd = jest.fn().mockResolvedValue(true);
let mockRemove = jest.fn().mockResolvedValue(true);
let mockUpdate = jest.fn().mockResolvedValue(true);
let mockToggleComplete = jest.fn().mockResolvedValue(true);
let mockInit = jest.fn().mockResolvedValue(undefined);
let mockUserCurrent = defaultUser;

jest.mock('../lib/context/user', () => ({
  useUser: () => ({ current: mockUserCurrent }),
}));

jest.mock('../lib/context/ideas', () => ({
  useIdeas: () => ({
    current: mockIdeasData,
    add: mockAdd,
    remove: mockRemove,
    update: mockUpdate,
    toggleComplete: mockToggleComplete,
    init: mockInit,
    isLoading: false,
    error: null,
    hasPermission: true,
  }),
}));

// ── Test Data Helpers ──────────────────────────────────────────────────────────

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function makeTask(overrides = {}) {
  return {
    $id: `task-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Test Task',
    description: '',
    tags: [],
    dueDate: todayStr,
    completed: false,
    recurrence: null,
    subtasks: null,
    userId: 'user-1',
    userName: 'Test User',
    entryDate: new Date().toISOString(),
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Setup / Teardown ───────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockIdeasData = [];
  mockAdd = jest.fn().mockResolvedValue(true);
  mockRemove = jest.fn().mockResolvedValue(true);
  mockUpdate = jest.fn().mockResolvedValue(true);
  mockToggleComplete = jest.fn().mockResolvedValue(true);
  mockInit = jest.fn().mockResolvedValue(undefined);
  mockUserCurrent = defaultUser;
  window.confirm = jest.fn(() => true);
});

// ── 1. QuickAddTask: adds subtasks and clears input after submission ──────────

describe('QuickAddTask subtask handling', () => {
  it('adds subtasks via checklist input and clears input after submission', async () => {
    mockIdeasData = [];
    render(<Ideas />);

    // Wait for loading to finish — the page should display at least one "Add…" placeholder
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Find one of the inline QuickAddTask inputs (there are multiple columns, pick the first)
    const addInputs = screen.getAllByPlaceholderText('Add…');
    const addInput = addInputs[0];

    // Type a title to reveal the "+ details" button
    fireEvent.change(addInput, { target: { value: 'Task with checklist' } });
    const detailsBtn = screen.getAllByText('+ details')[0];
    fireEvent.click(detailsBtn);

    // Now the expanded form should show the "Add item (enter)" input
    const subtaskInput = screen.getAllByPlaceholderText('Add item (enter)')[0];

    // Add first subtask
    fireEvent.change(subtaskInput, { target: { value: 'Sub-item 1' } });
    fireEvent.keyDown(subtaskInput, { key: 'Enter', code: 'Enter' });

    // Add second subtask
    fireEvent.change(subtaskInput, { target: { value: 'Sub-item 2' } });
    fireEvent.keyDown(subtaskInput, { key: 'Enter', code: 'Enter' });

    // Both subtask items should be visible
    expect(screen.getByText('Sub-item 1')).toBeInTheDocument();
    expect(screen.getByText('Sub-item 2')).toBeInTheDocument();

    // Submit the form via the "Add" button
    const addBtn = screen.getByRole('button', { name: 'Add' });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    // Verify ideas.add was called with subtasks JSON
    expect(mockAdd).toHaveBeenCalledTimes(1);
    const callArgs = mockAdd.mock.calls[0][0];
    expect(callArgs.title).toBe('Task with checklist');
    const subtasksPayload = JSON.parse(callArgs.subtasks);
    expect(subtasksPayload).toHaveLength(2);
    expect(subtasksPayload[0]).toEqual({ text: 'Sub-item 1', done: false });
    expect(subtasksPayload[1]).toEqual({ text: 'Sub-item 2', done: false });

    // After successful submit, the subtask items should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Sub-item 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Sub-item 2')).not.toBeInTheDocument();
    });
  });
});

// ── 2. TaskItem: displays subtask progress indicator based on subtasks JSON ───

describe('TaskItem subtask progress indicator', () => {
  it('shows [done/total items] when subtasks JSON is present', async () => {
    const subtasksJson = JSON.stringify([
      { text: 'Step A', done: true },
      { text: 'Step B', done: false },
      { text: 'Step C', done: true },
    ]);

    mockIdeasData = [
      makeTask({ $id: 'task-sub', title: 'Task with subtasks', subtasks: subtasksJson }),
    ];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // The progress indicator should show [2/3 items]
    expect(screen.getByText('[2/3 items]')).toBeInTheDocument();
  });

  it('shows [0/N items] when no subtasks are done', async () => {
    const subtasksJson = JSON.stringify([
      { text: 'A', done: false },
      { text: 'B', done: false },
    ]);

    mockIdeasData = [
      makeTask({ $id: 'task-none-done', title: 'None done', subtasks: subtasksJson }),
    ];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    expect(screen.getByText('[0/2 items]')).toBeInTheDocument();
  });

  it('does not show progress indicator when subtasks is null', async () => {
    mockIdeasData = [
      makeTask({ $id: 'task-no-sub', title: 'No subtasks', subtasks: null }),
    ];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    expect(screen.queryByText(/items\]/)).not.toBeInTheDocument();
  });
});

// ── 3. TimelineColumn: filters pinned work tasks when showWorkSection is true ─

describe('TimelineColumn work section filtering', () => {
  it('displays pinned work tasks separately when showWorkSection is toggled on', async () => {
    mockIdeasData = [
      makeTask({ $id: 'work-1', title: 'Work Task Alpha', tags: ['fs'], dueDate: todayStr }),
      makeTask({ $id: 'personal-1', title: 'Personal Task Beta', tags: ['personal'], dueDate: todayStr }),
      makeTask({ $id: 'work-2', title: 'Work Task Gamma', tags: ['fs', 'urgent'], dueDate: todayStr }),
    ];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Before toggling: all tasks visible, no "Work" section header
    expect(screen.getByText('Work Task Alpha')).toBeInTheDocument();
    expect(screen.getByText('Personal Task Beta')).toBeInTheDocument();
    expect(screen.getByText('Work Task Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Work')).not.toBeInTheDocument();

    // Click the work section toggle (briefcase icon button)
    const workToggle = screen.getByTitle('Pin work tasks to top');
    fireEvent.click(workToggle);

    // Now "Work" header(s) should appear in columns that have fs-tagged tasks
    await waitFor(() => {
      const workHeaders = screen.getAllByText('Work');
      expect(workHeaders.length).toBeGreaterThan(0);
    });

    // All three tasks should still be visible
    expect(screen.getByText('Work Task Alpha')).toBeInTheDocument();
    expect(screen.getByText('Personal Task Beta')).toBeInTheDocument();
    expect(screen.getByText('Work Task Gamma')).toBeInTheDocument();
  });
});

// ── 4. Ideas component: toggles showWorkSection and renders work section ──────

describe('Ideas showWorkSection toggle', () => {
  it('toggles showWorkSection state via the briefcase button', async () => {
    mockIdeasData = [
      makeTask({ $id: 'fs-task', title: 'FS tagged task', tags: ['fs'], dueDate: todayStr }),
    ];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Initially no "Work" section headers
    expect(screen.queryByText('Work')).not.toBeInTheDocument();

    // Toggle ON
    const toggleBtn = screen.getByTitle('Pin work tasks to top');
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getAllByText('Work').length).toBeGreaterThan(0);
    });

    // Title should change after toggle
    expect(screen.getByTitle('Unpin work tasks')).toBeInTheDocument();

    // Toggle OFF
    fireEvent.click(screen.getByTitle('Unpin work tasks'));

    await waitFor(() => {
      expect(screen.queryByText('Work')).not.toBeInTheDocument();
    });

    // Title reverts
    expect(screen.getByTitle('Pin work tasks to top')).toBeInTheDocument();
  });

  it('renders work section tasks correctly in list view', async () => {
    mockIdeasData = [
      makeTask({ $id: 'fs-1', title: 'Work item 1', tags: ['fs'], dueDate: todayStr }),
      makeTask({ $id: 'fs-2', title: 'Work item 2', tags: ['fs'], dueDate: todayStr }),
      makeTask({ $id: 'reg-1', title: 'Regular item', tags: [], dueDate: todayStr }),
    ];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Switch to list view
    const listBtn = screen.getByText('list');
    fireEvent.click(listBtn);

    // Toggle work section on
    const workToggle = screen.getByTitle('Pin work tasks to top');
    fireEvent.click(workToggle);

    await waitFor(() => {
      const workHeaders = screen.getAllByText('Work');
      expect(workHeaders.length).toBeGreaterThan(0);
    });

    // All tasks still visible
    expect(screen.getByText('Work item 1')).toBeInTheDocument();
    expect(screen.getByText('Work item 2')).toBeInTheDocument();
    expect(screen.getByText('Regular item')).toBeInTheDocument();
  });
});

// ── 5. Edit modal: editing, reordering, and deleting subtasks ─────────────────

describe('Edit modal subtask management', () => {
  const taskWithSubtasks = makeTask({
    $id: 'edit-task-1',
    title: 'Editable Task',
    subtasks: JSON.stringify([
      { text: 'First', done: false },
      { text: 'Second', done: true },
      { text: 'Third', done: false },
    ]),
    dueDate: todayStr,
  });

  it('opens edit modal and displays existing subtasks', async () => {
    mockIdeasData = [taskWithSubtasks];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Open the 3-dot menu and click Edit
    const menuBtns = screen.getAllByTestId('fa-icon');
    // Find the ellipsis button for the task row — click on the task's menu button
    const taskRow = screen.getByText('Editable Task').closest('.group');
    const menuBtn = within(taskRow).getAllByRole('button').find(btn =>
      btn.querySelector('[data-testid="fa-icon"]') && btn.textContent === ''
    );
    fireEvent.click(menuBtn);

    // Click "Edit"
    const editBtn = await screen.findByText('Edit');
    fireEvent.click(editBtn);

    // Edit modal should be open
    expect(screen.getByText('Edit Task')).toBeInTheDocument();

    // Existing subtasks should be displayed
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('adds a new subtask in edit modal', async () => {
    mockIdeasData = [taskWithSubtasks];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Open edit modal
    const taskRow = screen.getByText('Editable Task').closest('.group');
    const menuBtn = within(taskRow).getAllByRole('button').find(btn =>
      btn.querySelector('[data-testid="fa-icon"]') && btn.textContent === ''
    );
    fireEvent.click(menuBtn);
    fireEvent.click(await screen.findByText('Edit'));

    // Add a new subtask
    const subtaskInput = screen.getByPlaceholderText('Add item (enter)');
    fireEvent.change(subtaskInput, { target: { value: 'Fourth' } });
    fireEvent.keyDown(subtaskInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('Fourth')).toBeInTheDocument();

    // Save and verify the update call includes the new subtask
    const saveBtn = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockUpdate.mock.calls[0];
    expect(updateArgs[0]).toBe('edit-task-1');
    const savedSubtasks = JSON.parse(updateArgs[1].subtasks);
    expect(savedSubtasks).toHaveLength(4);
    expect(savedSubtasks[3]).toEqual({ text: 'Fourth', done: false });
  });

  it('reorders subtasks with up/down buttons', async () => {
    mockIdeasData = [taskWithSubtasks];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Open edit modal
    const taskRow = screen.getByText('Editable Task').closest('.group');
    const menuBtn = within(taskRow).getAllByRole('button').find(btn =>
      btn.querySelector('[data-testid="fa-icon"]') && btn.textContent === ''
    );
    fireEvent.click(menuBtn);
    fireEvent.click(await screen.findByText('Edit'));

    // "Second" item (index 1) has an up arrow button — click it to move it before "First"
    const upButtons = screen.getAllByText('↑');
    // The first ↑ button belongs to "Second" (index 1, since index 0 has no ↑)
    fireEvent.click(upButtons[0]);

    // Save and check order
    const saveBtn = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    const savedSubtasks = JSON.parse(mockUpdate.mock.calls[0][1].subtasks);
    expect(savedSubtasks[0].text).toBe('Second');
    expect(savedSubtasks[1].text).toBe('First');
    expect(savedSubtasks[2].text).toBe('Third');
  });

  it('deletes a subtask in edit modal', async () => {
    mockIdeasData = [taskWithSubtasks];

    render(<Ideas />);
    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    });

    // Open edit modal
    const taskRow = screen.getByText('Editable Task').closest('.group');
    const menuBtn = within(taskRow).getAllByRole('button').find(btn =>
      btn.querySelector('[data-testid="fa-icon"]') && btn.textContent === ''
    );
    fireEvent.click(menuBtn);
    fireEvent.click(await screen.findByText('Edit'));

    // Verify all three subtasks exist
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();

    // Find the delete buttons (× icons) in the checklist section
    // Each subtask row has a delete button with a FontAwesome × icon
    const editModal = screen.getByText('Edit Task').closest('.bg-td-bg');
    const checklistLabel = within(editModal).getByText('Checklist');
    const checklistSection = checklistLabel.closest('div');
    
    // Get all subtask row delete buttons (the ones with × icon at the end)
    const subtaskRows = within(checklistSection).getAllByText(/^(First|Second|Third)$/);
    // Delete "Second" — find its row and the delete button
    const secondRow = screen.getByText('Second').closest('.flex');
    const deleteButtons = within(secondRow).getAllByRole('button');
    // The last button in the row is the delete button (has × icon)
    const deleteBtn = deleteButtons[deleteButtons.length - 1];
    fireEvent.click(deleteBtn);

    // "Second" should be gone
    expect(screen.queryByText('Second')).not.toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();

    // Save and verify
    const saveBtn = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    const savedSubtasks = JSON.parse(mockUpdate.mock.calls[0][1].subtasks);
    expect(savedSubtasks).toHaveLength(2);
    expect(savedSubtasks.map(s => s.text)).toEqual(['First', 'Third']);
  });
});
