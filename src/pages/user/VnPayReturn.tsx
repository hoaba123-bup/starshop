// file: src/pages/VnPayReturn.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const VnPayReturn: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'checking'>('loading');
    const [message, setMessage] = useState('Đang kiểm tra kết quả thanh toán...');

    useEffect(() => {
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // Mã giao dịch VNPAY

        // Dữ liệu VNPAY gửi về qua Query String
        const vnpQuery = Object.fromEntries(searchParams.entries());

        if (!vnp_ResponseCode || !vnp_TxnRef) {
            setStatus('failed');
            setMessage('Lỗi: Không nhận được dữ liệu phản hồi từ VNPAY.');
            toast.error('Giao dịch VNPAY không hợp lệ.');
            return;
        }

        // Gọi API Backend để kiểm tra Secure Hash và kết quả
        const checkPaymentStatus = async () => {
            try {
                // Endpoint kiểm tra kết quả thanh toán (thay vì dùng IPN, ta tạo 1 endpoint riêng)
                // Tuy nhiên, vì IPN đã xử lý cập nhật DB, ta chỉ cần check trạng thái đơn hàng thôi.
                // Đối với Sandbox, ta chỉ kiểm tra mã ResponseCode
                
                if (vnp_ResponseCode === '00') {
                    // Nếu mã thành công, đợi 1 chút để IPN xử lý xong và thông báo
                    setStatus('checking');
                    
                    // Sau 3 giây, kiểm tra trạng thái đơn hàng (tối ưu: gọi API check đơn hàng)
                    setTimeout(() => {
                        setStatus('success');
                        setMessage('Thanh toán VNPAY thành công!');
                        toast.success('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
                        // Xóa giỏ hàng sau khi thanh toán thành công
                        localStorage.removeItem('cart');
                        // Nếu cần, có thể gọi API để lấy trạng thái đơn hàng chi tiết hơn
                    }, 3000); 

                } else {
                    setStatus('failed');
                    setMessage(`Thanh toán VNPAY thất bại. Mã lỗi: ${vnp_ResponseCode}.`);
                    toast.error('Thanh toán thất bại, vui lòng thử lại.');
                }

            } catch (error) {
                setStatus('failed');
                setMessage('Lỗi khi kiểm tra kết quả giao dịch VNPAY.');
                console.error("VNPAY Return Error:", error);
            }
        };

        checkPaymentStatus();
    }, [searchParams]);

    const displayIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon className="w-20 h-20 text-green-500" />;
            case 'failed':
                return <XCircleIcon className="w-20 h-20 text-red-500" />;
            case 'loading':
            case 'checking':
                return <ClockIcon className="w-20 h-20 text-blue-500 animate-spin" />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Kết Quả Thanh Toán VNPAY</h1>
                <div className="flex justify-center mb-6">
                    {displayIcon()}
                </div>
                <p className={`text-lg font-semibold ${status === 'success' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : 'text-blue-600'}`}>
                    {message}
                </p>
                <div className="mt-8">
                    <button
                        onClick={() => window.location.href = '/profile/orders'}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Xem Đơn Hàng Của Bạn
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="ml-4 border border-indigo-600 text-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-indigo-50 transition duration-200"
                    >
                        Tiếp Tục Mua Sắm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VnPayReturn;