import { getMembers, getMemberStats } from './app/actions/memberActions';

async function testActions() {
    console.log('Testing getMemberStats...');
    const stats = await getMemberStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));

    console.log('Testing getMembers...');
    const members = await getMembers({});
    console.log('Members count:', members.length);
}

testActions().catch(console.error);
