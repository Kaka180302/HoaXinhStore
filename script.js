
// *******************Header********************
const header = document.querySelector('.header_info');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// *******************Slider_top****************

const slides = document.querySelector(".slider_item")

let index = 1
const total = 4

slides.style.transform = "translateX(-100%)"

function updateDot(i){
  document.getElementById("s"+i).checked = true
}

function nextSlide(){

  index++

  slides.style.transition = "0.6s"
  slides.style.transform = `translateX(-${index*100}%)`

  if(index <= total){
    updateDot(index)
  }

  if(index == total + 1){

    setTimeout(()=>{
      slides.style.transition = "none"
      index = 1
      slides.style.transform = "translateX(-100%)"
      updateDot(1)
    },600)

  }

}
setInterval(nextSlide,3000)
// *****************End_Slider_Top*********************

// ******************Slider_product********************
const slider = document.querySelector(".product_slider")
const slide = document.querySelectorAll(".products_item--img")

const prevBtn = document.querySelector(".product_button--prev")
const nextBtn = document.querySelector(".product_button--next")

let indexP = 0
const totalP = slide.length

function updateSlide(){
  slider.style.transform = `translateX(-${indexP * 100}%)`
}

// next
nextBtn.addEventListener("click", ()=>{
  indexP++

  if(indexP >= totalP){
    indexP = 0
  }

  updateSlide()
})

// prev
prevBtn.addEventListener("click", ()=>{
  indexP--

  if(indexP < 0){
    indexP = totalP - 1
  }

  updateSlide()
})

// auto slide
setInterval(()=>{
  indexP++

  if(indexP >= totalP){
    indexP = 0
  }

  updateSlide()

},7000)
// *******************End_Slider_Product**********************

// **************************Form_Popup***********************

const orderPopup = document.getElementById("order")
const closeBtn = document.querySelector(".order__close")
const productBtnSelector = ".product_buyBtn, .product_hoverBtn, .product_buyBtn--detail"

const productBox = document.getElementById("orderProducts")
const addProductBtn = document.getElementById("addProduct")
const totalEl = document.getElementById("orderTotal")

const paymentMethod = document.getElementById("paymentMethod")
const qrBox = document.getElementById("qrBox")

let products = []

function getSheetProductsForOrder() {
  return Array.isArray(window.googleSheetProductsForOrder)
    ? window.googleSheetProductsForOrder
    : []
}

