'use client';

import { Suspense } from 'react';
import { CentralLoginRedirect } from '../login/CentralLoginRedirect';

export default function PhoneLoginPage() {
    return (
        <Suspense fallback={null}>
            <CentralLoginRedirect />
        </Suspense>
    );
}
