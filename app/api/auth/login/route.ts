import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // 1. Check Admin Accounts
        const admin = await prisma.adminAccount.findUnique({
            where: { admin_email: email }
        });

        if (admin) {
            const isPasswordValid = await verifyPassword(password, admin.admin_password);
            if (isPasswordValid) {
                // Update last login
                await prisma.adminAccount.update({
                    where: { admin_id: admin.admin_id },
                    data: { last_login: new Date() }
                });

                return NextResponse.json({
                    success: true,
                    message: 'Login successful',
                    userType: 'admin',
                    redirect: '/admin/dashboard'
                });
            }
        }

        // 2. Check Regular Users
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (user) {
            if (!user.is_active) {
                return NextResponse.json(
                    { success: false, message: 'Account is inactive' },
                    { status: 403 }
                );
            }

            const isPasswordValid = await verifyPassword(password, user.password);
            if (isPasswordValid) {
                return NextResponse.json({
                    success: true,
                    message: 'Login successful',
                    userType: 'user',
                    redirect: '/' // Website home
                });
            }
        }

        // 3. Invalid credentials
        return NextResponse.json(
            { success: false, message: 'Invalid email or password' },
            { status: 401 }
        );

    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, message: 'An internal error occurred' },
            { status: 500 }
        );
    }
}
