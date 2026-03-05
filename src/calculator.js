// ============================================
// CALCULATOR MODULE - Phone Style (Left-to-Right)
// Shared across all pasillos
// ============================================

function initCalculator(getInventoryData, setInventoryData, renderTableFn) {

    let savedQty = 0;
    let activeProduct = "";
    let justCalculated = false;
    let lastExpression = "";

    // Phone calculator internals
    let runningTotal = null;
    let pendingOp = null;
    let currentInput = "0";
    let displayExpr = "0";

    const modal = document.getElementById('calcModal');
    const calcResult = document.getElementById('calcResult');
    const currentSavedDisplay = document.getElementById('current-saved-val');

    const updateDisplay = () => {
        currentSavedDisplay.textContent = savedQty;
        calcResult.textContent = displayExpr;
    };

    const doOperation = (a, op, b) => {
        switch (op) {
            case '+': return a + b;
            case '-': case '−': return a - b;
            case '*': case '×': return a * b;
            case '/': case '÷': return b !== 0 ? a / b : 0;
            default: return b;
        }
    };

    const handleCalcInput = (btn) => {
        const val = btn.textContent.trim();
        const op = btn.dataset ? btn.dataset.op : null;

        // ===== EQUALS =====
        if (val === '=') {
            if (pendingOp !== null && currentInput !== "") {
                let b = parseFloat(currentInput);
                if (isNaN(b)) b = 0;
                let result = doOperation(runningTotal, pendingOp, b);
                lastExpression = displayExpr;
                displayExpr = String(result);
                runningTotal = result;
                pendingOp = null;
                currentInput = String(result);
                justCalculated = true;
            } else if (runningTotal === null && currentInput !== "") {
                lastExpression = displayExpr;
                displayExpr = currentInput;
                justCalculated = true;
            }
            updateDisplay();
            return;
        }

        // ===== CLEAR =====
        if (op === 'C') {
            runningTotal = null;
            pendingOp = null;
            currentInput = "0";
            displayExpr = "0";
            justCalculated = false;
            lastExpression = "";
            updateDisplay();
            return;
        }
        if (op === 'CE') {
            currentInput = "0";
            if (pendingOp !== null) {
                displayExpr = String(runningTotal) + pendingOp;
            } else {
                displayExpr = "0";
            }
            updateDisplay();
            return;
        }

        // ===== BACKSPACE =====
        if (op === 'BS') {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = "0";
            }
            if (pendingOp !== null) {
                displayExpr = String(runningTotal) + pendingOp + (currentInput === "0" ? "" : currentInput);
            } else {
                displayExpr = currentInput;
            }
            justCalculated = false;
            updateDisplay();
            return;
        }

        // ===== ANS =====
        if (op === 'ANS') {
            currentInput = String(savedQty);
            if (pendingOp !== null) {
                displayExpr = String(runningTotal) + pendingOp + "ANS";
            } else {
                displayExpr = "ANS";
                runningTotal = null;
            }
            justCalculated = false;
            updateDisplay();
            return;
        }

        // ===== SPECIAL FUNCTIONS =====
        if (['1/x', 'x2', 'sqrt', '%'].includes(op)) {
            let num = parseFloat(currentInput);
            if (isNaN(num)) num = 0;
            if (op === '1/x') num = num !== 0 ? 1 / num : 0;
            if (op === 'x2') num = num * num;
            if (op === 'sqrt') num = Math.sqrt(num);
            if (op === '%') num = num / 100;
            currentInput = String(num);
            if (pendingOp !== null) {
                displayExpr = String(runningTotal) + pendingOp + currentInput;
            } else {
                displayExpr = currentInput;
            }
            justCalculated = true;
            updateDisplay();
            return;
        }

        // ===== OPERATORS (+, -, ×, ÷) =====
        if (btn.classList.contains('op') || ['+', '-', '×', '÷', '−'].includes(val)) {
            let opSymbol = val;

            if (justCalculated) {
                runningTotal = parseFloat(currentInput);
                if (isNaN(runningTotal)) runningTotal = 0;
                pendingOp = opSymbol;
                currentInput = "";
                displayExpr = String(runningTotal) + opSymbol;
                justCalculated = false;
                updateDisplay();
                return;
            }

            let num = parseFloat(currentInput);
            if (isNaN(num)) num = 0;

            if (pendingOp !== null) {
                runningTotal = doOperation(runningTotal, pendingOp, num);
                displayExpr = String(runningTotal) + opSymbol;
            } else {
                runningTotal = num;
                displayExpr = String(runningTotal) + opSymbol;
            }
            pendingOp = opSymbol;
            currentInput = "";
            justCalculated = false;
            updateDisplay();
            return;
        }

        // ===== NUMBERS AND DOT =====
        if (justCalculated) {
            runningTotal = null;
            pendingOp = null;
            currentInput = val;
            displayExpr = val;
            justCalculated = false;
            updateDisplay();
            return;
        }

        if (currentInput === "0" && val !== '.') {
            currentInput = val;
        } else {
            currentInput += val;
        }

        if (pendingOp !== null) {
            displayExpr = String(runningTotal) + pendingOp + currentInput;
        } else {
            displayExpr = currentInput;
        }
        updateDisplay();
    };

    const bindCalcEvents = () => {
        document.querySelectorAll('.p-btn-new').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                handleCalcInput(btn);
            };
        });
    };

    // Toggle history panel
    const menuBtn = document.querySelector('.calc-menu');
    if (menuBtn) {
        menuBtn.onclick = () => {
            const panel = document.getElementById('calc-history-panel');
            if (panel) {
                const inventoryData = getInventoryData();
                if (panel.style.display === 'none') {
                    const data = inventoryData[activeProduct] || {};
                    const history = data.history || "0";
                    const contentEl = document.getElementById('calc-history-content');
                    if (history === "0" || !history) {
                        contentEl.innerHTML = '<span style="opacity:0.5">Sin historial para este producto</span>';
                    } else {
                        const entries = history.split(' | ');
                        contentEl.innerHTML = entries.map((e, i) =>
                            '<div class="history-entry">' + (i + 1) + '. ' + e + '</div>'
                        ).join('');
                    }
                    panel.style.display = 'block';
                } else {
                    panel.style.display = 'none';
                }
            }
        };
    }

    window.openCalculator = (product) => {
        const inventoryData = getInventoryData();
        activeProduct = product;
        document.getElementById('calc-product-name').textContent = product;
        const data = inventoryData[product] || { qty: 0, history: "0" };
        savedQty = data.qty || 0;
        runningTotal = null;
        pendingOp = null;
        currentInput = "0";
        displayExpr = "0";
        justCalculated = false;
        lastExpression = "";
        updateDisplay();
        modal.style.display = 'flex';
        const histPanel = document.getElementById('calc-history-panel');
        if (histPanel) histPanel.style.display = 'none';
        bindCalcEvents();
    };

    window.closeCalculator = () => {
        modal.style.display = 'none';
    };

    window.saveCalculation = () => {
        let inventoryData = getInventoryData();
        let formula = "";
        let resultVal = 0;

        if (justCalculated && lastExpression) {
            formula = lastExpression;
            resultVal = parseFloat(displayExpr);
            if (isNaN(resultVal)) resultVal = 0;
        } else {
            formula = displayExpr;
            if (pendingOp !== null && currentInput !== "") {
                let b = parseFloat(currentInput);
                if (isNaN(b)) b = 0;
                resultVal = doOperation(runningTotal, pendingOp, b);
            } else {
                resultVal = parseFloat(currentInput);
            }
            if (isNaN(resultVal)) resultVal = 0;
        }

        let newQty = savedQty + resultVal;

        let historyEntry = "";
        if (formula && formula !== "0" && formula !== "Error") {
            historyEntry = formula + "=" + resultVal;
        }

        let oldHistory = inventoryData[activeProduct]?.history || "0";
        let newHistory;
        if (oldHistory === "0" || oldHistory === "") {
            newHistory = historyEntry || "0";
        } else {
            newHistory = historyEntry ? oldHistory + " | " + historyEntry : oldHistory;
        }

        inventoryData[activeProduct] = {
            ...inventoryData[activeProduct],
            qty: newQty,
            history: newHistory
        };
        setInventoryData(inventoryData);
        renderTableFn();
        closeCalculator();
    };
}
