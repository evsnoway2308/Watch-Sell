import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, CurrencyPipe, DecimalPipe],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {

    // ─── Navbar ───────────────────────────────────────
    isScrolled = false;
    menuOpen = false;

    @HostListener('window:scroll')
    onScroll() {
        this.isScrolled = window.scrollY > 60;
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ─── Hero Slider ──────────────────────────────────
    currentSlide = 0;
    private slideInterval: any;

    heroSlides = [
        {
            tag: 'Bộ Sưu Tập Mới 2025',
            title: 'Đẳng Cấp Trong Từng Khoảnh Khắc',
            subtitle: 'Khám phá những chiếc đồng hồ tinh xảo được chế tác bởi các nghệ nhân hàng đầu thế giới.',
            bg: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1400&q=80'
        },
        {
            tag: 'Thương Hiệu Cao Cấp',
            title: 'Thời Gian Là Nghệ Thuật',
            subtitle: 'Mỗi chiếc đồng hồ là một tác phẩm nghệ thuật, phản ánh cá tính và phong cách sống của bạn.',
            bg: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1400&q=80'
        },
        {
            tag: 'Ưu Đãi Đặc Biệt',
            title: 'Sở Hữu Đồng Hồ Mơ Ước',
            subtitle: 'Giảm đến 40% cho hàng trăm mẫu đồng hồ chính hãng. Cơ hội không thể bỏ lỡ.',
            bg: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=1400&q=80'
        }
    ];

    setSlide(index: number) {
        this.currentSlide = index;
        this.resetSlideTimer();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
        this.resetSlideTimer();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
        this.resetSlideTimer();
    }

    private startSlideTimer() {
        this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    }

    private resetSlideTimer() {
        clearInterval(this.slideInterval);
        this.startSlideTimer();
    }

    // ─── Categories ───────────────────────────────────
    categories = [
        {
            name: 'Đồng Hồ Nam',
            count: 128,
            image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&q=80'
        },
        {
            name: 'Đồng Hồ Nữ',
            count: 96,
            image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&q=80'
        },
        {
            name: 'Đồng Hồ Thể Thao',
            count: 64,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80'
        },
        {
            name: 'Đồng Hồ Cổ Điển',
            count: 45,
            image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&q=80'
        },
    ];

    // ─── Products ─────────────────────────────────────
    productTabs = ['Tất Cả', 'Mới Nhất', 'Bán Chạy', 'Khuyến Mãi'];
    activeTab = 'Tất Cả';

    allProducts = [
        {
            name: 'Submariner Date',
            brand: 'Rolex',
            price: 335000000,
            oldPrice: null,
            image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80',
            rating: 5,
            reviews: 128,
            isNew: true,
            discount: 0,
            category: 'Mới Nhất'
        },
        {
            name: 'Speedmaster Professional',
            brand: 'Omega',
            price: 142000000,
            oldPrice: 178000000,
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80',
            rating: 5,
            reviews: 96,
            isNew: false,
            discount: 20,
            category: 'Khuyến Mãi'
        },
        {
            name: 'Carrera Chronograph',
            brand: 'TAG Heuer',
            price: 58000000,
            oldPrice: 72000000,
            image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&q=80',
            rating: 4,
            reviews: 74,
            isNew: false,
            discount: 19,
            category: 'Khuyến Mãi'
        },
        {
            name: 'Royal Oak Offshore',
            brand: 'Audemars Piguet',
            price: 820000000,
            oldPrice: null,
            image: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&q=80',
            rating: 5,
            reviews: 42,
            isNew: true,
            discount: 0,
            category: 'Mới Nhất'
        },
        {
            name: 'Pilot\'s Watch Mark XX',
            brand: 'IWC',
            price: 98000000,
            oldPrice: null,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80',
            rating: 4,
            reviews: 58,
            isNew: true,
            discount: 0,
            category: 'Bán Chạy'
        },
        {
            name: 'Seamaster Diver 300M',
            brand: 'Omega',
            price: 112000000,
            oldPrice: 135000000,
            image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&q=80',
            rating: 5,
            reviews: 213,
            isNew: false,
            discount: 17,
            category: 'Bán Chạy'
        },
        {
            name: 'Reverso Classic Large',
            brand: 'Jaeger-LeCoultre',
            price: 195000000,
            oldPrice: null,
            image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&q=80',
            rating: 4,
            reviews: 31,
            isNew: true,
            discount: 0,
            category: 'Mới Nhất'
        },
        {
            name: 'Nautilus 5711',
            brand: 'Patek Philippe',
            price: 2100000000,
            oldPrice: null,
            image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80',
            rating: 5,
            reviews: 18,
            isNew: false,
            discount: 0,
            category: 'Bán Chạy'
        }
    ];

    get filteredProducts() {
        if (this.activeTab === 'Tất Cả') return this.allProducts;
        return this.allProducts.filter(p => p.category === this.activeTab);
    }

    // ─── Brands ───────────────────────────────────────
    brands = ['ROLEX', 'OMEGA', 'TAG HEUER', 'PATEK PHILIPPE', 'IWC', 'BREITLING', 'CARTIER', 'HUBLOT', 'AUDEMARS PIGUET', 'JAEGER-LECOULTRE'];

    // ─── Testimonials ─────────────────────────────────
    testimonials = [
        {
            name: 'Nguyễn Văn Minh',
            product: 'Rolex Submariner',
            text: 'Dịch vụ tuyệt vời! Đồng hồ được giao đúng hẹn, đóng gói cẩn thận. Sản phẩm chính hãng và đúng với mô tả. Tôi rất hài lòng với lần mua hàng này.'
        },
        {
            name: 'Trần Thị Hương',
            product: 'Omega Seamaster',
            text: 'Đây là lần thứ ba tôi mua đồng hồ tại đây. Mỗi lần đều được tư vấn nhiệt tình và chuyên nghiệp. Sản phẩm luôn đảm bảo chất lượng chính hãng.'
        },
        {
            name: 'Lê Hoàng Nam',
            product: 'TAG Heuer Carrera',
            text: 'Tôi đã tìm kiếm chiếc Carrera này lâu lắm. May mắn tìm được ở LuxeWatch với giá tốt và bảo hành đầy đủ. Cảm ơn team hỗ trợ rất nhiệt tình!'
        }
    ];

    // ─── Countdown ────────────────────────────────────
    countdown = { hours: 23, minutes: 59, seconds: 59 };
    private countdownInterval: any;

    private startCountdown() {
        this.countdownInterval = setInterval(() => {
            if (this.countdown.seconds > 0) {
                this.countdown.seconds--;
            } else if (this.countdown.minutes > 0) {
                this.countdown.minutes--;
                this.countdown.seconds = 59;
            } else if (this.countdown.hours > 0) {
                this.countdown.hours--;
                this.countdown.minutes = 59;
                this.countdown.seconds = 59;
            } else {
                this.countdown = { hours: 23, minutes: 59, seconds: 59 };
            }
        }, 1000);
    }

    // ─── Lifecycle ────────────────────────────────────
    ngOnInit() {
        this.startSlideTimer();
        this.startCountdown();
    }

    ngOnDestroy() {
        clearInterval(this.slideInterval);
        clearInterval(this.countdownInterval);
    }
}
