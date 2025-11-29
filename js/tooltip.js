// js/tooltip.js
class Tooltip {
    constructor() {
        this.tooltip = null;
        this.createTooltip();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'custom-tooltip';
        Object.assign(this.tooltip.style, {
            position: 'absolute',
            background: 'rgba(10, 10, 30, 0.95)',
            color: '#e0e7ff',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.5',
            pointerEvents: 'none',
            zIndex: '10000',
            opacity: '0',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            transform: 'translateY(10px)',
            maxWidth: '280px',
            boxShadow: '0 8px 30px rgba(0, 255, 65, 0.3)',
            border: '1px solid rgba(0, 255, 65, 0.4)',
            backdropFilter: 'blur(10px)',
            whiteSpace: 'pre-line'
        });
        document.body.appendChild(this.tooltip);
    }

    show(text, element) {
        this.tooltip.textContent = text;
        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = 'translateY(0)';

        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let top = rect.bottom + 8;
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

        // Keep within viewport
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 8;
        }

        this.tooltip.style.top = top + window.scrollY + 'px';
        this.tooltip.style.left = left + window.scrollX + 'px';
    }

    hide() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'translateY(10px)';
    }
}

// Initialize global tooltip
window.tooltip = new Tooltip();

// Auto-bind all elements with data-tooltip
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.style.cursor = 'help';
        el.addEventListener('mouseenter', (e) => {
            const text = el.getAttribute('data-tooltip');
            if (text) window.tooltip.show(text, el);
        });
        el.addEventListener('mouseleave', () => {
            window.tooltip.hide();
        });
        el.addEventListener('mousemove', (e) => {
            // Optional: follow cursor slightly for premium feel
            // window.tooltip.show(el.getAttribute('data-tooltip'), el);
        });
    });
});
