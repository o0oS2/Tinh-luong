document.addEventListener("DOMContentLoaded", function () {
  // Giá trị mặc định cho một số phụ cấp
  const defaultValues = {
    pcDiLai: 500000,
    pcChuyenCan: 200000,
    pcThamNien: 400000
  };

  // Khởi tạo giá trị mặc định
  document.getElementById("pcDiLai").value = defaultValues.pcDiLai;
  document.getElementById("pcChuyenCan").value = defaultValues.pcChuyenCan;
  document.getElementById("pcThamNien").value = defaultValues.pcThamNien;

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
    // Tính lương ngay khi thay đổi
    input.addEventListener("input", tinhLuong);
  });

  function tinhLuong() {
    // Lấy dữ liệu đầu vào
    const luongCoBan = +document.getElementById("luongCoBan").value || 0;
    const ngayCongChuan = +document.getElementById("ngayCongChuan").value || 1;
    const phuCapThamNien = +document.getElementById("pcThamNien").value || 0;
    const phuCapChucVu = +document.getElementById("pcChucVu").value || 0;
    const hoTroDiLai = +document.getElementById("pcDiLai").value || 0;

    // Lương cơ bản phân theo ngày và giờ
    const luongNgayCong = luongCoBan / ngayCongChuan;
    const luongTangCa = (luongCoBan + phuCapThamNien + phuCapChucVu + hoTroDiLai) / ngayCongChuan / 8;
    const troCapDem = luongTangCa;

    // Hàm tính và cập nhật tiền từng loại
    function updateTien(idSo, idTien, calc) {
      const val = +document.getElementById(idSo).value || 0;
      const tien = Math.round(calc(val));
      document.getElementById(idTien).textContent = tien.toLocaleString("vi-VN");
      return tien;
    }

    // Tính lần lượt các khoản 100%, 150%, 200%, đêm, chủ nhật...
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

    // Tính tổng từ bảng phụ (giờ công hành chính, tăng ca, đêm)
    const tienNgayLeTet = calcBangPhu(luongNgayCong, luongTangCa, troCapDem);
    document.getElementById("tienNgayLeTet").textContent = tienNgayLeTet.toLocaleString("vi-VN");
    tong += tienNgayLeTet;

    // Cộng thêm các phụ cấp khác
    const phuCaps = [
      "pcABC", "pcChuyenCan", "pcThamNien",
      "pcChucVu", "pcDiLai", "pcDienThoai",
      "pcTreEm", "pcKhac"
    ];
    phuCaps.forEach(id => {
      tong += +document.getElementById(id).value || 0;
    });

    // Cập nhật tổng thu nhập
    document.getElementById("tongLuong").textContent = Math.round(tong).toLocaleString("vi-VN");

    // Khấu trừ BHXH (10.5%) và Công đoàn (1%) tính trên lương đóng BH
    const luongDongBH = luongCoBan + phuCapThamNien + phuCapChucVu;
    const tienTruBHXH = Math.round(luongDongBH * 0.105);
    const tienTruCD = Math.round(luongDongBH * 0.01);
    document.getElementById("tienTruBHXH").textContent = tienTruBHXH.toLocaleString("vi-VN");
    document.getElementById("tienTruCD").textContent = tienTruCD.toLocaleString("vi-VN");

    // Tính thực lĩnh
    const thucLinh = Math.round(tong) - tienTruBHXH - tienTruCD;
    document.getElementById("thucLinh").textContent = thucLinh.toLocaleString("vi-VN");
  }

  // Hàm tính tổng của Bảng Phụ (giờ công hành chính, tăng ca, đêm)
  function calcBangPhu(luongNgayCong, luongTangCa, troCapDem) {
    function phuLuong(soGioId, heSoId, rowTienId, loaiLuong) {
      const gio = +document.getElementById(soGioId).value || 0;
      const heSo = +document.getElementById(heSoId).value || 0;
      let donGia = 0;
      if (loaiLuong === "hanhChinh" || loaiLuong === "dem") {
        donGia = luongNgayCong / 800;
      } else if (loaiLuong === "tangCa") {
        donGia = luongTangCa / 100;
      }
      const tien = Math.round(gio * heSo * donGia);
      document.getElementById(rowTienId).textContent = tien.toLocaleString("vi-VN");
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
});
