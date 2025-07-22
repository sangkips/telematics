// Responsive utility functions and constants

export const BREAKPOINTS = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Check if current screen width matches a breakpoint
export const isBreakpoint = (breakpoint: Breakpoint, width: number): boolean => {
    return width >= BREAKPOINTS[breakpoint];
};

// Get current breakpoint based on width
export const getCurrentBreakpoint = (width: number): Breakpoint => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
};

// Touch device detection
export const isTouchDevice = (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Check if device is mobile based on user agent (fallback)
export const isMobileUserAgent = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

// Haptic feedback for mobile devices
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
    if ('vibrate' in navigator) {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
        };
        navigator.vibrate(patterns[type]);
    }
};

// Safe area insets detection
export const getSafeAreaInsets = () => {
    const style = getComputedStyle(document.documentElement);
    return {
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
};

// Prevent body scroll (useful for modals on mobile)
export const preventBodyScroll = (prevent: boolean): void => {
    if (prevent) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
};

// Debounce function for resize events
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: number;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Check if device supports hover (desktop-like devices)
export const supportsHover = (): boolean => {
    return window.matchMedia('(hover: hover)').matches;
};

// Get viewport dimensions accounting for mobile browsers
export const getViewportDimensions = () => {
    return {
        width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    };
};

// Format responsive class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
};