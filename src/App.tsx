import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppLayout } from './layouts';
import { ErrorFallback } from './components/common/ErrorFallback';

const App: React.FC = () => {

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
