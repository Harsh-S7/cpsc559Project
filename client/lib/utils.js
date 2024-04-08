const BASE_URL = '/api';

export const getString = async () => {
    const response = await fetch(`${BASE_URL}/user`, {
        method: 'GET',
    });
    console.log(response);
    const data = await response.json();
    return data.m;
}

export const insertString = async (index, string) => {
    const response = await fetch(`${BASE_URL}/insertString`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ index, string })
    });
    if (response.status === 400) {
        return 'Index out of range';
    }
}

export const removeString = async (startIndex, endIndex) => {
    const response = await fetch(`${BASE_URL}/removeString`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fromIndex: startIndex,
            toIndex: endIndex,
        })
    });
    if (response.status === 400) {
        return 'Index out of range';
    }
}
