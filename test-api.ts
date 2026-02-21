import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let cookie = '';

async function runTests() {
    try {
        console.log('--- 1. Register User ---');
        const email = `test_steps_${Date.now()}@example.com`;
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password: 'Password123!',
            fullName: 'Step Tracker'
        });
        
        cookie = registerRes.headers['set-cookie']?.[0] || '';
        console.log('Registered successfully. Cookie acquired:', !!cookie);
        
        // Wait just a sec
        await new Promise(r => setTimeout(r, 1000));
        
        console.log('\n--- 2. Log Steps - Day 1 ---');
        const res1 = await axios.post(`${API_URL}/steps/log`, {
            date: new Date().toISOString().split('T')[0],
            steps: 5000
        }, { headers: { Cookie: cookie } });
        console.log('Log Day 1 response:', res1.data);
        
        console.log('\n--- 3. Log Steps - Day 2 (Yesterday) ---');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const res2 = await axios.post(`${API_URL}/steps/log`, {
            date: yesterday.toISOString().split('T')[0],
            steps: 12000
        }, { headers: { Cookie: cookie } });
        console.log('Log Day 2 response:', res2.data);
        
        console.log('\n--- 4. Get Today Steps ---');
        const todayRes = await axios.get(`${API_URL}/steps/today`, { headers: { Cookie: cookie } });
        console.log('Today:', todayRes.data);
        
        console.log('\n--- 5. Get History for Week ---');
        const historyRes = await axios.get(`${API_URL}/steps/history`, { headers: { Cookie: cookie } });
        console.log('History counts:', historyRes.data.history?.length || 0);
        
        console.log('\n--- 6. Get Weekly Stats ---');
        const statsRes = await axios.get(`${API_URL}/steps/stats?period=week`, { headers: { Cookie: cookie } });
        console.log('Stats:', statsRes.data);
        
        console.log('\n--- 7. Update Step Entry ---');
        const stepId = todayRes.data.steps.id;
        const updateRes = await axios.patch(`${API_URL}/steps/${stepId}`, {
            steps: 8000
        }, { headers: { Cookie: cookie } });
        console.log('Updated:', updateRes.data);
        
        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
        
    } catch (e: any) {
        console.error('TEST FAILED:', e.response?.data || e.message);
    }
}

runTests();
