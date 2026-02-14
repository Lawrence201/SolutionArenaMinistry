
import { getEventById } from '@/app/actions/event';
import EditEventForm from '@/components/Admin/events/EditEventForm';
import { notFound } from 'next/navigation';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
        notFound();
    }

    const result = await getEventById(eventId);

    if (!result.success || !result.data) {
        // In a real app we might want a specific error page
        // For now, notFound() is a decent fallback for invalid IDs
        notFound();
    }

    return (
        <EditEventForm event={result.data} />
    );
}
