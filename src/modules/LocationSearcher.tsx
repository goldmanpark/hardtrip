import React, { useState, useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

const Autocomplete = lazy(() => import('react-google-places-autocomplete'));

const LocationSearcher = () => {
  const [value, setValue] = useState<any>(null);

  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <div className='w-100'>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Autocomplete
            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value,
              onChange: setValue,
            }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default LocationSearcher;
