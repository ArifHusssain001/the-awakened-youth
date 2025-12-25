// Columns Manager - Updates the main website with published columns
class ColumnsManager {
    constructor() {
        this.loadPublishedColumns();
    }

    loadPublishedColumns() {
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        const publishedColumns = columns.filter(col => col.status === 'published');
        
        this.updateColumnsPage(publishedColumns);
        this.updateHomePage(publishedColumns);
    }

    updateColumnsPage(columns) {
        const columnsContainer = document.querySelector('.columns-container');
        if (!columnsContainer) return;

        if (columns.length === 0) {
            columnsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Coming Soon, In Sha Allah</h3>
                    <p>
                        New columns and reflections will be published here regularly. 
                        Each piece will offer gentle reminders, practical guidance, and thoughtful 
                        reflections on living as a Muslim in today's world.
                    </p>
                    <p>
                        Please check back soon or <a href="contact.html" style="color: #663399; text-decoration: underline;">contact me</a> 
                        if you have specific topics you'd like me to address.
                    </p>
                </div>
            `;
            return;
        }

        // Sort by creation date (newest first)
        columns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        columnsContainer.innerHTML = columns.map(column => `
            <article class="column-entry">
                <h3 class="column-title">${column.title}</h3>
                <p class="column-date">Published on: ${new Date(column.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
                <p class="column-snippet">${this.getExcerpt(column.content)}</p>
                <a href="column.html?id=${column.id}" class="read-more-btn">Read More</a>
            </article>
        `).join('');
    }

    updateHomePage(columns) {
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton && columns.length > 0) {
            // Update CTA button to link to latest column
            const latestColumn = columns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            ctaButton.href = `column.html?id=${latestColumn.id}`;
        }

        // Update latest columns section
        this.updateLatestColumnsSection(columns);
    }

    updateLatestColumnsSection(columns) {
        const container = document.getElementById('latestColumnsContainer');
        if (!container) return;

        if (columns.length === 0) {
            container.innerHTML = `
                <div class="no-columns-message">
                    <div class="coming-soon-card">
                        <h3>📝 Coming Soon, In Sha Allah</h3>
                        <p>New inspiring columns and reflections will be published here regularly. Each piece offers gentle reminders and practical Islamic guidance for modern life.</p>
                        <a href="admin.html" class="admin-link">✍️ Write First Column</a>
                    </div>
                </div>
            `;
            return;
        }

        // Sort by creation date (newest first) and take latest 3
        const latestColumns = columns
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        container.innerHTML = latestColumns.map(column => `
            <article class="column-card">
                <h3 class="column-card-title">${column.title}</h3>
                <p class="column-card-date">📅 ${new Date(column.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
                <p class="column-card-excerpt">${this.getExcerpt(column.content, 120)}</p>
                <a href="column.html?id=${column.id}" class="column-card-link">
                    Read Full Article →
                </a>
            </article>
        `).join('');
    }

    getExcerpt(content, maxLength = 200) {
        // Remove markdown formatting for excerpt
        const plainText = content
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/>\s/g, '') // Remove quotes
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .trim();

        return plainText.length > maxLength 
            ? plainText.substring(0, maxLength) + '...'
            : plainText;
    }

    // Method to get a specific column by ID
    getColumn(id) {
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        return columns.find(col => col.id === id && col.status === 'published');
    }

    // Convert markdown-like syntax to HTML
    convertToHTML(text) {
        return text
            .replace(/### (.*$)/gim, '<h3 style="color: #330066; margin: 25px 0 15px; font-size: 1.3rem;">$1</h3>')
            .replace(/## (.*$)/gim, '<h2 style="color: #330066; margin: 30px 0 20px; font-size: 1.5rem;">$1</h2>')
            .replace(/# (.*$)/gim, '<h1 style="color: #330066; margin: 35px 0 25px; font-size: 1.8rem;">$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/> (.*$)/gim, '<blockquote style="border-left: 4px solid #663399; padding: 15px 20px; margin: 25px 0; background-color: #F5F0FF; border-radius: 5px; font-style: italic; color: #330066;">$1</blockquote>')
            .replace(/^- (.*$)/gim, '<li style="margin: 8px 0; padding-left: 5px;">$1</li>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" style="color: #663399; text-decoration: underline;" target="_blank">$1</a>')
            .replace(/\n\n/gim, '</p><p style="margin: 20px 0; line-height: 1.8;">')
            .replace(/\n/gim, '<br>')
            .replace(/^(.)/gim, '<p style="margin: 20px 0; line-height: 1.8;">$1')
            .replace(/(.)$/gim, '$1</p>');
    }
}

// Initialize columns manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.columnsManager = new ColumnsManager();
});