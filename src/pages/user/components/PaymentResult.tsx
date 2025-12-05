// File: src/pages/user/PaymentResult.tsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clearCart } from '../../../utils/cart';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
    
  // Lấy các tham số từ URL do Backend VNPay redirect về
  const success = searchParams.get('success'); // 'true' hoặc 'false'
  const orderId = searchParams.get('orderId'); // Mã đơn hàng (vnp_TxnRef)
  const message = searchParams.get('message'); // Thông báo lỗi (ví dụ: Hash_Invalid)
  
  const isSuccess = success === 'true';

  // Khi component được render, dọn dẹp giỏ hàng 
  useEffect(() => {
    // Nếu thành công, xóa giỏ hàng
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess]);

  // Hàm chuyển hướng về trang chi tiết đơn hàng (nếu thành công)
  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/profile/orders/${orderId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto p-4 text-center my-20">
      <div className={`p-8 rounded-xl shadow-2xl max-w-lg mx-auto transition-all duration-300 
        ${isSuccess ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-8`}>
        
        {isSuccess ? (
          // HIỂN THỊ THÀNH CÔNG
          <div className="text-green-700">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-3xl font-bold mb-2">Thanh Toán Thành Công!</h2>
            <p className="text-lg">Đơn hàng đã được ghi nhận.</p>
            <p className="font-mono text-sm mt-1">Mã tham chiếu: <span className="font-bold">{orderId}</span></p>
            
          </div>
        ) : (
          // HIỂN THỊ THẤT BẠI
          <div className="text-red-700">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-3xl font-bold mb-2">Thanh Toán Thất Bại!</h2>
            <p className="text-lg">Giao dịch không thành công.</p>
            {message && <p className="text-sm mt-2 font-medium">Lý do: {message}</p>}
          </div>
        )}
        
        <div className="mt-6 space-x-4">
          <button 
            onClick={handleViewOrder}
            className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            {isSuccess ? "Xem chi tiết đơn hàng" : "Thử lại thanh toán"}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="inline-block border border-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium hover:bg-slate-100 transition"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}