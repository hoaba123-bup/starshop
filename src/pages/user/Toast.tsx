import React, { useEffect,useState } from "react";

// Định nghĩa component Toast
const SuccessIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Icon thất bại (Dấu X trong vòng tròn)
const ErrorIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface ToastProps {
  message: string | null;
  type: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  // State nội bộ để kiểm soát hiệu ứng CSS
  const [isVisible, setIsVisible] = useState(false);
  const DURATION_MS = 300; // Phù hợp với transition-duration-300
  const DISPLAY_TIME_MS = 2000; // Thời gian hiển thị (2 giây)

  useEffect(() => {
    if (message) {
      // 1. Kích hoạt hiệu ứng slide-in ngay lập tức khi message xuất hiện
      setIsVisible(true);

      // 2. Thiết lập thời gian chờ để tự động trượt ra
      const timer = setTimeout(() => {
        setIsVisible(false); // Kích hoạt hiệu ứng slide-out CSS
        // Chờ hiệu ứng slide-out hoàn tất (300ms) rồi gọi parent's onClose để unmount
        setTimeout(onClose, DURATION_MS);
      }, DISPLAY_TIME_MS);

      return () => {
        clearTimeout(timer);
      };
    } 
    // Nếu message là null, isVisible cũng sẽ là false, component sẽ unmount
  }, [message]);

  // Handler cho nút đóng thủ công
  const handleCloseClick = () => {
    setIsVisible(false); // Kích hoạt slide-out CSS
    setTimeout(onClose, DURATION_MS); // Chờ animation rồi đóng
  };

  if (!message && !isVisible) {
    return null; // Chỉ unmount khi không có message VÀ hiệu ứng trượt ra đã xong
  }

  // Lớp CSS cho hiệu ứng:
  // translate-x-full: Bắt đầu từ ngoài màn hình (bên phải)
  // translate-x-0: Trượt vào vị trí
  // opacity-0/opacity-100: Thêm hiệu ứng mờ dần
  const transformClass = isVisible 
    ? 'translate-x-0 opacity-100' 
    : 'translate-x-full opacity-0';

  const bgColor = type === "success" ? "bg-emerald-600" : "bg-rose-600";
  const IconComponent = type === "success" ? SuccessIcon : ErrorIcon;

  return (
    <div
      className={`fixed top-5 right-5 z-50 max-w-xs p-3 pt-1 pb-1 rounded-lg shadow-2xl text-white ${bgColor} 
                  transform transition-all duration-300 ease-out 
                  ${transformClass}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2 text-white">
            <IconComponent />
          </span>
          <p className="font-medium text-sm pt-3">{message}</p>
        </div>
        <button
         className="ml-4 p-1  flex items-center justify-center text-white/80 hover:text-white transition-colors focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};
export default Toast;