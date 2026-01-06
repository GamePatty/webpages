/* =========================================================
   DOM REFERENCES
========================================================= */

const bundlesDiv = document.getElementById("bundles");
const itemsDiv   = document.getElementById("items");
const offersDiv  = document.getElementById("offers");

document.getElementById("addBundleBtn").onclick = () => addProduct("Bundle");
document.getElementById("addItemBtn").onclick   = () => addProduct("Item");
document.getElementById("addOfferBtn").onclick  = () => addOffer();

document.getElementById("exportBtn").onclick = exportJSON;

document.getElementById("collapseAllBtn").onclick = () => {
    document.querySelectorAll(".card").forEach(c => c.classList.add("collapsed"));
};

document.getElementById("expandAllBtn").onclick = () => {
    document.querySelectorAll(".card").forEach(c => c.classList.remove("collapsed"));
};

document.getElementById("themeToggle").onclick = toggleTheme;

/* =========================================================
   THEME
========================================================= */

if (localStorage.theme === "dark") {
    document.body.classList.add("dark");
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light";
}

/* =========================================================
   UTIL
========================================================= */

function getAllItemIDs() {
    return [...document.querySelectorAll(".itemid")]
        .map(i => i.value)
        .filter(Boolean);
}

function uniqueID(base) {
    let i = 1;
    let id = base;
    const ids = getAllItemIDs();

    while (ids.includes(id)) {
        id = `${base}_${i++}`;
    }
    return id;
}

/* =========================================================
   ARRAY UI
========================================================= */

function createArray(label, type, values = []) {
    const wrap = document.createElement("div");
    wrap.className = "array-block";

    const head = document.createElement("div");
    head.className = "array-header";
    head.innerHTML = `<span>${label}</span>`;

    const add = document.createElement("button");
    add.textContent = "➕";
    head.appendChild(add);

    const list = document.createElement("div");
    list.className = "array-items";

    add.onclick = () => addArrayItem(list, type, "");
    values.forEach(v => addArrayItem(list, type, v));

    wrap.append(head, list);
    return wrap;
}

function addArrayItem(list, type, value) {
    const row = document.createElement("div");
    row.innerHTML = `<input type="${type}" value="${value}"><button>✖</button>`;
    row.querySelector("button").onclick = () => row.remove();
    list.appendChild(row);
}

/* =========================================================
   PRODUCT
========================================================= */

function addProduct(type, data = {}) {
    const card = document.createElement("div");
    card.className = `product ${type.toLowerCase()} card`;

    card.innerHTML = `
        <div class="card-header">
            <div class="title"></div>
            <div class="chevron">▾</div>
        </div>

        <div class="card-body">
            <div class="card-actions">
                <button class="secondary">📄</button>
                <button class="danger">❌</button>
            </div>

            <div class="row"><b>ItemID:</b><input class="itemid"></div>
            <div class="row"><b>ProductID:</b><input></div>
            <div class="row"><b>Title:</b><input></div>
            <div class="row"><b>Desc:</b><input></div>
            <div class="row"><b>Price:</b><input type="number"></div>
        </div>
    `;

    const inputs = card.querySelectorAll("input");
    inputs[0].value = data.ItemID || uniqueID(type.toLowerCase());
    inputs[1].value = data.ProductID || "";
    inputs[2].value = data.Title || "";
    inputs[3].value = data.Desc || "";
    inputs[4].value = data.Price || 0;

    const updateTitle = () => {
        card.querySelector(".title").textContent =
            `${inputs[0].value} (${inputs[1].value})`;
    };

    inputs[0].oninput = updateTitle;
    inputs[1].oninput = updateTitle;
    updateTitle();

    card.querySelector(".card-header").onclick = () => {
        card.classList.toggle("collapsed");
    };

    const ge = createArray("GiftEvents", "text", data.GiftEvents || []);
    const gp = createArray("GiftPowers", "number", data.GiftPowers || []);
    const gc = createArray("GiftCurrencys", "number", data.GiftCurrencys || []);

    card.querySelector(".card-body").append(ge, gp, gc);

    const [dup, rm] = card.querySelectorAll(".card-actions button");

    dup.onclick = () => addProduct(type, {
        ItemID: uniqueID(inputs[0].value),
        ProductID: inputs[1].value,
        Title: inputs[2].value,
        Desc: inputs[3].value,
        Price: inputs[4].value,
        GiftEvents: [...ge.querySelectorAll("input")].map(i => i.value),
        GiftPowers: [...gp.querySelectorAll("input")].map(i => +i.value),
        GiftCurrencys: [...gc.querySelectorAll("input")].map(i => +i.value)
    });

    rm.onclick = () => card.remove();

    if (type === "Bundle") {
        bundlesDiv.appendChild(card);
    } else {
        itemsDiv.appendChild(card);
    }
}

/* =========================================================
   OFFER
========================================================= */

