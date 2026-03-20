(function () {
    const productTrack = document.querySelector(".product_track");

    if (!productTrack) {
        return;
    }

    const sheetId = productTrack.dataset.sheetId?.trim();
    const sheetGid = productTrack.dataset.sheetGid?.trim() || "0";
    const callbackName = `googleSheetProductsCallback_${Date.now()}`;

    window.googleSheetProductsForOrder = [];

    function normalizeHeader(value = "") {
        return value
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
    }

    function normalizeCategory(value = "") {
        const category = normalizeHeader(value);

        if (category.includes("mypham")) {
            return "mypham";
        }

        if (category.includes("thietbi") || category.includes("giadung")) {
            return "thietbi";
        }

        if (category.includes("thucpham")) {
            return "thucpham";
        }

        return "all";
    }

    function escapeHtml(value = "") {
        return value
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatPrice(value = "") {
        const numericValue = Number(value.toString().replace(/[^\d.-]/g, ""));

        if (Number.isNaN(numericValue)) {
            return value || "Lien he";
        }

        return `${numericValue.toLocaleString("vi-VN")} VND`;
    }

    function getCellValue(cell) {
        if (!cell) {
            return "";
        }

        if (typeof cell.f === "string" && cell.f.trim()) {
            return cell.f.trim();
        }

        if (cell.v === null || cell.v === undefined) {
            return "";
        }

        return cell.v.toString().trim();
    }

    function getFieldValue(product, fieldNames) {
        for (const fieldName of fieldNames) {
            const matchedKey = Object.keys(product).find(
                (key) => normalizeHeader(key) === normalizeHeader(fieldName)
            );

            if (matchedKey && product[matchedKey]) {
                return product[matchedKey];
            }
        }

        return "";
    }

    function cleanup(scriptEl) {
        if (scriptEl && scriptEl.parentNode) {
            scriptEl.parentNode.removeChild(scriptEl);
        }

        try {
            delete window[callbackName];
        } catch (error) {
            window[callbackName] = undefined;
        }
    }

    function parseProducts(response) {
        const table = response.table || {};
        const headers = (table.cols || []).map((col) => col.label || col.id || "");
        const rows = table.rows || [];

        return rows.map((row) => {
            const item = {};

            headers.forEach((header, index) => {
                item[header] = getCellValue(row.c ? row.c[index] : null);
            });

            return item;
        }).filter((item) => Object.values(item).some(Boolean));
    }

    function renderProducts(products) {
        if (!products.length) {
            productTrack.innerHTML = '<p class="google-sheet-status">Google Sheet chua co du lieu san pham.</p>';
            return;
        }

        window.googleSheetProductsForOrder = products.map((product) => ({
            name: getFieldValue(product, ["ten", "tensanpham", "sanpham", "name", "productname"]),
            price: getFieldValue(product, ["gia", "price", "giaban"])
        })).filter((product) => product.name);

        const html = products.map((product) => {
            const name = getFieldValue(product, ["ten", "tensanpham", "sanpham", "name", "productname"]);
            const image = getFieldValue(product, ["hinh", "hinhanh", "image", "img", "anh", "photo"]);
            const price = getFieldValue(product, ["gia", "price", "giaban"]);
            const category = getFieldValue(product, ["category", "danhmuc", "loai"]);
            const categoryKey = normalizeCategory(category);

            return `
                <div class="product_listItem" data-category="${escapeHtml(categoryKey)}">
                    <div class="product_imgWrap">
                        <img
                            src="${escapeHtml(image || "https://placehold.co/600x400?text=No+Image")}"
                            alt="${escapeHtml(name || "San pham")}"
                            class="product_listItem--img"
                        >
                    </div>
                    <h3 class="product_listItem--title">${escapeHtml(name || "Chua co ten san pham")}</h3>
                    <div class="product_listItem--cost">${escapeHtml(formatPrice(price))}</div>
                    <button
                        type="button"
                        class="product_hoverBtn"
                        data-name="${escapeHtml(name || "")}"
                        data-price="${escapeHtml(price || "")}"
                    >
                        <svg class="icon_addCart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z" />
                        </svg>
                    </button>
                </div>
            `;
        }).join("");

        productTrack.innerHTML = html;

        if (typeof window.refreshProductSlider === "function") {
            window.refreshProductSlider();
        }

        if (typeof window.filterProducts === "function") {
            const activeBtn = document.querySelector(".product_nav--item.active");
            const activeFilter = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
            window.filterProducts(activeFilter);
        }

        if (typeof window.bindDynamicProductButtons === "function") {
            window.bindDynamicProductButtons();
        }

        if (typeof window.refreshOrderProductSelects === "function") {
            window.refreshOrderProductSelects();
        }
    }

    if (!sheetId) {
        productTrack.innerHTML = '<p class="google-sheet-status">Thieu data-sheet-id de tai du lieu Google Sheet.</p>';
        return;
    }

    productTrack.innerHTML = '<p class="google-sheet-status">Dang tai san pham...</p>';

    const scriptEl = document.createElement("script");

    window[callbackName] = function (response) {
        cleanup(scriptEl);

        try {
            if (response.status === "error") {
                throw new Error(response.errors?.[0]?.detailed_message || "Google Sheet error");
            }

            const products = parseProducts(response);
            renderProducts(products);
        } catch (error) {
            productTrack.innerHTML = '<p class="google-sheet-status">Khong doc duoc du lieu Google Sheet. Kiem tra lai quyen chia se sheet.</p>';
            console.error("Google Sheet render failed:", error);
        }
    };

    scriptEl.onerror = function () {
        cleanup(scriptEl);
        productTrack.innerHTML = '<p class="google-sheet-status">Khong ket noi duoc Google Sheet.</p>';
    };

    scriptEl.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${sheetGid}`;
    document.body.appendChild(scriptEl);
})();