function buildOrderOptionsHtml(selectedName = "", selectedPrice = "") {
  const sheetProducts = getSheetProductsForOrder()

  let optionsHtml = '<option value="">--Chon san pham--</option>'

  if (sheetProducts.length) {
    optionsHtml += sheetProducts.map((product) => {
      const isSelected = product.name === selectedName ? " selected" : ""
      const safeName = String(product.name || "").replace(/"/g, "&quot;")
      const safePrice = String(product.price || "").replace(/"/g, "&quot;")

      return `<option value="${safeName}" data-price="${safePrice}"${isSelected}>${safeName}</option>`
    }).join("")

    return optionsHtml
  }

  optionsHtml += `
      <option data-price="24000">Mat na chong lao hoa - 24,000d</option>
      <option data-price="350000">Mieng tay trang - 350,000d</option>
      <option data-price="400000">Kem chong nang - 400,000d</option>
  `

  return optionsHtml
}

function refreshOrderProductSelects() {
  document.querySelectorAll(".order__productRow .order__select").forEach((select) => {
    const selectedOption = select.options[select.selectedIndex]
    const selectedName = selectedOption ? selectedOption.text : ""
    const selectedPrice = selectedOption ? selectedOption.dataset.price || "" : ""

    select.innerHTML = buildOrderOptionsHtml(selectedName, selectedPrice)

    if (selectedName && !Array.from(select.options).some((option) => option.text === selectedName)) {
      const customOption = document.createElement("option")
      customOption.text = selectedName
      customOption.value = selectedName
      customOption.dataset.price = selectedPrice || 0
      customOption.selected = true
      select.appendChild(customOption)
    }
  })

  updateTotal()
}

function openOrder(){
  orderPopup.classList.add("active")
}

function resetOrderForm(){

    // xoá danh sách sản phẩm
    productBox.innerHTML = ""

    // reset tổng tiền
    totalEl.innerText = "0"

    // reset form
    document.getElementById("orderForm").reset()

    // ẩn QR
    qrBox.style.display = "none"

}

function closeOrder(){
  orderPopup.classList.remove("active")

  resetOrderForm()
}

closeBtn.onclick = closeOrder



function bindDynamicProductButtons() {
  document.querySelectorAll(productBtnSelector).forEach(btn=>{
    if (btn.dataset.orderBound === "true") {
      return
    }

    btn.dataset.orderBound = "true"

    btn.addEventListener("click",()=>{

        openOrder()

        addProduct(
          btn.dataset.name,
          btn.dataset.price
        )
    })
  })
}

bindDynamicProductButtons()
window.bindDynamicProductButtons = bindDynamicProductButtons
window.refreshOrderProductSelects = refreshOrderProductSelects



function addProduct(name = "", price = 0){

  const row = document.createElement("div")
  row.className = "order__productRow"

  row.innerHTML = `

    <select class="order__select">

      <option value="">--Chọn sản phẩm--</option>

      <option data-price="24000">Mặt nạ chống lão hoá - 24,000đ</option>

      <option data-price="350000">Miếng tẩy trang - 350,000đ</option>

      <option data-price="400000">Kem chống nắng - 400,000đ</option>

    </select>

    <input
      type="number"
      name = "qty"
      class="order__qty"
      value="1"
      min="1"
    >

    <button type="button" class="order__remove">
      x
    </button>
  `

  productBox.appendChild(row)

  // chọn đúng sản phẩm khi mở popup
  if(name){

    const select = row.querySelector("select")
    let hasMatchedOption = false

    for(let option of select.options){

      if(option.text === name){
        option.selected = true
        hasMatchedOption = true
      }

    }

    if(!hasMatchedOption){
      const customOption = document.createElement("option")
      customOption.text = name
      customOption.value = name
      customOption.dataset.price = price || 0
      customOption.selected = true
      select.appendChild(customOption)
    }

  }

  updateTotal()
}

function addProduct(name = "", price = 0){

  const row = document.createElement("div")
  row.className = "order__productRow"

  row.innerHTML = `

    <select class="order__select">
      ${buildOrderOptionsHtml(name, price)}
    </select>

    <input
      type="number"
      name = "qty"
      class="order__qty"
      value="1"
      min="1"
    >

    <button type="button" class="order__remove">
      x
    </button>
  `

  productBox.appendChild(row)

  if(name){

    const select = row.querySelector("select")
    let hasMatchedOption = false

    for(let option of select.options){

      if(option.text === name){
        option.selected = true
        hasMatchedOption = true
      }

    }

    if(!hasMatchedOption){
      const customOption = document.createElement("option")
      customOption.text = name
      customOption.value = name
      customOption.dataset.price = price || 0
      customOption.selected = true
      select.appendChild(customOption)
    }

  }

  updateTotal()
}



  addProductBtn.onclick = ()=>{

    addProduct()

  }



  productBox.addEventListener("click",(e)=>{

    if(e.target.classList.contains("order__remove")){

    e.target.parentElement.remove()

    updateTotal()

    }

  })


productBox.addEventListener("change",updateTotal)
productBox.addEventListener("input",updateTotal)



function updateTotal(){

  let total = 0

  document.querySelectorAll(".order__productRow")
  .forEach(row=>{

    const select = row.querySelector("select")
    const qty = row.querySelector("input").value

    const price = select.options[select.selectedIndex]?.dataset.price

    if(price){

      total += price * qty

    }

  })

    totalEl.innerText = total.toLocaleString()
    document.getElementById("orderTotalInput").value = total

}



paymentMethod.onchange = ()=>{

  if(paymentMethod.value === "qr"){

    qrBox.style.display="block"

  }else{

  qrBox.style.display="none"

  }
}

// **********Validate*********************

function validatePhone(phone){

  const regex = /^(0[3|5|7|8|9])[0-9]{8}$/

  return regex.test(phone)

}


const submitBtn = document.getElementById("orderSubmit")
const customerPhone = document.getElementById("customerPhone")
const inputs = document.querySelectorAll("#customerName,#customerEmail,#customerPhone,#customerAddress")

function checkForm(){

  let valid = true

  inputs.forEach(input=>{

    if(input.value.trim()===""){
    valid=false
  }

  })

  if(document.querySelectorAll(".order__productRow").length === 0){
    valid = false
  }

  if(!validatePhone(customerPhone.value)){
    valid=false
  }

  submitBtn.disabled = !valid

}

inputs.forEach(input=>{

  input.addEventListener("input",checkForm)

})

// ***********Notification***********************

const successPopup = document.getElementById("successPopup")
const successOk = document.getElementById("successOk")

successOk.onclick = ()=>{
  successPopup.classList.remove("active")
}

// ******************Form_Submit*****************

const scriptURL = "https://script.google.com/macros/s/AKfycbz2_pxbqLLY2XzMKKNslb8q9RrEhYeabuaq0VF5RrVihz9Ty7Dmj4Z-gvUncNOBWWNm/exec"
const form = document.getElementById("orderForm")

form.addEventListener("submit", function(e){

  e.preventDefault()
  submitBtn.classList.add("loading")
  submitBtn.textContent = "Đang gửi..."

let productList = []

document.querySelectorAll(".order__productRow").forEach(row=>{

  const select = row.querySelector("select")
  const productName = select.options[select.selectedIndex].text.split(" - ")[0]

  const price = select.options[select.selectedIndex].dataset.price
  const qty = row.querySelector(".order__qty").value

  const subtotal = price * qty

  productList.push({
    name: productName,
    price: price,
    qty: qty,
    subtotal: subtotal
  })

})

const products = JSON.stringify(productList)

  const formData = new FormData()

  formData.append("name", document.getElementById("customerName").value)
  formData.append("email", document.getElementById("customerEmail").value)
  formData.append("phone", document.getElementById("customerPhone").value)
  formData.append("address", document.getElementById("customerAddress").value)
  formData.append("product", products)
  formData.append("total", document.getElementById("orderTotalInput").value)

  fetch(scriptURL,{
    method:"POST",
    body: formData
  })
  .then(res=>{
    successPopup.classList.add("active")
    submitBtn.classList.remove("loading")
    submitBtn.textContent = "Đặt hàng"
    closeOrder()
  })
.catch(err=>{
    successPopup.querySelector("p").innerText =
    "❌ Gửi đơn thất bại. Vui lòng thử lại."

    successPopup.classList.add("active")
})
})

// ******************Menu mobile**************************

const menu = document.querySelector(".menu_nav")
const openBtn = document.getElementById("menuToggle")
const closeBtnMobile = document.getElementById("btn_close")

openBtn.onclick = function(){
    menu.classList.add("active")
}

closeBtnMobile.onclick = function(){
    menu.classList.remove("active")
}

document.addEventListener("click", (e) => {

    if(!menu.contains(e.target) && !openBtn.contains(e.target)){
        menu.classList.remove("active")
    }

})

// **********Đóng_mở_ảnh*******************

const productImgs = document.querySelectorAll(".product_listItem--img, .product_listItem--title");
const popups = document.querySelectorAll(".product_popup");
const closeBtns = document.querySelectorAll(".popup_close");

productImgs.forEach(img => {
    img.addEventListener("click", () => {

        const popupId = img.dataset.popup;
        const popup = document.getElementById(popupId);

        popup.classList.add("active");

    });
});


closeBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        btn.closest(".product_popup").classList.remove("active");
    });
});


