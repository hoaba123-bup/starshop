// file: src/pages/VnPayReturn.tsx

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon} from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import "./css/AddToCartButton.css";

const VnPayReturn: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'checking'>('loading');
    const [message, setMessage] = useState('Đang kiểm tra kết quả thanh toán...');

    useEffect(() => {
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef'); 

        const vnpQuery = Object.fromEntries(searchParams.entries());

        if (!vnp_ResponseCode || !vnp_TxnRef) {
            setStatus('failed');
            setMessage('Lỗi: Không nhận được dữ liệu phản hồi từ VNPAY.');
            toast.error('Giao dịch VNPAY không hợp lệ.');
            return;
        }

        const checkPaymentStatus = async () => {
            try {
                if (vnp_ResponseCode === '00') {
                    setStatus('checking');
                    
                    setTimeout(() => {
                        setStatus('success');
                        setMessage('Thanh toán VNPAY thành công!');
                        toast.success('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
                        localStorage.removeItem('cart');
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
        const baseIconClasses = "w-14 h-14"; 
        
        switch (status) {
            case 'success':
                return <CheckCircleIcon className={`${baseIconClasses} text-green-500`} />;
            case 'failed':
                return <XCircleIcon className={`${baseIconClasses} text-red-500`} />;
            case 'loading':
            case 'checking':
                // SỬA ĐỔI: Thay ClockIcon bằng ArrowPathIcon
                return <ArrowPathIcon className={`${baseIconClasses} text-indigo-500 animate-spin`} />; 
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-10 rounded-xl shadow-2xl text-center">
                {/* Tiêu đề */}
                <h1 className="text-2xl font-extrabold mb-4 text-gray-900">
                    Trạng Thái Giao Dịch
                </h1>
                <p className="textt-sm text-gray-500 mb-8">
                    Kết quả thanh toán qua cổng VNPAY
                </p>

                {/* Icon Hiển thị */}
                <div className="flex justify-center mb-5 ">
                    {displayIcon()}
                </div>

                {/* Thông báo Message */}
                <p className={`text-1xl font-bold mb-8 ${status === 'success' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : 'text-indigo-600'}`}>
                    {message}
                </p>

                {/* Nút Hành động */}
                <div className="flexxx flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                    <button
                        onClick={() => window.location.href = '/profile/orders'}
                        // Cải tiến nút: Bo tròn nhiều (rounded-full) và đổ bóng nhẹ (shadow-md)
                        className="btnA mb-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-[1.08]"
                    >
                        Xem Đơn Hàng Của Bạn
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        // Cải tiến nút phụ: Viền (ring-2) và màu nền khi hover nhẹ
                        className="btnB w-full sm:w-auto border border-indigo-600 text-indigo-600 font-semibold py-3 px-6 rounded-full ring-2 ring-indigo-100 hover:bg-indigo-50 transition duration-300 transform hover:scale-[1.09]"
                    >
                        Tiếp Tục Mua Sắm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VnPayReturn;