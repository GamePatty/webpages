document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       DOM
    ========================================================= */

    const bundlesDiv = document.getElementById("bundles");
    const itemsDiv   = document.getElementById("items");
    const offersDiv  = document.getElementById("offers");
    const importInput = document.getElementById("importInput");

    document.getElementById("addBundleBtn").onclick = () => addProduct("Bundle");
    document.getElementById("addItemBtn").onclick   = () => addProduct("Item");
    document.getElementById("addOfferBtn").onclick  = () => addOffer();

    document.getElementById("exportBtn").onclick = exportJSON;
    importInput.onchange = importJSON;
	
	document.getElementById("copyJsonBtn").onclick = copyJSONToClipboard;
	document.getElementById("pasteJsonBtn").onclick = pasteJSONFromClipboard;

    document.getElementById("collapseAllBtn").onclick =
        () => document.querySelectorAll(".card").forEach(c => c.classList.add("collapsed"));
    document.getElementById("expandAllBtn").onclick =
        () => document.querySelectorAll(".card").forEach(c => c.classList.remove("collapsed"));

    document.getElementById("themeToggle").onclick = toggleTheme;

    /* =========================================================
       THEME
    ========================================================= */

    if (localStorage.theme === "dark") document.body.classList.add("dark");

    function toggleTheme() {
        document.body.classList.toggle("dark");
        localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light";
    }

    /* =========================================================
       UTIL
    ========================================================= */

    function getAllItemIDs() {
        return [...document.querySelectorAll(".itemid")].map(i => i.value).filter(Boolean);
    }

    function uniqueID(base) {
        let i = 1, id = base;
        const ids = getAllItemIDs();
        while (ids.includes(id)) id = `${base}_copy${i++}`;
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
                    <button class="secondary dup">📄</button>
                    <button class="danger del">❌</button>
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
        inputs[4].value = data.Price ?? 0;

        const updateTitle = () => {
            card.querySelector(".title").textContent =
                `${inputs[0].value} (${inputs[1].value})`;
        };
        inputs[0].oninput = inputs[1].oninput = updateTitle;
        updateTitle();

        card.querySelector(".card-header").onclick =
            () => card.classList.toggle("collapsed");

        const gift = data.Gift || {};
        const ge = createArray("GiftEvents", "text",
            gift.events === -4 ? [] : (gift.events || []));
        const gp = createArray("GiftPowers", "number",
            gift.powers === -4 ? [] : (gift.powers || []));
        const gc = createArray("GiftCurrencys", "number",
            gift.currencys === -4 ? [] : (gift.currencys || []));

        card.querySelector(".card-body").append(ge, gp, gc);

        // DUPLICATE PRODUCT
        card.querySelector(".dup").onclick = () => {
            addProduct(type, {
                ItemID: uniqueID(inputs[0].value),
                ProductID: inputs[1].value,
                Title: inputs[2].value,
                Desc: inputs[3].value,
                Price: inputs[4].value,
                Gift: {
                    events: [...ge.querySelectorAll("input")].map(i => i.value),
                    powers: [...gp.querySelectorAll("input")].map(i => +i.value),
                    currencys: [...gc.querySelectorAll("input")].map(i => +i.value)
                }
            });
        };

        card.querySelector(".del").onclick = () => card.remove();

        (type === "Bundle" ? bundlesDiv : itemsDiv).appendChild(card);
    }

    /* =========================================================
       OFFER
    ========================================================= */

    function createDateFromData(d) {
        const wrap = document.createElement("div");
        wrap.className = "date-inline";

        const make = (max, val) => {
            const s = document.createElement("select");
            s.add(new Option(-1, -1));
            for (let i = 1; i <= max; i++) {
                const o = new Option(i, i);
                if (i === val) o.selected = true;
                s.add(o);
            }
            return s;
        };

        wrap.append(
            make(31, d?.day),
            make(12, d?.month),
            make(50, d?.year)
        );
        return wrap;
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
                    <button class="secondary dup">📄</button>
                    <button class="danger del">❌</button>
                </div>

                <div class="row"><b>Base Item:</b><select class="base"></select></div>
                <div class="row"><b>Offer Item:</b><select class="offerItem"></select></div>

                <div class="row"><b>Offer Type:</b>
                    <select class="offerType">
                        <option value="0">Manual</option>
                        <option value="2">TimeBased</option>
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

        baseSel.value = data.itemID || baseSel.options[0]?.value || "";
        offerSel.value = data.offerItemID || "";

        const typeSel = card.querySelector(".offerType");
        typeSel.value = String(data.offerType ?? 0);

        const activeSel = card.querySelector(".active");
        activeSel.value = String(data.active ?? false);

        const times = card.querySelectorAll(".time");
        times[0].appendChild(createDateFromData(data.offerData?.[0]));
        times[1].appendChild(createDateFromData(data.offerData?.[1]));

        const refresh = () => {
            const isTime = typeSel.value === "2";
            card.querySelectorAll(".manual").forEach(r => r.style.display = isTime ? "none" : "flex");
            times.forEach(r => r.style.display = isTime ? "flex" : "none");
            card.querySelector(".title").textContent =
                `Offer: ${baseSel.value} → ${offerSel.value}`;
        };

        baseSel.onchange = refresh;
        offerSel.onchange = refresh;
        typeSel.onchange = refresh;
        refresh();

        card.querySelector(".card-header").onclick =
            () => card.classList.toggle("collapsed");

        // DUPLICATE OFFER
        card.querySelector(".dup").onclick = () => {
            addOffer({
                itemID: baseSel.value,
                offerItemID: offerSel.value,
                offerType: +typeSel.value,
                active: activeSel.value === "true",
                offerData: data.offerData
            });
        };

        card.querySelector(".del").onclick = () => card.remove();

        offersDiv.appendChild(card);
    }

    /* =========================================================
       IMPORT
    ========================================================= */
	
