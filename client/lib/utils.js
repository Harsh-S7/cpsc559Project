const BASE_URL = '/api';

export const createNewUser = async (user) => {
    if (!user.username || !user.password || !user.email) {
        throw new Error('Invalid user data');
    }
    const response = await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
        body: JSON.stringify({
            username: user.username,
            email: user.email,
        }),
    });
    return response;
};

export const loginUser = async (user) => {
    if (!user.username || !user.password) {
        throw new Error('Invalid user data');
    }
    const response = await fetch(`${BASE_URL}/user/${user.username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
    });
    console.log(response);
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        return new Error('Invalid credentials');
    }
}

export const createNewDocument = async (documentName, username) => {
    if (!documentName || !username) {
        throw new Error('Invalid document data');
    }
    const response = await fetch(`${BASE_URL}/document`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
        body: JSON.stringify({ 
            name: documentName, 
            owner: username 
        }),
    });
    if (response.status === 200) {
        return response;
    } else {
        return new Error('Invalid document data');
    }
}

export const getDocumentsByUser = async (username) => {
    if (!username) {
        throw new Error('Invalid username');
    }
    const response = await fetch(`${BASE_URL}/document/byUser/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        return new Error('Invalid username');
    }
}

export const getDocumentSharedWithUser = async (username) => {
    if (!username) {
        throw new Error('Invalid username');
    }
    const response = await fetch(`${BASE_URL}/document/sharedWithUser/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        return new Error('Invalid username');
    }
}

export const getAllDocumentsByUser = async (username) => {
    if (!username) {
        throw new Error('Invalid username');
    }
    const response = await fetch(`${BASE_URL}/document/combined/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        return new Error('Invalid username');
    }
}

export const getDocumentById = async (docId) => {
    if (!docId) {
        throw new Error('Invalid document id');
    }
    const response = await fetch(`${BASE_URL}/document/${docId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        return new Error('Invalid document id');
    }
}

export const deleteDocument = async (docId) => {
    if (!docId) {
        throw new Error('Invalid document id');
    }
    const response = await fetch(`${BASE_URL}/document/${docId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
    });
    if (response.status === 200) {
        return response;
    } else {
        return new Error('Invalid document id');
    }
}

export const shareDocument = async (docId, usernames) => {
    if (!docId || !usernames) {
        throw new Error('Invalid data');
    }
    const response = await fetch(`${BASE_URL}/document/share/${docId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': true,
        },
        body: JSON.stringify({ shared: usernames }),
    });
    if (response.status === 200) {
        return response;
    } else {
        return new Error('Invalid data');
    }
}