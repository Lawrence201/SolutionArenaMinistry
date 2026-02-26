import { jsPDF } from 'jspdf';

/**
 * Utility to generate and download a member profile PDF.
 * Supports both database (snake_case) and form (camelCase) data structures.
 */
export const generateMemberProfilePDF = async (memberData: any) => {
    try {
        const doc = new jsPDF();
        let yPos = 20;

        // --- Data Normalization ---
        // Handle both camelCase (form) and snake_case (database)
        const member = {
            firstName: memberData.firstName || memberData.first_name || '',
            lastName: memberData.lastName || memberData.last_name || '',
            email: memberData.email || '',
            phone: memberData.phone || '',
            createdAt: memberData.created_at || memberData.createdAt || new Date(),
            status: memberData.status || 'Active',
            engagement: memberData.engagement || 'Medium',
            photoPath: memberData.photoPath || memberData.photo_path || null,
            gender: memberData.gender || 'Not specified',
            dateOfBirth: memberData.dateOfBirth || memberData.date_of_birth || 'Not specified',
            maritalStatus: memberData.maritalStatus || memberData.marital_status || 'Not specified',
            occupation: memberData.occupation || 'Not specified',
            address: memberData.address || 'Not specified',
            gpsAddress: memberData.gpsAddress || memberData.gps_address || 'Not specified',
            city: memberData.city || 'Not specified',
            region: memberData.region || 'Not specified',
            churchGroup: memberData.selectedMinistry || memberData.church_group || 'Not assigned',
            leadershipRole: memberData.leadership || memberData.leadership_role || 'None',
            baptismStatus: memberData.baptismStatus || memberData.baptism_status || 'Not specified',
            spiritualGrowth: memberData.spiritualGrowth || memberData.spiritual_growth || 'Not specified',
            membershipType: memberData.membershipType || memberData.membership_type || 'Full Member',
            attendance: memberData.attendance || 0,
            emergencyName: memberData.emergencyName || memberData.emergency_name || '',
            emergencyPhone: memberData.emergencyPhone || memberData.emergency_phone || '',
            emergencyRelation: memberData.emergencyRelation || memberData.emergency_relation || '',
            ministries: memberData.ministries || [],
            departments: memberData.departments || [],
        };

        const memberName = `${member.firstName} ${member.lastName}`;
        const joinedDate = new Date(member.createdAt).toLocaleDateString();

        // Helper to load image
        const loadImageForPDF = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            });
        };

        const drawPlaceholder = (x: number, y: number, size: number) => {
            doc.setFillColor(243, 244, 246);
            doc.circle(x + size / 2, y + size / 2, size / 2, 'F');
            doc.setDrawColor(156, 163, 175);
            doc.circle(x + size / 2, y + size / 2, size / 2, 'S');

            // Draw simple user icon
            doc.setFillColor(156, 163, 175);
            doc.circle(x + size / 2, y + size / 2 - 5, 6, 'F'); // head
            doc.ellipse(x + size / 2, y + size / 2 + 10, 10, 8, 'F'); // body
        };

        // ========== HEADER: Member Profile Title ==========
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229); // Purple color
        doc.text(String('Member Profile'), 105, yPos, { align: 'center' });

        yPos += 20;

        // ========== PROFILE HEADER SECTION ==========
        const headerStartY = yPos;

        // LEFT SIDE: Member Name & Basic Info
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(String(memberName), 14, yPos);

        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Email: ${String(member.email || '-')}`, 14, yPos);
        yPos += 6;
        doc.text(`Phone: ${String(member.phone || '-')}`, 14, yPos);
        yPos += 6;
        doc.text(`Joined: ${String(joinedDate)}`, 14, yPos);

        yPos += 10;
        // Badges
        doc.setFontSize(9);
        const statusStr = String(member.status || 'Active');
        doc.setFillColor(209, 250, 229); // Light green
        if (statusStr.toLowerCase() === 'inactive') doc.setFillColor(254, 202, 202);
        doc.roundedRect(14, yPos - 5, 28, 8, 2, 2, 'F');
        doc.setTextColor(6, 95, 70);
        if (statusStr.toLowerCase() === 'inactive') doc.setTextColor(153, 27, 27);
        doc.text(statusStr, 16, yPos);

        const engagementStr = String(member.engagement || 'Medium');
        doc.setFillColor(219, 234, 254); // Light blue
        doc.roundedRect(46, yPos - 5, 50, 8, 2, 2, 'F');
        doc.setTextColor(29, 78, 216);
        doc.text(`${engagementStr} Engagement`, 48, yPos);

        // RIGHT SIDE: Profile Picture
        const imageSize = 40;
        const imageX = 196 - imageSize - 10;
        const imageY = headerStartY;

        let photoUrl = null;
        if (member.photoPath) {
            photoUrl = (member.photoPath.startsWith('/') || member.photoPath.startsWith('http') || member.photoPath.startsWith('data:'))
                ? member.photoPath
                : `/uploads/${member.photoPath}`;
        }

        if (photoUrl) {
            try {
                // Determine format more accurately for base64
                let format: 'JPEG' | 'PNG' | 'WEBP' = 'JPEG';
                if (photoUrl.startsWith('data:image/png')) format = 'PNG';
                else if (photoUrl.startsWith('data:image/webp')) format = 'WEBP';
                else if (photoUrl.startsWith('data:image/jpeg') || photoUrl.startsWith('data:image/jpg')) format = 'JPEG';

                const img = await loadImageForPDF(photoUrl);

                doc.setFillColor(255, 255, 255);
                doc.circle(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2 + 1, 'F');
                doc.setDrawColor(229, 231, 235);
                doc.setLineWidth(1);
                doc.circle(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2 + 1, 'S');

                doc.addImage(img, format, imageX, imageY, imageSize, imageSize, undefined, 'FAST');
            } catch (e) {
                console.error('Image load failed for PDF', e);
                drawPlaceholder(imageX, imageY, imageSize);
            }
        } else {
            drawPlaceholder(imageX, imageY, imageSize);
        }

        yPos = Math.max(yPos + 10, imageY + imageSize + 10);
        doc.setDrawColor(229, 231, 235);
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        // ========== PERSONAL INFORMATION ==========
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text('Personal Information', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const birthDisplay = member.dateOfBirth && member.dateOfBirth !== 'Not specified'
            ? new Date(member.dateOfBirth).toLocaleDateString()
            : 'Not specified';

        const personalInfo = [
            ['Gender:', member.gender],
            ['Date of Birth:', birthDisplay],
            ['Marital Status:', member.maritalStatus],
            ['Occupation:', member.occupation],
            ['Address:', member.address],
            ['GPS Address:', member.gpsAddress],
            ['City:', member.city],
            ['Region:', member.region]
        ];

        personalInfo.forEach(([label, value], index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const xPos = col === 0 ? 14 : 110;
            const currentY = yPos + (row * 14);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81);
            doc.text(String(label), xPos, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const valueText = doc.splitTextToSize(String(value || 'Not specified'), 80);
            doc.text(valueText, xPos, currentY + 5);
        });

        yPos += Math.ceil(personalInfo.length / 2) * 14 + 10;
        doc.setDrawColor(229, 231, 235);
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        // ========== CHURCH INFORMATION ==========
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text('Church Information', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);

        const churchInfo = [
            ['Church Group:', member.churchGroup],
            ['Baptism Status:', member.baptismStatus],
            ['Spiritual Growth:', member.spiritualGrowth],
            ['Leadership Role:', member.leadershipRole],
            ['Membership Type:', member.membershipType],
            ['Attendance Rate:', `${member.attendance || 0}%`]
        ];

        churchInfo.forEach(([label, value], index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const xPos = col === 0 ? 14 : 110;
            const currentY = yPos + (row * 14);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81);
            doc.text(String(label), xPos, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const valueText = doc.splitTextToSize(String(value || 'Not assigned'), 80);
            doc.text(valueText, xPos, currentY + 5);
        });

        yPos += Math.ceil(churchInfo.length / 2) * 14 + 10;

        // ========== EMERGENCY CONTACT ==========
        if (member.emergencyName) {
            doc.setDrawColor(229, 231, 235);
            doc.line(14, yPos, 196, yPos);
            yPos += 10;

            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text('Emergency Contact', 14, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81);
            doc.text('Name:', 14, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(String(member.emergencyName || '-'), 14, yPos + 5);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81);
            doc.text('Phone:', 110, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(String(member.emergencyPhone || '-'), 110, yPos + 5);

            yPos += 14;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(55, 65, 81);
            doc.text('Relation:', 14, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(String(member.emergencyRelation || '-'), 14, yPos + 5);
        }

        doc.save(`${member.firstName}_${member.lastName}_Profile.pdf`);

    } catch (error) {
        console.error('PDF generation failed:', error);
    }
};
