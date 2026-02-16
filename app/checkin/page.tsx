import { Suspense } from 'react';
import CheckinClient from '@/components/Checkin/CheckinClient';

export const metadata = {
    title: 'Church Check-In | Solution Arena Ministry',
    description: 'Check in for church service using your credentials',
};

export default function CheckinPage() {
    return (
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Check-in...</div>}>
            <CheckinClient />
        </Suspense>
    );
}
