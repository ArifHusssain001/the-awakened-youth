// Submission Management System
class SubmissionSystem {
    constructor() {
        this.submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    }

    // Create new submission
    createSubmission(data) {
        if (!authSystem.isLoggedIn()) {
            throw new Error('You must be logged in to submit columns.');
        }

        const user = authSystem.getCurrentUser();
        
        const submission = {
            id: Date.now().toString(),
            title: data.title,
            content: data.content,
            status: data.status || 'draft', // draft, pending, approved, rejected
            authorId: user.id,
            authorName: user.name,
            authorEmail: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submittedAt: data.status === 'pending' ? new Date().toISOString() : null,
            adminFeedback: null,
            reviewedAt: null,
            reviewedBy: null
        };

        this.submissions.push(submission);
        this.saveSubmissions();

        // Notify admin if submitted for review
        if (data.status === 'pending') {
            this.notifyAdminNewSubmission(submission);
        }

        return submission;
    }

    // Update existing submission
    updateSubmission(id, data) {
        const index = this.submissions.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Submission not found.');
        }

        const submission = this.submissions[index];
        
        // Check if user owns this submission or is admin
        const user = authSystem.getCurrentUser();
        if (submission.authorId !== user.id && !authSystem.isAdmin()) {
            throw new Error('Access denied. You can only edit your own submissions.');
        }

        // Update fields
        if (data.title !== undefined) submission.title = data.title;
        if (data.content !== undefined) submission.content = data.content;
        if (data.status !== undefined) {
            submission.status = data.status;
            if (data.status === 'pending' && !submission.submittedAt) {
                submission.submittedAt = new Date().toISOString();
                this.notifyAdminNewSubmission(submission);
            }
        }
        
        submission.updatedAt = new Date().toISOString();
        
        this.submissions[index] = submission;
        this.saveSubmissions();