popups.forEach(popup=>{
    popup.addEventListener("click", (e)=>{

        if(e.target === popup){
            popup.classList.remove("active");
        }

    });
});

const closeDetail = document.querySelectorAll(".product_buyBtn--detail");

closeDetail.forEach(close =>{
  close.addEventListener("click", () => {
      close.closest(".product_popup").classList.remove("active")
    })

})

// ************ SLIDER *************
const track = document.querySelector(".product_track");
const nextBtn_product = document.querySelector(".product_button--next");
const prevBtn_product = document.querySelector(".product_button--prev");

let index_product = 0;
let maxIndex = 0;

const visibleItems = 3;

function getProductItems() {
    return Array.from(document.querySelectorAll(".product_listItem"));
}

function getVisibleProductItems() {
    return getProductItems().filter((item) => item.style.display !== "none");
}

function getItemWidth() {
    const firstVisibleItem = getVisibleProductItems()[0] || getProductItems()[0];

    if (!firstVisibleItem) {
        return 0;
    }

    return firstVisibleItem.offsetWidth + 32;
}

// update button trạng thái
function updateButtons() {
    prevBtn_product.classList.toggle("disabled", index_product === 0);
    nextBtn_product.classList.toggle("disabled", index_product >= maxIndex);
}

// next
nextBtn_product.addEventListener("click", () => {
    if (index_product < maxIndex) {
        index_product++;
        track.style.transform = `translateX(-${index_product * getItemWidth()}px)`;
        updateButtons();
    }
});

