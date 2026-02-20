import { prisma } from "./prisma";
import { ActivityType } from "@prisma/client";

/**
 * Log an activity to the system audit trail
 */
export async function logActivity(
    type: string,
    title: string,
    description: string,
    relatedId?: number,
    createdBy: string = "Admin"
) {
    try {
        await prisma.activityLog.create({
            data: {
                activity_type: type as ActivityType,
                title,
                description,
                related_id: relatedId,
                icon_type: type, // Using type as icon_type by default
                created_by: createdBy
            }
        });
    } catch (e) {
        console.error('Failed to log activity:', e);
    }
}
