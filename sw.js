/* ==========================
   STORAGE
========================== */
let list = JSON.parse(localStorage.getItem("candidates") || "[]");
let salesList = JSON.parse(localStorage.getItem("salesList") || `["Sales A","Sales B","Sales C"]`);
let statusList = JSON.parse(localStorage.getItem("statusList") || `["pending","approval","reject"]`);

/* ==========================
   DATE FORMAT
========================== */
function getCurrentDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

/* ==========================
   LOAD DROPDOWNS
========================== */
function loadDropdowns() {

  /* SALES SEARCH DROPDOWN */
  const search = document.getElementById("salesSearch");
  const menu = document.getElementById("salesMenu");

  const renderSales = (keyword = "") => {
    menu.innerHTML = "";
    salesList
      .filter(s => s.toLowerCase().includes(keyword.toLowerCase()))
      .forEach(s => {
        let item = document.createElement("button");
        item.className = "dropdown-item";
        item.innerText = s;
        item.onclick = () => {
          search.value = s;
          menu.classList.remove("show");
        };
        menu.appendChild(item);
      });
  };

  search.addEventListener("input", () => {
    renderSales(search.value);
    menu.classList.add("show");
  });

  search.addEventListener("focus", () => menu.classList.add("show"));

  document.addEventListener("click", e => {
    if (!search.contains(e.target) && !menu.contains(e.target))
      menu.classList.remove("show");
  });

  renderSales("");

  /* STATUS DROPDOWN */
  if (!statusList.length) statusList = ["pending"];

  document.getElementById("status").innerHTML =
    statusList.map(s => `<option value="${s}">${s}</option>`).join("");

  /* SYNC TEXTAREAS */
  document.getElementById("editSales").value = salesList.join("\n");
  document.getElementById("editStatus").value = statusList.join("\n");
}

/* ==========================
   UPDATE CONFIG
========================== */
function updateDropdowns() {
  salesList = document.getElementById("editSales").value
    .split("\n").map(x => x.trim()).filter(x => x);

  statusList = document.getElementById("editStatus").value
    .split("\n").map(x => x.trim()).filter(x => x);

  if (!statusList.length) statusList = ["pending"];

  localStorage.setItem("salesList", JSON.stringify(salesList));
  localStorage.setItem("statusList", JSON.stringify(statusList));

  loadDropdowns();
  renderCounters();
  renderSalesChart();
}

/* ==========================
   RENDER TABLE
========================== */
function renderTable() {
  let tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  list.forEach((item, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${item.name}</td>
        <td>${item.exp}</td>
        <td>${item.sales}</td>
        <td>${item.position}</td>
        <td>${item.status}</td>
        <td>${item.createdDate}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteItem(${i})">Xóa</button></td>
      </tr>
    `;
  });

  renderCounters();
  renderSalesChart();
}

/* ==========================
   COUNTERS
========================== */
function renderCounters() {
  let ctr = document.getElementById("statusCounters");
  ctr.innerHTML = "";

  statusList.forEach(st => {
    let count = list.filter(x => x.status === st).length;

    ctr.innerHTML += `
      <div class="col-md-3 mb-2">
        <div class="p-3 border bg-white rounded">
          <b>${st}</b>: ${count}
        </div>
      </div>
    `;
  });
}

/* ==========================
   SALES CHART (NEW)
========================== */
let salesChartInstance = null;

function renderSalesChart() {
  const ctx = document.getElementById("salesChart");
  if (!ctx) return;

  const labels = salesList;

  const values = labels.map(sales =>
    list.filter(x => x.sales === sales).length
  );

  if (salesChartInstance) salesChartInstance.destroy();

  salesChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Tổng số ứng viên",
          data: values,
          backgroundColor: "rgba(54,162,235,0.6)",
          borderColor: "rgba(54,162,235,1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        tooltip: {
          callbacks: {
            /* TOOLTIP HIỆN CHI TIẾT STATUS */
            afterLabel: function(context) {
              let sales = context.label;
              let text = "";

              statusList.forEach(st => {
                let c = list.filter(x => x.sales === sales && x.status === st).length;
                text += `\n${st}: ${c}`;
              });

              return text;
            }
          }
        }
      }
    }
  });
}

/* ==========================
   ADD CANDIDATE
========================== */
function addCandidate() {
  list.push({
    name: candidateName.value,
    exp: exp.value,
    sales: salesSearch.value,
    position: position.value,
    status: document.getElementById("status").value,
    createdDate: getCurrentDate()
  });

  localStorage.setItem("candidates", JSON.stringify(list));

  candidateName.value = "";
  exp.value = "";
  salesSearch.value = "";
  position.value = "";

  renderTable();
}

/* ==========================
   DELETE
========================== */
function deleteItem(i) {
  list.splice(i, 1);
  localStorage.setItem("candidates", JSON.stringify(list));
  renderTable();
}

/* ==========================
   EXPORT
========================== */
function exportExcel() {
  let wb = XLSX.utils.book_new();
  let data = [["STT","Tên","KN","Sales","Vị trí","Status","Ngày tạo"]];

  list.forEach((x,i) => {
    data.push([i+1, x.name, x.exp, x.sales, x.position, x.status, x.createdDate]);
  });

  let ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách");

  XLSX.writeFile(wb, "Ung_vien.xlsx");
}

/* ==========================
   INIT
========================== */
loadDropdowns();
renderTable();