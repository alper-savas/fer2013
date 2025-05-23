"use client";

import { useEffect } from "react";

export function ErrorWithAutoRefresh() {

    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.reload();
        }, 3000); // Refresh after 3 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg">
            Error processing images. Refreshing page...
        </div>
    );
}

