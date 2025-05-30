// File: tinhluong.js

document.addEventListener("DOMContentLoaded", function () {
  const defaultValues = {
    pcDiLai: 500000,
    pcChuyenCan: 200000,
    pcThamNien: 400000
  };

  // Set default values
  document.getElementById("pcDiLai").value = defaultValues.pcDiLai;
  document.getElementById("pcChuyenCan").value = defaultValues.pcChuyenCan;
  document.getElementById("pcThamNien").value = defaultValues.pcThamNien;

  // Focus chuyển tiếp khi nhấn Enter
  const inputs = Array.from(document.querySelectorAll("input, select"));
  inputs.forEach((input, index) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = inputs[index + 1];
        if (next) next.focus();
      }
    });
  });

  // Cập nhật khi có thay đổi
  inputs.forEach(input => input.addEventListener("input", tinhLuong));

  function tinhLuong() {
    const luongCoBan = +document.getElementById("luongCoBan").value || 0;
    const ngayCongChuan = +document.getElementById("ngayCongChuan").value || 1;
    const phuCapThamNien = +document.getElementById("pcThamNien").value || 0;
    const phuCapChucVu = +document.getElementById("pcChucVu").value || 0;
    const hoTroDiLai = +document.getElementById("pcDiLai").value || 0;

    const luongNgayCong = luongCoBan / ngayCongChuan;
    const luongTangCa = (luongCoBan + phuCapThamNien + phuCapChucVu + hoTroDiLai) / ngayCongChuan / 8;
    const troCapDem = (luongCoBan + phuCapThamNien + phuCapChucVu + hoTroDiLai) / ngayCongChuan / 8;

    function updateTien(idSo, idTien, calc) {
      const val = +document.getElementById(idSo).value || 0;
      const tien = Math.round(calc(val));
      document.getElementById(idTien).textContent = tien.toLocaleString("vi-VN");
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

    const tienNgayLeTet = Math.round(calcBangPhu(luongNgayCong, luongTangCa, troCapDem));
    document.getElementById("tienNgayLeTet").textContent = tienNgayLeTet.toLocaleString("vi-VN");
    tong += tienNgayLeTet;

    const phuCaps = [
      "pcABC", "pcChuyenCan", "pcThamNien",
      "pcChucVu", "pcDiLai", "pcDienThoai",
      "pcTreEm", "pcKhac"
    ];
    phuCaps.forEach(id => {
      const val = +document.getElementById(id).value || 0;
      tong += val;
    });

    const tongLuong = Math.round(tong);
    document.getElementById("tongLuong").textContent = tongLuong.toLocaleString("vi-VN");

    // Khấu trừ BHXH và Công đoàn
    const luongDongBH = luongCoBan + phuCapThamNien + phuCapChucVu;
    const tienTruBHXH = Math.round(luongDongBH * 0.105);
    const tienTruCD = Math.round(luongDongBH * 0.01);
    document.getElementById("tienTruBHXH").textContent = tienTruBHXH.toLocaleString("vi-VN");
    document.getElementById("tienTruCD").textContent = tienTruCD.toLocaleString("vi-VN");

    const thucLinh = tongLuong - tienTruBHXH - tienTruCD;
    document.getElementById("thucLinh").textContent = thucLinh.toLocaleString("vi-VN");
  }

  function calcBangPhu(luongNgayCong, luongTangCa, troCapDem) {
    function phuLuong(soGioId, tyLeId, heSoLuong, rowId) {
      const gio = +document.getElementById(soGioId).value || 0;
      const tyLe = (+document.getElementById(tyLeId).value || 0) / 100;
      const tien = Math.round(heSoLuong * gio * tyLe);
      document.getElementById(rowId).textContent = tien.toLocaleString("vi-VN");
      return tien;
    }

    let tong = 0;
    tong += phuLuong("soGioHanhChinh1", "phuLuongHanhChinh", luongNgayCong / 8, "tienHanhChinh");
    tong += phuLuong("soGioTangCa1", "phuLuongTangCa", luongTangCa, "tienTangCa");
    tong += phuLuong("soGioDem1", "phuLuongDem", luongNgayCong / 8, "tienTroCapDem");
    tong += phuLuong("soGioHanhChinh2", "phuLuongHanhChinh2", luongNgayCong / 8, "tienHanhChinh2");
    tong += phuLuong("soGioTangCa2", "phuLuongTangCa2", luongTangCa, "tienTangCa2");
    tong += phuLuong("soGioDem2", "phuLuongDem2", luongNgayCong / 8, "tienTroCapDem2");
    return tong;
  }
});
