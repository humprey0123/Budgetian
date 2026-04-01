// ======== Data ========
let budget = {
   income: 20000,
   categories: [
      { name: "Food", budget: 8000, spent: 0 },
      { name: "Rent", budget: 3000, spent: 0 },
      { name: "Entertainment", budget: 300, spent: 0 },
   ],
};

let expenses = [];

// ======== Elements ========
const totalBudgetEl = document.getElementById("total-budget");
const remainingBudgetEl = document.getElementById("remaining-budget");
const dailyAllowanceEl = document.getElementById("daily-allowance");
const categoryCardsEl = document.getElementById("category-cards");
const expensesTableBody = document.getElementById("expenses-table-body");

const expenseModal = document.getElementById("expense-modal");
const addExpenseBtn = document.getElementById("add-expense-btn");
const cancelExpenseBtn = document.getElementById("cancel-expense");
const expenseForm = document.getElementById("expense-form");
const expenseCategory = document.getElementById("expense-category");
const expenseAmount = document.getElementById("expense-amount");
const expenseNote = document.getElementById("expense-note");

const budgetModal = document.getElementById("budget-modal");
const editBudgetBtn = document.getElementById("edit-budget-btn");
const cancelBudgetBtn = document.getElementById("cancel-budget");
const budgetForm = document.getElementById("budget-form");
const budgetIncomeInput = document.getElementById("budget-income");
const budgetCategoriesContainer = document.getElementById(
   "budget-categories-container",
);
const addCategoryBtn = document.getElementById("add-category-btn");

// ======== Functions ========

// Calculate spent per category and totals
function recalcSpent() {
   // Reset spent
   budget.categories.forEach((c) => (c.spent = 0));
   expenses.forEach((e) => {
      const cat = budget.categories.find((c) => c.name === e.category);
      if (cat) cat.spent += e.amount;
   });
}

// Render dashboard and category cards
function updateDashboard() {
   recalcSpent();
   const totalAllocated = budget.categories.reduce(
      (acc, c) => acc + c.budget,
      0,
   );
   const remaining = budget.income - totalAllocated;
   const today = new Date();
   const daysLeft =
      new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() -
      today.getDate() +
      1;
   const dailyAllowance = budget.categories[0].budget / daysLeft;

   totalBudgetEl.textContent = `₱${budget.income.toFixed(2)}`;
   remainingBudgetEl.textContent = `₱${remaining.toFixed(2)}`;
   dailyAllowanceEl.textContent = `₱${dailyAllowance.toFixed(2)}/day`;

   // Render category cards
   categoryCardsEl.innerHTML = "";
   budget.categories.forEach((c) => {
      const remainingCat = c.budget - c.spent;
      let color = "bg-green-100";
      if (remainingCat < 0) color = "bg-red-200";
      else if (remainingCat / c.budget < 0.2) color = "bg-yellow-200";

      const card = document.createElement("div");
      card.className = `${color} p-4 rounded shadow`;
      card.innerHTML = `
        <h3 class="font-bold">${c.name}</h3>
        <p>Spent: ₱${c.spent.toFixed(2)} / ₱${c.budget.toFixed(2)}</p>
        <p>Remaining: ₱${remainingCat.toFixed(2)}</p>
      `;
      categoryCardsEl.appendChild(card);
   });

   // Populate expense category select
   expenseCategory.innerHTML = "";
   budget.categories.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.name;
      option.textContent = c.name;
      expenseCategory.appendChild(option);
   });

   // Render expenses table
   renderExpensesTable();
}