// prev
prevBtn_product.addEventListener("click", () => {
    if (index_product > 0) {
        index_product--;
        track.style.transform = `translateX(-${index_product * getItemWidth()}px)`;
        updateButtons();
    }
});


// ************* FILTER FUNCTION (CHUNG) *************
function filterProducts(filter) {

    // reset slider
    index_product = 0;
    track.style.transform = `translateX(0px)`;

    // filter
    getProductItems().forEach(item => {
        const category = item.getAttribute("data-category");

        item.style.display =
            (filter === "all" || filter === category) ? "block" : "none";
    });

    // tính lại maxIndex
    const visibleProducts = getVisibleProductItems();
    maxIndex = Math.max(0, visibleProducts.length - visibleItems);

    updateButtons();
}

function refreshProductSlider() {
    index_product = 0;
    track.style.transform = `translateX(0px)`;
    maxIndex = Math.max(0, getVisibleProductItems().length - visibleItems);
    updateButtons();
}


// ************* CLICK TAB (PRODUCT NAV) *************
const navBtns = document.querySelectorAll(".product_nav--item");

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {

        const filter = btn.getAttribute("data-filter");

        // active tab
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        filterProducts(filter);
    });
});


// ************* CLICK SUBMENU *************
const menuItems = document.querySelectorAll(".menu_product--item");

menuItems.forEach(menu => {
    menu.addEventListener("click", () => {

        const filter = menu.getAttribute("data-filter");

        // active tab bên dưới
        navBtns.forEach(btn => {
            btn.classList.toggle(
                "active",
                btn.getAttribute("data-filter") === filter
            );
        });

        filterProducts(filter);
    });
});

window.filterProducts = filterProducts;
window.refreshProductSlider = refreshProductSlider;
refreshProductSlider();

const cart = document.querySelector(".cart")
const openBtn_cart = document.getElementById("icon_cart")
const closeBtnCart = document.getElementById("btn_closeCart")

openBtn_cart.onclick = function(){
    cart.classList.add("active_cart")
}

closeBtnCart.onclick = function(){
    cart.classList.remove("active_cart")
}

document.addEventListener("click", (e) => {

    if(!cart.contains(e.target) && !openBtn_cart.contains(e.target)){
        cart.classList.remove("active_cart")
    }

})

// **************logo_xoay******************
const orbits = document.querySelectorAll('.orbit');
const totals = orbits.length;

const radius = 190;
const duration = 20;

orbits.forEach((item, index) => {
    const angle = (360 / totals) * index;

    item.style.setProperty('--angle', angle + 'deg');
    item.style.setProperty('--radius', radius + 'px');

    item.style.animation = `spinOrbit ${duration}s linear infinite`;
});
