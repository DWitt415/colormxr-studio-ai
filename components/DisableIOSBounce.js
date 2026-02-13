import { useEffect } from 'react';

const DisableIOSBounce = ({ children }) => {
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        document.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            document.removeEventListener('touchmove', preventDefault);
        };
    }, []);

    return children;
};

export default DisableIOSBounce;