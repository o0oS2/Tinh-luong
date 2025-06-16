document.addEventListener("DOMContentLoaded", function () {
  // === Khởi tạo select tháng, năm theo logic của bạn ===
  const thangSelect = document.getElementById("thang");
  const namSelect = document.getElementById("nam");

  // Lấy ngày hiện tại
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDate = today.getDate();

  // Xác định tháng mặc định
  let defaultMonth;
  if (currentDate < 11) {
    // Nếu là tháng 1 thì tháng trước là 12
    defaultMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  } else {
    defaultMonth = currentMonth;
  }

  // Xác định năm mặc định
  // Nếu ngày < 11/1 thì năm mặc định là năm hiện tại - 1
  // Ngược lại là năm hiện tại
  let defaultYear;
  if (currentMonth === 1 && currentDate < 11) {
    defaultYear = currentYear - 1;
  } else {
    defaultYear = currentYear;
  }

  // Gán tháng (1-12)
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i.toString().padStart(2, '0');
    if (i === defaultMonth) option.selected = true;
    thangSelect.appendChild(option);
  }

  // Gán năm (năm hiện tại -1, năm hiện tại, năm hiện tại +1)
  for (let y = currentYear - 1; y <= currentYear + 1; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.text = y;
    if (y === defaultYear) option.selected = true;
    namSelect.appendChild(option);
  }

  // === Phần còn lại của code tính lương ===

  // Giá trị mặc định cho một số phụ cấp
  const defaultValues = {
    pcDiLai: 500000,
    pcChuyenCan: 200000,
    pcThamNien: 400000
  };

  // Khởi tạo giá trị mặc định phụ cấp
  if(document.getElementById("pcDiLai")) document.getElementById("pcDiLai").value = defaultValues.pcDiLai;
  if(document.getElementById("pcChuyenCan")) document.getElementById("pcChuyenCan").value = defaultValues.pcChuyenCan;
  if(document.getElementById("pcThamNien")) document.getElementById("pcThamNien").value = defaultValues.pcThamNien;

  // Hàm tính ngayCongChuan dựa vào tháng và năm
  function tinhNgayCongChuan() {
    const thang = +document.getElementById("thang")?.value || 1;
    const nam = +document.getElementById("nam")?.value || new Date().getFullYear();

    const soNgayTrongThang = new Date(nam, thang, 0).getDate();

    let soNgayChuNhat = 0;
    for (let d = 1; d <= soNgayTrongThang; d++) {
      const ngayTrongTuan = new Date(nam, thang - 1, d).getDay();
      if (ngayTrongTuan === 0) soNgayChuNhat++;
    }

    let ngayCongChuan = soNgayTrongThang - soNgayChuNhat;
    if (ngayCongChuan === 27) ngayCongChuan = 26;

    return ngayCongChuan;
  }

  // Tạo mảng tất cả input và select để xử lý focus Enter và cập nhật
  const inputs = Array.from(document.querySelectorAll("input, select"));
  inputs.forEach((input, index) => {
    // Chuyển focus khi nhấn Enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = inputs[index + 1];
        if (next) next.focus();
      }
    });
    // Tính lương ngay khi thay đổi input/select
    input.addEventListener("input", tinhLuong);
    input.addEventListener("change", tinhLuong);
  });

  // Khi thay đổi thang hoặc nam thì tính lương lại
  ["thang", "nam"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", tinhLuong);
    }
  });

  function tinhLuong() {
    const luongCoBan = +document.getElementById("luongCoBan")?.value || 0;
    const ngayCongChuan = tinhNgayCongChuan();

    const phuCapThamNien = +document.getElementById("pcThamNien")?.value || 0;
    const phuCapChucVu = +document.getElementById("pcChucVu")?.value || 0;
    const hoTroDiLai = +document.getElementById("pcDiLai")?.value || 0;

    const luongNgayCong = ngayCongChuan > 0 ? luongCoBan / ngayCongChuan : 0;
    const luongTangCa = ngayCongChuan > 0 ? (luongCoBan + phuCapThamNien + phuCapChucVu + hoTroDiLai) / ngayCongChuan / 8 : 0;
    const troCapDem = luongTangCa;

    function updateTien(idSo, idTien, calc) {
      const val = +document.getElementById(idSo)?.value || 0;
      const tien = Math.round(calc(val));
      if(document.getElementById(idTien)) {
        document.getElementById(idTien).textContent = tien.toLocaleString("vi-VN");
      }
      return tien;
    }

    let tong = 0;
    tong += updateTien("ngayCong", "tienNgayCong", so => luongNgayCong * so);
    tong += updateTien("tc150", "tienTC150", so => luongTangCa * 1.5 * so);
    tong += updateTien("tc200", "tienTC200", so => luongTangCa * 2 * so);
    tong += updateTien("tcDem30", "tienDem30", so => troCapDem * 0.3 * so);
    tong += updateTien("ngayCong200", "tienCong200", so => luongNgayCong * 2 * so);
    tong += updateTien("tc300", "tienTC300", so => luongTangCa * 3 * so);
    tong += updateTien("tc340", "tienTC340", so => luongTangCa * 3.4 * so);
    tong += updateTien("tcDem70", "tienDem70", so => troCapDem * 0.7 * so);
    tong += updateTien("phepNam", "tienPhepNam", so => luongNgayCong * so);
    tong += updateTien("le", "tienLe", so => luongNgayCong * so);

    const tienNgayLeTet = calcBangPhu(luongNgayCong, luongTangCa, troCapDem);
    if(document.getElementById("tienNgayLeTet")) {
      document.getElementById("tienNgayLeTet").textContent = tienNgayLeTet.toLocaleString("vi-VN");
    }
    tong += tienNgayLeTet;

    const phuCaps = [
      "pcABC", "pcChuyenCan", "pcThamNien",
      "pcChucVu", "pcDiLai", "pcDienThoai",
      "pcTreEm", "pcKhac"
    ];
    phuCaps.forEach(id => {
      const val = +document.getElementById(id)?.value || 0;
      tong += val;
    });

    if(document.getElementById("tongLuong")) {
      document.getElementById("tongLuong").textContent = Math.round(tong).toLocaleString("vi-VN");
    }

    const luongDongBH = luongCoBan + phuCapThamNien + phuCapChucVu;
    const tienTruBHXH = Math.round(luongDongBH * 0.105);
    const tienTruCD = Math.round(luongDongBH * 0.01);
    if(document.getElementById("tienTruBHXH")) {
      document.getElementById("tienTruBHXH").textContent = tienTruBHXH.toLocaleString("vi-VN");
    }
    if(document.getElementById("tienTruCD")) {
      document.getElementById("tienTruCD").textContent = tienTruCD.toLocaleString("vi-VN");
    }

    const thucLinh = Math.round(tong) - tienTruBHXH - tienTruCD;
    if(document.getElementById("thucLinh")) {
      document.getElementById("thucLinh").textContent = thucLinh.toLocaleString("vi-VN");
    }
  }

  function calcBangPhu(luongNgayCong, luongTangCa, troCapDem) {
    function phuLuong(soGioId, heSoId, rowTienId, loaiLuong) {
      const gio = +document.getElementById(soGioId)?.value || 0;
      const heSo = +document.getElementById(heSoId)?.value || 0;
      let donGia = 0;
      if (loaiLuong === "hanhChinh" || loaiLuong === "dem") {
        donGia = luongNgayCong / 800;
      } else if (loaiLuong === "tangCa") {
        donGia = luongTangCa / 100;
      }
      const tien = Math.round(gio * heSo * donGia);
      if(document.getElementById(rowTienId)) {
        document.getElementById(rowTienId).textContent = tien.toLocaleString("vi-VN");
      }
      return tien;
    }

    let tongPhu = 0;
    tongPhu += phuLuong("soGioHanhChinh1", "phuLuongHanhChinh", "tienHanhChinh", "hanhChinh");
    tongPhu += phuLuong("soGioTangCa1", "phuLuongTangCa", "tienTangCa", "tangCa");
    tongPhu += phuLuong("soGioDem1", "phuLuongDem", "tienTroCapDem", "dem");
    tongPhu += phuLuong("soGioHanhChinh2", "phuLuongHanhChinh2", "tienHanhChinh2", "hanhChinh");
    tongPhu += phuLuong("soGioTangCa2", "phuLuongTangCa2", "tienTangCa2", "tangCa");
    tongPhu += phuLuong("soGioDem2", "phuLuongDem2", "tienTroCapDem2", "dem");
    return tongPhu;
  }

  // Tính lương ngay khi load trang
  tinhLuong();
});
