import NextAuth from 'next-auth';
import authOptions from '../../../../lib/authOptions';
// @ts-ignore
globalThis.trustHost = true;
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };