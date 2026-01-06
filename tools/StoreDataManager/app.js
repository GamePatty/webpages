const productsDiv = document.getElementById("products");
const offersDiv = document.getElementById("offers");

document.getElementById("addProductBtn").onclick = () => addProduct();
document.getElementById("addOfferBtn").onclick = () => addOffer();
document.getElementById("exportBtn").onclick = exportJSON;
document.getElementById("importInput").onchange = importJSON;

/* ================= UTIL ================= */

function getItemIDs() {
    return [...productsDiv.querySelectorAll(".itemid")].map(i => i.value);
}

function uniqueItemID(base) {
    let i = 1, id = base;
    while (getItemIDs().includes(id)) {
        id = `${base}_copy${i++}`;
    }
    return id;
}

function refreshOfferDropdowns() {
    offersDiv.querySelectorAll(".offer").forEach(fillOfferProducts);
}

/* ================= ARRAY ================= */

function arrayField(label, type, values = []) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<b>${label}:</b>`;
    const list = document.createElement("div");
    list.className = "array";

    values.forEach(v => addArrayItem(list, type, v));

    const btn = document.createElement("button");
    btn.textContent = "➕ Add";
    btn.onclick = () => addArrayItem(list, type, "");

    wrap.append(list, btn);
    return wrap;
}

function addArrayItem(list, type, value) {
    const row = document.createElement("div");
    row.innerHTML = `<input type="${type}" value="${value}"><button>✖</button>`;
    row.querySelector("button").onclick = () => row.remove();
    list.appendChild(row);
}

function readArray(container, isNumber) {
    const vals = [...container.querySelectorAll("input")]
        .map(i => isNumber ? Number(i.value) : i.value)
        .filter(v => v !== "" && !Number.isNaN(v));
    return vals.length ? vals : -4.0;
}

/* ================= PRODUCTS ================= */

function addProduct(data = {}) {
    const p = document.createElement("div");
    p.className = "product";

    p.innerHTML = `
        <div class="card-actions">
            <button class="secondary">📄 Duplicate</button>
            <button class="danger">❌ Remove</button>
        </div>

        <div class="row"><b>StoreProductType:</b>
            <select><option>Item</option><option>Bundle</option></select>
        </div>
        <div class="row"><b>ItemID:</b> <input class="itemid"></div>
        <div class="row"><b>ProductID:</b> <input></div>
        <div class="row"><b>Title:</b> <input></div>
        <div class="row"><b>Desc:</b> <input></div>
        <div class="row"><b>Price:</b> <input type="number" step="any"></div>
    `;

    const i = p.querySelectorAll("input, select");
    i[0].value = data.StoreProductType || "Item";
    i[1].value = data.ItemID || uniqueItemID("item");
    i[2].value = data.ProductID || "";
    i[3].value = data.Title || "";
    i[4].value = data.Desc || "";
    i[5].value = data.Price || 0;
    i[1].oninput = refreshOfferDropdowns;

    const ge = arrayField("GiftEvents (string)", "text", data.GiftEvents || []);
    const gp = arrayField("GiftPowers (real)", "number", data.GiftPowers || []);
    const gc = arrayField("GiftCurrencys (real)", "number", data.GiftCurrencys || []);

    p.append(ge, gp, gc);

    const [dup, rm] = p.querySelectorAll(".card-actions button");

    dup.onclick = () => addProduct({
        StoreProductType: i[0].value,
        ItemID: uniqueItemID(i[1].value),
        ProductID: i[2].value,
        Title: i[3].value,
        Desc: i[4].value,
        Price: i[5].value,
        GiftEvents: readArray(ge, false) === -4.0 ? [] : readArray(ge, false),
        GiftPowers: readArray(gp, true) === -4.0 ? [] : readArray(gp, true),
        GiftCurrencys: readArray(gc, true) === -4.0 ? [] : readArray(gc, true)
    });

    rm.onclick = () => { p.remove(); refreshOfferDropdowns(); };

    productsDiv.appendChild(p);
    refreshOfferDropdowns();
}

/* ================= OFFERS ================= */

function dateDropdown(values = {}) {
    const wrap = document.createElement("div");
    wrap.className = "inline";

    const make = arr => {
        const s = document.createElement("select");
        arr.forEach(v => {
            const o = document.createElement("option");
            o.value = v;
            o.textContent = v;
            s.appendChild(o);
        });
        return s;
    };

    const day = make([-1, ...Array.from({ length: 31 }, (_, i) => i + 1)]);
    const month = make([-1, ...Array.from({ length: 12 }, (_, i) => i + 1)]);
    const year = make([-1, ...Array.from({ length: 20 }, (_, i) => 2024 + i)]);

    day.value = values.day ?? -1;
    month.value = values.month ?? -1;
    year.value = values.year ?? -1;

    wrap.append(day, month, year);
    return wrap;
}

function fillOfferProducts(o) {
    const ids = getItemIDs();
    o.querySelectorAll(".np,.op").forEach(sel => {
        const prev = sel.value;
        sel.innerHTML = "";
        ids.forEach(id => sel.add(new Option(id, id)));
        if (ids.includes(prev)) sel.value = prev;
    });
}

function addOffer(data = {}) {
    const o = document.createElement("div");
    o.className = "offer";

    o.innerHTML = `
        <div class="card-actions">
            <button class="secondary">📄 Duplicate</button>
            <button class="danger">❌ Remove</button>
        </div>

        <div class="row"><b>Normal Product:</b> <select class="np"></select></div>
        <div class="row"><b>Offer Product:</b> <select class="op"></select></div>
        <div class="row"><b>Offer Type:</b>
            <select class="otype"><option>Manual</option><option>TimeBased</option></select>
        </div>
        <div class="row manual"><b>Active:</b>
            <select class="active"><option>false</option><option>true</option></select>
        </div>
        <div class="row time" style="display:none"><b>Start Date:</b></div>
        <div class="row time" style="display:none"><b>End Date:</b></div>
    `;

    const typeSel = o.querySelector(".otype");
    typeSel.onchange = () => toggleOffer(typeSel);

    o.querySelectorAll(".row.time")[0].appendChild(dateDropdown(data.StartDate));
    o.querySelectorAll(".row.time")[1].appendChild(dateDropdown(data.EndDate));

    const [dup, rm] = o.querySelectorAll(".card-actions button");
    dup.onclick = () => addOffer(data);
    rm.onclick = () => o.remove();

    offersDiv.appendChild(o);
    fillOfferProducts(o);
}

/* ================= IMPORT / EXPORT ================= */

function exportJSON() {
    const result = { items:{}, bundles:{}, offers:{} };

    productsDiv.querySelectorAll(".product").forEach(p => {
        const i = p.querySelectorAll("input, select");
        const a = p.querySelectorAll(".array");

        const obj = {
            ProductID: i[2].value,
            ItemID: i[1].value,
            Gift: {
                powers: readArray(a[1], true),
                currencys: readArray(a[2], true),
                events: readArray(a[0], false)
            },
            IsConsumable: i[0].value === "Item",
            Price: Number(i[5].value),
            Desc: i[4].value,
            Title: i[3].value
        };

        (i[0].value === "Item" ? result.items : result.bundles)[obj.ItemID] = obj;
    });

    offersDiv.querySelectorAll(".offer").forEach(o => {
        const s = o.querySelectorAll("select");
        result.offers[s[0].value  + "_offer"] = {
            itemID: s[0].value,
            offerItemID: s[1].value,
            type: 1,
            offerType: s[2].value === "Manual" ? 0 : 2,
            offerData: [
                { day:+s[4].value, month:+s[5].value, year:+s[6].value, hour:0, minute:0, second:0 },
                { day:+s[7].value, month:+s[8].value, year:+s[9].value, hour:0, minute:0, second:0 }
            ]
        };
    });

    downloadJSON(result);
}

function importJSON(e) {
    const reader = new FileReader();
    reader.onload = ev => alert("Import logic can map this JSON back if needed.");
    reader.readAsText(e.target.files[0]);
}

function downloadJSON(data) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)]));
    a.download = "store_config.json";
    a.click();
}