function createDate() {
    const d = document.createElement("div");
    d.className = "date-inline";

    const makeSelect = (max) => {
        const s = document.createElement("select");
        s.add(new Option(-1, -1));
        for (let i = 1; i <= max; i++) {
            s.add(new Option(i, i));
        }
        return s;
    };

    d.append(makeSelect(31), makeSelect(12), makeSelect(50));
    return d;
}

function addOffer(data = {}) {
    const card = document.createElement("div");
    card.className = "offer card";

    card.innerHTML = `
        <div class="card-header">
            <div class="title">Offer</div>
            <div class="chevron">▾</div>
        </div>

        <div class="card-body">
            <div class="card-actions">
                <button class="secondary">📄</button>
                <button class="danger">❌</button>
            </div>

            <div class="row"><b>Base Item:</b><select class="base"></select></div>
            <div class="row"><b>Offer Item:</b><select class="offerItem"></select></div>

            <div class="row"><b>Offer Type:</b>
                <select class="offerType">
                    <option>Manual</option>
                    <option>TimeBased</option>
                </select>
            </div>

            <div class="row manual"><b>Active:</b>
                <select class="active">
                    <option>false</option>
                    <option>true</option>
                </select>
            </div>

            <div class="row time" style="display:none"><b>Start Date:</b></div>
            <div class="row time" style="display:none"><b>End Date:</b></div>
        </div>
    `;

    const baseSel  = card.querySelector(".base");
    const offerSel = card.querySelector(".offerItem");

    getAllItemIDs().forEach(id => {
        baseSel.add(new Option(id, id));
        offerSel.add(new Option(id, id));
    });

    const typeSel = card.querySelector(".offerType");
    const activeSel = card.querySelector(".active");

    typeSel.onchange = () => {
        const isTime = typeSel.value === "TimeBased";
        card.querySelectorAll(".manual").forEach(r => r.style.display = isTime ? "none" : "flex");
        card.querySelectorAll(".time").forEach(r => r.style.display = isTime ? "flex" : "none");
    };
    typeSel.onchange();

    card.querySelectorAll(".time")[0].appendChild(createDate());
    card.querySelectorAll(".time")[1].appendChild(createDate());

    const updateTitle = () => {
        card.querySelector(".title").textContent =
            `Offer: ${baseSel.value} → ${offerSel.value}`;
    };

    baseSel.onchange = updateTitle;
    offerSel.onchange = updateTitle;
    updateTitle();

    card.querySelector(".card-header").onclick = () => {
        card.classList.toggle("collapsed");
    };

    const [dup, rm] = card.querySelectorAll(".card-actions button");
    dup.onclick = () => addOffer({
        itemID: baseSel.value,
        offerItemID: offerSel.value,
        offerType: typeSel.value === "Manual" ? 0 : 2,
        active: activeSel.value === "true"
    });
    rm.onclick = () => card.remove();

    offersDiv.appendChild(card);
}

/* =========================================================
   EXPORT (WORKING)
========================================================= */

function exportJSON() {
    const output = { items: {}, bundles: {}, offers: {} };

    document.querySelectorAll(".product.card").forEach(card => {
        const inputs = card.querySelectorAll("input");
        const arrays = card.querySelectorAll(".array-block");

        const gift = {
            events: arrays[0].querySelectorAll("input").length
                ? [...arrays[0].querySelectorAll("input")].map(i => i.value)
                : -4.0,
            powers: arrays[1].querySelectorAll("input").length
                ? [...arrays[1].querySelectorAll("input")].map(i => +i.value)
                : -4.0,
            currencys: arrays[2].querySelectorAll("input").length
                ? [...arrays[2].querySelectorAll("input")].map(i => +i.value)
                : -4.0
        };

        const obj = {
            ProductID: inputs[1].value,
            ItemID: inputs[0].value,
            Gift: gift,
            IsConsumable: card.classList.contains("item"),
            Price: +inputs[4].value,
            Desc: inputs[3].value,
            Title: inputs[2].value
        };

        if (card.classList.contains("item")) {
            output.items[obj.ItemID] = obj;
        } else {
            output.bundles[obj.ItemID] = obj;
        }
    });

    document.querySelectorAll(".offer.card").forEach(card => {
        const base = card.querySelector(".base").value;
        const offer = card.querySelector(".offerItem").value;
        const type = card.querySelector(".offerType").value;
        const active = card.querySelector(".active").value === "true";

        const dates = card.querySelectorAll(".date-inline select");

        const start = {
            day: +dates[0].value,
            month: +dates[1].value,
            year: +dates[2].value,
            hour: 0, minute: 0, second: 0
        };

        const end = {
            day: +dates[3].value,
            month: +dates[4].value,
            year: +dates[5].value,
            hour: 0, minute: 0, second: 0
        };

        output.offers[base] = {
            itemID: base,
            offerItemID: offer,
            type: 1,
            offerType: type === "Manual" ? 0 : 2,
            active: active,
            offerData: type === "TimeBased" ? [start, end] : []
        };
    });

    downloadJSON(output);
}

function downloadJSON(data) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    );
    a.download = "store_config.json";
    a.click();
}
