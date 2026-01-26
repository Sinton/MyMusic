import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppLayout } from './layouts';
import { ErrorFallback } from './components/common/ErrorFallback';
import { usePlayerStore } from './stores/usePlayerStore';
import { MusicService } from './services/MusicService';

const App: React.FC = () => {
    const { setTrack, setQueue } = usePlayerStore();

    useEffect(() => {
        const init = async () => {
            try {
                const { currentTrack, queue } = await MusicService.getInitialData();
                setQueue(queue);
                setTrack(currentTrack);
            } catch (error) {
                console.error("Failed to load initial data", error);
            }
        };
        init();
    }, [setTrack, setQueue]);

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
