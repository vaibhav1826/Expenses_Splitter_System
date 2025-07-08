let people = [];
let expenses = [];

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
}

function addPerson() {
    const nameInput = document.getElementById('personName');
    const name = nameInput.value.trim();
    if (!name) {
        showError('Please enter a name.');
        return;
    }
    if (people.includes(name)) {
        showError('This name already exists.');
        return;
    }
    people.push(name);
    nameInput.value = '';
    updatePeopleList();
    updatePayerDropdown();
    updateParticipantsCheckboxes();
}

function updatePeopleList() {
    const peopleList = document.getElementById('peopleList');
    peopleList.innerHTML = '';
    people.forEach((person, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 bg-gray-100 rounded mb-1';
        div.innerHTML = `
            <span>${person}</span>
            <button onclick="removePerson(${index})" class="text-red-500 hover:text-red-700">Remove</button>
        `;
        peopleList.appendChild(div);
    });
}

function removePerson(index) {
    if (expenses.some(expense => expense.payer === people[index] || expense.participants.includes(people[index]))) {
        showError('Cannot remove person involved in expenses.');
        return;
    }
    people.splice(index, 1);
    updatePeopleList();
    updatePayerDropdown();
    updateParticipantsCheckboxes();
}

function updatePayerDropdown() {
    const payerSelect = document.getElementById('expensePayer');
    payerSelect.innerHTML = '<option value="">Select Payer</option>';
    people.forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        payerSelect.appendChild(option);
    });
}

function updateParticipantsCheckboxes() {
    const participantsDiv = document.getElementById('expenseParticipants');
    participantsDiv.innerHTML = '';
    people.forEach(person => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label class="flex items-center">
                <input type="checkbox" value="${person}" class="mr-2 participant-checkbox">
                ${person}
            </label>
        `;
        participantsDiv.appendChild(div);
    });
}

function addExpense() {
    const desc = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const payer = document.getElementById('expensePayer').value;
    const participants = Array.from(document.querySelectorAll('.participant-checkbox:checked')).map(cb => cb.value);

    if (!desc || !amount || amount <= 0 || !payer || participants.length === 0) {
        showError('Please fill in all fields and select at least one participant.');
        return;
    }

    expenses.push({ desc, amount, payer, participants });
    document.getElementById('expenseDesc').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expensePayer').value = '';
    document.querySelectorAll('.participant-checkbox').forEach(cb => cb.checked = false);

    updateExpensesList();
    calculateBalances();
}

function updateExpensesList() {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';
    expenses.forEach((expense, index) => {
        const div = document.createElement('div');
        div.className = 'p-2 bg-gray-100 rounded mb-1';
        div.innerHTML = `
            <div class="flex justify-between">
                <span>${expense.desc}: $${expense.amount.toFixed(2)}</span>
                <button onclick="removeExpense(${index})" class="text-red-500 hover:text-red-700">Remove</button>
            </div>
            <div class="text-sm">Paid by: ${expense.payer}</div>
            <div class="text-sm">Split among: ${expense.participants.join(', ')}</div>
        `;
        expensesList.appendChild(div);
    });
}

function removeExpense(index) {
    expenses.splice(index, 1);
    updateExpensesList();
    calculateBalances();
}

function calculateBalances() {
    const balances = {};
    people.forEach(person => balances[person] = 0);

    expenses.forEach(expense => {
        const share = expense.amount / expense.participants.length;
        balances[expense.payer] += expense.amount;
        expense.participants.forEach(participant => {
            balances[participant] -= share;
        });
    });

    const balancesList = document.getElementById('balancesList');
    balancesList.innerHTML = '';
    for (const person in balances) {
        const balance = balances[person];
        const div = document.createElement('div');
        div.className = 'p-2 bg-gray-100 rounded mb-1';
        div.textContent = `${person}: ${balance >= 0 ? 'is owed $' + balance.toFixed(2) : 'owes $' + Math.abs(balance).toFixed(2)}`;
        balancesList.appendChild(div);
    }
}