export const exportSessionsToCSV = (sessions: any[]) => {
    const headers = ['Date', 'Time', 'Duration (min)', 'Task'];

    const rows = sessions.map(session => [
        session.sessionDate,
        session.sessionTime,
        session.duration,
        session.taskText || 'N/A',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomodoro-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
};

export const exportTasksToCSV = (tasks: any[]) => {
    const headers = ['Task', 'Status', 'Priority', 'Created', 'Completed'];

    const rows = tasks.map(task => [
        task.text,
        task.completed ? 'Completed' : 'Pending',
        task.priority,
        new Date(task.createdAt).toLocaleDateString(),
        task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomodoro-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
};