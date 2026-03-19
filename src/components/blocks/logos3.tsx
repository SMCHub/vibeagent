"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Logo {
  id: string;
  description: string;
  image?: string;
  className?: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
}

const Logos3 = ({
  heading = "Trusted by these companies",
  logos = [],
}: Logos3Props) => {
  return (
    <section className="border-y border-border bg-card py-10">
      <div className="mx-auto flex flex-col items-center text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {heading}
        </p>
      </div>
      <div className="pt-6">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl">
          <Carousel
            opts={{ loop: true, dragFree: true }}
            plugins={[AutoScroll({ playOnInit: true, speed: 0.8 })]}
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-8 flex shrink-0 items-center justify-center gap-2.5">
                    {logo.image ? (
                      <img
                        src={logo.image}
                        alt={logo.description}
                        className={logo.className || "h-6 w-auto"}
                      />
                    ) : null}
                    <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                      {logo.description}
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-card to-transparent" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent" />
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