// Render expenses table
function renderExpensesTable() {
   expensesTableBody.innerHTML = "";
   expenses.forEach((e, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-2 border">${e.date}</td>
        <td class="p-2 border">${e.category}</td>
        <td class="p-2 border">$${e.amount.toFixed(2)}</td>
        <td class="p-2 border">${e.note}</td>
        <td class="p-2 border flex gap-2">
          <button class="edit-btn bg-yellow-400 px-2 rounded hover:bg-yellow-500" data-index="${index}">✎</button>
          <button class="delete-btn bg-red-400 px-2 rounded hover:bg-red-500" data-index="${index}">🗑</button>
        </td>
      `;
      expensesTableBody.appendChild(row);
   });

   // Add event listeners for delete
   document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
         const i = btn.dataset.index;
         expenses.splice(i, 1);
         saveData();
         updateDashboard();
      });
   });

   // (Optional) Add edit functionality later
}

// Save to LocalStorage
function saveData() {
   localStorage.setItem("budget", JSON.stringify(budget));
   localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Load from LocalStorage
function loadData() {
   if (localStorage.getItem("budget"))
      budget = JSON.parse(localStorage.getItem("budget"));
   if (localStorage.getItem("expenses"))
      expenses = JSON.parse(localStorage.getItem("expenses"));
}

// Open/Close Modals
function openModal(modal) {
   modal.classList.remove("hidden");
}
function closeModal(modal) {
   modal.classList.add("hidden");
}

// ======== Event Listeners ========

// Add Expense
addExpenseBtn.addEventListener("click", () => openModal(expenseModal));
cancelExpenseBtn.addEventListener("click", () => {
   closeModal(expenseModal);
   expenseForm.reset();
});

expenseForm.addEventListener("submit", (e) => {
   e.preventDefault();
   const amount = parseFloat(expenseAmount.value);
   const category = expenseCategory.value;
   const note = expenseNote.value;
   const date = new Date().toISOString().split("T")[0];

   expenses.push({ amount, category, note, date });
   saveData();
   updateDashboard();
   closeModal(expenseModal);
   expenseForm.reset();
});

// Edit Budget
editBudgetBtn.addEventListener("click", () => {
   openModal(budgetModal);
   budgetIncomeInput.value = budget.income;

   budgetCategoriesContainer.innerHTML = "";
   budget.categories.forEach((c, i) => {
      const div = document.createElement("div");
      div.className = "flex gap-2 mb-2";
      div.innerHTML = `
        <input type="text" value="${c.name}" placeholder="Category" class="flex-1 border rounded p-2 category-name" required>
        <input type="number" value="${c.budget}" placeholder="Budget" class="w-24 border rounded p-2 category-budget" required min="0" step="0.01">
        <button type="button" class="remove-category bg-red-400 px-2 rounded hover:bg-red-500">🗑</button>
      `;
      budgetCategoriesContainer.appendChild(div);

      div.querySelector(".remove-category").addEventListener("click", () => {
         div.remove();
      });
   });
});

cancelBudgetBtn.addEventListener("click", () => closeModal(budgetModal));

// Add new category input in Edit Budget
addCategoryBtn.addEventListener("click", () => {
   const div = document.createElement("div");
   div.className = "flex gap-2 mb-2";
   div.innerHTML = `
      <input type="text" placeholder="Category" class="flex-1 border rounded p-2 category-name" required>
      <input type="number" placeholder="Budget" class="w-24 border rounded p-2 category-budget" required min="0" step="0.01">
      <button type="button" class="remove-category bg-red-400 px-2 rounded hover:bg-red-500">🗑</button>
    `;
   budgetCategoriesContainer.appendChild(div);

   div.querySelector(".remove-category").addEventListener("click", () =>
      div.remove(),
   );
});

// Save Budget
budgetForm.addEventListener("submit", (e) => {
   e.preventDefault();
   budget.income = parseFloat(budgetIncomeInput.value);
   const newCategories = [];
   budgetCategoriesContainer.querySelectorAll("div").forEach((div) => {
      const name = div.querySelector(".category-name").value.trim();
      const b = parseFloat(div.querySelector(".category-budget").value);
      if (name && !isNaN(b)) newCategories.push({ name, budget: b, spent: 0 });
   });
   budget.categories = newCategories;
   saveData();
   updateDashboard();
   closeModal(budgetModal);
});

// ======== Initialize ========
loadData();
updateDashboard();
