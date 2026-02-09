const fetch = require('node-fetch');

const API_URL = 'http://localhost:5002/api';
let token = '';
let habitId = '';

async function test() {
    try {
        console.log('--- Register ---');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: `testuser_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        console.log('Register:', regRes.status, regData);

        if (regData.token) token = regData.token;
        else {
            // Try login if user exists (though unique email avoids this)
        }

        console.log('\n--- Login ---');
        // Not strictly needed if register gives token, but good to test

        console.log('\n--- Create Habit ---');
        const createRes = await fetch(`${API_URL}/habits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Test Habit',
                targetPerDay: 5
            })
        });
        const createData = await createRes.json();
        console.log('Create Habit:', createRes.status, createData);
        if (createData.habit) habitId = createData.habit._id;

        console.log('\n--- List Habits ---');
        const listRes = await fetch(`${API_URL}/habits`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('List Habits:', listRes.status, await listRes.json());

        if (habitId) {
            console.log('\n--- Update Habit (Check-in) ---');
            const updateRes = await fetch(`${API_URL}/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ delta: 1 })
            });
            console.log('Update Habit:', updateRes.status, await updateRes.json());

            console.log('\n--- Delete Habit ---');
            const delRes = await fetch(`${API_URL}/habits/${habitId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Delete Habit:', delRes.status);
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
