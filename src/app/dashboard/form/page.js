'use client';

import React, { Suspense } from 'react';
import DashboardForm from './DashboardForm';

export default function Page() {
  return (
    <Suspense fallback={<p>Loading form...</p>}>
      <DashboardForm/>
    </Suspense>
  );
}