        return submission;
    }

    // Update submission status (admin only)
    updateSubmissionStatus(id, status, feedback = null) {
        const index = this.submissions.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Submission not found.');
        }

        const submission = this.submissions[index];
        const user = authSystem.getCurrentUser();

        // Check permissions
        if (submission.authorId === user.id && ['pending'].includes(status)) {
            // Authors can change draft to pending
        } else if (authSystem.isAdmin()) {
            // Admins can change any status
        } else {
            throw new Error('Access denied.');
        }

        submission.status = status;
        submission.updatedAt = new Date().toISOString();
        
        if (authSystem.isAdmin()) {
            submission.reviewedAt = new Date().toISOString();
            submission.reviewedBy = user.name;
            if (feedback) {
                submission.adminFeedback = feedback;
            }
        }

        this.submissions[index] = submission;
        this.saveSubmissions();

        // If approved, add to published columns
        if (status === 'approved') {
            this.publishSubmission(submission);
        }

        // Notify author of status change (if admin made the change)
        if (authSystem.isAdmin() && submission.authorId !== user.id) {
            this.notifyAuthorStatusChange(submission);
        }

        return submission;
    }

    // Publish approved submission to main columns
    publishSubmission(submission) {
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        
        // Check if already published
        const existingColumn = columns.find(c => c.submissionId === submission.id);
        if (existingColumn) {
            return existingColumn;
        }

        const column = {
            id: `sub_${submission.id}`,
            submissionId: submission.id,
            title: submission.title,
            content: submission.content,
            status: 'published',
            authorName: submission.authorName,
            createdAt: submission.createdAt,
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
        };

        columns.push(column);
        localStorage.setItem('columns', JSON.stringify(columns));

        // Update website columns
        if (window.columnsManager) {
            window.columnsManager.loadPublishedColumns();
        }

        return column;
    }

    // Get submission by ID
    getSubmission(id) {
        return this.submissions.find(s => s.id === id);
    }

    // Get user's submissions
    getUserSubmissions(userId) {
        return this.submissions.filter(s => s.authorId === userId);
    }

    // Get all submissions (admin only)
    getAllSubmissions() {
        if (!authSystem.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }
        
        return this.submissions;
    }

    // Get submissions by status
    getSubmissionsByStatus(status) {
        if (!authSystem.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }
        
        return this.submissions.filter(s => s.status === status);
    }

    // Delete submission
    deleteSubmission(id) {
        const index = this.submissions.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Submission not found.');
        }

        const submission = this.submissions[index];
        const user = authSystem.getCurrentUser();

        // Check permissions
        if (submission.authorId !== user.id && !authSystem.isAdmin()) {
            throw new Error('Access denied. You can only delete your own submissions.');
        }

        // Remove from submissions
        this.submissions.splice(index, 1);
        this.saveSubmissions();

        // If it was published, remove from columns too
        if (submission.status === 'approved') {
            const columns = JSON.parse(localStorage.getItem('columns') || '[]');
            const updatedColumns = columns.filter(c => c.submissionId !== submission.id);
            localStorage.setItem('columns', JSON.stringify(updatedColumns));
            
            if (window.columnsManager) {
                window.columnsManager.loadPublishedColumns();
            }
        }

        return true;
    }

    // Save submissions to localStorage
    saveSubmissions() {
        localStorage.setItem('submissions', JSON.stringify(this.submissions));
    }

    // Notify admin of new submission
    notifyAdminNewSubmission(submission) {
        console.log(`Email sent to admin: New submission for review - ${submission.title}`);
        
        // Store notification for admin (legacy)
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const notifObj = {
            id: Date.now().toString(),
            type: 'new_submission',
            title: 'New Column Submission',
            body: `${submission.authorName} submitted "${submission.title}" for review`,
            data: submission,
            createdAt: new Date().toISOString(),
            read: false
        };
        notifications.push(notifObj);
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));

        // Also store notification for bell system
        const bellNotifs = JSON.parse(localStorage.getItem('aw_notifications') || '[]');
        bellNotifs.unshift(notifObj);
        localStorage.setItem('aw_notifications', JSON.stringify(bellNotifs));
        // Mark as unread
        const unreadIds = JSON.parse(localStorage.getItem('aw_notifications_unread_ids') || '[]');
        unreadIds.unshift(notifObj.id);
        localStorage.setItem('aw_notifications_unread_ids', JSON.stringify(unreadIds));

        // Simulate email notification
        const emailBody = `
            New Column Submission - The Awakened Youth
            
            Title: ${submission.title}
            Author: ${submission.authorName} (${submission.authorEmail})
            Submitted: ${new Date(submission.submittedAt).toLocaleString()}
            
            Content Preview:
            ${submission.content.substring(0, 200)}...
            
            Please review and approve/reject this submission in the admin panel.
        `;
        
        console.log('Admin notification email:', emailBody);
    }

    // Notify author of status change
    notifyAuthorStatusChange(submission) {
        console.log(`Email sent to ${submission.authorEmail}: Submission status updated`);
        
        const statusMessages = {
            approved: 'Your column has been approved and published!',
            rejected: 'Your column submission needs revision. Please check the feedback and resubmit.',
            pending: 'Your column is under review.'
        };

        const emailBody = `
            Column Submission Update - The Awakened Youth
            
            Dear ${submission.authorName},
            
            Your column "${submission.title}" status has been updated to: ${submission.status.toUpperCase()}
            
            ${statusMessages[submission.status]}
            
            ${submission.adminFeedback ? `Admin Feedback: ${submission.adminFeedback}` : ''}
            
            You can view your submission status in your writer dashboard.
            
            Best regards,
            The Awakened Youth Team
        `;
        
        console.log('Author notification email:', emailBody);
    }

    // Get submission statistics
    getStatistics() {
        if (!authSystem.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }

        const total = this.submissions.length;
        const pending = this.submissions.filter(s => s.status === 'pending').length;
        const approved = this.submissions.filter(s => s.status === 'approved').length;
        const rejected = this.submissions.filter(s => s.status === 'rejected').length;
        const drafts = this.submissions.filter(s => s.status === 'draft').length;

        return {
            total,
            pending,
            approved,
            rejected,
            drafts
        };
    }
}

// Global submission system instance
window.submissionSystem = new SubmissionSystem();