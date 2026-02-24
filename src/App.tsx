import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppLayout } from './layouts';
import { ErrorFallback } from './components/common/ErrorFallback';
import { usePlayerStore } from './stores/usePlayerStore';
import { MusicService } from './services/MusicService';

const App: React.FC = () => {
    const { setTrack, setQueue } = usePlayerStore();

    useEffect(() => {
        // We no longer automatically load a mock song (like "七里香") on startup.
        // The app will open in a clean state with no active song.
    }, []);

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Reset any state that might have caused the error
                window.location.reload();
            }}
        >
            <AppLayout />
        </ErrorBoundary>
    );
};

export default App;
