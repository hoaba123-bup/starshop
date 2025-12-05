import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cart";
import { http } from "../../apis/http";
import { Product } from "../../types/product";
// **********************************
// IMPORT COMPONENT TOAST MỚI
// **********************************
import Toast from "./Toast"; // Điều chỉnh đường dẫn này cho phù hợp
import { runAddToCartAnimation } from "./Home"; // Giả sử hàm này đã được export từ Home.tsx
export default function ProductDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [product, setProduct] = useState<Product | null>(null);
   const [qty, setQty] = useState(1);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

   useEffect(() => {
     const fetchDetail = async () => {
       if (!id) return;
       setLoading(true);
       setError("");
       try {
         const res = await http.get<Product>(`/products/${id}`);
         setProduct(res.data);
       } catch (err) {
         console.error(err);
         setError("San pham khong ton tai hoac da bi an.");
         setTimeout(() => navigate("/"), 2000);
       } finally {
         setLoading(false);
       }
     };
     fetchDetail();
   }, [id, navigate]);

   if (loading) return <p className="text-sm text-slate-600">Dang tai...</p>;
   if (error) return <p className="text-sm text-rose-600">{error}</p>;
   if (!product) return null;

   const handleAddToCart = () => {
     const result = addToCart(product, qty);
     if (result.success) {
       setToast({ message: "Đã thêm sản phẩm vào giỏ hàng.", type: "success" });
     } else {
       setToast({ message: result.message || "Sản phẩm đã hết hàng hoặc không đủ số lượng.", type: "error" });
     }
   };
 const runAddToCartAnimation = (button: HTMLElement) => {
    // Đăng ký MorphSVGPlugin 
    if ((window as any).MorphSVGPlugin) {
        // 2. Đăng ký plugin. GSAP v3 sẽ tự động bỏ qua nếu nó đã được đăng ký.
        gsap.registerPlugin((window as any).MorphSVGPlugin);
    } else {
        console.warn("MorphSVGPlugin không khả dụng. Hiệu ứng Morph có thể không chạy.");
    }
    
    // Lấy các phần tử con cần thiết
    let morph = button.querySelector('.morph path') as SVGPathElement;
    let shirt = button.querySelectorAll('.shirt svg path') as NodeListOf<SVGPathElement>;
    
    // Đảm bảo nút đang ở trạng thái active
    button.classList.add('active');

    // Animation 1: Background scale
    gsap.to(button, {
        keyframes: [{
            '--background-scale': .97,
            duration: .15
        }, {
            '--background-scale': 1,
            delay: .125,
            duration: 1.2,
            ease: 'elastic.out(1, .6)'
        }]
    });

    // Animation 2: Shirt and Cart movement (Phase 1)
    gsap.to(button, {
        keyframes: [{
            '--shirt-scale': 1,
            '--shirt-y': '-42px',
            '--cart-x': '0px',
            '--cart-scale': 1,
            duration: .4,
            ease: 'power1.in'
        }, {
            '--shirt-y': '-40px',
            duration: .3
        }, {
            '--shirt-y': '16px',
            '--shirt-scale': .9,
            duration: .25,
            ease: 'none'
        }, {
            '--shirt-scale': 0,
            duration: .3,
            ease: 'none'
        }]
    });

    // Animation 3: Shirt second part
    gsap.to(button, {
        '--shirt-second-y': '0px',
        delay: .835,
        duration: .12
    });

    // Animation 4: Cart movement (Phase 2) & Text hide/show
    gsap.to(button, {
        keyframes: [{
            '--cart-clip': '12px',
            '--cart-clip-x': '3px',
            delay: .9,
            duration: .06
        }, {
            '--cart-y': '2px',
            duration: .1
        }, {
            '--cart-tick-offset': '0px',
            '--cart-y': '0px',
            duration: .2,
            onComplete() {
                // Dùng setTimeout để reset animation state
                setTimeout(() => {
                    button.style.overflow = 'hidden';
                }, 0); 
            }
        }, {
            '--cart-x': '52px',
            '--cart-rotate': '-15deg',
            duration: .2
        }, {
            '--cart-x': '104px',
            '--cart-rotate': '0deg',
            duration: .2,
            clearProps: true,
            onComplete() {
                button.style.overflow = 'hidden';
                button.style.setProperty('--text-o', '0');
                button.style.setProperty('--text-x', '0px');
                button.style.setProperty('--cart-x', '-104px');
            }
        }, {
            '--text-o': '1',
            '--text-x': '12px',
            '--cart-x': '-48px',
            '--cart-scale': '.75',
            duration: .25,
            clearProps: true,
            onComplete() {
                button.classList.remove('active');
            }
        }]
    });

    // Animation 5: Text opacity
    gsap.to(button, {
        keyframes: [{
            '--text-o': 0,
            duration: .3
        }]
    });

    // Animation 6: MorphSVG cho background wave
    gsap.to(morph, {
        keyframes: [{
             morphSVG: 'M0 12C6 12 20 10 32 0C43.9024 9.99999 58 12 64 12V13H0V12Z',
            duration: .25,
            ease: 'power1.out'
        }, {
            morphSVG: 'M0 12C6 12 17 12 32 12C47.9024 12 58 12 64 12V13H0V12Z',
            duration: .15,
            ease: 'none'
        }]
    });

    // Animation 7: MorphSVG cho shirt shape
    gsap.to(shirt, {
        keyframes: [{
               morphSVG: 'M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L23.5 8L20.5 11L19 9.5L18 22.5C18 22.5 14 21.5 12 21.5C10 21.5 5.99997 22.5 5.99997 22.5L4.99997 9.5L3.5 11L0.5 8L4.99997 3Z',
            duration: .25,
            delay: .25
        }, {
          morphSVG: 'M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L23.5 8L20.5 11L19 9.5L18.5 22.5C18.5 22.5 13.5 22.5 12 22.5C10.5 22.5 5.5 22.5 5.5 22.5L4.99997 9.5L3.5 11L0.5 8L4.99997 3Z',
            duration: .85,
            ease: 'elastic.out(1, .5)'
        }, {
              morphSVG: 'M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L22.5 8L19.5 10.5L19 9.5L17.1781 18.6093C17.062 19.1901 16.778 19.7249 16.3351 20.1181C15.4265 20.925 13.7133 22.3147 12 23C10.2868 22.3147 8.57355 20.925 7.66487 20.1181C7.22198 19.7249 6.93798 19.1901 6.82183 18.6093L4.99997 9.5L4.5 10.5L1.5 8L4.99997 3Z',
            duration: 0,
            delay: 1.25
        }]
    });
  };
  
const handleToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ message: msg, type });
  };

   return (
     <div className="grid gap-6 lg:grid-cols-2">
       <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden">
         {product.imageUrl ? (
           <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
         ) : (
           <div className="h-full w-full bg-slate-100" />
         )}
       </div>
       <div className="space-y-4">
         <p className="text-sm text-slate-500">Danh muc: {product.categoryName}</p>
         <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
         <p className="text-indigo-600 text-xl font-semibold">
           {Number(product.price).toLocaleString("vi-VN")} VND
         </p>
         {typeof product.stock === "number" && (
           <p className="text-xs text-slate-500">Ton kho: {product.stock}</p>
         )}
         <p className="text-sm text-slate-600">{product.description}</p>
         <div className="flex items-center gap-3">
           <input
             type="number"
             min={1}
             value={qty}
             onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
             className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
           />
           <button
                    className="add-to-cart mt-auto rounded-lg bg-indigo-600 px-3 py-2 text-white text-sm font-medium 
             transition duration-300 transform hover:bg-indigo-700 hover:scale-[1.04] " 
                    onPointerDown={(e) => {
                      const button = e.currentTarget as HTMLElement;
                      if (button.classList.contains('active')) return;
                      
                      gsap.to(button, {
                          '--background-scale': .97,
                          duration: .15
                      });
                    }}

                    onClick={(e) => {
                      // 1. Dừng sự kiện lan truyền lên thẻ cha (div product)
                      e.stopPropagation();
                      
                      // 2. Lấy button element
                      const button = e.currentTarget as HTMLElement; 
                      
                      // Ngăn chặn click nếu đang chạy animation
                      if (button.classList.contains('active')) return;
                      
                      // 3. Chạy logic giỏ hàng
                      const result = handleAddToCart(); 
                      
                      if (result.success) {
                          // 4. Bắt đầu animation nếu thêm vào giỏ thành công
                          runAddToCartAnimation(button);
                          handleToast("Đã thêm sản phẩm vào giỏ hàng", "success");
                      } else {
                          // Xử lý khi thất bại
                          handleToast(result.message || "Sản phẩm đã hết hàng", "error");
                      }
                    }}
                  >
                    <span>Thêm vào giỏ</span>
                    
                    {/* SVG cho hiệu ứng morph */}
                   <svg className="morph" viewBox="0 0 64 13">
                <path d="M0 12C6 12 17 12 32 12C47.9024 12 58 12 64 12V13H0V12Z" />
            </svg>
                    
                    {/* Khu vực Áo */}
                    <div className="shirt">
                        {/* Áo phần 1 */}
                           <svg className="first" viewBox="0 0 24 24">
                    <path d="M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L22.5 8L19.5 10.5L19 9.5L17.1781 18.6093C17.062 19.1901 16.778 19.7249 16.3351 20.1181C15.4265 20.925 13.7133 22.3147 12 23C10.2868 22.3147 8.57355 20.925 7.66487 20.1181C7.22198 19.7249 6.93798 19.1901 6.82183 18.6093L4.99997 9.5L4.5 10.5L1.5 8L4.99997 3Z" />
                            {/* Logo Group */}
                            <g>
                               <path d="M16.3516 9.65383H14.3484V7.83652H14.1742V9.8269H16.5258V7.83652H16.3516V9.65383Z" />
                        <path d="M14.5225 6.01934V7.66357H14.6967V7.4905H14.8186V7.66357H14.9928V6.01934H14.8186V7.31742H14.6967V6.01934H14.5225Z" />
                        <path d="M14.1742 5.67319V7.66357H14.3484V5.84627H16.3516V7.66357H16.5258V5.67319H14.1742Z" />
                        <path d="M15.707 9.48071H15.8812V9.28084L16.0032 9.4807V9.48071H16.1774V7.83648H16.0032V9.14683L15.8812 8.94697V7.83648H15.707V9.48071Z" />
                        <path d="M15.5852 6.01931H15.1149V6.19238H15.5852V6.01931Z" />
                        <path d="M15.707 6.01934V7.66357H15.8812V7.46371L16.0032 7.66357H16.1774V6.01934H16.0032V7.32969L15.8812 7.12984V6.01934H15.707Z" />
                        <path d="M15.411 7.31742H15.2891V6.53857H15.411V7.31742ZM15.1149 7.66357H15.2891V7.4905H15.411V7.66357H15.5852V6.3655H15.1149V7.66357Z" />
                        <path d="M14.5225 8.69756L14.8186 9.18291V9.30763H14.6967V9.13455H14.5225V9.48071H14.9928V9.13456V9.13455L14.6967 8.64917V8.00956H14.8186V8.6586H14.9928V7.83648H14.5225V8.69756Z" />
                        <path d="M15.411 9.30763H15.2891V8.00956H15.411V9.30763ZM15.1149 9.48071H15.5852V7.83648H15.1149V9.48071Z" />
                            </g>
                        </svg>
                        {/* Áo phần 2 (second) */}
                        <svg className="second" viewBox="0 0 24 24">
                               <path d="M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L22.5 8L19.5 10.5L19 9.5L17.1781 18.6093C17.062 19.1901 16.778 19.7249 16.3351 20.1181C15.4265 20.925 13.7133 22.3147 12 23C10.2868 22.3147 8.57355 20.925 7.66487 20.1181C7.22198 19.7249 6.93798 19.1901 6.82183 18.6093L4.99997 9.5L4.5 10.5L1.5 8L4.99997 3Z" />
                            {/* Logo Group (lặp lại) */}
                            <g>
                                <path d="M16.3516 9.65383H14.3484V7.83652H14.1742V9.8269H16.5258V7.83652H16.3516V9.65383Z" />
                        <path d="M14.5225 6.01934V7.66357H14.6967V7.4905H14.8186V7.66357H14.9928V6.01934H14.8186V7.31742H14.6967V6.01934H14.5225Z" />
                        <path d="M14.1742 5.67319V7.66357H14.3484V5.84627H16.3516V7.66357H16.5258V5.67319H14.1742Z" />
                        <path d="M15.707 9.48071H15.8812V9.28084L16.0032 9.4807V9.48071H16.1774V7.83648H16.0032V9.14683L15.8812 8.94697V7.83648H15.707V9.48071Z" />
                        <path d="M15.5852 6.01931H15.1149V6.19238H15.5852V6.01931Z" />
                        <path d="M15.707 6.01934V7.66357H15.8812V7.46371L16.0032 7.66357H16.1774V6.01934H16.0032V7.32969L15.8812 7.12984V6.01934H15.707Z" />
                        <path d="M15.411 7.31742H15.2891V6.53857H15.411V7.31742ZM15.1149 7.66357H15.2891V7.4905H15.411V7.66357H15.5852V6.3655H15.1149V7.66357Z" />
                        <path d="M14.5225 8.69756L14.8186 9.18291V9.30763H14.6967V9.13455H14.5225V9.48071H14.9928V9.13456V9.13455L14.6967 8.64917V8.00956H14.8186V8.6586H14.9928V7.83648H14.5225V8.69756Z" />
                        <path d="M15.411 9.30763H15.2891V8.00956H15.411V9.30763ZM15.1149 9.48071H15.5852V7.83648H15.1149V9.48071Z" />
                            </g>
                        </svg>
                    </div>
                    
                    {/* Icon Giỏ hàng (dùng chung cho tất cả các nút) */}
                    <svg className="cart" viewBox="0 0 36 26">
                        {/* Cart body (stroke) */}
                       <path d="M1 2.5H6L10 18.5H25.5L28.5 7.5L7.5 7.5" className="shape" />
                    <path d="M11.5 25C12.6046 25 13.5 24.1046 13.5 23C13.5 21.8954 12.6046 21 11.5 21C10.3954 21 9.5 21.8954 9.5 23C9.5 24.1046 10.3954 25 11.5 25Z" className="wheel" />
                    <path d="M24 25C25.1046 25 26 24.1046 26 23C26 21.8954 25.1046 21 24 21C22.8954 21 22 21.8954 22 23C22 24.1046 22.8954 25 24 25Z" class="wheel" />
                    <path d="M14.5 13.5L16.5 15.5L21.5 10.5" className="tick" />
                    </svg>
                  </button>
         </div>
         
         {/* 2. SỬ DỤNG TOAST THAY CHO MODAL */}
         {/* Toast component sẽ tự quản lý hiệu ứng và gọi onClose sau 2.3 giây */}
         {toast && (
           <Toast
             message={toast.message}
             type={toast.type}
             onClose={() => setToast(null)} // Đặt toast về null để unmount component
           />
         )}
       </div>
     </div>
   );
}