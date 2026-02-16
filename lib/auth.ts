import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password The plain text password
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 * @param password The plain text password
 * @param hash The hashed password
 * @returns True if the password matches the hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // Legacy support for plain text passwords in admin_accounts
    // If the hash is short or doesn't look like a bcrypt hash, check for direct equality
    if (!hash.startsWith('$2') && hash.length < 30) {
        return password === hash;
    }

    return bcrypt.compare(password, hash);
}
