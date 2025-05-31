```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Constants
  const DEFAULT_VALUES = {
    pcDiLai: 500000,
    pcChuyenCan: 200000,
    pcThamNien: 400000,
  };

  const PERCENTAGES = {
    BHXH: 0.105, // Social insurance deduction (10.5%)
    CONG_DOAN: 0.01, // Union fee deduction (1%)
    TC_150: 1.5,
    TC_200: 2,
    TC_300: 3,
    TC_340: 3.4,
    TC_DEM_30: 0.3,
    TC_DEM_70: 0.7,
    NGAY_CONG_200: 2,
  };

  // Cache DOM elements
  const DOM = {
    luongCoBan: document.getElementById("luongCoBan"),
    ngayCongChuan: document.getElementById("ngayCongChuan"),
    pcThamNien: document.getElementById("pcThamNien"),
    pcChucVu: document.getElementById("pcChucVu"),
    pcDiLai: document.getElementById("pcDiLai"),
    pcChuyenCan: document.getElementById("pcChuyenCan"),
    pcABC: document.getElementById("pcABC"),
    pcDienThoai: document.getElementById("pcDienThoai"),
    pcTreEm: document.getElementById("pcTreEm"),
    pcKhac: document.getElementById("pcKhac"),
    tongLuong: document.getElementById("tongLuong"),
    tienTruBHXH: document.getElementById("tienTruBHXH"),
    tienTruCD: document.getElementById("tienTruCD"),
    thucLinh: document.getElementById("thucLinh"),
    tienNgayLeTet: document.getElementById("tienNgayLeTet"),
  };

  const MAIN_TABLE_FIELDS = [
    { input: "ngayCong", output: "tienNgayCong", multiplier: 1, unit: "ngayCong" },
    { input: "tc150", output: "tienTC150", multiplier: PERCENTAGES.TC_150, unit: "tangCa" },
    { input: "tc200", output: "tienTC200", multiplier: PERCENTAGES.TC_200, unit: "tangCa" },
    { input: "tcDem30", output: "tienDem30", multiplier: PERCENTAGES.TC_DEM_30, unit: "troCapDem" },
    { input: "ngayCong200", output: "tienCong200", multiplier: PERCENTAGES.NGAY_CONG_200, unit: "ngayCong" },
    { input: "tc300", output: "tienTC300", multiplier: PERCENTAGES.TC_300, unit: "tangCa" },
    { input: "tc340", output: "tienTC340", multiplier: PERCENTAGES.TC_340, unit: "tangCa" },
    { input: "tcDem70", output: "tienDem70", multiplier: PERCENTAGES.TC_DEM_70, unit: "troCapDem" },
    { input: "phepNam", output: "tienPhepNam", multiplier: 1, unit: "ngayCong" },
    { input: "le", output: "tienLe", multiplier: 1, unit: "ngayCong" },
  ];

  const PHU_TABLE_FIELDS = [
    { hours: "soGioHanhChinh1", rate: "phuLuongHanhChinh", output: "tienHanhChinh", type: "hanhChinh" },
    { hours: "soGioTangCa1", rate: "phuLuongTangCa", output: "tienTangCa", type: "tangCa" },
    { hours: "soGioDem1", rate: "phuLuongDem", output: "tienTroCapDem", type: "dem" },
    { hours: "soGioHanhChinh2", rate: "phuLuongHanhChinh2", output: "tienHanhChinh2", type: "hanhChinh" },
    { hours: "soGioTangCa2", rate: "phuLuongTangCa2", output: "tienTangCa2", type: "tangCa" },
    { hours: "soGioDem2", rate: "phuLuongDem2", output: "tienTroCapDem2", type: "dem" },
  ];

  const PHU_CAP_FIELDS = ["pcABC", "pcChuyenCan", "pcThamNien", "pcChucVu", "pcDiLai", "pcDienThoai", "pcTreEm", "pcKhac"];

  // Initialize default values
  DOM.pcDiLai.value = DEFAULT_VALUES.pcDiLai;
  DOM.pcChuyenCan.value = DEFAULT_VALUES.pcChuyenCan;
  DOM.pcThamNien.value = DEFAULT_VALUES.pcThamNien;

  // Debounce function to limit frequent calculations
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Calculate base rates
  const getBaseRates = () => {
    const luongCoBan = parseFloat(DOM.luongCoBan.value) || 0;
    const ngayCongChuan = parseFloat(DOM.ngayCongChuan.value) || 1;
    const phuCapThamNien = parseFloat(DOM.pcThamNien.value) || 0;
    const phuCapChucVu = parseFloat(DOM.pcChucVu.value) || 0;
    const hoTroDiLai = parseFloat(DOM.pcDiLai.value) || 0;

    return {
      luongNgayCong: luongCoBan / ngayCongChuan,
      luongTangCa: (luongCoBan + phuCapThamNien + phuCapChucVu + hoTroDiLai) / ngayCongChuan / 8,
      troCapDem: (luongCoBan + phuCapThamNien + phuCapChucVu + hoTroDiLai) / ngayCongChuan / 8,
      luongDongBH: luongCoBan + phuCapThamNien + phuCapChucVu,
    };
  };

  // Calculate and update main table amounts
  const calculateMainTable = (rates) => {
    let total = 0;
    MAIN_TABLE_FIELDS.forEach(({ input, output, multiplier, unit }) => {
      const value = parseFloat(document.getElementById(input).value) || 0;
      const rate = unit === "ngayCong" ? rates.luongNgayCong : unit === "tangCa" ? rates.luongTangCa : rates.troCapDem;
      const amount = Math.round(value * multiplier * rate);
      document.getElementById(output).textContent = amount.toLocaleString("vi-VN");
      total += amount;
    });
    return total;
  };

  // Calculate and update secondary table (bangPhu) amounts
  const calculateBangPhu = (rates) => {
    let total = 0;
    PHU_TABLE_FIELDS.forEach(({ hours, rate, output, type }) => {
      const hoursValue = parseFloat(document.getElementById(hours).value) || 0;
      const rateValue = parseFloat(document.getElementById(rate).value) || 0;
      const unitRate = type === "tangCa" ? rates.luongTangCa / 100 : rates.luongNgayCong / 800;
      const amount = Math.round(hoursValue * rateValue * unitRate);
      document.getElementById(output).textContent = amount.toLocaleString("vi-VN");
      total += amount;
    });
    return total;
  };

  // Calculate allowances
  const calculatePhuCap = () => {
    return PHU_CAP_FIELDS.reduce((sum, id) => sum + (parseFloat(document.getElementById(id).value) || 0), 0);
  };

  // Main calculation function
  const tinhLuong = () => {
    const rates = getBaseRates();

    // Calculate main table total
    let totalIncome = calculateMainTable(rates);

    // Add secondary table (holidays, overtime)
    const tienNgayLeTet = calculateBangPhu(rates);
    DOM.tienNgayLeTet.textContent = tienNgayLeTet.toLocaleString("vi-VN");
    totalIncome += tienNgayLeTet;

    // Add allowances
    totalIncome += calculatePhuCap();

    // Update total income
    DOM.tongLuong.textContent = Math.round(totalIncome).toLocaleString("vi-VN");

    // Calculate deductions
    const tienTruBHXH = Math.round(rates.luongDongBH * PERCENTAGES.BHXH);
    const tienTruCD = Math.round(rates.luongDongBH * PERCENTAGES.CONG_DOAN);
    DOM.tienTruBHXH.textContent = tienTruBHXH.toLocaleString("vi-VN");
    DOM.tienTruCD.textContent = tienTruCD.toLocaleString("vi-VN");

    // Calculate net income
    const thucLinh = Math.round(totalIncome - tienTruBHXH - tienTruCD);
    DOM.thucLinh.textContent = thucLinh.toLocaleString("vi-VN");
  };

  // Debounced calculation
  const debouncedTinhLuong = debounce(tinhLuong, 300);

  // Set up event listeners
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input, index) => {
    // Handle Enter key for focus navigation
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = inputs[index + 1];
        if (next) next.focus();
      }
    });
    // Trigger calculation on input change
    input.addEventListener("input", debouncedTinhLuong);
  });

  // Initial calculation
  tinhLuong();
});
```