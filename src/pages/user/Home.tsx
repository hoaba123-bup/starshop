import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cart";
import { http } from "../../apis/http";
import { Product } from "../../types/product";
import { Category } from "../../types/category";

import "./css/AddToCartButton.css";
import { gsap } from "gsap";
import Toast from './Toast';
// Khai báo lại window.MorphSVGPlugin để TypeScript biết nó tồn tại khi load bằng CDN
declare global {
  interface Window {
    MorphSVGPlugin?: any;
  }
}

// const ToastModal = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
//   const isSuccess = type === "success";

//   return (
//     // Backdrop (Nền mờ đen 50% + Làm mờ (Blur) + Hiệu ứng Fade In cho nền)
//     // opacity-100: trạng thái cuối của fade-in
//     <div className="fixed inset-0 z-50 flex items-center justify-center 
//                     bg-black/50 backdrop-blur-sm 
//                     transition-opacity duration-300 ease-out 
//                     opacity-100">
      
//       {/* Modal Content (Hiện từ từ - Scale Up và Fade In) */}
//       {/* scale-100 opacity-100: trạng thái cuối của scale-up/fade-in */}
//       <div className="bg-white rounded-lg shadow-xl p-6 w-80 max-w-sm 
//                     transform transition-all duration-300 ease-out 
//                     dark:bg-slate-700 
//                     opacity-100 scale-100">
//         <div className={`text-center p-3 rounded-full mx-auto w-12 h-12 flex items-center justify-center ${isSuccess ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-rose-100 dark:bg-rose-800'}`}>
//           <svg className={`w-6 h-6 ${isSuccess ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             {isSuccess ? (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//             ) : (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             )}
//           </svg>
//         </div>
//         <h3 className={`text-lg font-semibold text-center mt-4 ${isSuccess ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
//           {isSuccess ? "Thành công!" : "Thất bại!"}
//         </h3>
//         <p className="text-sm text-center text-slate-600 dark:text-slate-300 mt-2">{message}</p>
//         <div className="mt-5 sm:mt-6">
//           <button
//             type="button"
//             className={`inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:text-sm transition duration-150 ease-in-out ${isSuccess ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}
//             onClick={onClose}
//           >
//             Đóng
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };




export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await http.get<Category[]>("/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await http.get<Product[]>("/products", {
          params: {
            q: keyword || undefined,
            categoryId: categoryId || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          },
        });
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categoryId, minPrice, maxPrice]);

  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    products.forEach((p) => {
      const key = String(p.categoryId || "others");
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [products]);
  
  // Hàm runAddToCartAnimation
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
    <div className="space-y-6">
     <section className="filter-container"> 
               <h1 className="search-heading">Tìm kiếm Sản phẩm</h1>
                <p className="textdis text-sm text-slate-500 dark:text-slate-400 mb-6">Lọc theo từ khóa, danh mục và khoảng giá.</p>
                
                {/* THAY THẾ DIV NÀY */}
                <div className="filter-grid mt-4"> 
                    
                    {/* 1. TỪ KHÓA */}
                    {/* THAY THẾ CÁC CLASS CỦA INPUT */}
                   <div className="input-wrapper">
        
        {/* ICON KÍNH LÚP (Sử dụng SVG hoặc thư viện icon) */}
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="search-icon"
        >
            <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.643 4.644a.75.75 0 1 1-1.06 1.06l-4.644-4.643A8.25 8.25 0 0 1 2.25 10.5Z" />
        </svg>

        {/* INPUT CŨ */}
        <input 
            className="filter-input input-with-icon" 
            placeholder="Tìm kiếm theo từ khóa" 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
        />
    </div>
                    {/* 2. DANH MỤC */}
                    {/* THAY THẾ CÁC CLASS CỦA SELECT */}
                    <select 
                        className="filter-input" 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* 3. GIÁ TỐI THIỂU */}
                    <input 
                        type="number" 
                        min={0} 
                        className="filter-input" 
                        placeholder="Giá tối thiểu (VND)" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)} 
                    />
                    
                    {/* 4. GIÁ TỐI ĐA */}
                    <input 
                        type="number" 
                        min={0} 
                        className="filter-input" 
                        placeholder="Giá tối đa (VND)" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)} 
                    />
                </div>
            </section>


      {loading && <p className="text-sm text-slate-600">Đang tải sản phẩm...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

    {toast?.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)} 
        />
      )}


      {!loading && !error && categories.map((cat) => {
        const list = grouped[String(cat.id)] || [];
        if (!list.length) return null;
        return (
          <div className="dark">
          <section key={cat.id} className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">{cat.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {list.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm flex flex-col cursor-pointer 
             transition duration-300 transform hover:scale-[1.03] hover:shadow-xl dark:bg-slate-800 dark:border-slate-700"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div>
                    <div className="h-32 rounded-lg bg-slate-100 mb-3 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-slate-100" />
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.categoryName}</div>
                    <div className="text-indigo-600 font-bold mt-1">
                      {Number(p.price).toLocaleString("vi-VN")} VND
                    </div>
                  </div>
                  
                  {/* START: Nút Thêm vào giỏ đã được làm sạch */}
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
                      const result = addToCart(p, 1); 
                      
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
                    <path d="M24 25C25.1046 25 26 24.1046 26 23C26 21.8954 25.1046 21 24 21C22.8954 21 22 21.8954 22 23C22 24.1046 22.8954 25 24 25Z" className="wheel" />
                    <path d="M14.5 13.5L16.5 15.5L21.5 10.5" className="tick" />
                    </svg>

                  </button>
                  {/* END: Nút Thêm vào giỏ đã được làm sạch */}

                </div>
              ))}
            </div>
          </section>
          </div>
        );
      })}

    </div>
  );
}