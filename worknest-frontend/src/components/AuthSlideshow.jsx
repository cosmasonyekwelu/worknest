import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { slideShow } from "@/utils/constant";

export default function AuthSlideshow () {
  return (
    <Swiper
      modules={[Autoplay, EffectFade, Pagination]}
      effect="fade"
      speed={800}
      loop
      allowTouchMove={false}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      className="h-full w-full"
    >
      {slideShow.map((slide) => (
        <SwiperSlide key={slide.id}>
          <div className="relative h-full w-full">
            {/* Background Image */}
            <img
              src={slide.src}
              alt="Auth slide"
              className="h-full w-full object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-end p-8">
              <p className="text-white text-lg max-w-md leading-relaxed">
                {slide.caption}
              </p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