function loadFromJSON(json) {
    bundlesDiv.innerHTML = "";
    itemsDiv.innerHTML = "";
    offersDiv.innerHTML = "";

    Object.values(json.items || {}).forEach(p => addProduct("Item", p));
    Object.values(json.bundles || {}).forEach(p => addProduct("Bundle", p));
    Object.values(json.offers || {}).forEach(o => addOffer(o));
}

function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const json = JSON.parse(reader.result);
        loadFromJSON(json);
    };
    reader.readAsText(file);
}


    /* =========================================================
       EXPORT
    ========================================================= */

function buildExportJSON() {

    // but return `out` instead of downloading
        const out = { items:{}, bundles:{}, offers:{} };

        document.querySelectorAll(".product.card").forEach(card => {
            const inputs = card.querySelectorAll("input");
            const arrays = card.querySelectorAll(".array-block");

            const gift = {
                events: arrays[0].querySelectorAll("input").length
                    ? [...arrays[0].querySelectorAll("input")].map(i => i.value)
                    : -4,
                powers: arrays[1].querySelectorAll("input").length
                    ? [...arrays[1].querySelectorAll("input")].map(i => +i.value)
                    : -4,
                currencys: arrays[2].querySelectorAll("input").length
                    ? [...arrays[2].querySelectorAll("input")].map(i => +i.value)
                    : -4
            };

            const obj = {
                ItemID: inputs[0].value,
                ProductID: inputs[1].value,
                Title: inputs[2].value,
                Desc: inputs[3].value,
                Price: +inputs[4].value,
                IsConsumable: card.classList.contains("item"),
                Gift: gift
            };

            (card.classList.contains("item") ? out.items : out.bundles)[obj.ItemID] = obj;
        });

        document.querySelectorAll(".offer.card").forEach(card => {
            const base = card.querySelector(".base").value;
            const offer = card.querySelector(".offerItem").value;
            const type = +card.querySelector(".offerType").value;
            const active = card.querySelector(".active").value === "true";

            const dates = card.querySelectorAll(".date-inline select");
            const start = {
                day:+dates[0].value, month:+dates[1].value, year:+dates[2].value,
                hour:0, minute:0, second:0
            };
            const end = {
                day:+dates[3].value, month:+dates[4].value, year:+dates[5].value,
                hour:0, minute:0, second:0
            };

            out.offers[base] = {
                itemID: base,
                offerItemID: offer,
                type: 1,
                offerType: type,
                active: active,
                offerData: type === 2 ? [start, end] : []
            };
        });

        const blob = new Blob(
            [JSON.stringify(out, null, 2)],
            { type: "application/json" }
        );
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "store_config.json";
        a.click();
		
	    return out;	
    }

function exportJSON() {
    const out = buildExportJSON();
    downloadJSON(out);
}


function copyJSONToClipboard() {
    const data = buildExportJSON(); // reuse same structure as Export
    const text = JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(text)
        .then(() => alert("JSON copied to clipboard"))
        .catch(() => alert("Clipboard access failed"));
}

async function pasteJSONFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const json = JSON.parse(text);

        if (
            typeof json !== "object" ||
            (!json.items && !json.bundles && !json.offers)
        ) {
            alert("Clipboard does not contain valid store JSON");
            return;
        }

        loadFromJSON(json); // reuse import logic
        alert("JSON loaded from clipboard");
    } catch (e) {
        alert("Invalid JSON in clipboard");
    }
}


});