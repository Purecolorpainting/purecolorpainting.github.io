// Quote Calculator - Pure Color Painting
(function () {
    'use strict';

    let roomCounter = 0;

    // --- DOM References ---
    const roomsContainer = document.getElementById('rooms-container');
    const resultsTable = document.getElementById('results-table').querySelector('tbody');
    const rateWallCeiling = document.getElementById('rate-wall-ceiling');
    const rateTrim = document.getElementById('rate-trim');
    const rateDoor = document.getElementById('rate-door');
    const doorSides = document.getElementById('door-sides');

    // Material inputs
    const matWallPrice = document.getElementById('mat-wall-price');
    const matWallGals = document.getElementById('mat-wall-gals');
    const matCeilingPrice = document.getElementById('mat-ceiling-price');
    const matCeilingGals = document.getElementById('mat-ceiling-gals');
    const matTrimPrice = document.getElementById('mat-trim-price');
    const matTrimGals = document.getElementById('mat-trim-gals');
    const matPrimerPrice = document.getElementById('mat-primer-price');
    const matPrimerGals = document.getElementById('mat-primer-gals');

    // Track whether user has manually edited gallon fields
    var galOverrides = { wall: false, ceiling: false, trim: false, primer: false };

    // Use focusin to mark override as soon as the user touches a gallon field,
    // before the input event triggers calculateAll and overwrites the value.
    matWallGals.addEventListener('focusin', function () { galOverrides.wall = true; });
    matCeilingGals.addEventListener('focusin', function () { galOverrides.ceiling = true; });
    matTrimGals.addEventListener('focusin', function () { galOverrides.trim = true; });
    matPrimerGals.addEventListener('focusin', function () { galOverrides.primer = true; });

    // --- Enforce 2 decimal places on money inputs ---
    var moneyInputs = [rateWallCeiling, rateTrim, rateDoor,
                       matWallPrice, matCeilingPrice, matTrimPrice, matPrimerPrice];
    moneyInputs.forEach(function (el) {
        el.addEventListener('input', function () {
            var dot = el.value.indexOf('.');
            if (dot !== -1 && el.value.length - dot - 1 > 2) {
                el.value = el.value.slice(0, dot + 3);
            }
        });
        el.addEventListener('blur', function () {
            var val = parseFloat(el.value);
            if (!isNaN(val)) {
                el.value = val.toFixed(2);
            }
        });
    });

    // --- Set footer year ---
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Settings toggle ---
    window.toggleSettings = function () {
        const body = document.getElementById('settings-body');
        const arrow = document.getElementById('settings-arrow');
        body.classList.toggle('open');
        arrow.classList.toggle('open');
    };

    // --- Share view toggle ---
    window.toggleShareView = function () {
        document.body.classList.toggle('share-view');
        if (document.body.classList.contains('share-view')) {
            updateShareDisplayValues();
        }
    };

    // --- Populate display values before print ---
    window.addEventListener('beforeprint', function () {
        updateShareDisplayValues();
    });


    function updateShareDisplayValues() {
        // Client info
        var clientName = document.getElementById('client-name').value.trim();
        var clientAddress = document.getElementById('client-address').value.trim();
        var clientDisplay = document.querySelector('.client-display');
        var html = '';
        if (clientName) {
            html += '<div class="client-display-name">' + clientName + '</div>';
        }
        if (clientAddress) {
            html += '<div class="client-display-address">' + clientAddress + '</div>';
        }
        clientDisplay.innerHTML = html;

        // Room cards
        const cards = roomsContainer.querySelectorAll('.room-card');
        cards.forEach(function (card) {
            const nameInput = card.querySelector('.room-name-input');
            const nameDisplay = card.querySelector('.room-name-display');
            const dimDisplay = card.querySelector('.dim-display');
            const l = card.querySelector('.input-length').value || 0;
            const w = card.querySelector('.input-width').value || 0;
            const h = card.querySelector('.input-height').value || 0;

            nameDisplay.textContent = nameInput.value || nameInput.placeholder || 'Room';
            dimDisplay.textContent = l + ' ft \u00D7 ' + w + ' ft \u00D7 ' + h + ' ft ceiling';
        });
    }

    // --- Room management ---
    window.addRoom = function () {
        roomCounter++;
        const id = roomCounter;
        const card = document.createElement('div');
        card.className = 'room-card';
        card.dataset.roomId = id;

        card.innerHTML =
            '<div class="room-card-header">' +
                '<input type="text" class="room-name-input" placeholder="Room ' + id + '" aria-label="Room name">' +
                '<span class="room-name-display"></span>' +
                '<button class="btn-remove" onclick="removeRoom(' + id + ')">Remove</button>' +
            '</div>' +
            '<div class="dim-display"></div>' +
            '<div class="room-dimensions">' +
                '<div class="dim-group">' +
                    '<label>Length</label>' +
                    '<div class="input-with-unit">' +
                        '<input type="number" class="input-length" min="0" step="0.1" placeholder="0" aria-label="Length in feet">' +
                        '<span class="unit">ft</span>' +
                    '</div>' +
                '</div>' +
                '<div class="dim-group">' +
                    '<label>Width</label>' +
                    '<div class="input-with-unit">' +
                        '<input type="number" class="input-width" min="0" step="0.1" placeholder="0" aria-label="Width in feet">' +
                        '<span class="unit">ft</span>' +
                    '</div>' +
                '</div>' +
                '<div class="dim-group">' +
                    '<label>Height</label>' +
                    '<div class="input-with-unit">' +
                        '<input type="number" class="input-height" min="0" step="0.1" placeholder="8" value="8" aria-label="Ceiling height in feet">' +
                        '<span class="unit">ft</span>' +
                    '</div>' +
                '</div>' +
                '<div class="dim-group">' +
                    '<label>Trim Runs</label>' +
                    '<div class="input-with-unit">' +
                        '<input type="number" class="input-trim-runs" min="0" step="1" value="1" aria-label="Trim runs (1=baseboard, 2=baseboard+crown)">' +
                        '<span class="unit">&times;</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="room-calcs">' +
                '<div class="calc-item">' +
                    '<div class="calc-label">Ceiling</div>' +
                    '<div class="calc-value"><span class="ceiling-sqft">0</span> <span class="calc-unit">sq ft</span></div>' +
                '</div>' +
                '<div class="calc-item">' +
                    '<div class="calc-label">Walls</div>' +
                    '<div class="calc-value"><span class="walls-sqft">0</span> <span class="calc-unit">sq ft</span></div>' +
                '</div>' +
                '<div class="calc-item">' +
                    '<div class="calc-label">Perimeter</div>' +
                    '<div class="calc-value"><span class="perim-lf">0</span> <span class="calc-unit">lin ft</span></div>' +
                '</div>' +
                '<div class="calc-item">' +
                    '<div class="calc-label">Trim</div>' +
                    '<div class="calc-value"><span class="trim-lf">0</span> <span class="calc-unit">lin ft</span></div>' +
                '</div>' +
            '</div>';

        roomsContainer.appendChild(card);

        // Attach listeners to new inputs
        var inputs = card.querySelectorAll('input[type="number"]');
        inputs.forEach(function (input) {
            input.addEventListener('input', calculateAll);
        });

        calculateAll();
    };

    window.removeRoom = function (id) {
        var card = roomsContainer.querySelector('[data-room-id="' + id + '"]');
        if (card) {
            card.remove();
            calculateAll();
        }
    };

    // --- Calculation ---
    function calculateAll() {
        var totalWallSqft = 0;
        var totalCeilingSqft = 0;
        var totalTrimLf = 0;

        var cards = roomsContainer.querySelectorAll('.room-card');
        cards.forEach(function (card) {
            var l = parseFloat(card.querySelector('.input-length').value) || 0;
            var w = parseFloat(card.querySelector('.input-width').value) || 0;
            var h = parseFloat(card.querySelector('.input-height').value) || 0;
            var trimRuns = parseInt(card.querySelector('.input-trim-runs').value) || 0;

            var ceilingSqft = l * w;
            var perimeter = (l + w) * 2;
            var wallSqft = perimeter * h;
            var trimLf = perimeter * trimRuns;

            card.querySelector('.ceiling-sqft').textContent = formatNum(ceilingSqft);
            card.querySelector('.walls-sqft').textContent = formatNum(wallSqft);
            card.querySelector('.perim-lf').textContent = formatNum(perimeter);
            card.querySelector('.trim-lf').textContent = formatNum(trimLf);

            totalCeilingSqft += ceilingSqft;
            totalWallSqft += wallSqft;
            totalTrimLf += trimLf;
        });

        var wallCeilRate = parseFloat(rateWallCeiling.value) || 0;
        var trimRate = parseFloat(rateTrim.value) || 0;
        var doorRate = parseFloat(rateDoor.value) || 0;
        var doors = parseInt(doorSides.value) || 0;

        var wallCost = totalWallSqft * wallCeilRate;
        var ceilingCost = totalCeilingSqft * wallCeilRate;
        var trimCost = totalTrimLf * trimRate;
        var doorCost = doors * doorRate;

        var laborSubtotal = wallCost + ceilingCost + trimCost + doorCost;

        // Auto-suggest gallons
        if (!galOverrides.wall) {
            // Wall paint: ~300 sq ft per gallon
            matWallGals.value = totalWallSqft > 0 ? Math.ceil(totalWallSqft / 300) : 0;
        }
        if (!galOverrides.ceiling) {
            // Ceiling paint: ~100 sq ft per gallon (thicker flat paint, lower coverage)
            matCeilingGals.value = totalCeilingSqft > 0 ? Math.ceil(totalCeilingSqft / 100) : 0;
        }
        if (!galOverrides.trim) {
            // Trim paint: ~100 linear feet per gallon
            matTrimGals.value = totalTrimLf > 0 ? Math.ceil(totalTrimLf / 100) : 0;
        }
        if (!galOverrides.primer) {
            // Primer: auto-estimate for ceiling area at ~300 sq ft per gallon
            matPrimerGals.value = totalCeilingSqft > 0 ? Math.ceil(totalCeilingSqft / 300) : 0;
        }

        // Material costs
        var matWallCost = (parseFloat(matWallPrice.value) || 0) * (parseInt(matWallGals.value) || 0);
        var matCeilingCost = (parseFloat(matCeilingPrice.value) || 0) * (parseInt(matCeilingGals.value) || 0);
        var matTrimCost = (parseFloat(matTrimPrice.value) || 0) * (parseInt(matTrimGals.value) || 0);
        var matPrimerCost = (parseFloat(matPrimerPrice.value) || 0) * (parseInt(matPrimerGals.value) || 0);
        var materialTotal = matWallCost + matCeilingCost + matTrimCost + matPrimerCost;

        // Update material cost displays
        document.getElementById('mat-wall-cost').textContent = formatMoney(matWallCost);
        document.getElementById('mat-ceiling-cost').textContent = formatMoney(matCeilingCost);
        document.getElementById('mat-trim-cost').textContent = formatMoney(matTrimCost);
        document.getElementById('mat-primer-cost').textContent = formatMoney(matPrimerCost);

        var grandSubtotal = laborSubtotal + materialTotal;
        var rounded = roundToNearest25(grandSubtotal);

        // Build results table
        var html = '';

        // Labor section
        html += '<tr class="section-header-row"><td colspan="3" class="section-label">Labor</td></tr>';

        html += buildRow(
            'Walls',
            formatNum(totalWallSqft) + ' sq ft &times; ' + formatMoney(wallCeilRate),
            formatMoney(wallCost)
        );
        html += buildRow(
            'Ceilings',
            formatNum(totalCeilingSqft) + ' sq ft &times; ' + formatMoney(wallCeilRate),
            formatMoney(ceilingCost)
        );
        html += buildRow(
            'Trim',
            formatNum(totalTrimLf) + ' lin ft &times; ' + formatMoney(trimRate),
            formatMoney(trimCost)
        );

        if (doors > 0) {
            html += buildRow(
                'Doors',
                doors + ' sides &times; ' + formatMoney(doorRate),
                formatMoney(doorCost)
            );
        }

        // Materials section
        html += '<tr class="section-header-row"><td colspan="3" class="section-label">Materials</td></tr>';

        var wg = parseInt(matWallGals.value) || 0;
        var cg = parseInt(matCeilingGals.value) || 0;
        var tg = parseInt(matTrimGals.value) || 0;
        var pg = parseInt(matPrimerGals.value) || 0;

        if (wg > 0) {
            html += buildRow('Wall Paint', wg + ' gal &times; ' + formatMoney(parseFloat(matWallPrice.value) || 0), formatMoney(matWallCost));
        }
        if (cg > 0) {
            html += buildRow('Ceiling Paint', cg + ' gal &times; ' + formatMoney(parseFloat(matCeilingPrice.value) || 0), formatMoney(matCeilingCost));
        }
        if (tg > 0) {
            html += buildRow('Trim Paint', tg + ' gal &times; ' + formatMoney(parseFloat(matTrimPrice.value) || 0), formatMoney(matTrimCost));
        }
        if (pg > 0) {
            html += buildRow('Primer', pg + ' gal &times; ' + formatMoney(parseFloat(matPrimerPrice.value) || 0), formatMoney(matPrimerCost));
        }
        if (wg === 0 && cg === 0 && tg === 0 && pg === 0) {
            html += '<tr><td colspan="3" style="color:var(--color-gray);font-size:0.9rem;padding:8px;">No materials added</td></tr>';
        }

        // Totals
        var roundingAdj = rounded - grandSubtotal;

        html += '<tr class="subtotal-row">' +
            '<td class="line-label">Subtotal</td>' +
            '<td class="line-detail"></td>' +
            '<td class="line-amount">' + formatMoney(grandSubtotal) + '</td>' +
            '</tr>';

        html += '<tr class="rounding-row">' +
            '<td class="line-label">Rounding</td>' +
            '<td class="line-detail">to nearest $25</td>' +
            '<td class="line-amount">' + formatSignedMoney(roundingAdj) + '</td>' +
            '</tr>';

        html += '<tr class="total-row">' +
            '<td class="line-label">Total</td>' +
            '<td class="line-detail"></td>' +
            '<td class="line-amount">' + formatMoney(rounded) + '</td>' +
            '</tr>';

        resultsTable.innerHTML = html;
    }

    function buildRow(label, detail, amount) {
        return '<tr>' +
            '<td class="line-label">' + label + '</td>' +
            '<td class="line-detail">' + detail + '</td>' +
            '<td class="line-amount">' + amount + '</td>' +
            '</tr>';
    }

    // --- Helpers ---
    function roundToNearest25(amount) {
        return Math.round(amount / 25) * 25;
    }

    function formatMoney(n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatSignedMoney(n) {
        if (n === 0) return '$0.00';
        var sign = n < 0 ? '-' : '+';
        var abs = Math.abs(n);
        return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatNum(n) {
        return n % 1 === 0 ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { maximumFractionDigits: 1 });
    }

    // --- Global input listeners ---
    [rateWallCeiling, rateTrim, rateDoor, doorSides,
     matWallPrice, matWallGals, matCeilingPrice, matCeilingGals,
     matTrimPrice, matTrimGals, matPrimerPrice, matPrimerGals].forEach(function (el) {
        el.addEventListener('input', calculateAll);
    });

    // --- Initialize with one room ---
    addRoom();
})();
